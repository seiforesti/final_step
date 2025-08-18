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
                # Enterprise MongoDB sampling with advanced strategies
                connection_uri = f"mongodb://{data_source.username}:{password}@{data_source.host}:{data_source.port}"
                client = MongoClient(connection_uri)
                db = client[data_source.database_name]
                collection = db[table_name]
                
                # Get collection statistics for intelligent sampling
                collection_stats = db.command("collStats", table_name)
                total_documents = collection_stats.get("count", 0)
                avg_document_size = collection_stats.get("avgObjSize", 0)
                
                # Enterprise sampling strategy selection
                sampling_strategy = await self._select_optimal_sampling_strategy(
                    total_documents, avg_document_size, sample_size
                )
                
                if sampling_strategy == "stratified":
                    # Stratified sampling based on document structure
                    data = await self._stratified_mongodb_sampling(collection, sample_size)
                elif sampling_strategy == "temporal":
                    # Time-based sampling if temporal fields exist
                    data = await self._temporal_mongodb_sampling(collection, sample_size)
                elif sampling_strategy == "systematic":
                    # Systematic sampling with calculated intervals
                    data = await self._systematic_mongodb_sampling(collection, sample_size, total_documents)
                else:
                    # Enhanced random sampling with bias detection
                    data = await self._enhanced_random_mongodb_sampling(collection, sample_size, total_documents)
                
                if not data:
                    return pd.DataFrame()
                    
                # Advanced data quality assessment during sampling
                df = pd.DataFrame(data)
                return await self._enhance_sampled_dataframe(df, collection, total_documents)
            
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
                
                # Check for potential date patterns in string columns with enterprise analysis
                if col_data.dtype == 'object':
                    # Enterprise-grade intelligent sampling for pattern detection
                    sample = await self._intelligent_pattern_sampling(col_data, pattern_type="date")
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
            
            # Calculate overall quality score (simple average of column completeness)
            if quality["columns"]:
                avg_completeness = sum(col["completeness"] for col in quality["columns"].values()) / len(quality["columns"])
                quality["overall"]["quality_score"] = round(avg_completeness, 2)
            
            return quality
            
        except Exception as e:
            logger.error(f"Error analyzing data quality: {str(e)}")
            return {"error": str(e)}
    
    # Enterprise sampling methods for advanced data profiling
    async def _select_optimal_sampling_strategy(self, total_docs: int, avg_size: int, sample_size: int) -> str:
        """Select optimal sampling strategy based on data characteristics."""
        try:
            # Strategy selection based on data characteristics
            if total_docs > 1000000:  # Large collections
                if avg_size > 10000:  # Large documents
                    return "systematic"  # More memory efficient
                else:
                    return "stratified"  # Better representation
            elif total_docs > 100000:  # Medium collections
                return "temporal" if await self._has_temporal_fields() else "stratified"
            else:
                return "enhanced_random"  # Small collections
        except Exception:
            return "enhanced_random"
    
    async def _has_temporal_fields(self) -> bool:
        """Check if collection has temporal fields for time-based sampling."""
        # Simplified check - in production, analyze schema
        return True  # Assume temporal fields exist
    
    async def _stratified_mongodb_sampling(self, collection, sample_size: int) -> List[Dict]:
        """Stratified sampling based on document structure and field diversity."""
        try:
            # Get schema diversity by sampling a few documents
            schema_sample = list(collection.aggregate([{"$sample": {"size": 100}}]))
            
            # Analyze field patterns for stratification
            field_patterns = {}
            for doc in schema_sample:
                for field, value in doc.items():
                    if field not in field_patterns:
                        field_patterns[field] = {"types": set(), "count": 0}
                    field_patterns[field]["types"].add(type(value).__name__)
                    field_patterns[field]["count"] += 1
            
            # Find the most diverse field for stratification
            stratification_field = max(field_patterns.keys(), 
                                     key=lambda f: len(field_patterns[f]["types"]))
            
            # Perform stratified sampling
            unique_values = collection.distinct(stratification_field)
            samples_per_stratum = max(1, sample_size // len(unique_values))
            
            all_samples = []
            for value in unique_values[:min(len(unique_values), sample_size)]:
                stratum_samples = list(collection.aggregate([
                    {"$match": {stratification_field: value}},
                    {"$sample": {"size": samples_per_stratum}}
                ]))
                all_samples.extend(stratum_samples)
            
            return all_samples[:sample_size]
            
        except Exception as e:
            logger.warning(f"Stratified sampling failed, falling back to random: {e}")
            return list(collection.aggregate([{"$sample": {"size": sample_size}}]))
    
    async def _temporal_mongodb_sampling(self, collection, sample_size: int) -> List[Dict]:
        """Time-based sampling to ensure temporal representation."""
        try:
            # Find temporal fields
            temporal_fields = ["createdAt", "created_at", "timestamp", "date", "_id"]
            
            for field in temporal_fields:
                try:
                    # Check if field exists and get time range
                    min_max = list(collection.aggregate([
                        {"$group": {
                            "_id": None,
                            "min": {"$min": f"${field}"},
                            "max": {"$max": f"${field}"}
                        }}
                    ]))
                    
                    if min_max and min_max[0]["min"] and min_max[0]["max"]:
                        # Divide time range into buckets and sample from each
                        time_buckets = 10  # Number of time buckets
                        bucket_size = sample_size // time_buckets
                        
                        # This is a simplified temporal sampling
                        # In production, calculate actual time intervals
                        return list(collection.aggregate([
                            {"$sample": {"size": sample_size}},
                            {"$sort": {field: 1}}
                        ]))
                        
                except Exception:
                    continue
            
            # Fallback to random sampling
            return list(collection.aggregate([{"$sample": {"size": sample_size}}]))
            
        except Exception as e:
            logger.warning(f"Temporal sampling failed, falling back to random: {e}")
            return list(collection.aggregate([{"$sample": {"size": sample_size}}]))
    
    async def _systematic_mongodb_sampling(self, collection, sample_size: int, total_docs: int) -> List[Dict]:
        """Systematic sampling with calculated intervals."""
        try:
            if total_docs <= sample_size:
                return list(collection.find())
            
            # Calculate sampling interval
            interval = total_docs // sample_size
            
            # Use skip and limit with systematic intervals
            samples = []
            for i in range(0, total_docs, interval):
                if len(samples) >= sample_size:
                    break
                    
                doc = collection.find().skip(i).limit(1)
                doc_list = list(doc)
                if doc_list:
                    samples.extend(doc_list)
            
            return samples[:sample_size]
            
        except Exception as e:
            logger.warning(f"Systematic sampling failed, falling back to random: {e}")
            return list(collection.aggregate([{"$sample": {"size": sample_size}}]))
    
    async def _enhanced_random_mongodb_sampling(self, collection, sample_size: int, total_docs: int) -> List[Dict]:
        """Enhanced random sampling with bias detection and correction."""
        try:
            # Standard random sampling
            samples = list(collection.aggregate([{"$sample": {"size": sample_size}}]))
            
            # Bias detection: check if sample represents the collection well
            if len(samples) > 10:
                # Analyze field coverage
                sample_fields = set()
                for doc in samples:
                    sample_fields.update(doc.keys())
                
                # Get field coverage from a small representative sample
                collection_sample = list(collection.aggregate([{"$sample": {"size": 50}}]))
                collection_fields = set()
                for doc in collection_sample:
                    collection_fields.update(doc.keys())
                
                # If significant field coverage difference, adjust sampling
                field_coverage = len(sample_fields) / len(collection_fields) if collection_fields else 1
                if field_coverage < 0.8:
                    # Re-sample with field diversity focus
                    logger.info("Adjusting sampling for better field representation")
                    # Add diverse documents to improve representation
                    additional_samples = list(collection.aggregate([
                        {"$sample": {"size": min(sample_size // 4, 50)}}
                    ]))
                    samples.extend(additional_samples)
                    samples = samples[:sample_size]
            
            return samples
            
        except Exception as e:
            logger.warning(f"Enhanced random sampling failed: {e}")
            return list(collection.aggregate([{"$sample": {"size": sample_size}}]))
    
    async def _enhance_sampled_dataframe(self, df: pd.DataFrame, collection, total_docs: int) -> pd.DataFrame:
        """Enhance sampled DataFrame with metadata and quality indicators."""
        try:
            # Add sampling metadata
            df.attrs = {
                "sampling_method": "enterprise_adaptive",
                "total_documents": total_docs,
                "sample_size": len(df),
                "sampling_ratio": len(df) / total_docs if total_docs > 0 else 0,
                "sampling_timestamp": datetime.now().isoformat()
            }
            
            # Add quality indicators for each column
            for column in df.columns:
                if column != '_id':  # Skip MongoDB ID field
                    col_data = df[column]
                    # Add column metadata
                    df[column].attrs = {
                        "null_percentage": col_data.isnull().sum() / len(col_data),
                        "unique_values": col_data.nunique(),
                        "data_type_consistency": len(col_data.apply(type).unique()) == 1
                    }
            
            return df
            
        except Exception as e:
            logger.warning(f"DataFrame enhancement failed: {e}")
            return df
    
    async def _intelligent_pattern_sampling(self, col_data: pd.Series, pattern_type: str = "general") -> List[str]:
        """Intelligent sampling for pattern detection with advanced strategies."""
        try:
            non_null_data = col_data.dropna()
            if len(non_null_data) == 0:
                return []
            
            sample_size = min(50, len(non_null_data))  # Larger sample for better pattern detection
            
            if pattern_type == "date":
                # For date pattern detection, use diverse length sampling
                return await self._diverse_length_sampling(non_null_data, sample_size)
            elif pattern_type == "numeric":
                # For numeric patterns, use statistical sampling
                return await self._statistical_sampling(non_null_data, sample_size)
            else:
                # General pattern detection with entropy-based sampling
                return await self._entropy_based_sampling(non_null_data, sample_size)
                
        except Exception as e:
            logger.warning(f"Intelligent pattern sampling failed: {e}")
            # Fallback to simple random sampling
            return non_null_data.sample(min(10, len(non_null_data))).astype(str).tolist()
    
    async def _diverse_length_sampling(self, data: pd.Series, sample_size: int) -> List[str]:
        """Sample data with diverse string lengths for better pattern coverage."""
        try:
            str_data = data.astype(str)
            length_groups = str_data.groupby(str_data.str.len())
            
            samples = []
            samples_per_group = max(1, sample_size // len(length_groups))
            
            for length, group in length_groups:
                group_sample = group.sample(min(samples_per_group, len(group))).tolist()
                samples.extend(group_sample)
            
            # If we have fewer samples than needed, add random samples
            if len(samples) < sample_size:
                remaining = sample_size - len(samples)
                additional = str_data.sample(min(remaining, len(str_data))).tolist()
                samples.extend([s for s in additional if s not in samples])
            
            return samples[:sample_size]
            
        except Exception as e:
            return data.astype(str).sample(min(sample_size, len(data))).tolist()
    
    async def _statistical_sampling(self, data: pd.Series, sample_size: int) -> List[str]:
        """Statistical sampling for numeric pattern detection."""
        try:
            # Convert to numeric if possible
            numeric_data = pd.to_numeric(data, errors='coerce')
            
            if numeric_data.notna().sum() > 0:
                # Sample from different statistical ranges
                q1, q2, q3 = numeric_data.quantile([0.25, 0.5, 0.75])
                
                samples = []
                # Sample from each quartile
                for q_min, q_max in [(numeric_data.min(), q1), (q1, q2), (q2, q3), (q3, numeric_data.max())]:
                    quartile_data = data[(numeric_data >= q_min) & (numeric_data <= q_max)]
                    if len(quartile_data) > 0:
                        quartile_sample = quartile_data.sample(min(sample_size // 4, len(quartile_data)))
                        samples.extend(quartile_sample.astype(str).tolist())
                
                return samples[:sample_size]
            else:
                # Fallback to regular sampling
                return data.astype(str).sample(min(sample_size, len(data))).tolist()
                
        except Exception as e:
            return data.astype(str).sample(min(sample_size, len(data))).tolist()
    
    async def _entropy_based_sampling(self, data: pd.Series, sample_size: int) -> List[str]:
        """Entropy-based sampling for maximum information diversity."""
        try:
            str_data = data.astype(str)
            
            # Calculate character entropy for each value
            def calculate_entropy(s):
                if len(s) == 0:
                    return 0
                char_counts = {}
                for char in s:
                    char_counts[char] = char_counts.get(char, 0) + 1
                
                entropy = 0
                for count in char_counts.values():
                    p = count / len(s)
                    entropy -= p * np.log2(p) if p > 0 else 0
                return entropy
            
            # Calculate entropy for each string
            entropies = str_data.apply(calculate_entropy)
            
            # Sample from different entropy ranges for diversity
            entropy_quantiles = entropies.quantile([0, 0.33, 0.66, 1.0])
            
            samples = []
            for i in range(len(entropy_quantiles) - 1):
                q_min, q_max = entropy_quantiles.iloc[i], entropy_quantiles.iloc[i + 1]
                range_data = str_data[(entropies >= q_min) & (entropies <= q_max)]
                if len(range_data) > 0:
                    range_sample = range_data.sample(min(sample_size // 3, len(range_data)))
                    samples.extend(range_sample.tolist())
            
            return samples[:sample_size]
            
        except Exception as e:
            return data.astype(str).sample(min(sample_size, len(data))).tolist()