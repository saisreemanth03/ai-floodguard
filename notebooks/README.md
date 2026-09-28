# 📓 Exploratory Data Analysis & Hydrological Modeling Notebooks

This directory contains experimental scripts and notebooks for:
1. **Hydrological Distribution Inspection**: Analyzing heavy-tail precipitation, river flood stage distributions, and soil moisture saturation curves across 125,000+ observations.
2. **Feature Engineering Experiments**: Comparing compound multi-variable interaction terms ($Rainfall \times SoilMoisture$, $ElevationRisk = 1 / (\ln(Elevation + 1) + 1)$).
3. **Model Selection & Hyperparameter Benchmarks**: Training Logistic Regression, Random Forest, and LightGBM / Gradient Boosting.
4. **SHAP & Feature Importance**: Analyzing tree-based split contributions to verify safety prioritization.
