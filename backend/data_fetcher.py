import os
import time
import threading
import yfinance as yf
import pandas as pd
import requests
from dotenv import load_dotenv

load_dotenv()

ALPHA_VANTAGE_API_KEY = os.getenv("ALPHA_VANTAGE_API_KEY", "").strip()
FINNHUB_API_KEY = os.getenv("FINNHUB_API_KEY", "").strip()

DATA_PROVIDER_PRIORITY = [
    p.strip().lower()
    for p in os.getenv("DATA_PROVIDER_PRIORITY", "finnhub,alpha_vantage,yfinance").split(",")
    if p.strip()
]

_PROVIDER_ALIASES = {
    "alpha": "alpha_vantage",
    "alphavantage": "alpha_vantage",
    "alpha_vantage": "alpha_vantage",
    "finnhub": "finnhub",
    "yf": "yfinance",
    "yahoo": "yfinance",
    "yfinance": "yfinance",
}

_CACHE_LOCK = threading.Lock()
_QUOTE_CACHE = {}
_HISTORY_CACHE = {}
_QUOTE_CACHE_TTL_SECONDS = 15
_HISTORY_CACHE_TTL_SECONDS = 60


def _canonical_provider(name: str):
    return _PROVIDER_ALIASES.get((name or "").strip().lower())


def _cache_get(bucket: dict, key):
    now = time.time()
    with _CACHE_LOCK:
        item = bucket.get(key)
        if not item:
            return None
        if item["expires_at"] <= now:
            bucket.pop(key, None)
            return None
        return item["value"]


def _cache_set(bucket: dict, key, value, ttl_seconds: int):
    with _CACHE_LOCK:
        bucket[key] = {"value": value, "expires_at": time.time() + ttl_seconds}


def _provider_sequence():
    seen = set()
    ordered = []
    for provider in DATA_PROVIDER_PRIORITY:
        canonical = _canonical_provider(provider)
        if canonical and canonical not in seen:
            ordered.append(canonical)
            seen.add(canonical)
    if not ordered:
        ordered = ["yfinance"]
    return ordered


def _period_seconds(period: str):
    p = (period or "1y").lower()
    table = {
        "1d": 1 * 24 * 3600,
        "5d": 5 * 24 * 3600,
        "1mo": 30 * 24 * 3600,
        "3mo": 90 * 24 * 3600,
        "6mo": 180 * 24 * 3600,
        "1y": 365 * 24 * 3600,
        "2y": 2 * 365 * 24 * 3600,
        "5y": 5 * 365 * 24 * 3600,
        "10y": 10 * 365 * 24 * 3600,
    }
    return table.get(p, 365 * 24 * 3600)


def _finnhub_resolution(interval: str):
    i = (interval or "1d").lower()
    if i == "1m":
        return "1"
    if i == "5m":
        return "5"
    if i == "15m":
        return "15"
    if i in {"30m", "1h", "60m"}:
        return "60"
    if i == "1d":
        return "D"
    if i == "1wk":
        return "W"
    if i == "1mo":
        return "M"
    return "D"


def _normalize_history_dataframe(df: pd.DataFrame):
    if df is None or df.empty:
        return None
    if "Datetime" in df.columns:
        df["Date"] = pd.to_datetime(df["Datetime"]).dt.strftime("%Y-%m-%d %H:%M:%S")
    elif "Date" in df.columns:
        dt = pd.to_datetime(df["Date"])
        if getattr(dt.dt, "hour", None) is not None:
            df["Date"] = dt.dt.strftime("%Y-%m-%d %H:%M:%S")
        else:
            df["Date"] = dt.dt.strftime("%Y-%m-%d")
    else:
        return None
    cols = ["Date", "Open", "High", "Low", "Close", "Volume"]
    for c in cols:
        if c not in df.columns:
            return None
    return df[cols]

