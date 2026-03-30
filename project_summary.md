# Stock Dashboard Project Summary

This document provides a structured summary and outline for creating a **Presentation**, **Poster**, and **Report** related to the Stock Market Analysis Dashboard. It also includes a detailed breakdown of the APIs, project files, and data flow.

## 1. Presentation Outline (10-15 Slides)
*   **Slide 1: Title Slide** - Project Name, Team Members, Date.
*   **Slide 2: Problem Statement** - The need for accessible, real-time stock analysis and predictive insights for retail investors.
*   **Slide 3: Proposed Solution** - A full-stack web application providing real-time data, charts, and AI-driven stock predictions.
*   **Slide 4: Key Features** - Live dashboard, interactive charting, AI predictions, secure authentication, top stock recommendations.
*   **Slide 5: System Architecture** - High-level diagram showing Frontend (React/Vite) interacting with Backend (FastAPI).
*   **Slide 6: Technologies Used** - Frontend (React, Tailwind), Backend (Python, FastAPI, YFinance/Alpha Vantage), Database (SQLite).
*   **Slide 7: Data Flow & Integration** - How data is fetched from financial APIs, processed by the backend, and rendered on the frontend.
*   **Slide 8: AI Prediction Model** - Brief explanation of the machine learning model used to forecast the next 6 time steps.
*   **Slide 9: User Authentication** - Registration, login, and Google OAuth implementation.
*   **Slide 10: Demo/Screenshots** - Visuals of the dashboard, charts, and prediction interface.
*   **Slide 11: Challenges & Solutions** - Handling rate limits (Alpha Vantage vs YFinance fallback), CORS issues, deployment.
*   **Slide 12: Future Enhancements** - Portfolio tracking, advanced technical indicators, live trading integration.
*   **Slide 13: Conclusion & Q/A** - Summary of achievements and invitation for questions.

## 2. Poster Layout (Academic/Technical Poster)
*   **Header:** Project Title, Names, Institution/Organization.
*   **Abstract/Introduction (Top Left):** Brief summary of the project goals (bridging the gap between complex financial data and accessible UI).
*   **Methodology & Architecture (Middle Left):** Diagram of the React + FastAPI architecture block.
*   **Key Features (Center):** Bullet points of main functionalities (Real-time tracking, ML Predictions).
*   **Data Flow & Processing (Middle Right):** Visual representation of `yfinance` / `alphavantage` -> `data_fetcher.py` -> `FastAPI` -> `Axios` -> `React UI`.
*   **Results & Interface (Bottom Left/Center):** Screenshots of the final UI (Dashboard, Charts).
*   **Conclusion & Future Work (Bottom Right):** Summary of the successful deployment and next steps.

## 3. Project Report Structure (15-20 Pages)
1.  **Abstract:** High-level summary of the tool.
2.  **Introduction:** Background, motivation, and objectives.
3.  **Literature Review / Existing Systems:** Comparison with existing trading tools.
4.  **System Requirements Specification (SRS):** Functional and non-functional requirements.
5.  **System Architecture & Design:** Component Diagram, User flow.
6.  **Implementation Details:** Data Fetching (Alpha Vantage/Yfinance fallback), Machine Learning prediction mechanisms, Authentication and database management.
7.  **Testing & Deployment:** Running locally and cloud deployment.
8.  **Conclusion & Future Scope.**
9.  **References.**

## 4. API Endpoints & Usage

The backend is built with **FastAPI** serving these interactive endpoints:

### Stock & Data APIs (`stock_api.py`)
| Endpoint | Method | Parameters | Description |
| :--- | :---: | :--- | :--- |
| `/api/dashboard/{ticker}` | GET | `ticker` (e.g., AAPL) | Fetches the current real-time quote, previous closing price, and daily growth percentage. |
| `/api/chart/{ticker}` | GET | `ticker`, `period`, `interval`| Retrieves historical OHLCV data formatted for frontend charting. |
| `/api/predict/{ticker}` | GET | `ticker` | Uses the ML model to predict the next 6 time steps for the given stock. |
| `/api/train/{ticker}` | POST| `ticker` | Triggers the backend to pull fresh historical data and retrain the prediction model. |
| `/api/top-stocks` | GET | None | Calculates the daily growth for top stocks, giving a Buy/Hold/Sell recommendation based on volatility. |
| `/api/recommendations` | GET | None | Fetches the `top-stocks` list and sorts them by highest daily growth. |

### Authentication APIs (`auth_api.py`)
| Endpoint | Method | Payload | Description |
| :--- | :---: | :--- | :--- |
| `/api/auth/register` | POST | `{email, password}` | Registers a new user and securely stores their details. |
| `/api/auth/login` | POST | `{email, password}` | Validates user credentials. Upon success, returns an authentication token. |
| `/api/auth/google` | POST | `{token}` | Validates a Google OAuth token, creating a user if they don't exist, and logs them in. |

## 5. File Structure and Data Flow

### The Backend (`/backend`)
*   **`main.py`**: The entry point for FastAPI. Configures CORS and registers the API routers.
*   **`data_fetcher.py`**: The core data engine. It fetches from the Alpha Vantage API first and gracefully falls back to the `yfinance` library. It structures all data identically.
*   **`prediction_model.py`**: Contains the logic and mathematical models for stock price forecasting.
*   **`stock_api.py` & `auth_api.py`**: The controller files containing the routing logic and mapping API endpoints to relevant backend functions.
*   **`auth_db.py` & `users.db`**: Handles SQLite database connections for storing user credentials securely.

### The Frontend (`/frontend`)
*   **`src/services/api.js`**: Centralized Axios API client. It calls the `VITE_API_BASE_URL` and formats functions for React components to use.
*   **`src/pages/HomePage.jsx`**: The main user interface. Forms the interactive dashboard and updates state on API data loads.
*   **`src/components/AuthModal.jsx`**: The component handling UI state for User Login and Registration interactions.

### Data Flow Example (Requesting a Stock Chart)
1. **User Action**: The user selects "AAPL" on the React Dashboard.
2. **Frontend Request**: `HomePage.jsx` calls `stockApi.getChartData("AAPL")` in `api.js`.
3. **HTTP Call**: Axios sends an HTTP GET request to `[backend-url]/api/chart/AAPL`.
4. **Backend Routing**: FastAPI routes this to `get_chart_data` in `stock_api.py`.
5. **Data Fetching**: `stock_api.py` triggers `data_fetcher.fetch_historical_data("AAPL")`.
6. **External API**: `data_fetcher.py` attempts Alpha Vantage, then YFinance.
7. **Response Flow**: Data is formatted as a dataframe, converted to JSON, sent back to Axios, and plotted on the graph in `HomePage.jsx`.
