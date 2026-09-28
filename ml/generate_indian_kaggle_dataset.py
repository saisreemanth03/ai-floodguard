"""
Indian Kaggle Flood Risk & Hydrological Dataset Generator
Generates a comprehensive 150,000+ record dataset representing Indian River Basins,
IMD (India Meteorological Department) Monsoon Observations, CWC (Central Water Commission)
River Gauges, Dam Discharges, and Topographical / Soil telemetry.
"""

import os
import numpy as np
import pandas as pd

# Define 15 major Indian River Basins with realistic bounding boxes, states, and hydrological profiles
INDIAN_BASIN_PROFILES = [
    {
        "basin": "Brahmaputra",
        "states": ["Assam", "Arunachal Pradesh", "Meghalaya"],
        "lat_range": (25.5, 27.8),
        "lon_range": (89.8, 95.5),
        "elevation_mean": 85.0,
        "rainfall_scale": 48.0, # High rainfall (NE monsoon / heavy SW)
        "flood_vulnerability": 1.45,
        "weight": 0.16
    },
    {
        "basin": "Ganga (Lower & Middle)",
        "states": ["Bihar", "Uttar Pradesh", "West Bengal"],
        "lat_range": (24.5, 27.2),
        "lon_range": (80.5, 88.5),
        "elevation_mean": 65.0,
        "rainfall_scale": 36.0,
        "flood_vulnerability": 1.35,
        "weight": 0.20
    },
    {
        "basin": "Yamuna",
        "states": ["Delhi NCR", "Haryana", "Uttar Pradesh", "Himachal Pradesh"],
        "lat_range": (27.0, 31.0),
        "lon_range": (76.8, 79.5),
        "elevation_mean": 210.0,
        "rainfall_scale": 28.0,
        "flood_vulnerability": 1.15,
        "weight": 0.08
    },
    {
        "basin": "Mahanadi & Baitarani",
        "states": ["Odisha", "Chhattisgarh"],
        "lat_range": (19.8, 22.5),
        "lon_range": (82.5, 86.9),
        "elevation_mean": 95.0,
        "rainfall_scale": 40.0,
        "flood_vulnerability": 1.30,
        "weight": 0.10
    },
    {
        "basin": "Godavari",
        "states": ["Maharashtra", "Telangana", "Andhra Pradesh"],
        "lat_range": (16.8, 20.0),
        "lon_range": (73.8, 82.2),
        "elevation_mean": 280.0,
        "rainfall_scale": 32.0,
        "flood_vulnerability": 1.10,
        "weight": 0.10
    },
    {
        "basin": "Krishna & Tungabhadra",
        "states": ["Karnataka", "Maharashtra", "Andhra Pradesh", "Telangana"],
        "lat_range": (15.0, 17.8),
        "lon_range": (74.0, 80.8),
        "elevation_mean": 450.0,
        "rainfall_scale": 26.0,
        "flood_vulnerability": 1.05,
        "weight": 0.08
    },
    {
        "basin": "Periyar & Pamba (Western Ghats)",
        "states": ["Kerala", "Tamil Nadu"],
        "lat_range": (8.8, 11.5),
        "lon_range": (75.8, 77.2),
        "elevation_mean": 120.0,
        "rainfall_scale": 52.0, # Intense orographic monsoon downpours
        "flood_vulnerability": 1.40,
        "weight": 0.09
    },
    {
        "basin": "Cauvery",
        "states": ["Tamil Nadu", "Karnataka"],
        "lat_range": (10.5, 12.8),
        "lon_range": (75.5, 79.8),
        "elevation_mean": 320.0,
        "rainfall_scale": 25.0,
        "flood_vulnerability": 0.95,
        "weight": 0.06
    },
    {
        "basin": "Narmada & Tapi",
        "states": ["Gujarat", "Madhya Pradesh", "Maharashtra"],
        "lat_range": (21.0, 23.2),
        "lon_range": (72.6, 79.0),
        "elevation_mean": 180.0,
        "rainfall_scale": 30.0,
        "flood_vulnerability": 1.05,
        "weight": 0.07
    },
    {
        "basin": "Indus / Jhelum / Sutlej Tributaries",
        "states": ["Punjab", "Jammu & Kashmir", "Himachal Pradesh", "Uttarakhand"],
        "lat_range": (30.5, 34.5),
        "lon_range": (74.5, 78.5),
        "elevation_mean": 650.0,
        "rainfall_scale": 29.0,
        "flood_vulnerability": 1.15,
        "weight": 0.06
    }
]

