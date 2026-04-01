import numpy as np
import pandas as pd
from sklearn.preprocessing import MinMaxScaler
import os

try:
    from tensorflow.keras.models import Sequential, load_model
    from tensorflow.keras.layers import LSTM, Dense, Dropout
except ImportError:
    pass

import data_fetcher

MODEL_DIR = "models"
MODEL_PATH = os.path.join(MODEL_DIR, "lstm_model.h5")

def create_dataset(dataset, time_step=60):
    X, Y = [], []
    for i in range(len(dataset) - time_step - 1):
        a = dataset[i:(i + time_step), 0]
        X.append(a)
        Y.append(dataset[i + time_step, 0])
    return np.array(X), np.array(Y)

def train_model(ticker="AAPL", period="2y"):
    if 'Sequential' not in globals():
        print("Tensorflow not available, skipping actual model training.")
        return False
        
    if not os.path.exists(MODEL_DIR):
        os.makedirs(MODEL_DIR)

    df = data_fetcher.fetch_historical_data(ticker, period=period, interval='1d')
    if df is None or df.empty:
        return False
        
    data = df['Close'].values.reshape(-1, 1)
    
    scaler = MinMaxScaler(feature_range=(0,1))
    scaled_data = scaler.fit_transform(data)
    
    time_step = 60
    if len(scaled_data) <= time_step:
        return False
    X, Y = create_dataset(scaled_data, time_step)
    
    X = X.reshape(X.shape[0], X.shape[1], 1)
    
    model = Sequential()
    model.add(LSTM(50, return_sequences=True, input_shape=(time_step, 1)))
    model.add(LSTM(50, return_sequences=False))
    model.add(Dense(25))
    model.add(Dense(1))
    
    model.compile(optimizer='adam', loss='mean_squared_error')
    model.fit(X, Y, batch_size=32, epochs=1, verbose=1) # epochs=1 for demonstration speed
    
    model.save(MODEL_PATH)
    return True

def predict_future(ticker, steps=6):
    df = data_fetcher.fetch_historical_data(ticker, period="60d", interval="1d")
    
    # Always get the last real price first as our seed
    last_price = None
    if df is not None and len(df) > 0:
        last_price = float(df['Close'].iloc[-1])
    
    # Fallback: try short period if 60d failed
    if df is None or len(df) < 10:
        df_short = data_fetcher.fetch_historical_data(ticker, period="5d", interval="1d")
        if df_short is not None and len(df_short) > 0:
            last_price = float(df_short['Close'].iloc[-1])
    
    # If we still have no price, return empty
    if last_price is None:
        return []
    
    # Try LSTM model if available and we have enough data
    if df is not None and len(df) >= 60 and os.path.exists(MODEL_PATH):
        try:
            model = load_model(MODEL_PATH)
            data = df['Close'].values.reshape(-1, 1)
            scaler = MinMaxScaler(feature_range=(0,1))
            scaled_data = scaler.fit_transform(data)
            
            x_input = scaled_data[-60:].reshape(1, -1)
            temp_input = list(x_input[0])
            
            lst_output = []
            i = 0
            while i < steps:
                if len(temp_input) > 60:
                    x_in = np.array(temp_input[1:]).reshape((1, 60, 1))
                    yhat = model.predict(x_in, verbose=0)
                    temp_input.append(yhat[0][0])
                    temp_input = temp_input[1:]
                else:
                    x_in = np.array(temp_input).reshape((1, 60, 1))
                    yhat = model.predict(x_in, verbose=0)
                    temp_input.append(yhat[0][0])
                lst_output.append(temp_input[-1])
                i += 1
            
            predicted_prices = scaler.inverse_transform(np.array(lst_output).reshape(-1, 1))
            return [float(p[0]) for p in predicted_prices]
        except Exception as e:
            print(f"LSTM prediction failed: {e}, falling back to statistical model")
    
    # Statistical fallback — always works even without TensorFlow
    # Uses simple momentum + volatility model based on recent price history
    predictions = []
    price = last_price
    
    if df is not None and len(df) >= 5:
        recent = df['Close'].values[-10:]
        # Calculate recent daily returns
        returns = np.diff(recent) / recent[:-1]
        mean_return = float(np.mean(returns))
        std_return = float(np.std(returns))
        # Scale to per-step (roughly 5 min intervals)
        step_mean = mean_return / 78  # ~78 5-min periods per trading day
        step_std = std_return / 78
    else:
        step_mean = 0.0001
        step_std = 0.002

    np.random.seed(42)  # Deterministic so predictions don't flicker on refresh
    for _ in range(steps):
        change = np.random.normal(step_mean, step_std)
        price = price * (1 + change)
        predictions.append(round(float(price), 4))
    
    return predictions
