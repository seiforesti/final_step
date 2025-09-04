// ABAC Condition Types - Maps to backend auth_models.py ConditionTemplate model

export interface ConditionTemplate {
  id: number;
  label: string;
  value: string; // JSON string
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface ConditionTemplateCreate {
  label: string;
  value: string;
  description?: string;
}

export interface ConditionTemplateUpdate {
  label?: string;
  value?: string;
  description?: string;
}

export interface PrebuiltConditionTemplate {
  label: string;
  value: string;
  description: string;
}

export interface ConditionValidation {
  valid: boolean;
  errors?: string[];
  warnings?: string[];
}

export interface ConditionBuilder {
  field: string;
  operator: 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'not_in' | 'regex' | 'user_attr';
  value: any;
  logical_operator?: 'AND' | 'OR';
}

export interface ConditionTest {
  condition: string;
  test_data: Record<string, any>;
  expected_result: boolean;
  actual_result?: boolean;
  explanation?: string;
}