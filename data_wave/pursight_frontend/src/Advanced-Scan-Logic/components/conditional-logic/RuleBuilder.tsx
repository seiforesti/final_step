"use client";

import React, { useState, useCallback, useMemo } from 'react';
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
import { Plus, Trash2, Copy, Settings, Eye, EyeOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useRBACStateManager } from '@/components/Advanced_RBAC_Datagovernance_System/hooks/useRBACState';
import { usePermissionCheck } from '@/components/Advanced_RBAC_Datagovernance_System/hooks/usePermissionCheck';

interface RuleCondition {
  id: string;
  field: string;
  operator: string;
  value: any;
  logicalOperator?: 'AND' | 'OR';
  groupId?: string;
  priority: number;
  isActive: boolean;
  metadata?: Record<string, any>;
}

interface RuleGroup {
  id: string;
  name: string;
  conditions: RuleCondition[];
  logicalOperator: 'AND' | 'OR';
  priority: number;
  isActive: boolean;
  description?: string;
}

interface RuleBuilderProps {
  initialRules?: RuleGroup[];
  onRulesChange: (rules: RuleGroup[]) => void;
  availableFields?: Array<{ name: string; type: string; description: string }>;
  maxConditions?: number;
  maxGroups?: number;
}

const OPERATORS = {
  string: ['equals', 'not_equals', 'contains', 'not_contains', 'starts_with', 'ends_with', 'regex'],
  number: ['equals', 'not_equals', 'greater_than', 'less_than', 'greater_equal', 'less_equal', 'between', 'in_range'],
  boolean: ['equals', 'not_equals'],
  date: ['equals', 'not_equals', 'before', 'after', 'between', 'in_past', 'in_future'],
  array: ['contains', 'not_contains', 'contains_all', 'contains_any', 'empty', 'not_empty']
};

