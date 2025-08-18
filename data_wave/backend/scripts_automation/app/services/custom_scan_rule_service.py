from typing import Dict, List, Any, Optional, Union, Callable
import re
import logging
from datetime import datetime
from sqlmodel import Session, select
from app.models.scan_models import ScanRuleSet

# Setup logging
logger = logging.getLogger(__name__)

class ExpressionParser:
    """Parser for custom scan rule expressions."""
    
    # Supported operators
    OPERATORS = {
        'AND': lambda x, y: x and y,
        'OR': lambda x, y: x or y,
        'NOT': lambda x: not x,
        '==': lambda x, y: x == y,
        '!=': lambda x, y: x != y,
        '>': lambda x, y: x > y,
        '<': lambda x, y: x < y,
        '>=': lambda x, y: x >= y,
        '<=': lambda x, y: x <= y,
        'CONTAINS': lambda x, y: y in x if isinstance(x, str) else False,
        'STARTSWITH': lambda x, y: x.startswith(y) if isinstance(x, str) else False,
        'ENDSWITH': lambda x, y: x.endswith(y) if isinstance(x, str) else False,
        'MATCHES': lambda x, y: bool(re.match(y, x)) if isinstance(x, str) and isinstance(y, str) else False,
    }
    
    @staticmethod
    def tokenize(expression: str) -> List[str]:
        """Tokenize the expression string."""
        # Remove extra whitespace and split
        expression = expression.strip()
        tokens = []
        current_token = ""
        in_string = False
        string_delimiter = None
        
        i = 0
        while i < len(expression):
            char = expression[i]
            
            if char in ['"', "'"] and not in_string:
                in_string = True
                string_delimiter = char
                current_token += char
            elif char == string_delimiter and in_string:
                in_string = False
                current_token += char
                tokens.append(current_token)
                current_token = ""
                string_delimiter = None
            elif in_string:
                current_token += char
            elif char.isspace():
                if current_token:
                    tokens.append(current_token)
                    current_token = ""
            elif char in ['(', ')', ',']:
                if current_token:
                    tokens.append(current_token)
                    current_token = ""
                tokens.append(char)
            else:
                current_token += char
            
            i += 1
        
        if current_token:
            tokens.append(current_token)
        
        return tokens
    
    @staticmethod
    def evaluate_function(function_name: str, args: List[Any], context: Dict[str, Any]) -> Any:
        """Evaluate custom functions with enterprise-level implementation."""
        try:
            if function_name == "FUNCTION_CONTAINS":
                if len(args) >= 2:
                    return str(args[0]).lower() in str(args[1]).lower()
                return False
            elif function_name == "FUNCTION_STARTS_WITH":
                if len(args) >= 2:
                    return str(args[0]).lower().startswith(str(args[1]).lower())
                return False
            elif function_name == "FUNCTION_ENDS_WITH":
                if len(args) >= 2:
                    return str(args[0]).lower().endswith(str(args[1]).lower())
                return False
            elif function_name == "FUNCTION_REGEX_MATCH":
                if len(args) >= 2:
                    import re
                    try:
                        pattern = re.compile(str(args[1]), re.IGNORECASE)
                        return bool(pattern.search(str(args[0])))
                    except re.error:
                        return False
                return False
            elif function_name == "FUNCTION_IN_LIST":
                if len(args) >= 2:
                    if isinstance(args[1], (list, tuple)):
                        return args[0] in args[1]
                    else:
                        return str(args[0]) in str(args[1]).split(',')
                return False
            elif function_name == "FUNCTION_LENGTH":
                if len(args) >= 1:
                    return len(str(args[0]))
                return 0
            elif function_name == "FUNCTION_IS_NULL":
                if len(args) >= 1:
                    return args[0] is None or args[0] == ""
                return True
            elif function_name == "FUNCTION_IS_NOT_NULL":
                if len(args) >= 1:
                    return args[0] is not None and args[0] != ""
                return False
            elif function_name == "FUNCTION_TO_LOWER":
                if len(args) >= 1:
                    return str(args[0]).lower()
                return ""
            elif function_name == "FUNCTION_TO_UPPER":
                if len(args) >= 1:
                    return str(args[0]).upper()
                return ""
            elif function_name == "FUNCTION_TRIM":
                if len(args) >= 1:
                    return str(args[0]).strip()
                return ""
            elif function_name == "FUNCTION_SUBSTRING":
                if len(args) >= 3:
                    text = str(args[0])
                    start = int(args[1])
                    length = int(args[2])
                    return text[start:start + length]
                return ""
            elif function_name == "FUNCTION_REPLACE":
                if len(args) >= 3:
                    text = str(args[0])
                    old = str(args[1])
                    new = str(args[2])
                    return text.replace(old, new)
                return str(args[0]) if args else ""
            elif function_name == "FUNCTION_MATH_ABS":
                if len(args) >= 1:
                    try:
                        return abs(float(args[0]))
                    except (ValueError, TypeError):
                        return 0
                return 0
            elif function_name == "FUNCTION_MATH_ROUND":
                if len(args) >= 1:
                    try:
                        return round(float(args[0]))
                    except (ValueError, TypeError):
                        return 0
                return 0
            elif function_name == "FUNCTION_MATH_CEIL":
                if len(args) >= 1:
                    try:
                        import math
                        return math.ceil(float(args[0]))
                    except (ValueError, TypeError):
                        return 0
                return 0
            elif function_name == "FUNCTION_MATH_FLOOR":
                if len(args) >= 1:
                    try:
                        import math
                        return math.floor(float(args[0]))
                    except (ValueError, TypeError):
                        return 0
                return 0
            elif function_name == "FUNCTION_DATE_NOW":
                from datetime import datetime
                return datetime.utcnow().isoformat()
            elif function_name == "FUNCTION_DATE_FORMAT":
                if len(args) >= 2:
                    try:
                        from datetime import datetime
                        date_obj = datetime.fromisoformat(str(args[0]))
                        return date_obj.strftime(str(args[1]))
                    except (ValueError, TypeError):
                        return str(args[0])
                return str(args[0]) if args else ""
            elif function_name == "FUNCTION_DATE_ADD_DAYS":
                if len(args) >= 2:
                    try:
                        from datetime import datetime, timedelta
                        date_obj = datetime.fromisoformat(str(args[0]))
                        days = int(args[1])
                        return (date_obj + timedelta(days=days)).isoformat()
                    except (ValueError, TypeError):
                        return str(args[0])
                return str(args[0]) if args else ""
            else:
                logger.warning(f"Unknown function: {function_name}")
                return None
                
        except Exception as e:
            logger.error(f"Error evaluating function {function_name}: {e}")
            return None
    
    @staticmethod
    def apply_operator_with_validation(operator: str, left_value: Any, right_value: Any) -> Any:
        """Apply operator with type checking and validation."""
        try:
            # Type conversion for numeric operations
            if operator in ['+', '-', '*', '/', '>', '<', '>=', '<=']:
                try:
                    left_numeric = float(left_value) if left_value is not None else 0
                    right_numeric = float(right_value) if right_value is not None else 0
                    
                    if operator == '+':
                        return left_numeric + right_numeric
                    elif operator == '-':
                        return left_numeric - right_numeric
                    elif operator == '*':
                        return left_numeric * right_numeric
                    elif operator == '/':
                        return left_numeric / right_numeric if right_numeric != 0 else 0
                    elif operator == '>':
                        return left_numeric > right_numeric
                    elif operator == '<':
                        return left_numeric < right_numeric
                    elif operator == '>=':
                        return left_numeric >= right_numeric
                    elif operator == '<=':
                        return left_numeric <= right_numeric
                except (ValueError, TypeError):
                    # Fall back to string comparison
                    left_str = str(left_value) if left_value is not None else ""
                    right_str = str(right_value) if right_value is not None else ""
                    
                    if operator == '>':
                        return left_str > right_str
                    elif operator == '<':
                        return left_str < right_str
                    elif operator == '>=':
                        return left_str >= right_str
                    elif operator == '<=':
                        return left_str <= right_str
                    else:
                        return False
            
            # String operations
            elif operator in ['==', '!=']:
                left_str = str(left_value) if left_value is not None else ""
                right_str = str(right_value) if right_value is not None else ""
                
                if operator == '==':
                    return left_str.lower() == right_str.lower()
                elif operator == '!=':
                    return left_str.lower() != right_str.lower()
            
            # Logical operations
            elif operator in ['AND', 'OR']:
                left_bool = bool(left_value)
                right_bool = bool(right_value)
                
                if operator == 'AND':
                    return left_bool and right_bool
                elif operator == 'OR':
                    return left_bool or right_bool
            
            # Use original operator if not handled above
            return ExpressionParser.OPERATORS[operator](left_value, right_value)
            
        except Exception as e:
            logger.error(f"Error applying operator {operator}: {e}")
            return False
    
    @staticmethod
    def parse(expression: str) -> Callable[[Dict[str, Any]], bool]:
        """Parse an expression into a callable function.
        
        Args:
            expression: The expression to parse
            
        Returns:
            A function that takes a context dictionary and returns a boolean
        """
        if not expression or expression.strip() == "":
            return lambda context: True
        
        # Enterprise-level expression parser with advanced features
        # Supports complex expressions, functions, and validation
        tokens = ExpressionParser.tokenize(expression)
        
        def evaluate(context: Dict[str, Any]) -> bool:
            # Advanced recursive descent parser with error handling
            def parse_expression(tokens_list, index=0):
                if index >= len(tokens_list):
                    return True, index
                
                # Parse the left operand
                if tokens_list[index] == '(':
                    left_value, index = parse_expression(tokens_list, index + 1)
                elif tokens_list[index] == 'NOT':
                    right_value, index = parse_expression(tokens_list, index + 1)
                    return ExpressionParser.OPERATORS['NOT'](right_value), index
                elif tokens_list[index].startswith('FUNCTION_'):
                    # Handle custom functions
                    function_name = tokens_list[index]
                    index += 1
                    if index < len(tokens_list) and tokens_list[index] == '(':
                        # Parse function arguments
                        args = []
                        index += 1
                        while index < len(tokens_list) and tokens_list[index] != ')':
                            if tokens_list[index] == ',':
                                index += 1
                                continue
                            arg_value, index = parse_expression(tokens_list, index)
                            args.append(arg_value)
                        if index < len(tokens_list) and tokens_list[index] == ')':
                            index += 1
                        left_value = ExpressionParser.evaluate_function(function_name, args, context)
                    else:
                        left_value = ExpressionParser.evaluate_function(function_name, [], context)
                elif tokens_list[index] in context:
                    left_value = context[tokens_list[index]]
                    index += 1
                else:
                    try:
                        # Try to convert to a number
                        left_value = float(tokens_list[index])
                    except ValueError:
                        # Treat as a string literal
                        left_value = tokens_list[index].strip('"\'')
                    index += 1
                
                # If we've reached the end or a closing parenthesis, return
                if index >= len(tokens_list) or tokens_list[index] == ')':
                    return left_value, index + 1 if index < len(tokens_list) and tokens_list[index] == ')' else index
                
                # Parse the operator
                operator = tokens_list[index]
                if operator not in ExpressionParser.OPERATORS:
                    raise ValueError(f"Unknown operator: {operator}")
                index += 1
                
                # Parse the right operand
                if tokens_list[index] == '(':
                    right_value, index = parse_expression(tokens_list, index + 1)
                elif tokens_list[index].startswith('FUNCTION_'):
                    # Handle custom functions
                    function_name = tokens_list[index]
                    index += 1
                    if index < len(tokens_list) and tokens_list[index] == '(':
                        # Parse function arguments
                        args = []
                        index += 1
                        while index < len(tokens_list) and tokens_list[index] != ')':
                            if tokens_list[index] == ',':
                                index += 1
                                continue
                            arg_value, index = parse_expression(tokens_list, index)
                            args.append(arg_value)
                        if index < len(tokens_list) and tokens_list[index] == ')':
                            index += 1
                        right_value = ExpressionParser.evaluate_function(function_name, args, context)
                    else:
                        right_value = ExpressionParser.evaluate_function(function_name, [], context)
                elif tokens_list[index] in context:
                    right_value = context[tokens_list[index]]
                    index += 1
                else:
                    try:
                        # Try to convert to a number
                        right_value = float(tokens_list[index])
                    except ValueError:
                        # Treat as a string literal
                        right_value = tokens_list[index].strip('"\'')
                    index += 1
                
                # Apply the operator with type checking
                result = ExpressionParser.apply_operator_with_validation(operator, left_value, right_value)
                
                # If we've reached the end or a closing parenthesis, return
                if index >= len(tokens_list) or tokens_list[index] == ')':
                    return result, index + 1 if index < len(tokens_list) and tokens_list[index] == ')' else index
                
                # Parse the next operator (for chaining AND/OR)
                next_operator = tokens_list[index]
                if next_operator not in ['AND', 'OR']:
                    raise ValueError(f"Expected AND or OR, got: {next_operator}")
                index += 1
                
                # Parse the rest of the expression
                rest_value, index = parse_expression(tokens_list, index)
                
                # Apply the next operator
                return ExpressionParser.apply_operator_with_validation(next_operator, result, rest_value), index
            
            try:
            result, _ = parse_expression(tokens)
            return result
            except Exception as e:
                logger.error(f"Expression evaluation error: {e}")
                return False  # Default to False on error
        
        return evaluate


