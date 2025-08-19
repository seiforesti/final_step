from typing import Dict, List, Any, Optional, Tuple, Union
import pandas as pd
import numpy as np
from sqlalchemy import create_engine, text
from pymongo import MongoClient
import logging
from app.models.scan_models import DataSource, DataSourceType
from app.services.data_source_service import DataSourceService

# Setup logging
logger = logging.getLogger(__name__)

class DataProfilingService:
    """Service for data sampling and profiling."""
    
    @staticmethod
    def sample_data(data_source: DataSource, table_name: str, schema_name: Optional[str] = None, 
                   sample_size: int = 1000, app_secret: Optional[str] = None) -> pd.DataFrame:
        """Sample data from a table.
        
        Args:
            data_source: The data source to sample from
            table_name: The name of the table to sample
            schema_name: The schema name (for PostgreSQL)
            sample_size: The number of rows to sample
            app_secret: Optional app secret for decrypting passwords
            
        Returns:
            A pandas DataFrame containing the sampled data
        """
        try:
            # Get the password
            password = DataSourceService.get_data_source_password(data_source, app_secret)
            
            if data_source.source_type in [DataSourceType.MYSQL, DataSourceType.POSTGRESQL, DataSourceType.ORACLE, DataSourceType.SQLSERVER]:
                # Handle SQL databases
                if data_source.source_type == DataSourceType.MYSQL:
                    connection_uri = f"mysql+pymysql://{data_source.username}:{password}@{data_source.host}:{data_source.port}/{data_source.database_name or ''}"
                    schema_clause = ""
                elif data_source.source_type == DataSourceType.POSTGRESQL:
                    connection_uri = f"postgresql+psycopg2://{data_source.username}:{password}@{data_source.host}:{data_source.port}/{data_source.database_name or ''}"
                    schema_clause = f"\"{schema_name}\"." if schema_name else ""
                elif data_source.source_type == DataSourceType.ORACLE:
                    connection_uri = f"oracle+cx_oracle://{data_source.username}:{password}@{data_source.host}:{data_source.port}/{data_source.database_name or ''}"
                    schema_clause = f"{schema_name}." if schema_name else ""
                elif data_source.source_type == DataSourceType.SQLSERVER:
                    connection_uri = f"mssql+pyodbc://{data_source.username}:{password}@{data_source.host}:{data_source.port}/{data_source.database_name or ''}?driver=ODBC+Driver+17+for+SQL+Server"
                    schema_clause = f"[{schema_name}]." if schema_name else ""
                
                engine = create_engine(connection_uri)
                
                # Create a query that works for the specific database type
                if data_source.source_type == DataSourceType.MYSQL:
                    query = f"SELECT * FROM `{table_name}` ORDER BY RAND() LIMIT {sample_size}"
                elif data_source.source_type == DataSourceType.POSTGRESQL:
                    query = f"SELECT * FROM {schema_clause}\"{table_name}\" ORDER BY RANDOM() LIMIT {sample_size}"
                elif data_source.source_type == DataSourceType.ORACLE:
                    query = f"SELECT * FROM {schema_clause}\"{table_name}\" SAMPLE({sample_size} ROWS)"
                elif data_source.source_type == DataSourceType.SQLSERVER:
                    query = f"SELECT TOP {sample_size} * FROM {schema_clause}[{table_name}] ORDER BY NEWID()"
                
                # Execute the query and return the results as a DataFrame
                return pd.read_sql(query, engine)
                
            elif data_source.source_type == DataSourceType.MONGODB:
                # Handle MongoDB
                connection_uri = f"mongodb://{data_source.username}:{password}@{data_source.host}:{data_source.port}"
                client = MongoClient(connection_uri)
                db = client[data_source.database_name]
                collection = db[table_name]
                
                # Sample documents from the collection
                pipeline = [
                    {"$sample": {"size": sample_size}}
                ]
                cursor = collection.aggregate(pipeline)
                
                # Convert to DataFrame
                data = list(cursor)
                if not data:
                    return pd.DataFrame()
                return pd.DataFrame(data)
            
            else:
                logger.error(f"Unsupported data source type for sampling: {data_source.source_type}")
                return pd.DataFrame()
                
        except Exception as e:
            logger.error(f"Error sampling data: {str(e)}")
            raise
    
    @staticmethod
    def profile_data(df: pd.DataFrame) -> Dict[str, Any]:
        """Generate a profile of the data.
        
        Args:
            df: The DataFrame to profile
            
        Returns:
            A dictionary containing profile information
        """
        if df.empty:
            return {"error": "No data to profile"}
        
        try:
            profile = {
                "row_count": len(df),
                "column_count": len(df.columns),
                "columns": {}
            }
            
            # Profile each column
            for column in df.columns:
                col_data = df[column]
                col_profile = {
                    "data_type": str(col_data.dtype),
                    "null_count": col_data.isna().sum(),
                    "null_percentage": round(col_data.isna().mean() * 100, 2),
                }
                
                # Add numeric statistics if applicable
                if np.issubdtype(col_data.dtype, np.number):
                    col_profile.update({
                        "min": col_data.min() if not pd.isna(col_data.min()) else None,
                        "max": col_data.max() if not pd.isna(col_data.max()) else None,
                        "mean": col_data.mean() if not pd.isna(col_data.mean()) else None,
                        "median": col_data.median() if not pd.isna(col_data.median()) else None,
                        "std_dev": col_data.std() if not pd.isna(col_data.std()) else None,
                        "quartiles": {
                            "25%": col_data.quantile(0.25) if not pd.isna(col_data.quantile(0.25)) else None,
                            "50%": col_data.quantile(0.5) if not pd.isna(col_data.quantile(0.5)) else None,
                            "75%": col_data.quantile(0.75) if not pd.isna(col_data.quantile(0.75)) else None
                        }
                    })
                
                # Add string statistics if applicable
                elif col_data.dtype == 'object':
                    # Calculate string lengths
                    str_lengths = col_data.dropna().astype(str).str.len()
                    if not str_lengths.empty:
                        col_profile.update({
                            "min_length": str_lengths.min() if not pd.isna(str_lengths.min()) else None,
                            "max_length": str_lengths.max() if not pd.isna(str_lengths.max()) else None,
                            "avg_length": str_lengths.mean() if not pd.isna(str_lengths.mean()) else None,
                        })
                    
                    # Get value counts for categorical analysis
                    value_counts = col_data.value_counts(dropna=True).head(10).to_dict()
                    col_profile["top_values"] = [
                        {"value": str(value), "count": count} 
                        for value, count in value_counts.items()
                    ]
                    
                    # Calculate cardinality
                    col_profile["cardinality"] = col_data.nunique()
                    col_profile["cardinality_ratio"] = round(col_data.nunique() / len(col_data) * 100, 2) if len(col_data) > 0 else 0
                
                # Add datetime statistics if applicable
                elif pd.api.types.is_datetime64_any_dtype(col_data):
                    col_profile.update({
                        "min_date": col_data.min().strftime('%Y-%m-%d %H:%M:%S') if not pd.isna(col_data.min()) else None,
                        "max_date": col_data.max().strftime('%Y-%m-%d %H:%M:%S') if not pd.isna(col_data.max()) else None,
                    })
                
                profile["columns"][column] = col_profile
            
            # Add correlation matrix for numeric columns
            numeric_cols = df.select_dtypes(include=[np.number]).columns.tolist()
            if len(numeric_cols) > 1:
                correlation_matrix = df[numeric_cols].corr().round(2).to_dict()
                profile["correlations"] = correlation_matrix
            
            return profile
            
        except Exception as e:
            logger.error(f"Error profiling data: {str(e)}")
            return {"error": str(e)}
    
    @staticmethod
    def detect_data_patterns(df: pd.DataFrame) -> Dict[str, List[Dict[str, Any]]]:
        """Detect patterns in the data.
        
        Args:
            df: The DataFrame to analyze
            
        Returns:
            A dictionary containing detected patterns
        """
        if df.empty:
            return {"error": "No data to analyze"}
        
        try:
            patterns = {"columns": []}
            
            for column in df.columns:
                col_data = df[column]
                col_patterns = {"column": column, "patterns": []}
                
                # Skip columns with too many nulls
                if col_data.isna().mean() > 0.5:
                    col_patterns["patterns"].append({
                        "type": "high_null_ratio",
                        "description": f"Column has {round(col_data.isna().mean() * 100, 2)}% null values"
                    })
                    patterns["columns"].append(col_patterns)
                    continue
                
                # Check for potential primary key
                if col_data.nunique() == len(col_data) and len(col_data) > 10:
                    col_patterns["patterns"].append({
                        "type": "potential_primary_key",
                        "description": "Column has unique values for all rows"
                    })
                
                # Check for potential foreign key (numeric or string with high cardinality)
                if (np.issubdtype(col_data.dtype, np.number) or col_data.dtype == 'object') and \
                   col_data.nunique() > 10 and col_data.nunique() < len(col_data) * 0.9:
                    col_patterns["patterns"].append({
                        "type": "potential_foreign_key",
                        "description": f"Column has {col_data.nunique()} distinct values out of {len(col_data)} rows"
                    })
                
                # Check for potential boolean
                if col_data.nunique() <= 2 and len(col_data) > 10:
                    col_patterns["patterns"].append({
                        "type": "potential_boolean",
                        "description": f"Column has only {col_data.nunique()} distinct values"
                    })
                
                # Check for potential categorical
                if col_data.dtype == 'object' and col_data.nunique() < 20 and len(col_data) > 20:
                    col_patterns["patterns"].append({
                        "type": "potential_categorical",
                        "description": f"Column has {col_data.nunique()} distinct string values"
                    })
                
                # Check for skewed numeric distribution
                if np.issubdtype(col_data.dtype, np.number):
                    skewness = col_data.skew()
                    if abs(skewness) > 1.5:
                        col_patterns["patterns"].append({
                            "type": "skewed_distribution",
                            "description": f"Column has a skewed distribution (skewness: {round(skewness, 2)})"
                        })
                
                # Check for potential date patterns in string columns
                if col_data.dtype == 'object':
                    # Sample some non-null values
                    sample = col_data.dropna().sample(min(10, len(col_data.dropna()))).astype(str)
                    date_patterns = 0
                    for val in sample:
                        # Check for common date separators
                        if ('/' in val or '-' in val or '.' in val) and any(c.isdigit() for c in val):
                            date_patterns += 1
                    
                    if date_patterns >= len(sample) * 0.7:
                        col_patterns["patterns"].append({
                            "type": "potential_date",
                            "description": "Column may contain date values"
                        })
                
                patterns["columns"].append(col_patterns)
            
            return patterns
            
        except Exception as e:
            logger.error(f"Error detecting data patterns: {str(e)}")
            return {"error": str(e)}
    
    @staticmethod
    def analyze_data_quality(df: pd.DataFrame) -> Dict[str, Any]:
        """Analyze the quality of the data.
        
        Args:
            df: The DataFrame to analyze
            
        Returns:
            A dictionary containing quality metrics
        """
        if df.empty:
            return {"error": "No data to analyze"}
        
        try:
            quality = {
                "overall": {},
                "columns": {}
            }
            
            # Calculate overall completeness
            total_cells = df.size
            missing_cells = df.isna().sum().sum()
            completeness = round((1 - missing_cells / total_cells) * 100, 2) if total_cells > 0 else 0
            quality["overall"]["completeness"] = completeness
            
            # Calculate column-level metrics
            for column in df.columns:
                col_data = df[column]
                col_quality = {
                    "completeness": round((1 - col_data.isna().mean()) * 100, 2),
                    "issues": []
                }
                
                # Check for completeness issues
                if col_data.isna().mean() > 0.1:
                    col_quality["issues"].append({
                        "type": "missing_values",
                        "severity": "high" if col_data.isna().mean() > 0.5 else "medium",
                        "description": f"{round(col_data.isna().mean() * 100, 2)}% of values are missing"
                    })
                
                # Check for consistency issues in numeric columns
                if np.issubdtype(col_data.dtype, np.number):
                    # Check for outliers using IQR method
                    q1 = col_data.quantile(0.25)
                    q3 = col_data.quantile(0.75)
                    iqr = q3 - q1
                    lower_bound = q1 - 1.5 * iqr
                    upper_bound = q3 + 1.5 * iqr
                    outliers = col_data[(col_data < lower_bound) | (col_data > upper_bound)]
                    outlier_pct = len(outliers) / len(col_data) if len(col_data) > 0 else 0
                    
                    if outlier_pct > 0.05:
                        col_quality["issues"].append({
                            "type": "outliers",
                            "severity": "high" if outlier_pct > 0.1 else "medium",
                            "description": f"{round(outlier_pct * 100, 2)}% of values are outliers"
                        })
                
                # Check for consistency issues in string columns
                elif col_data.dtype == 'object':
                    # Check for mixed case values
                    if len(col_data.dropna()) > 0:
                        lowercase = col_data.dropna().astype(str).str.islower().mean()
                        uppercase = col_data.dropna().astype(str).str.isupper().mean()
                        
                        if 0.3 < lowercase < 0.7 or 0.3 < uppercase < 0.7:
                            col_quality["issues"].append({
                                "type": "inconsistent_case",
                                "severity": "low",
                                "description": "Column has inconsistent case formatting"
                            })
                    
                    # Check for mixed formats (e.g., dates, phone numbers)
                    value_lengths = col_data.dropna().astype(str).str.len().value_counts()
                    if len(value_lengths) > 1 and len(value_lengths) <= 5:
                        length_distribution = value_lengths / value_lengths.sum()
                        if not any(length_distribution > 0.9):
                            col_quality["issues"].append({
                                "type": "inconsistent_formats",
                                "severity": "medium",
                                "description": f"Column has {len(value_lengths)} different value lengths"
                            })
                
                quality["columns"][column] = col_quality
            
            # Calculate overall quality score using completeness and issue penalties
            if quality["columns"]:
                def _severity_penalty(issues):
                    penalty = 0.0
                    for iss in issues:
                        sev = (iss or {}).get("severity", "medium")
                        if sev == "critical":
                            penalty += 0.2
                        elif sev == "high":
                            penalty += 0.1
                        elif sev == "medium":
                            penalty += 0.05
                        elif sev == "low":
                            penalty += 0.02
                    return penalty
                scores = []
                for col_name, col in quality["columns"].items():
                    completeness = float(col.get("completeness", 0.0))
                    penalty = _severity_penalty(col.get("issues", []))
                    score = max(0.0, min(1.0, completeness - penalty))
                    scores.append(score)
                overall = sum(scores) / len(scores)
                quality["overall"]["quality_score"] = round(overall, 2)
            
            return quality
            
        except Exception as e:
            logger.error(f"Error analyzing data quality: {str(e)}")
            return {"error": str(e)}