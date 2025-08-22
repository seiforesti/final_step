"use client";

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Plus, Trash2, Copy, Settings, Eye, EyeOff, Code, Play, Save, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { usePermissionCheck } from '@/components/Advanced_RBAC_Datagovernance_System/hooks/usePermissionCheck';

interface ExpressionNode {
  id: string;
  type: 'operator' | 'field' | 'value' | 'function' | 'group';
  value: string;
  children?: ExpressionNode[];
  metadata?: Record<string, any>;
  position?: { x: number; y: number };
}

interface ExpressionGroup {
  id: string;
  name: string;
  expression: ExpressionNode;
  description?: string;
  isActive: boolean;
  priority: number;
  validationRules?: string[];
  errorHandling?: 'strict' | 'lenient' | 'custom';
}

interface ExpressionEditorProps {
  initialExpression?: ExpressionNode;
  onExpressionChange: (expression: ExpressionNode) => void;
  availableFields?: Array<{ name: string; type: string; description: string }>;
  availableFunctions?: Array<{ name: string; signature: string; description: string; category: string }>;
  maxDepth?: number;
  enableValidation?: boolean;
  enablePreview?: boolean;
}

const OPERATORS = {
  logical: ['AND', 'OR', 'NOT', 'XOR', 'NAND', 'NOR'],
  comparison: ['==', '!=', '>', '<', '>=', '<=', 'IN', 'NOT_IN', 'LIKE', 'NOT_LIKE'],
  arithmetic: ['+', '-', '*', '/', '%', '**', '//'],
  bitwise: ['&', '|', '^', '~', '<<', '>>'],
  assignment: ['=', '+=', '-=', '*=', '/=', '%=', '**=', '//=']
};

const FUNCTION_CATEGORIES = {
  string: ['concat', 'substring', 'length', 'upper', 'lower', 'trim', 'replace'],
  numeric: ['abs', 'round', 'floor', 'ceil', 'min', 'max', 'sum', 'avg'],
  date: ['now', 'date', 'time', 'year', 'month', 'day', 'hour', 'minute'],
  logical: ['if', 'case', 'coalesce', 'nullif', 'isnull', 'isnotnull'],
  aggregation: ['count', 'sum', 'avg', 'min', 'max', 'group_concat'],
  custom: ['user_defined', 'external_api', 'ml_prediction']
};

