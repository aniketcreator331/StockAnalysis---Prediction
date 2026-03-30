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
    if df is None or len(df) < 60:
        return []
    
    data = df['Close'].values.reshape(-1, 1)
    scaler = MinMaxScaler(feature_range=(0,1))
    scaled_data = scaler.fit_transform(data)
    
    if not os.path.exists(MODEL_PATH):
        # mock prediction if model is not yet trained to prevent app crash
        predictions = []
        last_price = data[-1][0]
        for i in range(steps):
             predictions.append(last_price * (1 + np.random.normal(0, 0.005)))
             last_price = predictions[-1]
        return predictions

    model = load_model(MODEL_PATH)
    
    x_input = scaled_data[-60:].reshape(1, -1)
    temp_input = list(x_input[0])
    
    lst_output = []
    i = 0
    while(i < steps):
        if(len(temp_input) > 60):
            x_input = np.array(temp_input[1:])
            x_input = x_input.reshape((1, 60, 1))
            yhat = model.predict(x_input, verbose=0)
            temp_input.append(yhat[0][0])
            temp_input = temp_input[1:]
            lst_output.append(yhat[0][0])
            i = i + 1
        else:
            x_input = x_input.reshape((1, 60, 1))
            yhat = model.predict(x_input, verbose=0)
            temp_input.append(yhat[0][0])
            lst_output.append(yhat[0][0])
            i = i + 1
    
    predicted_prices = scaler.inverse_transform(np.array(lst_output).reshape(-1,1))
    return [float(p[0]) for p in predicted_prices]
