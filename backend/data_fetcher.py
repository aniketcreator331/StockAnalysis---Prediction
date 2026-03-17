import os
import yfinance as yf
import pandas as pd
import numpy as np
import requests
from dotenv import load_dotenv

load_dotenv()
ALPHA_VANTAGE_API_KEY = os.getenv("ALPHA_VANTAGE_API_KEY", "F25Y9ZL7W5QWTBXF")

def fetch_alpha_vantage_history(ticker_symbol, interval='1d'):
    # Alpha Vantage Free Tier Limit: 25 requests per day
    # So we'll try AV, but gracefully fallback to yfinance on error/limit.
    
    if not ALPHA_VANTAGE_API_KEY or ALPHA_VANTAGE_API_KEY == "YOUR_API_KEY_HERE":
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
             
        res = requests.get(url)
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
            df['Date'] = df['Date'].dt.strftime('%Y-%m-%d %H:%M:%S')
            return df
        return None
    except Exception as e:
        print(f"Error fetching from Alpha Vantage history: {e}")
        return None

def fetch_historical_data(ticker_symbol, period='1y', interval='1d'):
    # 1. Try Alpha Vantage if configured
    df = fetch_alpha_vantage_history(ticker_symbol, interval)
    if df is not None and not df.empty:
        # AV returns ~100 days normally, slice based on period requested conceptually 
        # (For this example, we return all of it, but you could filter)
        print(f"[Alpha Vantage] Used for historical data of {ticker_symbol}")
        return df[['Date', 'Open', 'High', 'Low', 'Close', 'Volume']]

    # 2. Fallback to YFinance
    print(f"[YFinance] Used for historical data of {ticker_symbol}")
    try:
        ticker = yf.Ticker(ticker_symbol)
        df = ticker.history(period=period, interval=interval)
        if df.empty:
            return None
        df.reset_index(inplace=True)
        # Handle timezone string formatting
        if 'Datetime' in df.columns:
            df['Date'] = df['Datetime'].dt.strftime('%Y-%m-%d %H:%M:%S')
        else:
            df['Date'] = df['Date'].dt.strftime('%Y-%m-%d')
        return df[['Date', 'Open', 'High', 'Low', 'Close', 'Volume']]
    except Exception as e:
        print(f"Error fetching data for {ticker_symbol}: {e}")
        return None


def fetch_alpha_vantage_quote(ticker_symbol):
    if not ALPHA_VANTAGE_API_KEY or ALPHA_VANTAGE_API_KEY == "F25Y9ZL7W5QWTBXF":
        return None
        
    try:
        url = f"https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol={ticker_symbol}&apikey={ALPHA_VANTAGE_API_KEY}"
        res = requests.get(url)
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
                "timestamp": pd.Timestamp.now().strftime('%Y-%m-%d %H:%M:%S')
            }
        return None
    except Exception as e:
         print(f"Error fetching from Alpha Vantage quote: {e}")
         return None


def fetch_realtime_quote(ticker_symbol):
    # 1. Try Alpha Vantage if configured
    quote = fetch_alpha_vantage_quote(ticker_symbol)
    if quote:
        print(f"[Alpha Vantage] Used for global quote of {ticker_symbol}")
        return quote

    # 2. Fallback to YFinance
    print(f"[YFinance] Used for global quote of {ticker_symbol}")
    try:
        ticker = yf.Ticker(ticker_symbol)
        data = ticker.history(period='1d', interval='1m')
        if data.empty:
            return None
        latest = data.iloc[-1]
        
        info = ticker.fast_info
        return {
            "symbol": ticker_symbol,
            "price": float(latest['Close']),
            "open": float(latest['Open']),
            "high": float(latest['High']),
            "low": float(latest['Low']),
            "volume": int(latest['Volume']),
            "previous_close": float(info.previous_close) if hasattr(info, 'previous_close') else float(latest['Close']),
            "timestamp": data.index[-1].strftime('%Y-%m-%d %H:%M:%S')
        }
    except Exception as e:
        print(f"Error fetching realtime data for {ticker_symbol}: {e}")
        return None

def fetch_multiple_quotes(symbols):
    quotes = []
    for sym in symbols:
        q = fetch_realtime_quote(sym)
        if q:
            quotes.append(q)
    return quotes