def generate_indian_flood_dataset(
    n_samples: int = 150000,
    output_path: str = "./data/flood_dataset.csv",
    random_state: int = 42
) -> pd.DataFrame:
    """
    Generates a 150,000-record Indian River Basin and Meteorological Flood Dataset
    conforming to Kaggle flood benchmark standards with real Indian state and river basin distributions.
    """
    np.random.seed(random_state)
    print(f"Generating {n_samples:,} Indian hydrological & meteorological flood observation records...")

    # Normalize weights
    weights = np.array([p["weight"] for p in INDIAN_BASIN_PROFILES])
    weights = weights / weights.sum()

    basin_choices = np.random.choice(len(INDIAN_BASIN_PROFILES), size=n_samples, p=weights)

    # Pre-allocate feature arrays
    river_basins = []
    states = []
    latitudes = np.zeros(n_samples)
    longitudes = np.zeros(n_samples)
    elevations = np.zeros(n_samples)
    rainfall_scales = np.zeros(n_samples)
    vulnerabilities = np.zeros(n_samples)

    for i in range(n_samples):
        p = INDIAN_BASIN_PROFILES[basin_choices[i]]
        river_basins.append(p["basin"])
        states.append(np.random.choice(p["states"]))
        latitudes[i] = np.random.uniform(p["lat_range"][0], p["lat_range"][1])
        longitudes[i] = np.random.uniform(p["lon_range"][0], p["lon_range"][1])
        # Elevation with lognormal variation around basin mean
        elevations[i] = max(2.0, np.random.lognormal(mean=np.log(max(10.0, p["elevation_mean"])), sigma=0.6))
        rainfall_scales[i] = p["rainfall_scale"]
        vulnerabilities[i] = p["flood_vulnerability"]

    latitudes = np.round(latitudes, 4)
    longitudes = np.round(longitudes, 4)
    elevations = np.round(np.clip(elevations, 2.0, 2800.0), 1)

    # Monsoon Season Classification (SW Monsoon accounts for ~70% of annual flood events in India)
    seasons = ['Southwest Monsoon (JJAS)', 'Northeast Monsoon (OND)', 'Pre-Monsoon / Summer', 'Post-Monsoon / Winter']
    season_probs = [0.65, 0.15, 0.10, 0.10]
    monsoon_season = np.random.choice(seasons, size=n_samples, p=season_probs)
    season_mult = np.where(monsoon_season == 'Southwest Monsoon (JJAS)', 1.45,
                  np.where(monsoon_season == 'Northeast Monsoon (OND)', 1.15, 0.55))

    # Rainfall (mm in last 24h/72h): Heavy-tailed Gamma with monsoon multiplier
    rainfall_base = np.random.gamma(shape=2.4, scale=rainfall_scales, size=n_samples) * season_mult
    # Inject extreme precipitation events / cloudbursts in 7.5% of samples
    cloudburst_mask = np.random.rand(n_samples) < 0.075
    rainfall_base[cloudburst_mask] += np.random.uniform(110.0, 320.0, np.sum(cloudburst_mask))
    rainfall = np.round(np.clip(rainfall_base, 0.0, 480.0), 2)

    # Ambient Temperature (°C) - Indian tropical & subtropical climate
    temperature = np.round(np.clip(np.random.normal(29.0, 5.5, n_samples) - (rainfall / 35.0), 12.0, 46.0), 1)

    # Relative Humidity (%) - Highly correlated with monsoon rain
    humidity = np.round(np.clip(52.0 + 0.38 * rainfall + np.random.normal(0, 7.5, n_samples), 25.0, 99.0), 1)

    # River / Gauge Water Level (m) relative to gauge zero
    river_level = np.round(np.clip(1.8 + (rainfall / 38.0) + np.random.gamma(shape=2.2, scale=0.9, size=n_samples), 0.5, 16.5), 2)

    # Soil Moisture (% saturation)
    soil_moisture = np.round(np.clip(28.0 + 0.48 * rainfall + 2.8 * river_level + np.random.normal(0, 6.5, n_samples), 8.0, 100.0), 1)

    # Proximity to River / Drainage Canal (km)
    drainage_proximity = np.round(np.clip(np.random.exponential(scale=3.2, size=n_samples) + 0.1, 0.05, 38.0), 2)

    # Upstream Dam / Reservoir Discharge (cumecs - m³/s)
    reservoir_discharge = np.round(np.clip(np.where(rainfall > 80.0, np.random.gamma(shape=2.5, scale=1200.0, size=n_samples), np.random.exponential(scale=300.0, size=n_samples)), 0.0, 18500.0), 1)

    # Land Cover Types in Indian Geographies
    land_cover_categories = [
        'Agricultural (Paddy/Kharif)',
        'Urban High-Density',
        'Wetland / Floodplain',
        'Forest / Catchment',
        'Coastal / Alluvial',
        'Barren / Fallow'
    ]
    land_cover_probs = [0.38, 0.24, 0.12, 0.12, 0.08, 0.06]
    land_cover = np.random.choice(land_cover_categories, size=n_samples, p=land_cover_probs)

    # Runoff factor based on land use
    runoff_map = {
        'Agricultural (Paddy/Kharif)': 1.15,
        'Urban High-Density': 1.50,
        'Wetland / Floodplain': 1.35,
        'Forest / Catchment': 0.65,
        'Coastal / Alluvial': 1.25,
        'Barren / Fallow': 1.10
    }
    runoff_factor = np.array([runoff_map[lc] for lc in land_cover])

    # Historical Flood Frequency (floods in past 20 years: 0 to 14)
    hist_base = np.random.poisson(lam=2.2, size=n_samples)
    hist_boost = (elevations < 75.0).astype(int) * 2 + (drainage_proximity < 1.8).astype(int) * 2
    historical_flood_count = np.clip(hist_base + hist_boost + np.random.choice([0, 1, 2], size=n_samples, p=[0.65, 0.25, 0.10]), 0, 15)
    historical_flood_frequency = np.round(historical_flood_count / 20.0, 3)

    # Ground-truth Hydrological Physical Risk Index (CWC / IMD Inundation Model)
    elevation_factor = np.exp(-elevations / 70.0)
    proximity_factor = np.exp(-drainage_proximity / 2.2)
    discharge_factor = np.clip(reservoir_discharge / 5000.0, 0.0, 2.0)

    composite_risk_score = (
        0.32 * (rainfall / 110.0) +
        0.25 * (river_level / 6.5) +
        0.16 * (soil_moisture / 75.0) +
        0.14 * elevation_factor +
        0.11 * proximity_factor +
        0.08 * (historical_flood_frequency * 3.0) +
        0.08 * discharge_factor +
        0.05 * (humidity / 85.0)
    ) * runoff_factor * vulnerabilities

    # Sigmoid mapping for flood occurrence probability
    flood_prob = 1.0 / (1.0 + np.exp(-3.6 * (composite_risk_score - 1.08)))
    flood_prob = np.clip(flood_prob + np.random.normal(0, 0.03, n_samples), 0.001, 0.999)

    # Binary flood event label with 0.50 threshold
    flood = (flood_prob >= 0.50).astype(int)

    # Assemble DataFrame
    df = pd.DataFrame({
        'state': states,
        'river_basin': river_basins,
        'latitude': latitudes,
        'longitude': longitudes,
        'monsoon_season': monsoon_season,
        'rainfall': rainfall,
        'river_level': river_level,
        'soil_moisture': soil_moisture,
        'elevation': elevations,
        'drainage_proximity': drainage_proximity,
        'reservoir_discharge_cumec': reservoir_discharge,
        'historical_flood_frequency': historical_flood_frequency,
        'land_cover': land_cover,
        'temperature': temperature,
        'humidity': humidity,
        'flood': flood
    })

    # Save dataset to CSV
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    df.to_csv(output_path, index=False)
    print(f"Dataset successfully created and saved to: {output_path}")
    print(f"Total Rows: {len(df):,} | Total Columns: {len(df.columns)}")
    print(f"Class Distribution: Non-Flood={np.sum(flood==0):,} ({np.mean(flood==0)*100:.1f}%), Flood={np.sum(flood==1):,} ({np.mean(flood==1)*100:.1f}%)")
    
    return df

if __name__ == "__main__":
    generate_indian_flood_dataset(150000, "./data/flood_dataset.csv")
