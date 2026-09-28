"""
Machine Learning Model Training and Multi-Model Evaluation Pipeline
Trains and compares:
1. Logistic Regression (Baseline with regularized L2)
2. Random Forest Classifier (Ensemble bagging)
3. Gradient Boosting / LightGBM Classifier (Gradient boosted trees)

Evaluates on: Accuracy, Precision, Recall, F1-Score, ROC-AUC, Confusion Matrix
Prioritizes flood recall and saves metrics, models, feature importance, and map points.
"""

import os
import json
import time
import numpy as np
import pandas as pd
from typing import Dict, Any, Tuple
from dotenv import load_dotenv

from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier, HistGradientBoostingClassifier
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score,
    roc_auc_score, confusion_matrix, classification_report
)
import joblib

from preprocess import FloodPreprocessor

# Load environment variables
load_dotenv()

DATASET_PATH = os.getenv("DATASET_PATH", "./data/flood_dataset.csv")
TARGET_COLUMN = os.getenv("TARGET_COLUMN", "flood")
MODEL_PATH = os.getenv("MODEL_PATH", "./models/flood_model.pkl")
PREPROCESSOR_PATH = os.getenv("PREPROCESSOR_PATH", "./models/preprocessor.pkl")
METRICS_PATH = "./models/model_metrics.json"
FEATURE_IMPORTANCE_PATH = "./models/feature_importance.json"
DATASET_INFO_PATH = "./models/dataset_info.json"
RISK_MAP_SAMPLE_PATH = "./models/risk_map_sample.json"

def evaluate_classifier(name: str, model: Any, X_test: np.ndarray, y_test: np.ndarray) -> Dict[str, Any]:
    """Computes comprehensive classification metrics for flood risk prediction."""
    y_pred = model.predict(X_test)
    y_prob = model.predict_proba(X_test)[:, 1] if hasattr(model, "predict_proba") else y_pred

    acc = float(accuracy_score(y_test, y_pred))
    prec = float(precision_score(y_test, y_pred, zero_division=0))
    rec = float(recall_score(y_test, y_pred, zero_division=0))
    f1 = float(f1_score(y_test, y_pred, zero_division=0))
    auc = float(roc_auc_score(y_test, y_prob))
    cm = confusion_matrix(y_test, y_pred).tolist()

    metrics = {
        "model_name": name,
        "accuracy": round(acc, 4),
        "precision": round(prec, 4),
        "recall": round(rec, 4),
        "f1": round(f1, 4),
        "roc_auc": round(auc, 4),
        "confusion_matrix": cm,
        "true_negatives": int(cm[0][0]),
        "false_positives": int(cm[0][1]),
        "false_negatives": int(cm[1][0]),
        "true_positives": int(cm[1][1])
    }
    return metrics

