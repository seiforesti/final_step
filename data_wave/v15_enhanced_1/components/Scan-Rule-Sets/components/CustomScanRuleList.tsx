"use client"

import type React from "react"
import { useState, useCallback } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Plus,
  Edit,
  Trash2,
  Play,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Code,
  Zap,
  Target,
  Activity,
} from "lucide-react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { customScanRuleApi } from "../services/api"
import type { CustomScanRule } from "../types"
import { useNotifications } from "../hooks/useNotifications"

const formSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name must be less than 100 characters"),
  description: z.string().max(500, "Description must be less than 500 characters").optional(),
  expression: z.string().min(1, "Expression is required"),
  rule_type: z.enum(["classification", "validation", "transformation"]),
  severity: z.enum(["low", "medium", "high", "critical"]),
  category: z.string().min(1, "Category is required"),
  is_active: z.boolean(),
})

type FormData = z.infer<typeof formSchema>

const SeverityBadge: React.FC<{ severity: string }> = ({ severity }) => {
  const config = {
    low: { variant: "secondary" as const, color: "text-blue-600" },
    medium: { variant: "outline" as const, color: "text-yellow-600" },
    high: { variant: "destructive" as const, color: "text-orange-600" },
    critical: { variant: "destructive" as const, color: "text-red-600" },
  }

  const { variant, color } = config[severity as keyof typeof config] || config.medium

  return (
    <Badge variant={variant} className={`capitalize ${color}`}>
      {severity}
    </Badge>
  )
}

const RuleTypeBadge: React.FC<{ type: string }> = ({ type }) => {
  const config = {
    classification: { icon: Target, color: "text-blue-600" },
    validation: { icon: CheckCircle, color: "text-green-600" },
    transformation: { icon: Zap, color: "text-purple-600" },
  }

  const { icon: Icon, color } = config[type as keyof typeof config] || config.classification

  return (
    <Badge variant="outline" className={`capitalize flex items-center gap-1 ${color}`}>
      <Icon className="h-3 w-3" />
      {type}
    </Badge>
  )
}

