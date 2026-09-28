"""
Feature Importance and SHAP Explainability Engine
Calculates global and local feature importance rankings for environmental risk factors.
"""

import os
import json
from typing import List, Dict, Any

def load_feature_importance(path: str = "./models/feature_importance.json") -> List[Dict[str, Any]]:
    """Loads saved feature importance rankings."""
    if not os.path.exists(path):
        return []
    with open(path, "r") as f:
        return json.load(f)

def format_feature_importance_display(top_n: int = 10) -> str:
    """Renders visual ASCII bar chart of feature importances."""
    items = load_feature_importance()[:top_n]
    if not items:
        return "No feature importance data available."
    
    max_imp = max(item["importance"] for item in items) if items else 1.0
    output = "\nTop Flood Prediction Features:\n"
    output += "-" * 50 + "\n"
    for item in items:
        feat = item["feature"]
        imp = item["importance"]
        bar_len = int((imp / max_imp) * 25)
        bar = "█" * bar_len
        output += f"{feat:<25} {bar:<25} ({imp:.4f})\n"
    return output

if __name__ == '__main__':
    print(format_feature_importance_display())
