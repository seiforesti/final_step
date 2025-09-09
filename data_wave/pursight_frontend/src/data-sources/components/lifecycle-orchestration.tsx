"use client"

import React, { Suspense } from "react"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Settings, Calendar, Archive, GitBranch, Boxes } from "lucide-react"

import { DataSource } from "../types"
const DataSourceCloudConfig = React.lazy(() => import("../data-source-cloud-config").then(m => ({ default: m.DataSourceCloudConfig })))
const DataSourceScheduler = React.lazy(() => import("../data-source-scheduler").then(m => ({ default: m.DataSourceScheduler })))
const DataSourceBackupRestore = React.lazy(() => import("../data-source-backup-restore").then(m => ({ default: m.DataSourceBackupRestore })))
const DataSourceVersionHistory = React.lazy(() => import("../data-source-version-history").then(m => ({ default: m.DataSourceVersionHistory })))
const DataSourceIntegrations = React.lazy(() => import("../data-source-integrations").then(m => ({ default: m.DataSourceIntegrations })))

interface LifecycleOrchestrationProps {
	dataSource: DataSource
	className?: string
}

export function LifecycleOrchestration({ dataSource, className = "" }: LifecycleOrchestrationProps) {
	return (
		<Card className={className}>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<Settings className="h-5 w-5" /> Lifecycle Orchestration
				</CardTitle>
			</CardHeader>
			<CardContent>
				<Tabs defaultValue="config">
					<TabsList className="grid w-full grid-cols-5">
						<TabsTrigger value="config">
							<Settings className="h-4 w-4 mr-2" /> Cloud Config
						</TabsTrigger>
						<TabsTrigger value="scheduler">
							<Calendar className="h-4 w-4 mr-2" /> Scheduler
						</TabsTrigger>
						<TabsTrigger value="backup">
							<Archive className="h-4 w-4 mr-2" /> Backup/Restore
						</TabsTrigger>
						<TabsTrigger value="versions">
							<GitBranch className="h-4 w-4 mr-2" /> Versions
						</TabsTrigger>
						<TabsTrigger value="integrations">
							<Boxes className="h-4 w-4 mr-2" /> Integrations
						</TabsTrigger>
					</TabsList>

					<TabsContent value="config" className="mt-4">
						<Suspense fallback={<div>Loading cloud config...</div>}>
							<DataSourceCloudConfig dataSource={dataSource} />
						</Suspense>
					</TabsContent>
					<TabsContent value="scheduler" className="mt-4">
						<Suspense fallback={<div>Loading scheduler...</div>}>
							<DataSourceScheduler dataSource={dataSource} />
						</Suspense>
					</TabsContent>
					<TabsContent value="backup" className="mt-4">
						<Suspense fallback={<div>Loading backup...</div>}>
							<DataSourceBackupRestore dataSourceId={dataSource.id} />
						</Suspense>
					</TabsContent>
					<TabsContent value="versions" className="mt-4">
						<Suspense fallback={<div>Loading versions...</div>}>
							<DataSourceVersionHistory dataSource={dataSource} />
						</Suspense>
					</TabsContent>
					<TabsContent value="integrations" className="mt-4">
						<Suspense fallback={<div>Loading integrations...</div>}>
							<DataSourceIntegrations dataSourceId={dataSource.id} />
						</Suspense>
					</TabsContent>
				</Tabs>
			</CardContent>
		</Card>
	)
}
