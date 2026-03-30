# Stock Dashboard Architecture and Data Flow

Here is a visual representation of the system architecture and how data flows between the user, the frontend, the backend, and external APIs.

```mermaid
flowchart TD
    %% User Interaction
    User((User / Web Browser)) -->|Interacts with UI| ReactApp(React Frontend Application)
    
    %% Frontend Structure
    subgraph Frontend [Frontend (React + Vite + Tailwind)]
        ReactApp --> AuthUI[Auth Modal / Forms]
        ReactApp --> DashUI[Dashboard / Charts]
        AuthUI -->|Login/Register| APIClient[api.js Client]
        DashUI -->|Fetch Data/Predict| APIClient
    end

    %% Network Connection
    APIClient -- "HTTP Requests (Axios)" --> FastAPIServer
    
    %% Backend Structure
    subgraph Backend [Backend (FastAPI + Python)]
        FastAPIServer{main.py Router}
        
        %% Routing
        FastAPIServer -->|/api/auth/*| AuthController(auth_api.py)
        FastAPIServer -->|/api/dashboard, /api/chart/*, etc.| StockController(stock_api.py)
        
        %% Auth Logic
        AuthController --> AuthDBLogic(auth_db.py)
        
        %% Stock Logic
        StockController --> PredictionEngine(prediction_model.py)
        StockController --> DataFetcher(data_fetcher.py)
        PredictionEngine -->|Needs historical data| DataFetcher
    end

    %% Database & External Services
    subgraph Storage [Local Storage]
        AuthDBLogic <-->|Read/Write Users| SQLiteDB[(users.db SQLite)]
    end

    subgraph ExternalServices [External Financial APIs]
        DataFetcher -- "1st Priority (Try)" --> AlphaVantage[Alpha Vantage API]
        DataFetcher -- "2nd Priority (Fallback)" --> YFinance[yfinance / Yahoo Finance]
    end
    
    %% Styling
    classDef frontendFill fill:#61dafb,stroke:#333,stroke-width:2px,color:#000
    classDef backendFill fill:#39b54a,stroke:#333,stroke-width:2px,color:#fff
    classDef dbFill fill:#f2a900,stroke:#333,stroke-width:2px,color:#000
    classDef extFill fill:#f05032,stroke:#333,stroke-width:2px,color:#fff
    
    class ReactApp,AuthUI,DashUI,APIClient frontendFill
    class FastAPIServer,AuthController,StockController,PredictionEngine,DataFetcher,AuthDBLogic backendFill
    class SQLiteDB dbFill
    class AlphaVantage,YFinance extFill
```

### Flowchart Breakdown:

1. **User Interaction**: The user accesses the web application via their browser, interacting with the React UI components.
2. **Frontend Layer**:
   * The UI consists of the Dashboard component (for viewing charts and data) and the Auth Modal (for login/registration).
   * Actions map to functions inside `api.js` which acts as the bridge connecting the frontend to the backend using Axios HTTP requests.
3. **Backend API (FastAPI)**:
   * `main.py` is the central gateway. It routes the HTTP requests to the appropriate controller (`auth_api.py` or `stock_api.py`).
4. **Business Logic & Storage / External APIs**:
   * **Authentication**: Requests sent to `auth_api.py` talk to `auth_db.py` to verify or store user credentials in the local `users.db` SQLite database.
   * **Data Fetching**: Requests sent to `stock_api.py` to view stock charts or data are routed to `data_fetcher.py`. This script implements a fallback mechanism: it attempts to hit the **Alpha Vantage API** first. If that fails or rate-limits, it uses **yfinance (Yahoo Finance)**.
   * **Predictions**: Requests for stock predictions hit `prediction_model.py` which uses the ML model on data aggregated by `data_fetcher.py`.
