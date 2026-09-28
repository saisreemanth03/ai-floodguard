"""
FastAPI Route Handlers for Flood Risk System
"""

from fastapi import APIRouter, HTTPException, BackgroundTasks, status
from typing import List, Dict, Any

from schemas.prediction import (
    FloodPredictionRequest, FloodPredictionResponse,
    BatchPredictionRequest, BatchPredictionResponse,
    ModelMetricsResponse, DatasetInfoResponse,
    FeatureImportanceItem, RiskMapPoint
)
from services.model_service import ModelService

router = APIRouter()

@router.get("/health", status_code=status.HTTP_200_OK, summary="Health Check")
def health_check():
    service = ModelService.get_instance()
    return {
        "status": "online",
        "service": "FloodGuard Risk Intelligence API",
        "model_loaded": service.is_loaded,
        "active_model": service.model_artifact.get("model_name") if service.model_artifact else "None"
    }

@router.get("/dataset-info", response_model=DatasetInfoResponse, summary="Get Dataset Inspection Metadata")
def get_dataset_info():
    service = ModelService.get_instance()
    info = service.get_dataset_info()
    return info

@router.post("/predict", response_model=FloodPredictionResponse, summary="Predict Flood Risk for a Location")
def predict_flood_risk(request: FloodPredictionRequest):
    service = ModelService.get_instance()
    try:
        data_dict = request.model_dump()
        result = service.predict_single(data_dict)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")

@router.post("/batch-predict", response_model=BatchPredictionResponse, summary="Batch Predict Flood Risk")
def batch_predict(request: BatchPredictionRequest):
    service = ModelService.get_instance()
    try:
        items = [item.model_dump() for item in request.locations]
        result = service.predict_batch(items)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Batch prediction error: {str(e)}")

@router.get("/model-metrics", response_model=ModelMetricsResponse, summary="Get Model Benchmark & Comparison Metrics")
def get_model_metrics():
    service = ModelService.get_instance()
    return service.get_model_metrics()

@router.get("/feature-importance", response_model=List[FeatureImportanceItem], summary="Get Feature Importance Rankings")
def get_feature_importance():
    service = ModelService.get_instance()
    return service.get_feature_importance()

@router.get("/risk-map", response_model=List[RiskMapPoint], summary="Get Geo-Spatial Flood Risk Map Coordinates")
def get_risk_map():
    service = ModelService.get_instance()
    return service.get_risk_map_points()

@router.post("/retrain", summary="Trigger Pipeline Retraining")
def retrain_pipeline():
    service = ModelService.get_instance()
    try:
        metrics = service.retrain()
        return {
            "status": "success",
            "message": "Model retrained successfully",
            "metrics": metrics
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Retraining error: {str(e)}")
