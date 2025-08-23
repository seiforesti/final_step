"use client";

import { useState, useCallback } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LoadingSpinner } from "./components/LoadingSpinner";

import { Filter, Plus, RefreshCw, Search, Settings, MoreHorizontal,  } from 'lucide-react';

import { useScanRuleRBAC } from "./utils/rbac-integration";

type ScanRule = {
  id: string;
  name: string;
  description: string;
  pattern: string;
  category: string;
  priority: number;
  status: "active" | "inactive";
  lastModified: string;
  metadata?: Record<string, any>;
};

export interface ScanRuleSetAppProps {
  embedded?: boolean;
}

export const ScanRuleSetApp = ({ embedded = false }: ScanRuleSetAppProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");

  // Get RBAC permissions
  const {
    canViewRuleSets,
    canCreateRuleSets,
    canEditRuleSets,
    canDeleteRuleSets,
    canDeployRuleSets,
  } = useScanRuleRBAC();

  // Mock data for now
  const rules: ScanRule[] = [
    {
      id: "1",
      name: "Sensitive Data Detection",
      description:
        "Detects sensitive data patterns like SSN, credit cards, etc.",
      pattern: "\\b\\d{3}-\\d{2}-\\d{4}\\b",
      category: "Security",
      priority: 1,
      status: "active",
      lastModified: "2024-01-20",
    },
    {
      id: "2",
      name: "PII Data Scan",
      description: "Identifies personally identifiable information",
      pattern: "\\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Z|a-z]{2,}\\b",
      category: "Compliance",
      priority: 2,
      status: "active",
      lastModified: "2024-01-19",
    },
  ];

  const handleRefresh = useCallback(() => {
    setIsLoading(true);
    // Simulated refresh
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  }, []);

  const handleCreateRule = useCallback(() => {
    // Implement rule creation
    console.log("Create new rule");
  }, []);

  const filteredRules = rules.filter((rule) => {
    const matchesSearch =
      searchQuery === "" ||
      rule.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rule.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedCategory === "all" || rule.category === selectedCategory;
    const matchesStatus =
      selectedStatus === "all" || rule.status === selectedStatus;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const columns = [
    {
      header: "Name",
      accessorKey: "name",
      cell: ({ getValue }: any) => (
        <span className="font-medium">{getValue()}</span>
      ),
    },
    {
      header: "Description",
      accessorKey: "description",
    },
    {
      header: "Category",
      accessorKey: "category",
      cell: ({ getValue }: any) => (
        <span className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium bg-primary/10 text-primary">
          {getValue()}
        </span>
      ),
    },
    {
      header: "Status",
      accessorKey: "status",
      cell: ({ getValue }: any) => {
        const status = getValue();
        return (
          <span
            className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
              status === "active"
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {status}
          </span>
        );
      },
    },
    {
      header: "Last Modified",
      accessorKey: "lastModified",
    },
    {
      header: "Actions",
      id: "actions",
      cell: ({ row }: any) => (
        <div className="flex items-center gap-2">
          {canEditRuleSets() && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => console.log("Edit", row.original)}
            >
              <Settings className="h-4 w-4" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => console.log("More actions", row.original)}
          >
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  if (isLoading) {
    return <LoadingSpinner size="lg" />;
  }

  return (
    <div className={`w-full ${embedded ? "px-4" : "p-6"}`}>
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle>Scan Rule Sets</CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" onClick={handleRefresh}>
                <RefreshCw className="h-4 w-4" />
              </Button>
              {canCreateRuleSets() && (
                <Button onClick={handleCreateRule}>
                  <Plus className="h-4 w-4 mr-2" />
                  New Rule Set
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-1 items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search rules..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2">
                <Label className="text-sm">Category</Label>
                <Select
                  value={selectedCategory}
                  onValueChange={setSelectedCategory}
                >
                  <SelectTrigger className="w-[140px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="Security">Security</SelectItem>
                    <SelectItem value="Compliance">Compliance</SelectItem>
                    <SelectItem value="Quality">Quality</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <Label className="text-sm">Status</Label>
                <Select
                  value={selectedStatus}
                  onValueChange={setSelectedStatus}
                >
                  <SelectTrigger className="w-[140px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Rules Table */}
          <DataTable
            columns={columns}
            data={filteredRules}
            toolbar={false}
            columnVisibility={{
              description: !embedded,
            }}
            pagination={{
              pageSize: embedded ? 5 : 10,
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
};