class CustomScanRuleService:
    """Service for managing custom scan rules."""
    
    @staticmethod
    def create_custom_rule_set(
        session: Session,
        name: str,
        description: Optional[str] = None,
        schema_inclusion_expressions: Optional[List[str]] = None,
        schema_exclusion_expressions: Optional[List[str]] = None,
        table_inclusion_expressions: Optional[List[str]] = None,
        table_exclusion_expressions: Optional[List[str]] = None,
        column_inclusion_expressions: Optional[List[str]] = None,
        column_exclusion_expressions: Optional[List[str]] = None,
        database_inclusion_expressions: Optional[List[str]] = None,
        database_exclusion_expressions: Optional[List[str]] = None,
        collection_inclusion_expressions: Optional[List[str]] = None,
        collection_exclusion_expressions: Optional[List[str]] = None,
        field_inclusion_expressions: Optional[List[str]] = None,
        field_exclusion_expressions: Optional[List[str]] = None,
    ) -> ScanRuleSet:
        """Create a new scan rule set with custom expressions.
        
        Args:
            session: The database session
            name: The name of the rule set
            description: Optional description
            schema_inclusion_expressions: Expressions for including schemas
            schema_exclusion_expressions: Expressions for excluding schemas
            table_inclusion_expressions: Expressions for including tables
            table_exclusion_expressions: Expressions for excluding tables
            column_inclusion_expressions: Expressions for including columns
            column_exclusion_expressions: Expressions for excluding columns
            database_inclusion_expressions: Expressions for including MongoDB databases
            database_exclusion_expressions: Expressions for excluding MongoDB databases
            collection_inclusion_expressions: Expressions for including MongoDB collections
            collection_exclusion_expressions: Expressions for excluding MongoDB collections
            field_inclusion_expressions: Expressions for including MongoDB fields
            field_exclusion_expressions: Expressions for excluding MongoDB fields
            
        Returns:
            The created scan rule set
        """
        # Validate expressions
        all_expressions = [
            *(schema_inclusion_expressions or []),
            *(schema_exclusion_expressions or []),
            *(table_inclusion_expressions or []),
            *(table_exclusion_expressions or []),
            *(column_inclusion_expressions or []),
            *(column_exclusion_expressions or []),
            *(database_inclusion_expressions or []),
            *(database_exclusion_expressions or []),
            *(collection_inclusion_expressions or []),
            *(collection_exclusion_expressions or []),
            *(field_inclusion_expressions or []),
            *(field_exclusion_expressions or [])
        ]
        
        # Validate all expressions
        for expr in all_expressions:
            try:
                ExpressionParser.parse(expr)
            except Exception as e:
                raise ValueError(f"Invalid expression: {expr}. Error: {str(e)}")
        
        # Create the rule set
        rule_set = ScanRuleSet(
            name=name,
            description=description,
            # Store the expressions as custom properties
            custom_properties={
                "schema_inclusion_expressions": schema_inclusion_expressions or [],
                "schema_exclusion_expressions": schema_exclusion_expressions or [],
                "table_inclusion_expressions": table_inclusion_expressions or [],
                "table_exclusion_expressions": table_exclusion_expressions or [],
                "column_inclusion_expressions": column_inclusion_expressions or [],
                "column_exclusion_expressions": column_exclusion_expressions or [],
                "database_inclusion_expressions": database_inclusion_expressions or [],
                "database_exclusion_expressions": database_exclusion_expressions or [],
                "collection_inclusion_expressions": collection_inclusion_expressions or [],
                "collection_exclusion_expressions": collection_exclusion_expressions or [],
                "field_inclusion_expressions": field_inclusion_expressions or [],
                "field_exclusion_expressions": field_exclusion_expressions or []
            }
        )
        
        session.add(rule_set)
        session.commit()
        session.refresh(rule_set)
        
        return rule_set
    
    @staticmethod
    def update_custom_rule_set(
        session: Session,
        rule_set_id: int,
        **kwargs
    ) -> Optional[ScanRuleSet]:
        """Update a custom scan rule set.
        
        Args:
            session: The database session
            rule_set_id: The ID of the rule set to update
            **kwargs: The fields to update
            
        Returns:
            The updated scan rule set, or None if not found
        """
        rule_set = session.get(ScanRuleSet, rule_set_id)
        if not rule_set:
            return None
        
        # Handle expression updates
        expression_fields = [
            "schema_inclusion_expressions",
            "schema_exclusion_expressions",
            "table_inclusion_expressions",
            "table_exclusion_expressions",
            "column_inclusion_expressions",
            "column_exclusion_expressions",
            "database_inclusion_expressions",
            "database_exclusion_expressions",
            "collection_inclusion_expressions",
            "collection_exclusion_expressions",
            "field_inclusion_expressions",
            "field_exclusion_expressions"
        ]
        
        # Initialize custom_properties if it doesn't exist
        if not rule_set.custom_properties:
            rule_set.custom_properties = {}
        
        # Update expression fields
        for field in expression_fields:
            if field in kwargs:
                expressions = kwargs.pop(field)
                
                # Validate expressions
                for expr in expressions:
                    try:
                        ExpressionParser.parse(expr)
                    except Exception as e:
                        raise ValueError(f"Invalid expression in {field}: {expr}. Error: {str(e)}")
                
                # Update the custom properties
                rule_set.custom_properties[field] = expressions
        
        # Update other fields
        for key, value in kwargs.items():
            if hasattr(rule_set, key):
                setattr(rule_set, key, value)
        
        rule_set.updated_at = datetime.utcnow()
        session.add(rule_set)
        session.commit()
        session.refresh(rule_set)
        
        return rule_set
    
    @staticmethod
    def apply_custom_rule_filters(
        rule_set: ScanRuleSet,
        metadata: Dict[str, Any],
        metadata_type: str = "relational"
    ) -> Dict[str, Any]:
        """Apply custom rule filters to metadata.
        
        Args:
            rule_set: The scan rule set with custom expressions
            metadata: The metadata to filter
            metadata_type: The type of metadata ("relational" or "mongodb")
            
        Returns:
            The filtered metadata
        """
        if not rule_set.custom_properties:
            return metadata
        
        try:
            if metadata_type == "relational":
                return CustomScanRuleService._filter_relational_metadata(rule_set, metadata)
            elif metadata_type == "mongodb":
                return CustomScanRuleService._filter_mongodb_metadata(rule_set, metadata)
            else:
                logger.error(f"Unsupported metadata type: {metadata_type}")
                return metadata
        except Exception as e:
            logger.error(f"Error applying custom rule filters: {str(e)}")
            return metadata
    
    @staticmethod
    def _filter_relational_metadata(rule_set: ScanRuleSet, metadata: Dict[str, Any]) -> Dict[str, Any]:
        """Filter relational metadata using custom expressions."""
        custom_props = rule_set.custom_properties or {}
        
        # Parse expressions
        schema_include_funcs = [ExpressionParser.parse(expr) for expr in custom_props.get("schema_inclusion_expressions", [])]
        schema_exclude_funcs = [ExpressionParser.parse(expr) for expr in custom_props.get("schema_exclusion_expressions", [])]
        table_include_funcs = [ExpressionParser.parse(expr) for expr in custom_props.get("table_inclusion_expressions", [])]
        table_exclude_funcs = [ExpressionParser.parse(expr) for expr in custom_props.get("table_exclusion_expressions", [])]
        column_include_funcs = [ExpressionParser.parse(expr) for expr in custom_props.get("column_inclusion_expressions", [])]
        column_exclude_funcs = [ExpressionParser.parse(expr) for expr in custom_props.get("column_exclusion_expressions", [])]
        
        filtered_metadata = {"schemas": []}
        
        # Filter schemas
        for schema in metadata.get("schemas", []):
            schema_context = {"name": schema.get("name", ""), "schema": schema.get("name", "")}
            
            # Check if schema should be included
            include_schema = not schema_include_funcs or any(func(schema_context) for func in schema_include_funcs)
            exclude_schema = any(func(schema_context) for func in schema_exclude_funcs)
            
            if include_schema and not exclude_schema:
                filtered_schema = {"name": schema.get("name", ""), "tables": []}
                
                # Filter tables
                for table in schema.get("tables", []):
                    table_context = {
                        "name": table.get("name", ""),
                        "table": table.get("name", ""),
                        "schema": schema.get("name", ""),
                        "row_count": table.get("row_count", 0)
                    }
                    
                    # Check if table should be included
                    include_table = not table_include_funcs or any(func(table_context) for func in table_include_funcs)
                    exclude_table = any(func(table_context) for func in table_exclude_funcs)
                    
                    if include_table and not exclude_table:
                        filtered_table = {
                            "name": table.get("name", ""),
                            "row_count": table.get("row_count", 0),
                            "columns": []
                        }
                        
                        # Filter columns
                        for column in table.get("columns", []):
                            column_context = {
                                "name": column.get("name", ""),
                                "column": column.get("name", ""),
                                "table": table.get("name", ""),
                                "schema": schema.get("name", ""),
                                "data_type": column.get("data_type", ""),
                                "is_nullable": column.get("is_nullable", False),
                                "is_primary_key": column.get("is_primary_key", False),
                                "is_foreign_key": column.get("is_foreign_key", False)
                            }
                            
                            # Check if column should be included
                            include_column = not column_include_funcs or any(func(column_context) for func in column_include_funcs)
                            exclude_column = any(func(column_context) for func in column_exclude_funcs)
                            
                            if include_column and not exclude_column:
                                filtered_table["columns"].append(column)
                        
                        if filtered_table["columns"]:
                            filtered_schema["tables"].append(filtered_table)
                
                if filtered_schema["tables"]:
                    filtered_metadata["schemas"].append(filtered_schema)
        
        return filtered_metadata
    
    @staticmethod
    def _filter_mongodb_metadata(rule_set: ScanRuleSet, metadata: Dict[str, Any]) -> Dict[str, Any]:
        """Filter MongoDB metadata using custom expressions."""
        custom_props = rule_set.custom_properties or {}
        
        # Parse expressions
        db_include_funcs = [ExpressionParser.parse(expr) for expr in custom_props.get("database_inclusion_expressions", [])]
        db_exclude_funcs = [ExpressionParser.parse(expr) for expr in custom_props.get("database_exclusion_expressions", [])]
        coll_include_funcs = [ExpressionParser.parse(expr) for expr in custom_props.get("collection_inclusion_expressions", [])]
        coll_exclude_funcs = [ExpressionParser.parse(expr) for expr in custom_props.get("collection_exclusion_expressions", [])]
        field_include_funcs = [ExpressionParser.parse(expr) for expr in custom_props.get("field_inclusion_expressions", [])]
        field_exclude_funcs = [ExpressionParser.parse(expr) for expr in custom_props.get("field_exclusion_expressions", [])]
        
        filtered_metadata = {"databases": []}
        
        # Filter databases
        for db in metadata.get("databases", []):
            db_context = {"name": db.get("name", ""), "database": db.get("name", "")}
            
            # Check if database should be included
            include_db = not db_include_funcs or any(func(db_context) for func in db_include_funcs)
            exclude_db = any(func(db_context) for func in db_exclude_funcs)
            
            if include_db and not exclude_db:
                filtered_db = {"name": db.get("name", ""), "collections": []}
                
                # Filter collections
                for collection in db.get("collections", []):
                    coll_context = {
                        "name": collection.get("name", ""),
                        "collection": collection.get("name", ""),
                        "database": db.get("name", ""),
                        "document_count": collection.get("document_count", 0)
                    }
                    
                    # Check if collection should be included
                    include_coll = not coll_include_funcs or any(func(coll_context) for func in coll_include_funcs)
                    exclude_coll = any(func(coll_context) for func in coll_exclude_funcs)
                    
                    if include_coll and not exclude_coll:
                        filtered_coll = {
                            "name": collection.get("name", ""),
                            "document_count": collection.get("document_count", 0),
                            "fields": []
                        }
                        
                        # Filter fields
                        for field in collection.get("fields", []):
                            field_context = {
                                "name": field.get("name", ""),
                                "field": field.get("name", ""),
                                "collection": collection.get("name", ""),
                                "database": db.get("name", ""),
                                "data_type": field.get("data_type", ""),
                                "is_array": field.get("is_array", False),
                                "is_nested": field.get("is_nested", False)
                            }
                            
                            # Check if field should be included
                            include_field = not field_include_funcs or any(func(field_context) for func in field_include_funcs)
                            exclude_field = any(func(field_context) for func in field_exclude_funcs)
                            
                            if include_field and not exclude_field:
                                filtered_coll["fields"].append(field)
                        
                        if filtered_coll["fields"]:
                            filtered_db["collections"].append(filtered_coll)
                
                if filtered_db["collections"]:
                    filtered_metadata["databases"].append(filtered_db)
        
        return filtered_metadata