export const ExpressionEditor: React.FC<ExpressionEditorProps> = ({
  initialExpression,
  onExpressionChange,
  availableFields = [],
  availableFunctions = [],
  maxDepth = 10,
  enableValidation = true,
  enablePreview = true
}) => {
  const [expression, setExpression] = useState<ExpressionNode>(initialExpression || {
    id: 'root',
    type: 'group',
    value: 'root',
    children: []
  });
  const [activeTab, setActiveTab] = useState('visual');
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [isValidating, setIsValidating] = useState(false);
  const [previewResult, setPreviewResult] = useState<any>(null);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const { toast } = useToast();
  const rbac = useRBACStateManager();
  const { hasPermission } = usePermissionCheck();

  const canManageExpressions = hasPermission({ action: 'manage', resource: 'expression' });
  const canCreateExpressions = hasPermission({ action: 'create', resource: 'expression' });
  const canDeleteExpressions = hasPermission({ action: 'delete', resource: 'expression' });
  const canValidateExpressions = hasPermission({ action: 'validate', resource: 'expression' });

  const addNode = useCallback((parentId: string, nodeType: ExpressionNode['type'], value: string = '') => {
    const newNode: ExpressionNode = {
      id: `node_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: nodeType,
      value: value,
      children: nodeType === 'group' ? [] : undefined,
      metadata: {}
    };

    const updateExpression = (node: ExpressionNode): ExpressionNode => {
      if (node.id === parentId) {
        return {
          ...node,
          children: [...(node.children || []), newNode]
        };
      }
      
      if (node.children) {
        return {
          ...node,
          children: node.children.map(child => updateExpression(child))
        };
      }
      
      return node;
    };

    const updatedExpression = updateExpression(expression);
    setExpression(updatedExpression);
    onExpressionChange(updatedExpression);
    setSelectedNode(newNode.id);
  }, [expression, onExpressionChange]);

  const removeNode = useCallback((nodeId: string) => {
    if (!canDeleteExpressions) {
      toast({
        title: "Permission Denied",
        description: "You don't have permission to delete expressions.",
        variant: "destructive"
      });
      return;
    }

    const removeNodeRecursive = (node: ExpressionNode): ExpressionNode | null => {
      if (node.id === nodeId) {
        return null;
      }
      
      if (node.children) {
        const filteredChildren = node.children
          .map(child => removeNodeRecursive(child))
          .filter((child): child is ExpressionNode => child !== null);
        
        return {
          ...node,
          children: filteredChildren
        };
      }
      
      return node;
    };

    const updatedExpression = removeNodeRecursive(expression);
    if (updatedExpression) {
      setExpression(updatedExpression);
      onExpressionChange(updatedExpression);
      
      if (selectedNode === nodeId) {
        setSelectedNode(null);
      }
    }
  }, [expression, onExpressionChange, canDeleteExpressions, toast, selectedNode]);

  const updateNode = useCallback((nodeId: string, updates: Partial<ExpressionNode>) => {
    const updateNodeRecursive = (node: ExpressionNode): ExpressionNode => {
      if (node.id === nodeId) {
        return { ...node, ...updates };
      }
      
      if (node.children) {
        return {
          ...node,
          children: node.children.map(child => updateNodeRecursive(child))
        };
      }
      
      return node;
    };

    const updatedExpression = updateNodeRecursive(expression);
    setExpression(updatedExpression);
    onExpressionChange(updatedExpression);
  }, [expression, onExpressionChange]);

  const moveNode = useCallback((nodeId: string, newParentId: string) => {
    // Find the node to move
    let nodeToMove: ExpressionNode | null = null;
    let sourceParent: ExpressionNode | null = null;

    const findNode = (node: ExpressionNode, parent: ExpressionNode | null = null) => {
      if (node.id === nodeId) {
        nodeToMove = node;
        sourceParent = parent;
        return;
      }
      
      if (node.children) {
        node.children.forEach(child => findNode(child, node));
      }
    };

    findNode(expression);

    if (!nodeToMove || !sourceParent) return;

    // Remove from source parent
    const removeFromSource = (node: ExpressionNode): ExpressionNode => {
      if (node.id === sourceParent?.id) {
        return {
          ...node,
          children: node.children?.filter(child => child.id !== nodeId) || []
        };
      }
      
      if (node.children) {
        return {
          ...node,
          children: node.children.map(child => removeFromSource(child))
        };
      }
      
      return node;
    };

    // Add to new parent
    const addToTarget = (node: ExpressionNode): ExpressionNode => {
      if (node.id === newParentId) {
        return {
          ...node,
          children: [...(node.children || []), nodeToMove!]
        };
      }
      
      if (node.children) {
        return {
          ...node,
          children: node.children.map(child => addToTarget(child))
        };
      }
      
      return node;
    };

    let updatedExpression = removeFromSource(expression);
    updatedExpression = addToTarget(updatedExpression);
    
    setExpression(updatedExpression);
    onExpressionChange(updatedExpression);
  }, [expression, onExpressionChange]);

  const duplicateNode = useCallback((nodeId: string) => {
    const duplicateNodeRecursive = (node: ExpressionNode): ExpressionNode => {
      if (node.id === nodeId) {
        const duplicatedNode: ExpressionNode = {
          ...node,
          id: `node_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          children: node.children ? node.children.map(child => duplicateNodeRecursive(child)) : undefined
        };
        return duplicatedNode;
      }
      
      if (node.children) {
        return {
          ...node,
          children: node.children.map(child => duplicateNodeRecursive(child))
        };
      }
      
      return node;
    };

    const updatedExpression = duplicateNodeRecursive(expression);
    setExpression(updatedExpression);
    onExpressionChange(updatedExpression);
  }, [expression, onExpressionChange]);

  const validateExpression = useCallback(async () => {
    if (!canValidateExpressions) {
      toast({
        title: "Permission Denied",
        description: "You don't have permission to validate expressions.",
        variant: "destructive"
      });
      return;
    }

    setIsValidating(true);
    setValidationErrors([]);

    try {
      // Simulate validation API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const errors: string[] = [];
      
      // Basic validation logic
      const validateNode = (node: ExpressionNode, depth: number = 0): void => {
        if (depth > maxDepth) {
          errors.push(`Expression depth exceeds maximum allowed depth of ${maxDepth}`);
          return;
        }

        if (!node.value.trim()) {
          errors.push(`Node ${node.id}: Value cannot be empty`);
        }

        if (node.type === 'operator' && !OPERATORS.logical.includes(node.value) && 
            !OPERATORS.comparison.includes(node.value) && !OPERATORS.arithmetic.includes(node.value)) {
          errors.push(`Node ${node.id}: Invalid operator '${node.value}'`);
        }

        if (node.type === 'field' && !availableFields.find(f => f.name === node.value)) {
          errors.push(`Node ${node.id}: Unknown field '${node.value}'`);
        }

        if (node.type === 'function' && !availableFunctions.find(f => f.name === node.value)) {
          errors.push(`Node ${node.id}: Unknown function '${node.value}'`);
        }

        if (node.children) {
          node.children.forEach(child => validateNode(child, depth + 1));
        }
      };

      validateNode(expression);
      setValidationErrors(errors);

      if (errors.length === 0) {
        toast({
          title: "Validation Passed",
          description: "Expression is valid and ready to use.",
          variant: "default"
        });
      } else {
        toast({
          title: "Validation Failed",
          description: `${errors.length} issue(s) found. Check the validation panel for details.`,
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Validation Error",
        description: "Failed to validate expression. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsValidating(false);
    }
  }, [expression, maxDepth, availableFields, availableFunctions, canValidateExpressions, toast]);

  const previewExpression = useCallback(async () => {
    if (!enablePreview) return;

    setIsPreviewing(true);
    setPreviewResult(null);

    try {
      // Simulate preview API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock preview result
      const result = {
        expression: expressionToString(expression),
        sampleData: generateSampleData(),
        evaluation: Math.random() > 0.5 ? 'true' : 'false',
        performance: {
          executionTime: Math.random() * 100,
          memoryUsage: Math.random() * 50,
          complexity: calculateComplexity(expression)
        }
      };
      
      setPreviewResult(result);
      toast({
        title: "Preview Generated",
        description: "Expression preview has been generated successfully.",
        variant: "default"
      });
    } catch (error) {
      toast({
        title: "Preview Failed",
        description: "Failed to generate preview. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsPreviewing(false);
    }
  }, [expression, enablePreview, toast]);

  const expressionToString = useCallback((node: ExpressionNode): string => {
    if (node.type === 'group' && node.children && node.children.length > 0) {
      return `(${node.children.map(child => expressionToString(child)).join(' ')})`;
    }
    
    if (node.children && node.children.length > 0) {
      return `${node.value}(${node.children.map(child => expressionToString(child)).join(', ')})`;
    }
    
    return node.value;
  }, []);

  const calculateComplexity = useCallback((node: ExpressionNode): string => {
    let nodeCount = 0;
    let maxDepth = 0;
    
    const traverse = (n: ExpressionNode, depth: number) => {
      nodeCount++;
      maxDepth = Math.max(maxDepth, depth);
      
      if (n.children) {
        n.children.forEach(child => traverse(child, depth + 1));
      }
    };
    
    traverse(node, 0);
    
    if (nodeCount <= 5 && maxDepth <= 2) return 'Low';
    if (nodeCount <= 15 && maxDepth <= 4) return 'Medium';
    return 'High';
  }, []);

  const generateSampleData = useCallback(() => {
    return {
      fields: availableFields.slice(0, 5).map(field => ({
        name: field.name,
        value: field.type === 'string' ? 'Sample Text' :
               field.type === 'number' ? Math.floor(Math.random() * 1000) :
               field.type === 'boolean' ? Math.random() > 0.5 :
               new Date().toISOString()
      }))
    };
  }, [availableFields]);

  const exportExpression = useCallback(() => {
    const expressionData = {
      version: '1.0',
      timestamp: new Date().toISOString(),
      expression: expression,
      metadata: {
        totalNodes: countNodes(expression),
        maxDepth: getMaxDepth(expression),
        exportedBy: 'ExpressionEditor'
      }
    };

    const blob = new Blob([JSON.stringify(expressionData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `expression_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [expression]);

  const importExpression = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        if (data.expression) {
          setExpression(data.expression);
          onExpressionChange(data.expression);
          toast({
            title: "Expression Imported",
            description: "Expression has been imported successfully.",
            variant: "default"
          });
        } else {
          throw new Error('Invalid expression format');
        }
      } catch (error) {
        toast({
          title: "Import Failed",
          description: "Failed to import expression. Please check the file format.",
          variant: "destructive"
        });
      }
    };
    reader.readAsText(file);
  }, [onExpressionChange, toast]);

  const countNodes = useCallback((node: ExpressionNode): number => {
    let count = 1;
    if (node.children) {
      node.children.forEach(child => count += countNodes(child));
    }
    return count;
  }, []);

  const getMaxDepth = useCallback((node: ExpressionNode, depth: number = 0): number => {
    let maxDepth = depth;
    if (node.children) {
      node.children.forEach(child => {
        maxDepth = Math.max(maxDepth, getMaxDepth(child, depth + 1));
      });
    }
    return maxDepth;
  }, []);

  const renderNode = useCallback((node: ExpressionNode, depth: number = 0) => {
    const isSelected = selectedNode === node.id;
    const canHaveChildren = node.type === 'group' || node.type === 'function';
    
    return (
      <div key={node.id} className="space-y-2">
        <Card className={`${isSelected ? 'ring-2 ring-primary' : ''} cursor-pointer`}>
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Badge variant="outline" className="text-xs">
                  {node.type}
                </Badge>
                <div className="flex-1">
                  {node.type === 'field' ? (
                    <Select
                      value={node.value}
                      onValueChange={(value) => updateNode(node.id, { value })}
                    >
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Select field" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableFields.map(field => (
                          <SelectItem key={field.name} value={field.name}>
                            {field.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : node.type === 'operator' ? (
                    <Select
                      value={node.value}
                      onValueChange={(value) => updateNode(node.id, { value })}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(OPERATORS).map(([category, ops]) => (
                          <optgroup key={category} label={category.toUpperCase()}>
                            {ops.map(op => (
                              <SelectItem key={op} value={op}>
                                {op}
                              </SelectItem>
                            ))}
                          </optgroup>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : node.type === 'function' ? (
                    <Select
                      value={node.value}
                      onValueChange={(value) => updateNode(node.id, { value })}
                    >
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Select function" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(FUNCTION_CATEGORIES).map(([category, funcs]) => (
                          <optgroup key={category} label={category.toUpperCase()}>
                            {funcs.map(func => (
                              <SelectItem key={func} value={func}>
                                {func}
                              </SelectItem>
                            ))}
                          </optgroup>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input
                      value={node.value}
                      onChange={(e) => updateNode(node.id, { value: e.target.value })}
                      placeholder={`Enter ${node.type} value`}
                      className="w-40"
                    />
                  )}
                </div>
              </div>
              
              <div className="flex items-center space-x-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedNode(node.id)}
                >
                  <Settings className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => duplicateNode(node.id)}
                >
                  <Copy className="w-4 h-4" />
                </Button>
                {canDeleteExpressions && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeNode(node.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
            
            {canHaveChildren && (
              <div className="mt-3 pl-4 border-l-2 border-muted">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Children</span>
                  {canCreateExpressions && (
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => addNode(node.id, 'field')}
                      >
                        <Plus className="w-3 h-3 mr-1" />
                        Field
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => addNode(node.id, 'operator')}
                      >
                        <Plus className="w-3 h-3 mr-1" />
                        Operator
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => addNode(node.id, 'value')}
                      >
                        <Plus className="w-3 h-3 mr-1" />
                        Value
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => addNode(node.id, 'function')}
                      >
                        <Plus className="w-3 h-3 mr-1" />
                        Function
                      </Button>
                    </div>
                  )}
                </div>
                
                {node.children && node.children.length > 0 ? (
                  <div className="space-y-2">
                    {node.children.map(child => renderNode(child, depth + 1))}
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground italic">
                    No children added yet
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }, [selectedNode, availableFields, canDeleteExpressions, canCreateExpressions, updateNode, duplicateNode, removeNode, addNode]);

  if (!canManageExpressions) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            <p>You don't have permission to manage expressions.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Expression Editor</h2>
          <p className="text-muted-foreground">Create and manage complex conditional expressions</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={() => setShowAdvanced(!showAdvanced)}>
            {showAdvanced ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            {showAdvanced ? 'Hide' : 'Show'} Advanced
          </Button>
          <Button variant="outline" onClick={exportExpression}>
            Export
          </Button>
          <input
            type="file"
            accept=".json"
            onChange={importExpression}
            className="hidden"
            id="import-expression"
          />
          <Button variant="outline" onClick={() => document.getElementById('import-expression')?.click()}>
            Import
          </Button>
          {enableValidation && (
            <Button 
              variant="outline" 
              onClick={validateExpression}
              disabled={isValidating}
            >
              {isValidating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Code className="w-4 h-4 mr-2" />}
              Validate
            </Button>
          )}
          {enablePreview && (
            <Button 
              variant="outline" 
              onClick={previewExpression}
              disabled={isPreviewing}
            >
              {isPreviewing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Play className="w-4 h-4 mr-2" />}
              Preview
            </Button>
          )}
          {canCreateExpressions && (
            <Button onClick={() => addNode('root', 'group')}>
              <Plus className="w-4 h-4 mr-2" />
              Add Group
            </Button>
          )}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="visual">Visual Editor</TabsTrigger>
          <TabsTrigger value="code">Code View</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
          {enableValidation && <TabsTrigger value="validation">Validation</TabsTrigger>}
        </TabsList>

        <TabsContent value="visual" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Expression Tree</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-4">
                  {expression.children && expression.children.length > 0 ? (
                    expression.children.map(child => renderNode(child))
                  ) : (
                    <div className="text-center text-muted-foreground p-8">
                      <p className="text-lg mb-4">No expression nodes defined</p>
                      <p className="mb-6">Start by adding nodes to build your expression</p>
                      {canCreateExpressions && (
                        <div className="flex items-center justify-center space-x-2">
                          <Button onClick={() => addNode('root', 'field')}>
                            <Plus className="w-4 h-4 mr-2" />
                            Add Field
                          </Button>
                          <Button onClick={() => addNode('root', 'operator')}>
                            <Plus className="w-4 h-4 mr-2" />
                            Add Operator
                          </Button>
                          <Button onClick={() => addNode('root', 'value')}>
                            <Plus className="w-4 h-4 mr-2" />
                            Add Value
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="code" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Expression Code</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={expressionToString(expression)}
                onChange={(e) => {
                  // In a real implementation, you would parse the text back to an expression tree
                  // For now, we'll just show the current expression
                }}
                rows={20}
                className="font-mono text-sm"
                placeholder="Expression will be generated automatically..."
                readOnly
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Expression Preview</CardTitle>
            </CardHeader>
            <CardContent>
              {previewResult ? (
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Expression</h4>
                    <code className="bg-muted px-3 py-2 rounded text-sm">
                      {previewResult.expression}
                    </code>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-2">Sample Data</h4>
                    <div className="bg-muted p-3 rounded">
                      <pre className="text-sm">{JSON.stringify(previewResult.sampleData, null, 2)}</pre>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-2">Evaluation Result</h4>
                    <Badge variant={previewResult.evaluation === 'true' ? 'default' : 'secondary'}>
                      {previewResult.evaluation}
                    </Badge>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-2">Performance Metrics</h4>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold">{previewResult.performance.executionTime.toFixed(2)}ms</div>
                        <div className="text-sm text-muted-foreground">Execution Time</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold">{previewResult.performance.memoryUsage.toFixed(2)}MB</div>
                        <div className="text-sm text-muted-foreground">Memory Usage</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold">{previewResult.performance.complexity}</div>
                        <div className="text-sm text-muted-foreground">Complexity</div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center text-muted-foreground p-8">
                  <p>No preview available</p>
                  <p className="text-sm">Click the Preview button to generate a preview</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {enableValidation && (
          <TabsContent value="validation" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Validation Results</CardTitle>
              </CardHeader>
              <CardContent>
                {validationErrors.length > 0 ? (
                  <div className="space-y-2">
                    {validationErrors.map((error, index) => (
                      <div key={index} className="flex items-center space-x-2 p-3 bg-destructive/10 rounded">
                        <div className="w-2 h-2 bg-destructive rounded-full"></div>
                        <span className="text-sm">{error}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground p-8">
                    <p>No validation errors found</p>
                    <p className="text-sm">Click the Validate button to check for issues</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};
