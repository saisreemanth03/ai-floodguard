"""
AI Flood Risk Prediction & Early Warning System - Backend Server
FastAPI Application Entry Point
"""

import os
import sys
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

# Set project paths
current_dir = os.path.dirname(os.path.abspath(__file__))
project_root = os.path.abspath(os.path.join(current_dir, "../"))
if project_root not in sys.path:
    sys.path.insert(0, project_root)
if os.path.join(project_root, "ml") not in sys.path:
    sys.path.insert(0, os.path.join(project_root, "ml"))
if current_dir not in sys.path:
    sys.path.insert(0, current_dir)

load_dotenv()

cors_env = os.getenv("CORS_ORIGINS", "*").strip()
if cors_env == "*" or not cors_env:
    cors_origins = ["*"]
else:
    cors_origins = [
        origin.strip().rstrip("/")
        for origin in cors_env.split(",")
        if origin.strip()
    ]

from api.routes import router
from services.model_service import ModelService

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Load model and cached artifacts into memory once
    print("=" * 60)
    print("Starting AI FloodGuard Backend...")
    print("=" * 60)
    service = ModelService.get_instance()
    service.load_artifacts()
    if not service.is_loaded:
        raise RuntimeError("FloodGuard ML model and preprocessor artifacts failed to load.")
    yield
    print("Shutting down AI FloodGuard Backend...")

app = FastAPI(
    title="AI Flood Risk Prediction & Early Warning System API",
    description="Hackathon-Ready ML-Powered Geographic Flood Risk Assessment and Early Warning API.",
    version="1.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=False,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Content-Type"],
)

# Register API Router
app.include_router(router)

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
