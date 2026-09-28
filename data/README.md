# 📊 Dataset Information & Kaggle Integration

## Overview
This repository supports high-dimensional hydrological datasets with **100,000 to 1,000,000+ records**.

## Features Included
- **`rainfall`**: 24-hour / 48-hour cumulative precipitation in millimeters (mm)
- **`river_level`**: Water discharge stage in meters (m) relative to normal bankfull stage
- **`soil_moisture`**: Sub-surface soil water saturation percentage (0–100%)
- **`elevation`**: Topographic elevation above sea level in meters (m ASL)
- **`historical_flood_frequency`**: Historical flood events recorded over the last 20 years
- **`latitude` / `longitude`**: Geographical coordinates
- **`temperature`**: Ambient temperature in °C
- **`humidity`**: Relative atmospheric humidity percentage (0–100%)
- **`land_cover`**: Land use category (`Urban`, `Agricultural`, `Forest`, `Wetland`, `Grassland`, `Barren`)
- **`drainage_proximity`**: Distance to nearest primary river tributary or drainage channel (km)
- **`flood`**: Target binary flood occurrence (1 = Inundation Event, 0 = Safe Baseline)

---

## Using Kaggle Flood Datasets
You can plug in any Kaggle flood dataset (e.g. *Kaggle Playground Series s4e5: Flood Prediction Competition* or real-world hydrological monitoring datasets):

1. Download the Kaggle dataset:
   ```bash
   kaggle competitions download -c playground-series-s4e5
   # or
   kaggle datasets download -d <dataset-slug>
   ```
2. Unzip and place the CSV into `./data/`
3. Update `.env`:
   ```env
   DATASET_PATH=./data/train.csv
   TARGET_COLUMN=FloodProbability
   ```
4. Re-run training:
   ```bash
   python ml/train.py
   ```
The pipeline automatically handles column matching, missing value median/mode imputation, encoding, and leak-free cross-validation.
