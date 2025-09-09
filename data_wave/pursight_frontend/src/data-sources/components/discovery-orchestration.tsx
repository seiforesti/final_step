"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Database, Scan, TreePine, GitBranch, Package } from "lucide-react"

import { DataSource } from "../types"
import { DataSourceDiscovery } from "../data-source-discovery"
import { SchemaDiscovery as SchemaDiscoveryStable } from "../data-discovery/schema-discovery"
import { SchemaDiscovery as SchemaDiscoveryTemp } from "../data-discovery/schema-discovery-temp"
import { DataSourceCatalog } from "../data-source-catalog"
import { DataLineageGraph } from "../data-discovery/data-lineage-graph"
import { DataSourceScanResults } from "../data-source-scan-results"

interface DiscoveryOrchestrationProps {
	dataSource: DataSource
	className?: string
}

export function DiscoveryOrchestration({ dataSource, className = "" }: DiscoveryOrchestrationProps) {
	return (
		<Card className={className}>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<Database className="h-5 w-5" />
					Discovery & Catalog Orchestration
				</CardTitle>
			</CardHeader>
			<CardContent>
				<Tabs defaultValue="discovery" className="w-full">
					<TabsList className="grid w-full grid-cols-5">
						<TabsTrigger value="discovery">
							<Scan className="h-4 w-4 mr-2" /> Discovery
						</TabsTrigger>
						<TabsTrigger value="schema">
							<TreePine className="h-4 w-4 mr-2" /> Schema
						</TabsTrigger>
						<TabsTrigger value="catalog">
							<Package className="h-4 w-4 mr-2" /> Catalog
						</TabsTrigger>
						<TabsTrigger value="lineage">
							<GitBranch className="h-4 w-4 mr-2" /> Lineage
						</TabsTrigger>
						<TabsTrigger value="scan-results">
							<Scan className="h-4 w-4 mr-2" /> Scan Results
						</TabsTrigger>
					</TabsList>

					<TabsContent value="discovery" className="mt-4">
						<DataSourceDiscovery dataSource={dataSource} />
					</TabsContent>

					<TabsContent value="schema" className="mt-4">
						<div className="grid md:grid-cols-2 gap-4">
							<Card>
								<CardHeader>
									<CardTitle>Schema Discovery</CardTitle>
								</CardHeader>
								<CardContent>
									<SchemaDiscoveryStable 
										dataSourceId={dataSource.id}
										dataSourceName={dataSource.name}
										onSelectionChange={() => {}}
										onClose={() => {}}
									/>
								</CardContent>
							</Card>
							<Card>
								<CardHeader>
									<CardTitle>Schema Discovery (Temp)</CardTitle>
								</CardHeader>
								<CardContent>
									<SchemaDiscoveryTemp 
										dataSourceId={dataSource.id}
										dataSourceName={dataSource.name}
										onSelectionChange={() => {}}
										onClose={() => {}}
									/>
								</CardContent>
							</Card>
						</div>
					</TabsContent>

					<TabsContent value="catalog" className="mt-4">
						<DataSourceCatalog dataSourceId={dataSource.id} />
					</TabsContent>

					<TabsContent value="lineage" className="mt-4">
						<DataLineageGraph dataSourceId={dataSource.id} />
					</TabsContent>

					<TabsContent value="scan-results" className="mt-4">
						<DataSourceScanResults dataSourceId={dataSource.id} />
					</TabsContent>
				</Tabs>
			</CardContent>
		</Card>
	)
}