def train_and_compare_models(dataset_path: str = DATASET_PATH, target_column: str = TARGET_COLUMN):
    """
    Executes full pipeline:
    1. Preprocesses 100K+ dataset
    2. Trains 3 competitive algorithms
    3. Evaluates and ranks models
    4. Extracts feature importances
    5. Saves production artifacts
    """
    start_total_time = time.time()
    print("=" * 60)
    print("AI FloodGuard: Model Training Pipeline")
    print(f"Dataset Path: {dataset_path}")
    print("=" * 60)

    # 1. Preprocess Data
    preprocessor = FloodPreprocessor(target_column=target_column)
    X_train, X_test, y_train, y_test = preprocessor.fit_transform_data(dataset_path)

    # Save Preprocessor and Dataset Info
    preprocessor.save(PREPROCESSOR_PATH)
    with open(DATASET_INFO_PATH, "w") as f:
        json.dump(preprocessor.dataset_info, f, indent=2)
    print(f"Saved dataset metadata to {DATASET_INFO_PATH}")

    # 2. Define Models
    models_to_train = {
        "Logistic Regression": LogisticRegression(
            max_iter=1000, 
            class_weight='balanced', 
            random_state=42, 
            C=1.0, 
            solver='lbfgs'
        ),
        "Random Forest": RandomForestClassifier(
            n_estimators=100, 
            max_depth=16, 
            min_samples_split=10, 
            class_weight='balanced', 
            n_jobs=-1, 
            random_state=42
        ),
        "HistGradientBoosting / LightGBM": HistGradientBoostingClassifier(
            max_iter=150, 
            learning_rate=0.08, 
            max_depth=12, 
            class_weight='balanced', 
            random_state=42
        )
    }

    results = []
    trained_models = {}

    print("\n--- Training Machine Learning Models ---")
    for name, model in models_to_train.items():
        t0 = time.time()
        print(f"Training '{name}' on {X_train.shape[0]:,} samples...")
        model.fit(X_train, y_train)
        fit_time = time.time() - t0
        print(f"-> Completed in {fit_time:.2f}s")

        metrics = evaluate_classifier(name, model, X_test, y_test)
        metrics["training_time_seconds"] = round(fit_time, 2)
        results.append(metrics)
        trained_models[name] = model

        print(f"   Accuracy: {metrics['accuracy']:.4f} | Precision: {metrics['precision']:.4f} | Recall: {metrics['recall']:.4f} | F1: {metrics['f1']:.4f} | ROC-AUC: {metrics['roc_auc']:.4f}")

    # 3. Model Selection (Optimized for Safety / F1 & Recall)
    # Compound score: 0.4 * F1 + 0.3 * Recall + 0.3 * ROC_AUC
    best_model_name = max(results, key=lambda x: (0.45 * x['f1'] + 0.30 * x['recall'] + 0.25 * x['roc_auc']))['model_name']
    best_model = trained_models[best_model_name]
    print("\n" + "=" * 60)
    print(f"WINNING MODEL SELECTED: {best_model_name}")
    print("=" * 60)

    # Save Best Model
    os.makedirs(os.path.dirname(MODEL_PATH), exist_ok=True)
    joblib.dump({
        "model": best_model,
        "model_name": best_model_name,
        "feature_names": preprocessor.engineered_feature_names,
        "training_timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
    }, MODEL_PATH)
    print(f"Saved winning model to {MODEL_PATH}")

    # Save Comparison Metrics JSON
    comparison_payload = {
        "best_model_name": best_model_name,
        "models": results,
        "total_training_time": round(time.time() - start_total_time, 2),
        "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
    }
    with open(METRICS_PATH, "w") as f:
        json.dump(comparison_payload, f, indent=2)
    print(f"Saved model metrics comparison to {METRICS_PATH}")

    # 4. Feature Importance Extraction
    print("\n--- Computing Feature Importance ---")
    feat_names = preprocessor.engineered_feature_names
    feature_importance_list = []

    if hasattr(best_model, "feature_importances_"):
        raw_importances = best_model.feature_importances_
        for fname, imp in zip(feat_names, raw_importances):
            feature_importance_list.append({"feature": fname, "importance": round(float(imp), 5)})
    elif hasattr(best_model, "coef_"):
        raw_importances = np.abs(best_model.coef_[0])
        total = np.sum(raw_importances) + 1e-9
        normalized_imp = raw_importances / total
        for fname, imp in zip(feat_names, normalized_imp):
            feature_importance_list.append({"feature": fname, "importance": round(float(imp), 5)})
    else:
        # Fallback to Random Forest importances if best model is HistGradientBoosting
        rf_model = trained_models["Random Forest"]
        raw_importances = rf_model.feature_importances_
        for fname, imp in zip(feat_names, raw_importances):
            feature_importance_list.append({"feature": fname, "importance": round(float(imp), 5)})

    feature_importance_list.sort(key=lambda x: x["importance"], reverse=True)
    with open(FEATURE_IMPORTANCE_PATH, "w") as f:
        json.dump(feature_importance_list, f, indent=2)
    print(f"Saved feature importances to {FEATURE_IMPORTANCE_PATH}")

    # 5. Generate Geo Risk Map Sample Points for Dashboard Map
    print("\n--- Generating Geo Risk Map Sample Grid ---")
    raw_df = pd.read_csv(dataset_path)
    # Take a representative stratified subsample of 350 locations for rich map visualization
    sample_df = raw_df.sample(n=min(350, len(raw_df)), random_state=42).copy()
    
    # Run predictions on the sample
    X_sample_trans = preprocessor.transform_single_or_batch(sample_df)
    sample_probs = best_model.predict_proba(X_sample_trans)[:, 1]

    def get_risk_category(prob: float) -> str:
        if prob < 0.30:
            return "Low Risk"
        elif prob < 0.60:
            return "Moderate Risk"
        elif prob < 0.80:
            return "High Risk"
        else:
            return "Very High Risk"

    map_points = []
    for idx, (_, row) in enumerate(sample_df.iterrows()):
        prob = float(sample_probs[idx])
        pct = round(prob * 100, 1)
        cat = get_risk_category(prob)
        lat = float(row['latitude']) if 'latitude' in row and pd.notna(row['latitude']) else round(20.0 + (idx % 15) * 1.5, 4)
        lon = float(row['longitude']) if 'longitude' in row and pd.notna(row['longitude']) else round(78.0 + (idx % 15) * 1.5, 4)

        point = {
            "id": int(idx + 1),
            "latitude": lat,
            "longitude": lon,
            "flood_probability": round(prob, 4),
            "risk_percentage": pct,
            "risk_category": cat,
            "rainfall": float(row.get('rainfall', 0.0)),
            "river_level": float(row.get('river_level', 0.0)),
            "soil_moisture": float(row.get('soil_moisture', 0.0)),
            "elevation": float(row.get('elevation', 0.0)),
            "historical_flood_frequency": float(row.get('historical_flood_frequency', 0.0)),
            "land_cover": str(row.get('land_cover', 'Unknown'))
        }
        map_points.append(point)

    with open(RISK_MAP_SAMPLE_PATH, "w") as f:
        json.dump(map_points, f, indent=2)
    print(f"Saved {len(map_points)} interactive map points to {RISK_MAP_SAMPLE_PATH}")

    print("\n" + "=" * 60)
    print("Training Pipeline Successfully Completed!")
    print("=" * 60)
    return comparison_payload

if __name__ == '__main__':
    train_and_compare_models()