export const CustomScanRuleList: React.FC = () => {
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingRule, setEditingRule] = useState<CustomScanRule | null>(null)
  const [testData, setTestData] = useState("{}")
  const [testResult, setTestResult] = useState<any>(null)
  const [validationResult, setValidationResult] = useState<any>(null)

  const queryClient = useQueryClient()
  const { showNotification } = useNotifications()

  // Load custom rules
  const {
    data: customRules = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["customScanRules"],
    queryFn: customScanRuleApi.list,
  })

  // Create mutation
  const createMutation = useMutation({
    mutationFn: customScanRuleApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries(["customScanRules"])
      showNotification({
        title: "Success",
        message: "Custom scan rule created successfully",
        type: "success",
      })
      setShowCreateModal(false)
    },
    onError: (error: any) => {
      showNotification({
        title: "Error",
        message: error.message || "Failed to create custom scan rule",
        type: "error",
      })
    },
  })

  // Validation mutation
  const validateMutation = useMutation({
    mutationFn: customScanRuleApi.validateExpression,
    onSuccess: (result) => {
      setValidationResult(result)
      if (result.valid) {
        showNotification({
          title: "Validation Successful",
          message: "Expression is valid",
          type: "success",
        })
      } else {
        showNotification({
          title: "Validation Failed",
          message: result.error || "Expression is invalid",
          type: "error",
        })
      }
    },
  })

  // Test mutation
  const testMutation = useMutation({
    mutationFn: ({ expression, testData }: { expression: string; testData: any }) =>
      customScanRuleApi.testExpression(expression, testData),
    onSuccess: (result) => {
      setTestResult(result)
      showNotification({
        title: "Test Completed",
        message: `Expression executed in ${result.execution_time_ms}ms`,
        type: "success",
      })
    },
    onError: (error: any) => {
      showNotification({
        title: "Test Failed",
        message: error.message || "Failed to test expression",
        type: "error",
      })
    },
  })

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      expression: "",
      rule_type: "classification",
      severity: "medium",
      category: "",
      is_active: true,
    },
  })

  const handleCreate = useCallback(() => {
    form.reset()
    setValidationResult(null)
    setTestResult(null)
    setShowCreateModal(true)
  }, [form])

  const handleEdit = useCallback(
    (rule: CustomScanRule) => {
      setEditingRule(rule)
      form.reset({
        name: rule.name,
        description: rule.description || "",
        expression: rule.expression,
        rule_type: rule.rule_type,
        severity: rule.severity,
        category: rule.category,
        is_active: rule.is_active,
      })
      setValidationResult(null)
      setTestResult(null)
      setShowCreateModal(true)
    },
    [form],
  )

  const handleValidate = useCallback(() => {
    const expression = form.getValues("expression")
    if (expression) {
      validateMutation.mutate(expression)
    }
  }, [form, validateMutation])

  const handleTest = useCallback(() => {
    const expression = form.getValues("expression")
    if (expression && testData) {
      try {
        const parsedTestData = JSON.parse(testData)
        testMutation.mutate({ expression, testData: parsedTestData })
      } catch (error) {
        showNotification({
          title: "Invalid Test Data",
          message: "Test data must be valid JSON",
          type: "error",
        })
      }
    }
  }, [form, testData, testMutation, showNotification])

  const onSubmit = useCallback(
    async (data: FormData) => {
      try {
        if (editingRule) {
          // Update logic would go here
          console.log("Update rule:", editingRule.id, data)
        } else {
          await createMutation.mutateAsync(data)
        }
      } catch (error) {
        // Error handled by mutation
      }
    },
    [editingRule, createMutation],
  )

  const closeModal = useCallback(() => {
    setShowCreateModal(false)
    setEditingRule(null)
    setValidationResult(null)
    setTestResult(null)
    form.reset()
  }, [form])

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>Failed to load custom scan rules. Please try again.</AlertDescription>
      </Alert>
    )
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Code className="h-5 w-5" />
              Custom Scan Rules
              <Badge variant="secondary">{customRules.length}</Badge>
            </CardTitle>
            <Button onClick={handleCreate}>
              <Plus className="h-4 w-4 mr-2" />
              Create Rule
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Severity</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Performance</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customRules.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <div className="flex flex-col items-center gap-2">
                        <Code className="h-8 w-8 text-muted-foreground" />
                        <p className="text-muted-foreground">No custom scan rules found</p>
                        <Button variant="outline" onClick={handleCreate}>
                          <Plus className="h-4 w-4 mr-2" />
                          Create your first rule
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  customRules.map((rule) => (
                    <TableRow key={rule.id}>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium">{rule.name}</div>
                          {rule.description && (
                            <div className="text-sm text-muted-foreground line-clamp-2">{rule.description}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <RuleTypeBadge type={rule.rule_type} />
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{rule.category}</Badge>
                      </TableCell>
                      <TableCell>
                        <SeverityBadge severity={rule.severity} />
                      </TableCell>
                      <TableCell>
                        <Badge variant={rule.is_active ? "default" : "secondary"}>
                          {rule.is_active ? (
                            <>
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Active
                            </>
                          ) : (
                            <>
                              <XCircle className="h-3 w-3 mr-1" />
                              Inactive
                            </>
                          )}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {rule.performance_metrics ? (
                          <div className="text-sm">
                            <div className="flex items-center gap-1">
                              <Activity className="h-3 w-3" />
                              {rule.performance_metrics.avg_execution_time_ms}ms avg
                            </div>
                            <div className="text-muted-foreground">
                              {(rule.performance_metrics.success_rate * 100).toFixed(1)}% success
                            </div>
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-sm">No data</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="sm" onClick={() => handleEdit(rule)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              // Delete logic would go here
                              console.log("Delete rule:", rule.id)
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Create/Edit Modal */}
      <Dialog open={showCreateModal} onOpenChange={closeModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingRule ? "Edit Custom Scan Rule" : "Create Custom Scan Rule"}</DialogTitle>
            <DialogDescription>
              Define a custom rule for data scanning, classification, or validation.
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter rule name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category *</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., PII, Financial, Healthcare" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Describe what this rule does" className="min-h-[60px]" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="rule_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Rule Type</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="classification">Classification</SelectItem>
                          <SelectItem value="validation">Validation</SelectItem>
                          <SelectItem value="transformation">Transformation</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="severity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Severity</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="critical">Critical</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="is_active"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                      <div className="space-y-0.5">
                        <FormLabel>Active</FormLabel>
                        <FormDescription>Enable this rule</FormDescription>
                      </div>
                      <FormControl>
                        <input type="checkbox" checked={field.value} onChange={field.onChange} className="h-4 w-4" />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="expression"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Expression *</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter SQL expression or regex pattern"
                        className="min-h-[120px] font-mono"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Use SQL expressions, regex patterns, or custom logic to define the rule
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={handleValidate} disabled={validateMutation.isPending}>
                  {validateMutation.isPending ? (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2 animate-spin" />
                      Validating...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Validate Expression
                    </>
                  )}
                </Button>
              </div>

              {validationResult && (
                <Alert>
                  {validationResult.valid ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                  <AlertDescription>
                    {validationResult.valid
                      ? "Expression is valid and ready to use"
                      : `Validation failed: ${validationResult.error}`}
                  </AlertDescription>
                </Alert>
              )}

              {/* Test Section */}
              <div className="space-y-4 border-t pt-4">
                <h4 className="font-medium">Test Expression</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Test Data (JSON)</label>
                    <Textarea
                      value={testData}
                      onChange={(e) => setTestData(e.target.value)}
                      placeholder='{"column_value": "test@example.com"}'
                      className="mt-1 font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Test Result</label>
                    <div className="mt-1 p-3 border rounded-lg bg-muted/50 min-h-[80px]">
                      {testResult ? (
                        <pre className="text-sm">{JSON.stringify(testResult, null, 2)}</pre>
                      ) : (
                        <span className="text-muted-foreground text-sm">Click "Test Expression" to see results</span>
                      )}
                    </div>
                  </div>
                </div>
                <Button type="button" variant="outline" onClick={handleTest} disabled={testMutation.isPending}>
                  {testMutation.isPending ? (
                    <>
                      <Play className="h-4 w-4 mr-2 animate-spin" />
                      Testing...
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4 mr-2" />
                      Test Expression
                    </>
                  )}
                </Button>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={closeModal}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending ? (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2 animate-spin" />
                      {editingRule ? "Updating..." : "Creating..."}
                    </>
                  ) : editingRule ? (
                    "Update Rule"
                  ) : (
                    "Create Rule"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  )
}
