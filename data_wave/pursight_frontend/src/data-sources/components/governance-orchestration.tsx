"use client"

import React, { Suspense } from "react"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Shield, ShieldCheckIcon, FileText, UserCheck, Hash } from "lucide-react"

import { DataSource } from "../types"
const DataSourceComplianceView = React.lazy(() => import("../data-source-compliance-view").then(m => ({ default: m.DataSourceComplianceView })))
const DataSourceSecurityView = React.lazy(() => import("../data-source-security-view").then(m => ({ default: m.DataSourceSecurityView })))
const DataSourceAccessControl = React.lazy(() => import("../data-source-access-control").then(m => ({ default: m.DataSourceAccessControl })))
const DataSourceReports = React.lazy(() => import("../data-source-reports").then(m => ({ default: m.DataSourceReports })))
const DataSourceTagsManager = React.lazy(() => import("../data-source-tags-manager").then(m => ({ default: m.DataSourceTagsManager })))

interface GovernanceOrchestrationProps {
	dataSource: DataSource
	className?: string
}

export function GovernanceOrchestration({ dataSource, className = "" }: GovernanceOrchestrationProps) {
	return (
		<Card className={className}>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<Shield className="h-5 w-5" /> Governance Orchestration
				</CardTitle>
			</CardHeader>
			<CardContent>
				<Tabs defaultValue="compliance">
					<TabsList className="grid w-full grid-cols-5">
						<TabsTrigger value="compliance">
							<ShieldCheckIcon className="h-4 w-4 mr-2" /> Compliance
						</TabsTrigger>
						<TabsTrigger value="security">
							<Shield className="h-4 w-4 mr-2" /> Security
						</TabsTrigger>
						<TabsTrigger value="access">
							<UserCheck className="h-4 w-4 mr-2" /> Access
						</TabsTrigger>
						<TabsTrigger value="reports">
							<FileText className="h-4 w-4 mr-2" /> Reports
						</TabsTrigger>
						<TabsTrigger value="tags">
							<Hash className="h-4 w-4 mr-2" /> Tags
						</TabsTrigger>
					</TabsList>

					<TabsContent value="compliance" className="mt-4">
						<Suspense fallback={<div>Loading compliance...</div>}>
							<DataSourceComplianceView dataSource={dataSource} />
						</Suspense>
					</TabsContent>
					<TabsContent value="security" className="mt-4">
						<Suspense fallback={<div>Loading security...</div>}>
							<DataSourceSecurityView dataSource={dataSource} />
						</Suspense>
					</TabsContent>
					<TabsContent value="access" className="mt-4">
						<Suspense fallback={<div>Loading access control...</div>}>
							<DataSourceAccessControl dataSource={dataSource} />
						</Suspense>
					</TabsContent>
					<TabsContent value="reports" className="mt-4">
						<Suspense fallback={<div>Loading reports...</div>}>
							<DataSourceReports dataSource={dataSource} />
						</Suspense>
					</TabsContent>
					<TabsContent value="tags" className="mt-4">
						<Suspense fallback={<div>Loading tags...</div>}>
							<DataSourceTagsManager dataSourceId={dataSource.id} onClose={() => {}} />
						</Suspense>
					</TabsContent>
				</Tabs>
			</CardContent>
		</Card>
	)
}
