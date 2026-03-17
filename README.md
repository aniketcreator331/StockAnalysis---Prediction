# Stock Market Analysis & Future Price Prediction Dashboard

A full-stack, real-time stock analysis and AI price prediction dashboard. It features a modern, dark-mode adaptive UI showing comprehensive data for technical stock analysis, including interactive Candlestick charts, AI recommendation markers based on LSTM Models, and comparison tables for top-performing stocks.

## Architecture & Tech Stack

- **Frontend**: React.js, Vite, TailwindCSS (Dark/Light mode native), Recharts / ApexCharts (for Interactive OHLC/Candlestick visualisations)
- **Backend**: Python, FastAPI
- **Machine Learning**: TensorFlow/Keras (LSTM architecture)
- **Data Source**: Yahoo Finance API (yfinance)
- **Data Update**: Auto-polling / Live data refresh every 5 min 

## Screenshots / Features

1. **Dashboard Page**: View live ticker data, daily highs/lows, trading volume, and Interactive Price History Candlestick Chart. Auto-refreshes data.
2. **AI Price Prediction System**: Train custom LSTM neural network models per ticker to generate a 30-minute forward performance price prediction. 
3. **Comparison & Recommendation Matrix**: Analyze top tech companies metrics (Volatility, Growth) powered with heuristic AI technical indicator signals (Buy/Sell/Hold). 

## Setup Instructions

### Backend (Python Server & AI System)

1. Open a terminal and navigate to `backend/`.
2. Create and activate a Virtual Environment (Optional but recommended):
   ```bash
   python -m venv venv
   source venv/bin/activate # On Windows: .\venv\Scripts\activate
   ```
3. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Start the FastAPI Uvicorn Server:
   ```bash
   python main.py
   # Or directly: uvicorn main:app --reload
   ```
   > The server will start on `http://localhost:8000`.

### Frontend (React Dashboard)

1. Open a separate terminal and navigate to `frontend/`.
2. Install npm packages:
   ```bash
   npm install
   ```
3. Run the Vite development server:
   ```bash
   npm run dev
   ```
   > The dashboard will start locally on `http://localhost:5173`. 

## AI Prediction & Data Logic

- **yfinance** module collects up-to-date data for the selected ticker.
- The **prediction_model.py** script processes raw data using `MinMaxScaler` into normalized numerical format.
- A bi-layered `tensorflow.keras` LSTM network is dynamically trained securely behind the FastAPI logic when the `Retrain Model` is hit.
- Forecasting occurs over the normalized data and results are scaled inversely back to USD for representation on Rechart axes. If you do not have GPU/Tensorflow natively configured, the backend will gracefully provide mock random-walk forecasted returns to display the frontend system cleanly. 
