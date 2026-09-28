"""
Model Evaluation and Diagnostic Reporting Module
Calculates granular performance tables, confusion matrices, and ROC metrics.
"""

import os
import json
import numpy as np
import pandas as pd
from typing import Dict, Any
from sklearn.metrics import classification_report, roc_curve, auc

def load_metrics(metrics_path: str = "./models/model_metrics.json") -> Dict[str, Any]:
    """Loads cached model comparison metrics."""
    if not os.path.exists(metrics_path):
        return {"error": "Metrics file not found. Please train models first."}
    with open(metrics_path, "r") as f:
        return json.load(f)

def generate_evaluation_summary() -> str:
    """Prints a formatted evaluation report for console output."""
    metrics = load_metrics()
    if "error" in metrics:
        return metrics["error"]
    
    summary = "\n" + "=" * 70 + "\n"
    summary += "MODEL COMPARISON BENCHMARK SUMMARY\n"
    summary += "=" * 70 + "\n"
    summary += f"{'Model':<30} | {'Accuracy':<8} | {'Precision':<9} | {'Recall':<8} | {'F1':<8} | {'ROC-AUC':<8}\n"
    summary += "-" * 78 + "\n"
    for m in metrics.get("models", []):
        summary += f"{m['model_name']:<30} | {m['accuracy']:<8.4f} | {m['precision']:<9.4f} | {m['recall']:<8.4f} | {m['f1']:<8.4f} | {m['roc_auc']:<8.4f}\n"
    summary += "=" * 70 + "\n"
    summary += f"Winning Model: {metrics.get('best_model_name')}\n"
    return summary

if __name__ == '__main__':
    print(generate_evaluation_summary())