def fetch_alpha_vantage_history(ticker_symbol, interval='1d'):
    # Alpha Vantage Free Tier Limit: 25 requests per day
    # So we'll try AV, but gracefully fallback to yfinance on error/limit.
    
    if not ALPHA_VANTAGE_API_KEY:
        return None
        
    try:
        # Map intervals roughly
        if interval in ['1d', '5d', '1mo', '3mo', '1y']:
            function = "TIME_SERIES_DAILY"
            data_key = "Time Series (Daily)"
        else: # intraday
            function = "TIME_SERIES_INTRADAY"
            if interval == '1m': av_int = '1min'
            elif interval == '5m': av_int = '5min'
            elif interval == '15m': av_int = '15min'
            elif interval == '1h': av_int = '60min'
            else: av_int = '60min'
            data_key = f"Time Series ({av_int})"
            
        url = f"https://www.alphavantage.co/query?function={function}&symbol={ticker_symbol}&apikey={ALPHA_VANTAGE_API_KEY}"
        if function == "TIME_SERIES_INTRADAY":
             url += f"&interval={av_int}"
             
        res = requests.get(url, timeout=12)
        data = res.json()
        
        if "Information" in data or "Error Message" in data:
            print(f"Alpha Vantage limit/error for {ticker_symbol}: {data.get('Information', data.get('Error Message'))}")
            return None
            
        if data_key in data:
            records = []
            for date_str, metrics in data[data_key].items():
                records.append({
                    "Date": date_str,
                    "Open": float(metrics["1. open"]),
                    "High": float(metrics["2. high"]),
                    "Low": float(metrics["3. low"]),
                    "Close": float(metrics["4. close"]),
                    "Volume": int(metrics["5. volume"])
                })
            df = pd.DataFrame(records)
            df['Date'] = pd.to_datetime(df['Date'])
            df = df.sort_values("Date").reset_index(drop=True)
            return _normalize_history_dataframe(df)
        return None
    except Exception as e:
        print(f"Error fetching from Alpha Vantage history: {e}")
        return None

def fetch_historical_data(ticker_symbol, period='1y', interval='1d'):
    cache_key = (str(ticker_symbol).upper(), str(period), str(interval), "history")
    cached = _cache_get(_HISTORY_CACHE, cache_key)
    if cached is not None:
        return cached

    for provider in _provider_sequence():
        df = _fetch_history_from_provider(provider, ticker_symbol, period, interval)
        if df is not None and not df.empty:
            _cache_set(_HISTORY_CACHE, cache_key, df, _HISTORY_CACHE_TTL_SECONDS)
            return df
    return None


def _fetch_history_from_provider(provider, ticker_symbol, period='1y', interval='1d'):
    if provider == "finnhub":
        df = fetch_finnhub_history(ticker_symbol, period=period, interval=interval)
        if df is not None and not df.empty:
            print(f"[Finnhub] Used for historical data of {ticker_symbol}")
            return df
    elif provider == "alpha_vantage":
        df = fetch_alpha_vantage_history(ticker_symbol, interval=interval)
        if df is not None and not df.empty:
            print(f"[Alpha Vantage] Used for historical data of {ticker_symbol}")
            return df
    elif provider == "yfinance":
        try:
            ticker = yf.Ticker(ticker_symbol)
            df = ticker.history(period=period, interval=interval)
            if df is None or df.empty:
                return None
            df.reset_index(inplace=True)
            out = _normalize_history_dataframe(df)
            if out is not None and not out.empty:
                print(f"[YFinance] Used for historical data of {ticker_symbol}")
                return out
        except Exception as e:
            print(f"Error fetching data from yfinance for {ticker_symbol}: {e}")
    return None


def fetch_finnhub_history(ticker_symbol, period='1y', interval='1d'):
    if not FINNHUB_API_KEY:
        return None
    try:
        now_ts = int(time.time())
        from_ts = now_ts - _period_seconds(period)
        resolution = _finnhub_resolution(interval)
        url = "https://finnhub.io/api/v1/stock/candle"
        params = {
            "symbol": ticker_symbol,
            "resolution": resolution,
            "from": from_ts,
            "to": now_ts,
            "token": FINNHUB_API_KEY,
        }
        res = requests.get(url, params=params, timeout=12)
        data = res.json()
        if not isinstance(data, dict) or data.get("s") != "ok":
            return None
        ts = data.get("t") or []
        opens = data.get("o") or []
        highs = data.get("h") or []
        lows = data.get("l") or []
        closes = data.get("c") or []
        vols = data.get("v") or []
        if not ts:
            return None
        df = pd.DataFrame({
            "Date": pd.to_datetime(ts, unit="s"),
            "Open": opens,
            "High": highs,
            "Low": lows,
            "Close": closes,
            "Volume": vols,
        })
        df = df.sort_values("Date").reset_index(drop=True)
        return _normalize_history_dataframe(df)
    except Exception as e:
        print(f"Error fetching from Finnhub history: {e}")
        return None


