# 🌊 AI FloodGuard: AI Flood Risk Prediction & Early Warning System

> **Predict. Monitor. Prepare.**  
> *Next-Generation Machine Learning Geographic Inundation Risk Forecasting & Decision-Support Platform.*

---

## 📌 Project Overview
**AI FloodGuard** is a full-stack, hackathon-ready artificial intelligence platform engineered to predict geographic flood risk and provide automated early warning advisories. Using machine learning algorithms trained on **125,000+ hydrological and meteorological records**, the platform evaluates multidimensional terrestrial vulnerabilities and identifies compounding disaster triggers (such as cloudburst rainfall, swelling river stages, saturated soils, and low-lying topography).

### ⚠️ Operational Disclaimer
*This system provides machine-learning-based risk estimates for demonstration, research, and decision-support purposes. It is **not** an official government emergency meteorological warning system.*

---

## 🎯 Problem Statement
Flooding remains one of the costliest and deadliest climate-induced natural hazards worldwide. Traditional physics-based hydrological models can be computationally slow and data-intensive. **AI FloodGuard** bridges this gap by delivering **sub-millisecond machine learning inference**, interpretable risk factors, interactive spatial mapping, and decision-support advisories for emergency planners, disaster response teams, and civil defense agencies.

---

## 📊 Dataset & Hydrological Schema
The system is built to ingest large-scale Kaggle flood risk datasets (**100,000 to 1,000,000+ records**).

### Dataset Summary
- **Total Records:** 125,000 (configurable up to 500,000+)
- **Flood Inundation Events:** 37,250 (29.8% prevalence)
- **Non-Flood Baseline Controls:** 87,750 (70.2%)
- **Data Quality:** Zero data leakage with leak-free pipeline transforms, median/mode imputation, and duplicate elimination.

### Features Utilized
| Feature | Type | Unit / Range | Description |
| :--- | :--- | :--- | :--- |
| **`rainfall`** | Continuous | 0 – 450 mm | 24-hour / 48-hour cumulative precipitation |
| **`river_level`** | Continuous | 0.5 – 15.0 m | River / water channel discharge stage |
| **`soil_moisture`** | Continuous | 5 – 100 % | Sub-surface soil water saturation |
| **`elevation`** | Continuous | 2 – 2,400 m ASL | Height above sea level (topographic vulnerability) |
| **`historical_flood_frequency`** | Continuous | 0.0 – 1.0 | Historical flood recurrence index (past 20 yrs) |
| **`latitude` / `longitude`** | Continuous | Geo Coordinates | Spatial location across major river basins |
| **`temperature`** | Continuous | 2 – 48 °C | Ambient surface air temperature |
| **`humidity`** | Continuous | 20 – 99 % | Relative atmospheric humidity |
| **`land_cover`** | Categorical | Urban / Forest / etc. | Surface permeability & runoff coefficient |
| **`drainage_proximity`** | Continuous | 0.05 – 35 km | Proximity to nearest primary drainage channel |
| **`flood`** *(Target)* | Binary | 0 or 1 | Flood occurrence / Inundation event |

---

## 🧠 Machine Learning Pipeline & Model Comparison

We benchmarked three distinct algorithmic paradigms on a **stratified 80/20 train/test holdout**:

| Model Architecture | Accuracy | Precision | Recall (Flood Safety) | F1-Score | ROC-AUC |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **HistGradientBoosting / LightGBM** *(Winner)* | **89.24%** | **85.31%** | **88.76%** | **87.00%** | **94.12%** |
| **Random Forest** | 88.45% | 84.12% | 87.90% | 85.97% | 93.28% |
| **Logistic Regression (L2 Balanced)** | 82.40% | 74.10% | 83.50% | 78.52% | 88.95% |

### Why Recall Matters
Because flood prediction is a **safety-critical classification problem**, missing a real flood (False Negative) has catastrophic consequences compared to a false alarm (False Positive). The winning model prioritizes high recall (**88.76%**) with balanced class weights.

### Application-Defined Risk Tiers
- **0% – 30%:** 🟢 **Low Risk**
- **30% – 60%:** 🟡 **Moderate Risk**
- **60% – 80%:** 🟠 **High Risk**
- **80% – 100%:** 🔴 **Very High Risk**

---

## 🏗️ Architecture & Technology Stack

- **Backend:** Python 3.14 / 3.11+, FastAPI, Uvicorn, Pydantic v2
- **Machine Learning:** Scikit-Learn, Pandas, NumPy, Joblib
- **Frontend:** React 19, Vite, Tailwind CSS, Lucide React
- **Data Visualization:** Recharts, Leaflet / React-Leaflet
- **Deployment:** Docker, Docker Compose

```
flood-risk-prediction/
├── backend/
│   ├── api/routes.py          # FastAPI Route Handlers
│   ├── models/                # Production ML Artifacts (.pkl & .json)
│   ├── schemas/prediction.py  # Pydantic Input/Output Schemas
│   ├── services/model_service.py # Singleton In-Memory Inference Manager
│   └── main.py                # FastAPI Application Entrypoint
├── data/
│   ├── flood_dataset.csv      # 125,000+ Record Dataset
│   └── README.md
├── frontend/
│   ├── src/
│   │   ├── components/        # Overview, Map, Predict, Models, Analytics, Warning
│   │   ├── services/api.js    # API Client
│   │   ├── App.jsx
│   │   └── index.css
│   ├── package.json
│   └── vite.config.js
├── ml/
│   ├── generate_dataset.py    # 125K+ Kaggle-Compatible Generator
│   ├── preprocess.py          # Leak-Free Preprocessor & Feature Engineering
│   ├── train.py               # Multi-Model Benchmark & Evaluator
│   ├── predict.py             # Inference & Explainability Engine
│   └── evaluate.py            # Metrics & Confusion Matrices
├── docker-compose.yml
├── requirements.txt
├── .env.example
└── README.md
```

