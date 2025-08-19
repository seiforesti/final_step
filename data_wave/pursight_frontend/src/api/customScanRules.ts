import axios from "./axiosConfig";

// Types for custom scan rules
export interface CustomScanRule {
  id: number;
  name: string;
  description?: string;
  expression: string;
  created_at: string;
  updated_at: string;
}

export interface CustomScanRuleCreate {
  name: string;
  description?: string;
  expression: string;
}

export interface CustomScanRuleUpdate {
  name?: string;
  description?: string;
  expression?: string;
}

// API functions

// Create a new custom scan rule
export const createCustomScanRule = async (params: CustomScanRuleCreate) => {
  const { data } = await axios.post("/custom-scan-rules/", params);
  return data as CustomScanRule;
};

// Get all custom scan rules
export const getCustomScanRules = async () => {
  const { data } = await axios.get("/custom-scan-rules/");
  return data as CustomScanRule[];
};

// Get a custom scan rule by ID
export const getCustomScanRule = async (id: number) => {
  const { data } = await axios.get(`/custom-scan-rules/${id}`);
  return data as CustomScanRule;
};

// Update a custom scan rule
export const updateCustomScanRule = async (
  id: number,
  params: CustomScanRuleUpdate
) => {
  const { data } = await axios.put(`/custom-scan-rules/${id}`, params);
  return data as CustomScanRule;
};

// Delete a custom scan rule
export const deleteCustomScanRule = async (id: number) => {
  const { data } = await axios.delete(`/custom-scan-rules/${id}`);
  return data as { success: boolean };
};

// Validate a custom scan rule expression
export const validateCustomScanRuleExpression = async (expression: string) => {
  const { data } = await axios.post("/custom-scan-rules/validate-expression", {
    expression,
  });
  return data as { valid: boolean; error?: string };
};

// Test a custom scan rule expression with sample data
export const testCustomScanRuleExpression = async (
  expression: string,
  test_data: Record<string, any>
) => {
  const { data } = await axios.post("/custom-scan-rules/test-expression", {
    expression,
    ...test_data,
  });
  return data as { result?: any; success: boolean; error?: string };
};
