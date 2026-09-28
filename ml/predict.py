"""
Inference and Explainability Engine
Generates flood probabilities, risk categories, and dynamic top contributing factor explanations.
"""

import os
import numpy as np
import pandas as pd
from typing import Dict, Any, List, Union
import joblib

from preprocess import FloodPreprocessor

def determine_risk_category(probability: float) -> str:
    """Categorizes flood probability into application-defined tiers."""
    if probability < 0.30:
        return "Low Risk"
    elif probability < 0.60:
        return "Moderate Risk"
    elif probability < 0.80:
        return "High Risk"
    else:
        return "Very High Risk"

def extract_top_contributing_factors(input_dict: Dict[str, Any], probability: float) -> List[str]:
    """
    Computes domain-aware contributing factor explanations for predictions.
    Identifies specific environmental anomalies driving the elevated or reduced risk.
    """
    factors = []
    rainfall = float(input_dict.get("rainfall", 0) or 0)
    river_level = float(input_dict.get("river_level", 0) or 0)
    soil_moisture = float(input_dict.get("soil_moisture", 0) or 0)
    elevation = float(input_dict.get("elevation", 100) or 100)
    hist_flood = float(input_dict.get("historical_flood_frequency", 0) or 0)
    land_cover = str(input_dict.get("land_cover", "")).capitalize()
    drainage_proximity = float(input_dict.get("drainage_proximity", 5.0) or 5.0)

    # Hydrological threshold checks
    if rainfall > 150:
        factors.append(f"Severe precipitation surge ({rainfall} mm/24h)")
    elif rainfall > 80:
        factors.append(f"Heavy rainfall ({rainfall} mm)")
    elif rainfall < 25 and probability < 0.30:
        factors.append("Low precipitation levels")

    if river_level > 7.5:
        factors.append(f"Critical river overflow level ({river_level} m)")
    elif river_level > 5.0:
        factors.append(f"Elevated river water stage ({river_level} m)")

    if soil_moisture > 80:
        factors.append(f"High soil water saturation ({soil_moisture}%)")
    elif soil_moisture > 65:
        factors.append(f"Moderate soil moisture ({soil_moisture}%)")

    if elevation < 30:
        factors.append(f"Low-lying terrain vulnerability ({elevation} m ASL)")
    elif elevation > 300 and probability < 0.40:
        factors.append(f"Protective high elevation ({elevation} m ASL)")

    if hist_flood >= 0.30:
        factors.append(f"High historical recurrence ({int(hist_flood * 20)} events in 20 yrs)")

    if drainage_proximity < 1.0:
        factors.append(f"Immediate river/drainage channel proximity ({drainage_proximity} km)")

    if land_cover == "Urban":
        factors.append("High urban surface impermeability (increased runoff)")
    elif land_cover == "Forest" and probability < 0.50:
        factors.append("Dense forest canopy and soil water absorption")

    if not factors:
        if probability >= 0.60:
            factors.append("Compound hydrological interaction effect")
        else:
            factors.append("Stable environmental conditions across all metrics")

    return factors[:4]

class FloodPredictor:
    def __init__(self, model_path: str = None, preprocessor_path: str = None):
        ml_dir = os.path.dirname(os.path.abspath(__file__))
        project_root = os.path.dirname(ml_dir)
        
        self.model_path = model_path or os.getenv("MODEL_PATH") or os.path.join(project_root, "models", "flood_model.pkl")
        self.preprocessor_path = preprocessor_path or os.getenv("PREPROCESSOR_PATH") or os.path.join(project_root, "models", "preprocessor.pkl")
        
        self.model_artifact = None
        self.preprocessor = None
        self._load()

    def _load(self):
        if os.path.exists(self.model_path) and os.path.exists(self.preprocessor_path):
            self.model_artifact = joblib.load(self.model_path)
            self.preprocessor = joblib.load(self.preprocessor_path)
            print(f"Loaded ML model '{self.model_artifact.get('model_name', 'Unknown')}' and preprocessor successfully.")
        else:
            print(f"Model artifacts not found at {self.model_path} or {self.preprocessor_path}.")

    def predict_single(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """Runs single observation prediction with explainability."""
        if self.model_artifact is None or self.preprocessor is None:
            self._load()
            if self.model_artifact is None:
                raise RuntimeError("Model artifacts missing. Train the model first.")

        df = pd.DataFrame([input_data])
        X_trans = self.preprocessor.transform_single_or_batch(df)
        model = self.model_artifact["model"]

        prob = float(model.predict_proba(X_trans)[0, 1])
        pct = round(prob * 100, 1)
        category = determine_risk_category(prob)
        top_factors = extract_top_contributing_factors(input_data, prob)

        # Recommended emergency advisory based on risk
        advisories = {
            "Low Risk": "Routine monitoring. Normal catchment drainage operational.",
            "Moderate Risk": "Advisory state. Monitor local weather radars and river gauges. Inspect storm drains.",
            "High Risk": "Pre-evacuation alert. Secure assets, review flood barrier deployments, prepare emergency response kits.",
            "Very High Risk": "CRITICAL WARNING: Imminent inundation risk. Activate emergency protocols, move to higher ground."
        }

        return {
            "flood_probability": round(prob, 4),
            "risk_percentage": pct,
            "risk_category": category,
            "top_factors": top_factors,
            "recommended_action": advisories.get(category, "Monitor conditions."),
            "model_used": self.model_artifact.get("model_name", "Ensemble Classifier"),
            "disclaimer": "This system provides machine-learning-based risk estimates for demonstration and decision-support purposes. It is not an official emergency warning system."
        }

    def predict_batch(self, input_list: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Runs vectorized batch predictions."""
        if self.model_artifact is None or self.preprocessor is None:
            self._load()
            if self.model_artifact is None:
                raise RuntimeError("Model artifacts missing. Train the model first.")

        df = pd.DataFrame(input_list)
        X_trans = self.preprocessor.transform_single_or_batch(df)
        model = self.model_artifact["model"]

        probs = model.predict_proba(X_trans)[:, 1]
        results = []
        for i, prob_val in enumerate(probs):
            p = float(prob_val)
            item_input = input_list[i]
            results.append({
                "id": item_input.get("id", i + 1),
                "flood_probability": round(p, 4),
                "risk_percentage": round(p * 100, 1),
                "risk_category": determine_risk_category(p),
                "top_factors": extract_top_contributing_factors(item_input, p)
            })
        return results
