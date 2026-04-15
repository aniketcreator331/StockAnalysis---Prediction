from fastapi import APIRouter
import time
import threading
import data_fetcher
import prediction_model

router = APIRouter()

QUOTE_TTL_SECONDS = 15
CHART_TTL_SECONDS = 60

_cache_lock = threading.Lock()
_quote_cache = {}
_chart_cache = {}


def _cache_get(cache_bucket, key):
    now = time.time()
    with _cache_lock:
        entry = cache_bucket.get(key)
        if not entry:
            return None
        if entry["expires_at"] <= now:
            del cache_bucket[key]
            return None
        return entry["value"]


def _cache_set(cache_bucket, key, value, ttl_seconds):
    with _cache_lock:
        cache_bucket[key] = {
            "value": value,
            "expires_at": time.time() + ttl_seconds,
        }

TOP_STOCKS = [
    "AAPL", "MSFT", "GOOGL", "AMZN", "TSLA", "META", "NVDA", "JPM", "JNJ", "V", 
    "WMT", "PG", "MA", "UNH", "DIS", "HD", "BAC", "XOM", "NFLX", "INTC", 
    "AMD", "CSCO", "PFE", "KO", "PEP", "ABBV", "CVX", "COST", "MCD", "T",
    "NKE", "ADBE", "CRM", "ABT", "ORCL", "QCOM", "VZ", "CMCSA", "IBM", "TXN",
    "AVGO", "LLY", "PM", "UNP", "LIN", "WFC", "HON", "RTX", "MDT", "SLB",
    "BA", "BMY", "GE", "PYPL", "INTU", "SBUX", "SPGI", "CAT", "GS", "C",
    "MS", "BLK", "SYK", "TMO", "GILD", "LMT", "MMM", "AMGN", "DE", "ISRG",
    "NOW", "CVS", "ZTS", "TGT", "LOW", "TJX", "BIIB", "MO", "CHTR", "CB",
    "CI", "MDLZ", "BDX", "FDX", "MMC", "ITW", "CME", "SO", "DUK", "PGR",
    "ECL", "FIS", "EW", "NSC", "WM", "CSX", "AON", "KMB", "PSA", "NEM"
]

@router.get("/dashboard/{ticker}")
def get_dashboard_summary(ticker: str):
    ticker_key = ticker.upper()
    cached = _cache_get(_quote_cache, ticker_key)
    if cached is not None:
        return cached

    data = data_fetcher.fetch_realtime_quote(ticker)
    if not data:
        return {"error": "Failed to fetch data"}
    
    try:
        current = data['price']
        prev = data['previous_close']
        growth = ((current - prev) / prev) * 100
        data['daily_growth'] = round(growth, 2)
    except Exception:
        data['daily_growth'] = 0.0

    _cache_set(_quote_cache, ticker_key, data, QUOTE_TTL_SECONDS)
    return data

@router.get("/chart/{ticker}")
def get_chart_data(ticker: str, period: str = "3mo", interval: str = "1d"):
    cache_key = f"{ticker.upper()}|{period}|{interval}"
    cached = _cache_get(_chart_cache, cache_key)
    if cached is not None:
        return cached

    df = data_fetcher.fetch_historical_data(ticker, period=period, interval=interval)
    if df is None:
        return {"error": "Failed to fetch data"}
    records = df.to_dict(orient="records")
    _cache_set(_chart_cache, cache_key, records, CHART_TTL_SECONDS)
    return records

@router.get("/predict/{ticker}")
def predict_stock(ticker: str):
    predictions = prediction_model.predict_future(ticker, steps=6)
    return {"ticker": ticker, "predictions": predictions}

@router.post("/train/{ticker}")
def train_stock_model(ticker: str):
    success = prediction_model.train_model(ticker)
    return {"success": success}

@router.get("/top-stocks")
def get_top_stocks():
    quotes = data_fetcher.fetch_multiple_quotes(TOP_STOCKS)
    for q in quotes:
        try:
            current = q['price']
            prev = q['previous_close']
            growth = ((current - prev) / prev) * 100
            q['daily_growth'] = round(growth, 2)
            
            if growth > 2:
                q['recommendation'] = 'Buy'
            elif growth < -2:
                q['recommendation'] = 'Sell'
            else:
                q['recommendation'] = 'Hold'
                
            q['volatility'] = round(abs(growth) * 1.5, 2) 
        except Exception:
            q['daily_growth'] = 0.0
            q['recommendation'] = 'Hold'
            q['volatility'] = 0.0
    return quotes

@router.get("/recommendations")
def get_recommendations():
    quotes = get_top_stocks()
    if not isinstance(quotes, list):
        return []
    ranked = sorted(quotes, key=lambda x: x.get('daily_growth', 0), reverse=True)
    return ranked
