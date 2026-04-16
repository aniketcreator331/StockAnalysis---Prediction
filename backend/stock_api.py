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
_technical_cache = {}


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


def _compute_ema(values, period):
    if not values or period <= 1:
        return []
    k = 2 / (period + 1)
    out = []
    ema = None
    for idx, raw in enumerate(values):
        try:
            value = float(raw)
        except Exception:
            out.append(None)
            continue
        ema = value if ema is None else (value * k) + (ema * (1 - k))
        out.append(None if idx < period - 1 else round(ema, 4))
    return out


def _compute_rsi(values, period=14):
    if not values or len(values) <= period:
        return [None] * len(values)
    out = [None] * len(values)
    gains = 0.0
    losses = 0.0
    for i in range(1, period + 1):
        diff = float(values[i]) - float(values[i - 1])
        if diff >= 0:
            gains += diff
        else:
            losses -= diff
    avg_gain = gains / period
    avg_loss = losses / period
    out[period] = 100.0 if avg_loss == 0 else round(100 - (100 / (1 + (avg_gain / avg_loss))), 2)

    for i in range(period + 1, len(values)):
        diff = float(values[i]) - float(values[i - 1])
        gain = diff if diff > 0 else 0.0
        loss = -diff if diff < 0 else 0.0
        avg_gain = ((avg_gain * (period - 1)) + gain) / period
        avg_loss = ((avg_loss * (period - 1)) + loss) / period
        out[i] = 100.0 if avg_loss == 0 else round(100 - (100 / (1 + (avg_gain / avg_loss))), 2)
    return out


def _compute_macd(values):
    ema12 = _compute_ema(values, 12)
    ema26 = _compute_ema(values, 26)
    macd = []
    for a, b in zip(ema12, ema26):
        if a is None or b is None:
            macd.append(None)
        else:
            macd.append(round(a - b, 4))

    compact = [v if v is not None else 0 for v in macd]
    signal = _compute_ema(compact, 9)
    signal = [sig if macd[i] is not None else None for i, sig in enumerate(signal)]
    histogram = []
    for i, v in enumerate(macd):
        if v is None or signal[i] is None:
            histogram.append(None)
        else:
            histogram.append(round(v - signal[i], 4))
    return macd, signal, histogram

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


@router.get("/technical/{ticker}")
def get_technical_indicators(ticker: str, period: str = "3mo", interval: str = "1d"):
    cache_key = f"{ticker.upper()}|{period}|{interval}"
    cached = _cache_get(_technical_cache, cache_key)
    if cached is not None:
        return cached

    df = data_fetcher.fetch_historical_data(ticker, period=period, interval=interval)
    if df is None or getattr(df, "empty", True):
        return {"error": "Failed to fetch data"}

    rows = df.to_dict(orient="records")
    aligned = []
    for row in rows:
        close = row.get("Close")
        date = row.get("Date")
        if close is None or date is None:
            continue
        try:
            aligned.append({"Date": date, "Close": float(close), "Volume": row.get("Volume")})
        except Exception:
            continue

    closes = [row["Close"] for row in aligned]
    times = [row["Date"] for row in aligned]

    ema20 = _compute_ema(closes, 20)
    ema50 = _compute_ema(closes, 50)
    rsi14 = _compute_rsi(closes, 14)
    macd, signal, histogram = _compute_macd(closes)

    payload = {
        "ticker": ticker.upper(),
        "period": period,
        "interval": interval,
        "updated_at": time.strftime("%Y-%m-%d %H:%M:%S"),
        "prices": [{"x": times[i], "y": closes[i]} for i in range(len(closes))],
        "ema20": [{"x": times[i], "y": ema20[i]} for i in range(len(closes))],
        "ema50": [{"x": times[i], "y": ema50[i]} for i in range(len(closes))],
        "rsi14": [{"x": times[i], "y": rsi14[i]} for i in range(len(closes))],
        "macd": [{"x": times[i], "y": macd[i]} for i in range(len(closes))],
        "signal": [{"x": times[i], "y": signal[i]} for i in range(len(closes))],
        "histogram": [{"x": times[i], "y": histogram[i]} for i in range(len(closes))],
        "snapshot": {
            "last_close": closes[-1] if closes else None,
            "previous_close": closes[-2] if len(closes) > 1 else None,
            "volume": aligned[-1].get("Volume") if aligned else None,
        },
    }
    _cache_set(_technical_cache, cache_key, payload, CHART_TTL_SECONDS)
    return payload

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
