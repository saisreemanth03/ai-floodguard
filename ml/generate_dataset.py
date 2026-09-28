"""
Realistic Benchmark Kaggle Flood-Risk Dataset Generator
Generates a comprehensive dataset with 120,000+ records (configurable to 500k+)
including rainfall, river levels, soil moisture, elevation, historical floods,
geographical coordinates, land use, temperature, humidity, and drainage proximity.
"""

import os
import numpy as np
import pandas as pd

def generate_flood_dataset(n_samples: int = 125000, output_path: str = "./data/flood_dataset.csv", random_state: int = 42) -> pd.DataFrame:
    """
    Generates a realistic multi-feature hydrological dataset for flood risk modeling.
    Uses physics-grounded nonlinear relationships and realistic geographical bounding boxes.
    """
    np.random.seed(random_state)
    print(f"Generating {n_samples:,} records for flood risk dataset...")

    # 1. Geographic Coordinates (Multi-region realistic distributions covering major river basins)
    # India/Asia, US Mississippi/Ohio basins, Europe Rhine/Danube, South America Amazon/Parana
    regions = [
        {"name": "Ganges-Brahmaputra", "lat_center": 25.5, "lon_center": 85.0, "lat_std": 3.0, "lon_std": 4.5, "weight": 0.35},
        {"name": "Mississippi-Missouri", "lat_center": 35.0, "lon_center": -90.0, "lat_std": 4.0, "lon_std": 5.0, "weight": 0.25},
        {"name": "Danube-Rhine", "lat_center": 47.5, "lon_center": 14.0, "lat_std": 2.5, "lon_std": 3.5, "weight": 0.20},
        {"name": "Yangtze-Mekong", "lat_center": 28.0, "lon_center": 108.0, "lat_std": 3.5, "lon_std": 4.0, "weight": 0.20},
    ]

    region_choices = np.random.choice(len(regions), size=n_samples, p=[r["weight"] for r in regions])
    
    latitudes = np.zeros(n_samples)
    longitudes = np.zeros(n_samples)
    for i, reg in enumerate(regions):
        idx = (region_choices == i)
        count = np.sum(idx)
        if count > 0:
            latitudes[idx] = np.random.normal(reg["lat_center"], reg["lat_std"], count)
            longitudes[idx] = np.random.normal(reg["lon_center"], reg["lon_std"], count)

    # 2. Meteorological Features
    # Rainfall (mm in last 24h/48h): Gamma distributed with heavy tail
    rainfall_base = np.random.gamma(shape=2.5, scale=28.0, size=n_samples)
    # Inject monsoon / cloudburst / extreme storm events in 6% of cases
    extreme_mask = np.random.rand(n_samples) < 0.06
    rainfall_base[extreme_mask] += np.random.uniform(100.0, 280.0, np.sum(extreme_mask))
    rainfall = np.round(np.clip(rainfall_base, 0.0, 450.0), 2)

    # Temperature (°C)
    temperature = np.round(np.random.normal(26.0, 6.5, n_samples), 1)
    temperature = np.clip(temperature, 2.0, 48.0)

    # Relative Humidity (%)
    humidity = np.round(np.clip(50.0 + 0.35 * rainfall + np.random.normal(0, 10, n_samples), 20.0, 99.0), 1)

    # 3. Hydrological & Terrestrial Features
    # River / Water Level (meters): Normal range 1.5 - 5.0m, danger stage > 7.5m
    river_level = np.round(np.clip(2.0 + (rainfall / 45.0) + np.random.gamma(shape=2.0, scale=0.8, size=n_samples), 0.5, 14.5), 2)

    # Soil Moisture (% saturation): strongly correlated with rainfall and river level
    soil_moisture = np.round(np.clip(30.0 + 0.45 * rainfall + 2.5 * river_level + np.random.normal(0, 8, n_samples), 5.0, 100.0), 1)

    # Elevation (meters above sea level): Log-normal distribution
    elevation_raw = np.random.lognormal(mean=3.8, sigma=1.0, size=n_samples)
    elevation = np.round(np.clip(elevation_raw, 2.0, 2400.0), 1)

    # Drainage proximity (km distance to nearest river / primary drainage channel)
    drainage_proximity = np.round(np.clip(np.random.exponential(scale=3.5, size=n_samples) + 0.2, 0.05, 35.0), 2)

    # Historical Flood Frequency (floods recorded in the past 20 years: 0 to 12)
    historical_flood_count = np.random.poisson(lam=1.8, size=n_samples)
    # Scale with proximity and low elevation
    hist_boost = (elevation < 60).astype(int) * 2 + (drainage_proximity < 1.5).astype(int) * 2
    historical_flood_count = np.clip(historical_flood_count + hist_boost + np.random.choice([0, 1, 2], size=n_samples, p=[0.7, 0.2, 0.1]), 0, 15)
    historical_flood_frequency = np.round(historical_flood_count / 20.0, 3)

    # Land Cover / Land Use
    land_cover_categories = ['Urban', 'Agricultural', 'Forest', 'Wetland', 'Grassland', 'Barren']
    land_cover_probs = [0.28, 0.32, 0.18, 0.08, 0.09, 0.05]
    land_cover = np.random.choice(land_cover_categories, size=n_samples, p=land_cover_probs)

    # Runoff coefficient multiplier based on land cover
    runoff_map = {'Urban': 1.45, 'Agricultural': 1.10, 'Forest': 0.70, 'Wetland': 1.30, 'Grassland': 0.85, 'Barren': 1.15}
    runoff_factor = np.array([runoff_map[lc] for lc in land_cover])

    # 4. Physical Flood Probability Calculation (Hydrological Risk Index)
    # Elevation factor (low elevation has high vulnerability)
    elevation_factor = np.exp(-elevation / 85.0)
    # Proximity factor
    proximity_factor = np.exp(-drainage_proximity / 2.5)

    # Composite Risk score
    raw_score = (
        0.34 * (rainfall / 120.0) +
        0.26 * (river_level / 7.0) +
        0.18 * (soil_moisture / 75.0) +
        0.15 * elevation_factor +
        0.12 * proximity_factor +
        0.10 * (historical_flood_frequency * 3.0) +
        0.08 * (humidity / 80.0)
    ) * runoff_factor

    # Convert to logistic probability
    logits = (raw_score - 1.18) * 3.6 + np.random.normal(0, 0.25, n_samples)
    flood_prob = 1.0 / (1.0 + np.exp(-logits))
    flood_prob = np.clip(flood_prob, 0.001, 0.999)

    # Binary flood event classification (Target)
    # Threshold chosen so flood event prevalence is ~28-32% (typical natural hazard balance)
    flood_target = (flood_prob >= 0.50).astype(int)

    # Create DataFrame
    df = pd.DataFrame({
        'rainfall': rainfall,
        'river_level': river_level,
        'soil_moisture': soil_moisture,
        'elevation': elevation,
        'historical_flood_frequency': historical_flood_frequency,
        'latitude': np.round(latitudes, 5),
        'longitude': np.round(longitudes, 5),
        'temperature': temperature,
        'humidity': humidity,
        'land_cover': land_cover,
        'drainage_proximity': drainage_proximity,
        'flood': flood_target
    })

    # Add a small amount of realistic missingness (<0.8%) in secondary features for imputation testing
    missing_indices_temp = np.random.choice(n_samples, size=int(n_samples * 0.006), replace=False)
    missing_indices_hum = np.random.choice(n_samples, size=int(n_samples * 0.005), replace=False)
    missing_indices_soil = np.random.choice(n_samples, size=int(n_samples * 0.004), replace=False)
    df.loc[missing_indices_temp, 'temperature'] = np.nan
    df.loc[missing_indices_hum, 'humidity'] = np.nan
    df.loc[missing_indices_soil, 'soil_moisture'] = np.nan

    # Ensure output directory exists and save
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    df.to_csv(output_path, index=False)
    print(f"Successfully generated and saved dataset to {output_path}")
    print(f"Dataset Shape: {df.shape}")
    print(f"Flood Events: {df['flood'].sum():,} ({df['flood'].mean()*100:.2f}%)")
    print(f"Non-Flood Events: {(df['flood'] == 0).sum():,} ({(1-df['flood'].mean())*100:.2f}%)")
    return df

if __name__ == '__main__':
    generate_flood_dataset()