def fetch_alpha_vantage_quote(ticker_symbol):
    if not ALPHA_VANTAGE_API_KEY:
        return None
        
    try:
        url = f"https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol={ticker_symbol}&apikey={ALPHA_VANTAGE_API_KEY}"
        res = requests.get(url, timeout=10)
        data = res.json()
        
        if "Information" in data or "Error Message" in data:
            print(f"Alpha Vantage limit/error for {ticker_symbol}: {data.get('Information', data.get('Error Message'))}")
            return None
            
        if "Global Quote" in data and bool(data["Global Quote"]):
            q = data["Global Quote"]
            return {
                "symbol": ticker_symbol,
                "price": float(q["05. price"]),
                "open": float(q["02. open"]),
                "high": float(q["03. high"]),
                "low": float(q["04. low"]),
                "volume": int(q["06. volume"]),
                "previous_close": float(q["08. previous close"]),
                "timestamp": pd.Timestamp.now().strftime('%Y-%m-%d %H:%M:%S'),
                "provider": "alpha_vantage",
            }
        return None
    except Exception as e:
         print(f"Error fetching from Alpha Vantage quote: {e}")
         return None


def fetch_realtime_quote(ticker_symbol):
    cache_key = (str(ticker_symbol).upper(), "quote")
    cached = _cache_get(_QUOTE_CACHE, cache_key)
    if cached is not None:
        return cached

    for provider in _provider_sequence():
        quote = _fetch_quote_from_provider(provider, ticker_symbol)
        if quote:
            _cache_set(_QUOTE_CACHE, cache_key, quote, _QUOTE_CACHE_TTL_SECONDS)
            return quote
    return None


def _fetch_quote_from_provider(provider, ticker_symbol):
    if provider == "finnhub":
        quote = fetch_finnhub_quote(ticker_symbol)
        if quote:
            print(f"[Finnhub] Used for global quote of {ticker_symbol}")
            return quote
    elif provider == "alpha_vantage":
        quote = fetch_alpha_vantage_quote(ticker_symbol)
        if quote:
            print(f"[Alpha Vantage] Used for global quote of {ticker_symbol}")
            return quote
    elif provider == "yfinance":
        quote = fetch_yfinance_quote(ticker_symbol)
        if quote:
            print(f"[YFinance] Used for global quote of {ticker_symbol}")
            return quote
    return None


def fetch_finnhub_quote(ticker_symbol):
    if not FINNHUB_API_KEY:
        return None
    try:
        quote_url = "https://finnhub.io/api/v1/quote"
        quote_params = {"symbol": ticker_symbol, "token": FINNHUB_API_KEY}
        quote_res = requests.get(quote_url, params=quote_params, timeout=10)
        q = quote_res.json()
        if not isinstance(q, dict):
            return None
        if not q.get("c"):
            return None

        return {
            "symbol": ticker_symbol,
            "price": float(q.get("c", 0.0)),
            "open": float(q.get("o", q.get("c", 0.0))),
            "high": float(q.get("h", q.get("c", 0.0))),
            "low": float(q.get("l", q.get("c", 0.0))),
            "volume": int(q.get("v", 0)),
            "previous_close": float(q.get("pc", q.get("c", 0.0))),
            "timestamp": pd.Timestamp.now().strftime('%Y-%m-%d %H:%M:%S'),
            "provider": "finnhub",
        }
    except Exception as e:
        print(f"Error fetching from Finnhub quote: {e}")
        return None


def fetch_yfinance_quote(ticker_symbol):
    try:
        ticker = yf.Ticker(ticker_symbol)
        data = ticker.history(period='1d', interval='1m')
        if data is None or data.empty:
            return None
        latest = data.iloc[-1]

        prev_close = float(latest['Close'])
        info = getattr(ticker, "fast_info", None)
        if info is not None:
            if hasattr(info, 'previous_close') and info.previous_close is not None:
                prev_close = float(info.previous_close)

        return {
            "symbol": ticker_symbol,
            "price": float(latest['Close']),
            "open": float(latest['Open']),
            "high": float(latest['High']),
            "low": float(latest['Low']),
            "volume": int(latest['Volume']),
            "previous_close": prev_close,
            "timestamp": data.index[-1].strftime('%Y-%m-%d %H:%M:%S'),
            "provider": "yfinance",
        }
    except Exception as e:
        print(f"Error fetching realtime data from yfinance for {ticker_symbol}: {e}")
        return None

def fetch_multiple_quotes(symbols):
    quotes = []
    for sym in symbols:
        q = fetch_realtime_quote(sym)
        if q:
            quotes.append(q)
    return quotes