export const RuleBuilder: React.FC<RuleBuilderProps> = ({
  initialRules = [],
  onRulesChange,
  availableFields = [],
  maxConditions = 100,
  maxGroups = 20
}) => {
  const [rules, setRules] = useState<RuleGroup[]>(initialRules);
  const [activeTab, setActiveTab] = useState('visual');
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const { toast } = useToast();
  const rbac = useRBACStateManager();
  const { hasPermission } = usePermissionCheck();

  const canManageRules = hasPermission({ action: 'manage', resource: 'rule' });
  const canCreateRules = hasPermission({ action: 'create', resource: 'rule' });
  const canDeleteRules = hasPermission({ action: 'delete', resource: 'rule' });

  const addRuleGroup = useCallback(() => {
    if (rules.length >= maxGroups) {
      toast({
        title: "Maximum Groups Reached",
        description: `Cannot create more than ${maxGroups} rule groups.`,
        variant: "destructive"
      });
      return;
    }

    const newGroup: RuleGroup = {
      id: `group_${Date.now()}`,
      name: `Rule Group ${rules.length + 1}`,
      conditions: [],
      logicalOperator: 'AND',
      priority: rules.length + 1,
      isActive: true,
      description: ''
    };

    const updatedRules = [...rules, newGroup];
    setRules(updatedRules);
    onRulesChange(updatedRules);
    setSelectedGroup(newGroup.id);
  }, [rules, maxGroups, onRulesChange, toast]);

  const removeRuleGroup = useCallback((groupId: string) => {
    if (!canDeleteRules) {
      toast({
        title: "Permission Denied",
        description: "You don't have permission to delete rules.",
        variant: "destructive"
      });
      return;
    }

    const updatedRules = rules.filter(group => group.id !== groupId);
    setRules(updatedRules);
    onRulesChange(updatedRules);
    
    if (selectedGroup === groupId) {
      setSelectedGroup(updatedRules.length > 0 ? updatedRules[0].id : null);
    }
  }, [rules, selectedGroup, onRulesChange, canDeleteRules, toast]);

  const addCondition = useCallback((groupId: string) => {
    const group = rules.find(g => g.id === groupId);
    if (!group) return;

    if (group.conditions.length >= maxConditions) {
      toast({
        title: "Maximum Conditions Reached",
        description: `Cannot add more than ${maxConditions} conditions to this group.`,
        variant: "destructive"
      });
      return;
    }

    const newCondition: RuleCondition = {
      id: `condition_${Date.now()}`,
      field: availableFields.length > 0 ? availableFields[0].name : '',
      operator: 'equals',
      value: '',
      logicalOperator: group.conditions.length > 0 ? 'AND' : undefined,
      groupId,
      priority: group.conditions.length + 1,
      isActive: true
    };

    const updatedRules = rules.map(g => 
      g.id === groupId 
        ? { ...g, conditions: [...g.conditions, newCondition] }
        : g
    );

    setRules(updatedRules);
    onRulesChange(updatedRules);
  }, [rules, maxConditions, availableFields, onRulesChange, toast]);

  const removeCondition = useCallback((groupId: string, conditionId: string) => {
    const updatedRules = rules.map(g => 
      g.id === groupId 
        ? { ...g, conditions: g.conditions.filter(c => c.id !== conditionId) }
        : g
    );

    setRules(updatedRules);
    onRulesChange(updatedRules);
  }, [rules, onRulesChange]);

  const updateCondition = useCallback((groupId: string, conditionId: string, updates: Partial<RuleCondition>) => {
    const updatedRules = rules.map(g => 
      g.id === groupId 
        ? {
            ...g,
            conditions: g.conditions.map(c => 
              c.id === conditionId ? { ...c, ...updates } : c
            )
          }
        : g
    );

    setRules(updatedRules);
    onRulesChange(updatedRules);
  }, [rules, onRulesChange]);

  const updateGroup = useCallback((groupId: string, updates: Partial<RuleGroup>) => {
    const updatedRules = rules.map(g => 
      g.id === groupId ? { ...g, ...updates } : g
    );

    setRules(updatedRules);
    onRulesChange(updatedRules);
  }, [rules, onRulesChange]);

  const duplicateGroup = useCallback((groupId: string) => {
    const group = rules.find(g => g.id === groupId);
    if (!group) return;

    const duplicatedGroup: RuleGroup = {
      ...group,
      id: `group_${Date.now()}`,
      name: `${group.name} (Copy)`,
      priority: rules.length + 1,
      conditions: group.conditions.map(c => ({
        ...c,
        id: `condition_${Date.now()}_${Math.random()}`,
        groupId: `group_${Date.now()}`
      }))
    };

    const updatedRules = [...rules, duplicatedGroup];
    setRules(updatedRules);
    onRulesChange(updatedRules);
    setSelectedGroup(duplicatedGroup.id);
  }, [rules, onRulesChange]);

  const reorderGroups = useCallback((fromIndex: number, toIndex: number) => {
    const updatedRules = [...rules];
    const [movedGroup] = updatedRules.splice(fromIndex, 1);
    updatedRules.splice(toIndex, 0, movedGroup);
    
    // Update priorities
    updatedRules.forEach((group, index) => {
      group.priority = index + 1;
    });

    setRules(updatedRules);
    onRulesChange(updatedRules);
  }, [rules, onRulesChange]);

  const validateRules = useCallback(() => {
    const errors: string[] = [];
    
    rules.forEach((group, groupIndex) => {
      if (!group.name.trim()) {
        errors.push(`Group ${groupIndex + 1}: Name is required`);
      }
      
      if (group.conditions.length === 0) {
        errors.push(`Group ${groupIndex + 1}: At least one condition is required`);
      }
      
      group.conditions.forEach((condition, condIndex) => {
        if (!condition.field) {
          errors.push(`Group ${groupIndex + 1}, Condition ${condIndex + 1}: Field is required`);
        }
        
        if (!condition.operator) {
          errors.push(`Group ${groupIndex + 1}, Condition ${condIndex + 1}: Operator is required`);
        }
        
        if (condition.value === undefined || condition.value === '') {
          errors.push(`Group ${groupIndex + 1}, Condition ${condIndex + 1}: Value is required`);
        }
      });
    });

    return errors;
  }, [rules]);

  const exportRules = useCallback(() => {
    const rulesData = {
      version: '1.0',
      timestamp: new Date().toISOString(),
      rules: rules,
      metadata: {
        totalGroups: rules.length,
        totalConditions: rules.reduce((sum, g) => sum + g.conditions.length, 0),
        exportedBy: 'RuleBuilder'
      }
    };

    const blob = new Blob([JSON.stringify(rulesData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rules_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [rules]);

  const importRules = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        if (data.rules && Array.isArray(data.rules)) {
          setRules(data.rules);
          onRulesChange(data.rules);
          toast({
            title: "Rules Imported",
            description: `Successfully imported ${data.rules.length} rule groups.`,
            variant: "default"
          });
        } else {
          throw new Error('Invalid rules format');
        }
      } catch (error) {
        toast({
          title: "Import Failed",
          description: "Failed to import rules. Please check the file format.",
          variant: "destructive"
        });
      }
    };
    reader.readAsText(file);
  }, [onRulesChange, toast]);

  const selectedGroupData = useMemo(() => 
    rules.find(g => g.id === selectedGroup), [rules, selectedGroup]
  );

  const fieldType = useMemo(() => {
    if (!selectedGroupData?.conditions.length) return 'string';
    const field = availableFields.find(f => f.name === selectedGroupData.conditions[0]?.field);
    return field?.type || 'string';
  }, [selectedGroupData, availableFields]);

  if (!canManageRules) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            <p>You don't have permission to manage rules.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Rule Builder</h2>
          <p className="text-muted-foreground">Create and manage conditional logic rules</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={() => setShowAdvanced(!showAdvanced)}>
            {showAdvanced ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            {showAdvanced ? 'Hide' : 'Show'} Advanced
          </Button>
          <Button variant="outline" onClick={exportRules}>
            Export Rules
          </Button>
          <input
            type="file"
            accept=".json"
            onChange={importRules}
            className="hidden"
            id="import-rules"
          />
          <Button variant="outline" onClick={() => document.getElementById('import-rules')?.click()}>
            Import Rules
          </Button>
          {canCreateRules && (
            <Button onClick={addRuleGroup}>
              <Plus className="w-4 h-4 mr-2" />
              Add Group
            </Button>
          )}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="visual">Visual Builder</TabsTrigger>
          <TabsTrigger value="code">Code View</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
        </TabsList>

        <TabsContent value="visual" className="space-y-4">
          {rules.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <div className="text-muted-foreground">
                  <p className="text-lg mb-4">No rule groups defined</p>
                  <p className="mb-6">Start by creating your first rule group</p>
                  {canCreateRules && (
                    <Button onClick={addRuleGroup}>
                      <Plus className="w-4 h-4 mr-2" />
                      Create First Group
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Rule Groups List */}
              <div className="space-y-3">
                <h3 className="font-semibold">Rule Groups</h3>
                <ScrollArea className="h-96">
                  {rules.map((group, index) => (
                    <Card 
                      key={group.id}
                      className={`cursor-pointer transition-all ${
                        selectedGroup === group.id ? 'ring-2 ring-primary' : ''
                      }`}
                      onClick={() => setSelectedGroup(group.id)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium">{group.name}</h4>
                            <p className="text-sm text-muted-foreground">
                              {group.conditions.length} condition{group.conditions.length !== 1 ? 's' : ''}
                            </p>
                            <div className="flex items-center space-x-2 mt-2">
                              <Badge variant={group.isActive ? 'default' : 'secondary'}>
                                {group.isActive ? 'Active' : 'Inactive'}
                              </Badge>
                              <Badge variant="outline">Priority {group.priority}</Badge>
                            </div>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                duplicateGroup(group.id);
                              }}
                            >
                              <Copy className="w-4 h-4" />
                            </Button>
                            {canDeleteRules && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  removeRuleGroup(group.id);
                                }}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </ScrollArea>
              </div>

              {/* Rule Group Editor */}
              <div className="lg:col-span-2">
                {selectedGroupData ? (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span>Edit Group: {selectedGroupData.name}</span>
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={selectedGroupData.isActive}
                            onCheckedChange={(checked) => 
                              updateGroup(selectedGroupData.id, { isActive: checked })
                            }
                          />
                          <Label>Active</Label>
                        </div>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Group Details */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="group-name">Group Name</Label>
                          <Input
                            id="group-name"
                            value={selectedGroupData.name}
                            onChange={(e) => updateGroup(selectedGroupData.id, { name: e.target.value })}
                            placeholder="Enter group name"
                          />
                        </div>
                        <div>
                          <Label htmlFor="group-priority">Priority</Label>
                          <Input
                            id="group-priority"
                            type="number"
                            value={selectedGroupData.priority}
                            onChange={(e) => updateGroup(selectedGroupData.id, { priority: parseInt(e.target.value) })}
                            min="1"
                            max={rules.length}
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="group-description">Description</Label>
                        <Textarea
                          id="group-description"
                          value={selectedGroupData.description || ''}
                          onChange={(e) => updateGroup(selectedGroupData.id, { description: e.target.value })}
                          placeholder="Describe this rule group"
                          rows={3}
                        />
                      </div>

                      <div>
                        <Label>Logical Operator</Label>
                        <Select
                          value={selectedGroupData.logicalOperator}
                          onValueChange={(value: 'AND' | 'OR') => 
                            updateGroup(selectedGroupData.id, { logicalOperator: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="AND">AND (All conditions must be true)</SelectItem>
                            <SelectItem value="OR">OR (Any condition can be true)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <Separator />

                      {/* Conditions */}
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="font-semibold">Conditions</h4>
                          {canCreateRules && (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => addCondition(selectedGroupData.id)}
                            >
                              <Plus className="w-4 h-4 mr-2" />
                              Add Condition
                            </Button>
                          )}
                        </div>

                        <div className="space-y-4">
                          {selectedGroupData.conditions.map((condition, index) => (
                            <Card key={condition.id} className="p-4">
                              <div className="grid grid-cols-12 gap-3 items-center">
                                {/* Logical Operator */}
                                {index > 0 && (
                                  <div className="col-span-2">
                                    <Select
                                      value={condition.logicalOperator || 'AND'}
                                      onValueChange={(value: 'AND' | 'OR') => 
                                        updateCondition(selectedGroupData.id, condition.id, { logicalOperator: value })
                                      }
                                    >
                                      <SelectTrigger>
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="AND">AND</SelectItem>
                                        <SelectItem value="OR">OR</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                )}

                                {/* Field */}
                                <div className={`${index > 0 ? 'col-span-3' : 'col-span-5'}`}>
                                  <Select
                                    value={condition.field}
                                    onValueChange={(value) => 
                                      updateCondition(selectedGroupData.id, condition.id, { field: value })
                                    }
                                  >
                                    <SelectTrigger>
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
                                </div>

                                {/* Operator */}
                                <div className="col-span-3">
                                  <Select
                                    value={condition.operator}
                                    onValueChange={(value) => 
                                      updateCondition(selectedGroupData.id, condition.id, { operator: value })
                                    }
                                  >
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {OPERATORS[fieldType as keyof typeof OPERATORS]?.map(op => (
                                        <SelectItem key={op} value={op}>
                                          {op.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>

                                {/* Value */}
                                <div className="col-span-3">
                                  <Input
                                    value={condition.value}
                                    onChange={(e) => 
                                      updateCondition(selectedGroupData.id, condition.id, { value: e.target.value })
                                    }
                                    placeholder="Enter value"
                                  />
                                </div>

                                {/* Actions */}
                                <div className="col-span-1">
                                  {canDeleteRules && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => removeCondition(selectedGroupData.id, condition.id)}
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  )}
                                </div>
                              </div>
                            </Card>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <Card>
                    <CardContent className="p-12 text-center text-muted-foreground">
                      <p>Select a rule group to edit</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="code" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>JSON Code View</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={JSON.stringify(rules, null, 2)}
                onChange={(e) => {
                  try {
                    const parsed = JSON.parse(e.target.value);
                    if (Array.isArray(parsed)) {
                      setRules(parsed);
                      onRulesChange(parsed);
                    }
                  } catch (error) {
                    // Invalid JSON, ignore
                  }
                }}
                rows={20}
                className="font-mono text-sm"
                placeholder="Enter JSON rules..."
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Rules Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {rules.map((group, groupIndex) => (
                  <div key={group.id} className="border rounded-lg p-4">
                    <h4 className="font-semibold mb-2">
                      Group {groupIndex + 1}: {group.name}
                    </h4>
                    <div className="text-sm text-muted-foreground mb-3">
                      {group.description}
                    </div>
                    <div className="space-y-2">
                      {group.conditions.map((condition, condIndex) => (
                        <div key={condition.id} className="flex items-center space-x-2">
                          {condIndex > 0 && (
                            <span className="text-primary font-medium">
                              {condition.logicalOperator}
                            </span>
                          )}
                          <span className="font-medium">{condition.field}</span>
                          <span className="text-muted-foreground">{condition.operator}</span>
                          <span className="font-mono bg-muted px-2 py-1 rounded">
                            {String(condition.value)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Validation */}
      {rules.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold">Validation</h4>
                <p className="text-sm text-muted-foreground">
                  Check for any issues with your rules
                </p>
              </div>
              <Button 
                variant="outline" 
                onClick={() => {
                  const errors = validateRules();
                  if (errors.length === 0) {
                    toast({
                      title: "Validation Passed",
                      description: "All rules are valid and ready to use.",
                      variant: "default"
                    });
                  } else {
                    toast({
                      title: "Validation Failed",
                      description: `${errors.length} issue(s) found. Check the console for details.`,
                      variant: "destructive"
                    });
                    console.error('Rule validation errors:', errors);
                  }
                }}
              >
                Validate Rules
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
