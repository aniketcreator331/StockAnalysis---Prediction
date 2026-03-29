from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from stock_api import router as stock_router
from auth_api import router as auth_router

app = FastAPI(title="Stock Market Analysis Dashboard API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(stock_router, prefix="/api")
app.include_router(auth_router, prefix="/api")

@app.get("/")
def read_root():
    return {"message": "Welcome to Stock Market Analysis API"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
