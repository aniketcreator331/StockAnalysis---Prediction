from fastapi import APIRouter
import data_fetcher
import prediction_model

router = APIRouter()

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

    return data

@router.get("/chart/{ticker}")
def get_chart_data(ticker: str, period: str = "3mo", interval: str = "1d"):
    df = data_fetcher.fetch_historical_data(ticker, period=period, interval=interval)
    if df is None:
        return {"error": "Failed to fetch data"}
    return df.to_dict(orient="records")

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