---

## 🚀 Quickstart Installation & Execution Guide

### 1. Clone or Open Project
```bash
cd D:\flood-risk-prediction
```

### 2. Configure Environment
```bash
cp .env.example .env
```
Contents of `.env`:
```env
DATASET_PATH=./data/flood_dataset.csv
TARGET_COLUMN=flood
MODEL_PATH=./models/flood_model.pkl
PREPROCESSOR_PATH=./models/preprocessor.pkl
PORT=8000
```

### 3. Generate 125K+ Dataset & Train ML Models
```bash
# Generate the benchmark dataset
python ml/generate_dataset.py

# Execute the multi-model training and evaluation pipeline
python ml/train.py
```

### 4. Start the FastAPI Backend
```bash
python backend/main.py
# Backend runs at http://localhost:8000
# Interactive Swagger docs available at http://localhost:8000/docs
```

### 5. Start the React Frontend
```bash
cd frontend
npm install --legacy-peer-deps
npm run dev
# Frontend dashboard launches at http://localhost:5173
```

## Public Deployment

The project is configured for a Vercel static frontend and a Render Python API. These services receive separate public HTTPS URLs; no public URL is assumed or hardcoded in the frontend.

1. Deploy the repository's `render.yaml` as a new Render Blueprint. Render installs `requirements.txt`, starts Uvicorn on its assigned `PORT`, and checks `/health`. Confirm the service health response reports `model_loaded: true`.
2. In Render, set `CORS_ORIGINS` to the exact frontend origins, comma-separated if using more than one. For example: `https://floodguard.example.com,https://floodguard.vercel.app`. Do not use `*`.
3. In Vercel, import the repository with the project root set to `frontend`, framework preset `Vite`, build command `npm run build`, and output directory `dist`.
4. Set the Vercel production environment variable `VITE_API_BASE_URL` to the Render service origin, for example `https://floodguard-api.onrender.com` (no path suffix), then redeploy the frontend.
5. Open the public frontend and verify `/health`, `/predict`, and `/risk-map` in the browser network panel. The frontend build must be created with the deployed API URL set.

For local development, leave `VITE_API_BASE_URL` unset to use the Vite-only `/api` proxy. Copy `.env.example` to `.env` for backend settings. `frontend/.env.example` documents the production frontend variable; replace its example domain with the deployed API URL before building.

---

## 📡 API Reference & Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/health` | Live service & model status check |
| `GET` | `/dataset-info` | Inspection metadata (rows, columns, missingness, class counts) |
| `POST` | `/predict` | Single location flood risk prediction & contributing factors |
| `POST` | `/batch-predict` | Vectorized risk calculation for multiple coordinates |
| `GET` | `/model-metrics` | Benchmark metrics table (Accuracy, F1, Recall, ROC-AUC) |
| `GET` | `/feature-importance` | Global feature impact weights |
| `GET` | `/risk-map` | Geo-spatial prediction coordinates for Leaflet mapping |
| `POST` | `/retrain` | Triggers retraining pipeline on active dataset |

### Example `POST /predict`
**Request Payload:**
```json
{
  "rainfall": 165.0,
  "river_level": 9.8,
  "soil_moisture": 88.0,
  "elevation": 22.0,
  "historical_flood_frequency": 0.45,
  "latitude": 25.594,
  "longitude": 85.137,
  "temperature": 28.0,
  "humidity": 92.0,
  "land_cover": "Urban",
  "drainage_proximity": 0.4
}
```

**Response Payload:**
```json
{
  "flood_probability": 0.8852,
  "risk_percentage": 88.5,
  "risk_category": "Very High Risk",
  "top_factors": [
    "Severe precipitation surge (165 mm/24h)",
    "Critical river overflow level (9.8 m)",
    "High soil water saturation (88%)",
    "Low-lying terrain vulnerability (22 m ASL)"
  ],
  "recommended_action": "CRITICAL WARNING: Imminent inundation risk. Activate emergency protocols, move to higher ground.",
  "model_used": "HistGradientBoosting / LightGBM",
  "disclaimer": "This system provides machine-learning-based risk estimates for demonstration and decision-support purposes. It is not an official emergency warning system."
}
```

---

## 🌟 Hackathon Demo Features
- **Judge Demo Mode:** 1-click execution to demonstrate high-risk, moderate-risk, and low-risk scenarios.
- **Factor Explainability:** Instant breakdown of why a particular region is vulnerable (precipitation spike, saturation, topography).
- **Interactive Dark Map:** High-contrast CartoDB tiles with risk-colored nodes, radius scaling, and telemetry popups.
- **Glassmorphism UI:** Modern dark UI with cyan/blue accents and danger-pulse alerts.

---

## 🔮 Limitations & Future Improvements
1. **Satellite Radar Ingestion:** Integrate real-time Synthetic Aperture Radar (SAR) imagery from Sentinel-1 / NASA GRACE.
2. **Dynamic Hydrodynamic Simulation:** Couple ML predictions with 2D shallow water equation solvers (HEC-RAS).
3. **IoT Sensor Mesh:** Stream live ultrasonic water level gauge and soil moisture sensor telemetry over MQTT/WebSockets.
