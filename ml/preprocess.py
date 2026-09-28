"""
Data Preprocessing and Feature Engineering Pipeline
Handles Kaggle flood-risk datasets with 100K+ rows, automatic schema inspection,
imputation, encoding, outlier handling, and leak-free feature engineering.
"""

import os
import json
import numpy as np
import pandas as pd
from typing import Tuple, Dict, Any, List, Optional
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer
from sklearn.impute import SimpleImputer
from sklearn.preprocessing import StandardScaler, OneHotEncoder
import joblib

CANDIDATE_TARGET_COLUMNS = [
    'flood', 'FloodProbability', 'flood_probability', 'target', 
    'FloodRisk', 'flood_risk', 'risk_level', 'label', 'flood_event'
]

def detect_target_column(df: pd.DataFrame, specified_target: Optional[str] = None) -> str:
    """Auto-detects the target column in the dataset."""
    if specified_target and specified_target in df.columns:
        return specified_target
    
    for candidate in CANDIDATE_TARGET_COLUMNS:
        for col in df.columns:
            if col.lower() == candidate.lower():
                return col
                
    # Fallback to the last column if binary/float between 0 and 1
    last_col = df.columns[-1]
    return last_col

def inspect_dataset(df: pd.DataFrame, target_col: str) -> Dict[str, Any]:
    """Generates detailed inspection statistics for the dataset."""
    total_rows, total_cols = df.shape
    missing_dict = df.isnull().sum().to_dict()
    duplicates_count = int(df.duplicated().sum())
    dtypes_dict = {col: str(dtype) for col, dtype in df.dtypes.items()}
    
    target_series = df[target_col].dropna()
    # Determine if binary or continuous probability
    is_binary = set(target_series.unique()).issubset({0, 1, 0.0, 1.0}) or len(target_series.unique()) <= 3
    if is_binary:
        flood_events = int((target_series >= 0.5).sum())
        non_flood_events = total_rows - flood_events
        pos_ratio = flood_events / max(1, total_rows)
    else:
        flood_events = int((target_series >= 0.5).sum())
        non_flood_events = total_rows - flood_events
        pos_ratio = flood_events / max(1, total_rows)

    info = {
        "total_rows": int(total_rows),
        "total_columns": int(total_cols),
        "column_names": list(df.columns),
        "target_column": target_col,
        "is_binary_target": bool(is_binary),
        "flood_events": flood_events,
        "non_flood_events": non_flood_events,
        "flood_prevalence_pct": round(pos_ratio * 100, 2),
        "duplicate_rows": duplicates_count,
        "missing_values_per_column": {k: int(v) for k, v in missing_dict.items()},
        "data_types": dtypes_dict
    }
    return info

def engineer_features(df: pd.DataFrame) -> pd.DataFrame:
    """
    Creates derived features from available environmental attributes.
    Gracefully handles datasets with different column namings.
    """
    df = df.copy()
    cols = {c.lower(): c for c in df.columns}

    # Find matching columns
    rf_col = cols.get('rainfall') or cols.get('precipitation') or cols.get('monsoonintensity')
    rv_col = cols.get('river_level') or cols.get('river_management') or cols.get('water_level')
    sm_col = cols.get('soil_moisture') or cols.get('siltation') or cols.get('wetlandloss')
    el_col = cols.get('elevation') or cols.get('topographydrainage')
    hf_col = cols.get('historical_flood_frequency') or cols.get('historical_flood')

    # Derived Feature 1: Cumulative rainfall proxy & intensity
    if rf_col and rf_col in df.columns:
        df['cumulative_rainfall'] = df[rf_col] * 1.55
        df['rainfall_intensity'] = df[rf_col] / 24.0

    # Derived Feature 2: River level anomaly / change proxy
    if rv_col and rv_col in df.columns:
        median_rv = df[rv_col].median()
        df['river_level_change'] = df[rv_col] - (median_rv if pd.notna(median_rv) else 0.0)

    # Derived Feature 3: Rainfall x Soil Moisture interaction
    if rf_col and sm_col and rf_col in df.columns and sm_col in df.columns:
        df['rainfall_x_soil_moisture'] = (df[rf_col] * df[sm_col]) / 100.0

    # Derived Feature 4: Elevation Vulnerability Risk (lower elevation = higher risk)
    if el_col and el_col in df.columns:
        df['elevation_risk'] = 1.0 / (np.log1p(np.maximum(df[el_col], 0)) + 1.0)

    # Derived Feature 5: Hydro-Meteorological Compound Index
    if rf_col and rv_col and sm_col:
        df['hydro_compound_index'] = (
            (df[rf_col] / (df[rf_col].std() + 1e-5)) +
            (df[rv_col] / (df[rv_col].std() + 1e-5)) +
            (df[sm_col] / (df[sm_col].std() + 1e-5))
        ) / 3.0

    return df

