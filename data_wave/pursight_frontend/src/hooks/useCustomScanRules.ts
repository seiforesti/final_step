import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getCustomScanRules,
  getCustomScanRule,
  createCustomScanRule,
  updateCustomScanRule,
  deleteCustomScanRule,
  validateCustomScanRuleExpression,
  testCustomScanRuleExpression,
  CustomScanRuleUpdate,
} from "../api/customScanRules";

/**
 * Example usage:
 * const {
 *   customScanRules,
 *   createMutation,
 *   updateMutation,
 *   deleteMutation,
 *   validateExpression,
 *   testExpression
 * } = useCustomScanRules();
 */

export function useCustomScanRules() {
  const queryClient = useQueryClient();

  // Fetch all custom scan rules
  const {
    data: customScanRules,
    isLoading: isCustomScanRulesLoading,
    isError: isCustomScanRulesError,
    error: customScanRulesError,
    refetch: refetchCustomScanRules,
  } = useQuery({
    queryKey: ["customScanRules"],
    queryFn: getCustomScanRules,
  });

  // Fetch a single custom scan rule by ID
  const fetchCustomScanRule = (id: number) => {
    return useQuery({
      queryKey: ["customScanRule", id],
      queryFn: () => getCustomScanRule(id),
      enabled: !!id,
    });
  };

  // Create
  const createMutation = useMutation({
    mutationFn: createCustomScanRule,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["customScanRules"] }),
  });

  // Update
  const updateMutation = useMutation({
    mutationFn: ({
      id,
      params,
    }: {
      id: number;
      params: CustomScanRuleUpdate;
    }) => updateCustomScanRule(id, params),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["customScanRules"] }),
  });

  // Delete
  const deleteMutation = useMutation({
    mutationFn: deleteCustomScanRule,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["customScanRules"] }),
  });

  // Validate expression
  const validateExpression = (expression: string) => {
    return validateCustomScanRuleExpression(expression);
  };

  // Test expression
  const testExpression = (
    expression: string,
    test_data: Record<string, any>
  ) => {
    return testCustomScanRuleExpression(expression, test_data);
  };

  return {
    // Data
    customScanRules,
    isCustomScanRulesLoading,
    isCustomScanRulesError,
    customScanRulesError,
    refetchCustomScanRules,
    // Single fetch
    fetchCustomScanRule,
    // Mutations
    createMutation,
    updateMutation,
    deleteMutation,
    // Validation
    validateExpression,
    testExpression,
  };
}
