"""
Pydantic Data Schemas for Flood Risk API
Defines input payloads, validation rules, and structured response types.
"""

from typing import List, Optional, Dict, Any, Union
from pydantic import BaseModel, Field

class FloodPredictionRequest(BaseModel):
    rainfall: float = Field(..., description="Precipitation / Rainfall in mm (e.g. 0 to 450)", ge=0.0, le=1000.0)
    river_level: float = Field(..., description="River or Water Stage in meters (e.g. 0.5 to 15.0)", ge=0.0, le=50.0)
    soil_moisture: float = Field(..., description="Soil Moisture saturation percentage (e.g. 5 to 100%)", ge=0.0, le=100.0)
    elevation: float = Field(..., description="Elevation above sea level in meters (e.g. 2 to 3000)", ge=-50.0, le=9000.0)
    historical_flood_frequency: float = Field(0.1, description="Historical flood frequency index (e.g. 0.0 to 1.0)", ge=0.0, le=1.0)
    latitude: Optional[float] = Field(None, description="Latitude coordinate", ge=-90.0, le=90.0)
    longitude: Optional[float] = Field(None, description="Longitude coordinate", ge=-180.0, le=180.0)
    temperature: Optional[float] = Field(26.0, description="Ambient temperature in °C", ge=-30.0, le=60.0)
    humidity: Optional[float] = Field(65.0, description="Relative humidity percentage", ge=0.0, le=100.0)
    land_cover: Optional[str] = Field("Urban", description="Land cover type (Urban, Agricultural, Forest, Wetland, Grassland, Barren)")
    drainage_proximity: Optional[float] = Field(2.5, description="Distance to nearest river/drainage in km", ge=0.0)

    class Config:
        json_schema_extra = {
            "example": {
                "rainfall": 120.0,
                "river_level": 8.2,
                "soil_moisture": 82.0,
                "elevation": 45.0,
                "historical_flood_frequency": 0.35,
                "latitude": 17.385,
                "longitude": 78.486,
                "temperature": 27.5,
                "humidity": 85.0,
                "land_cover": "Urban",
                "drainage_proximity": 1.2
            }
        }

class FloodPredictionResponse(BaseModel):
    flood_probability: float = Field(..., description="Calculated probability of flood occurrence between 0.0 and 1.0")
    risk_percentage: float = Field(..., description="Flood probability expressed as percentage (0-100%)")
    risk_category: str = Field(..., description="Application-defined category: Low Risk, Moderate Risk, High Risk, Very High Risk")
    top_factors: List[str] = Field(..., description="Key environmental factors contributing to the predicted risk level")
    recommended_action: Optional[str] = Field(None, description="Recommended advisory response action")
    model_used: Optional[str] = Field(None, description="Machine learning algorithm that generated the prediction")
    disclaimer: str = Field("This system provides machine-learning-based risk estimates for demonstration and decision-support purposes. It is not an official emergency warning system.")

class BatchPredictionRequest(BaseModel):
    locations: List[FloodPredictionRequest] = Field(..., description="List of location data items for batch risk scoring")

class BatchPredictionItem(BaseModel):
    id: int
    flood_probability: float
    risk_percentage: float
    risk_category: str
    top_factors: List[str]

class BatchPredictionResponse(BaseModel):
    total_locations: int
    high_risk_count: int
    results: List[BatchPredictionItem]

class ModelMetricItem(BaseModel):
    model_name: str
    accuracy: float
    precision: float
    recall: float
    f1: float
    roc_auc: float
    confusion_matrix: List[List[int]]
    training_time_seconds: Optional[float] = None

class ModelMetricsResponse(BaseModel):
    best_model_name: str
    models: List[ModelMetricItem]
    total_training_time: Optional[float] = None
    timestamp: Optional[str] = None

class FeatureImportanceItem(BaseModel):
    feature: str
    importance: float

class DatasetInfoResponse(BaseModel):
    total_rows: int
    total_columns: int
    column_names: List[str]
    target_column: str
    flood_events: int
    non_flood_events: int
    flood_prevalence_pct: float
    duplicate_rows: int
    missing_values_per_column: Dict[str, int]
    data_types: Dict[str, str]

class RiskMapPoint(BaseModel):
    id: int
    location_name: Optional[str] = "Monitoring Station"
    river_basin: Optional[str] = "Catchment Basin"
    latitude: float
    longitude: float
    flood_probability: float
    risk_percentage: float
    risk_score: Optional[int] = None
    risk_level: Optional[str] = "LOW"
    risk_category: str
    rainfall: float
    river_level: float
    soil_moisture: float
    elevation: float
    historical_flood_frequency: float
    land_cover: Optional[str] = "Urban"
    drainage_proximity: Optional[float] = None
    temperature: Optional[float] = None
    humidity: Optional[float] = None
    primary_drivers: Optional[List[str]] = None
    recommended_action: Optional[str] = None
    timestamp: Optional[str] = None