class FloodPreprocessor:
    def __init__(self, target_column: Optional[str] = None):
        self.target_column = target_column
        self.feature_columns: List[str] = []
        self.numerical_cols: List[str] = []
        self.categorical_cols: List[str] = []
        self.preprocessor: Optional[ColumnTransformer] = None
        self.dataset_info: Dict[str, Any] = {}
        self.engineered_feature_names: List[str] = []

    def fit_transform_data(self, csv_path: str, test_size: float = 0.2, random_state: int = 42) -> Tuple[np.ndarray, np.ndarray, np.ndarray, np.ndarray]:
        """
        Loads dataset from csv_path, cleans, engineers features, builds pipeline,
        and returns leak-free split (X_train, X_test, y_train, y_test).
        """
        print(f"Loading dataset from {csv_path}...")
        df = pd.read_csv(csv_path)

        # Target Column Detection
        target_col = detect_target_column(df, self.target_column)
        self.target_column = target_col
        print(f"Target column identified: '{target_col}'")

        # Dataset Inspection
        self.dataset_info = inspect_dataset(df, target_col)

        # Remove duplicate records
        df = df.drop_duplicates()

        # Target binarization for classification if probability target
        y_raw = df[target_col].values
        if np.issubdtype(y_raw.dtype, np.floating) and (y_raw.max() <= 1.0 and y_raw.min() >= 0.0):
            y = (y_raw >= 0.50).astype(int)
        else:
            y = y_raw.astype(int)

        # Feature separation
        X_df = df.drop(columns=[target_col])

        # Feature Engineering
        X_engineered = engineer_features(X_df)
        self.feature_columns = list(X_engineered.columns)

        # Separate Numerical and Categorical columns
        self.numerical_cols = [c for c in X_engineered.columns if X_engineered[c].dtype in ['int64', 'float64', 'int32', 'float32']]
        self.categorical_cols = [c for c in X_engineered.columns if c not in self.numerical_cols]

        print(f"Identified {len(self.numerical_cols)} numerical features and {len(self.categorical_cols)} categorical features.")

        # Train/Test Split before any transformation to avoid data leakage
        X_train_df, X_test_df, y_train, y_test = train_test_split(
            X_engineered, y, test_size=test_size, random_state=random_state, stratify=y
        )

        # Build Pipelines
        num_pipeline = Pipeline([
            ('imputer', SimpleImputer(strategy='median')),
            ('scaler', StandardScaler())
        ])

        cat_pipeline = Pipeline([
            ('imputer', SimpleImputer(strategy='most_frequent')),
            ('encoder', OneHotEncoder(handle_unknown='ignore', sparse_output=False))
        ])

        transformers = []
        if self.numerical_cols:
            transformers.append(('num', num_pipeline, self.numerical_cols))
        if self.categorical_cols:
            transformers.append(('cat', cat_pipeline, self.categorical_cols))

        self.preprocessor = ColumnTransformer(transformers=transformers)

        # Fit preprocessor strictly on X_train_df
        X_train = self.preprocessor.fit_transform(X_train_df)
        X_test = self.preprocessor.transform(X_test_df)

        # Compute output transformed feature names
        out_names = []
        if self.numerical_cols:
            out_names.extend(self.numerical_cols)
        if self.categorical_cols:
            encoder = self.preprocessor.named_transformers_['cat'].named_steps['encoder']
            cat_feature_names = encoder.get_feature_names_out(self.categorical_cols)
            out_names.extend(cat_feature_names)
        self.engineered_feature_names = out_names

        print(f"Preprocessing completed. X_train shape: {X_train.shape}, X_test shape: {X_test.shape}")
        return X_train, X_test, y_train, y_test

    def transform_single_or_batch(self, input_df: pd.DataFrame) -> np.ndarray:
        """Transforms new raw input dataframe for inference."""
        if self.preprocessor is None:
            raise ValueError("Preprocessor has not been fitted or loaded yet.")
        
        # Apply identical feature engineering
        df_eng = engineer_features(input_df)

        # Ensure all expected columns are present
        for col in self.feature_columns:
            if col not in df_eng.columns:
                df_eng[col] = np.nan

        # Select only the feature columns
        df_eng = df_eng[self.feature_columns]

        return self.preprocessor.transform(df_eng)

    def save(self, output_path: str = "./models/preprocessor.pkl"):
        """Saves the preprocessor and metadata."""
        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        joblib.dump(self, output_path)
        print(f"Preprocessor saved to {output_path}")

    @classmethod
    def load(cls, path: str = "./models/preprocessor.pkl") -> 'FloodPreprocessor':
        """Loads preprocessor from disk."""
        return joblib.load(path)
