"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Database, Scan, TreePine, GitBranch, Package } from "lucide-react"

import { DataSource } from "../types"
import { DataSourceDiscovery } from "../data-source-discovery"
import { SchemaDiscovery as SchemaDiscoveryStable } from "../data-discovery/schema-discovery"
import { SchemaDiscovery as SchemaDiscoveryTemp } from "../data-discovery/schema-discovery-temp"
import { SchemaDiscoveryProvider } from "../shared/contexts/schema-discovery-context"
import { SchemaDiscoverySplitView } from "../ui/schema-discovery-split-view"
import { DataSourceCatalog } from "../data-source-catalog"
import { DataLineageGraph } from "../data-discovery/data-lineage-graph"
import { DataSourceScanResults } from "../data-source-scan-results"

interface DiscoveryOrchestrationProps {
	dataSource: DataSource
	className?: string
}

export function DiscoveryOrchestration({ dataSource, className = "" }: DiscoveryOrchestrationProps) {
	return (
		<Card className={`${className} h-screen overflow-hidden`}>
			<CardHeader className="border-b bg-background/60 backdrop-blur-sm">
				<CardTitle className="flex items-center gap-2">
					<Database className="h-5 w-5" />
					Discovery & Catalog Orchestration
				</CardTitle>
			</CardHeader>
			<CardContent className="p-0 h-[calc(100vh-90px)] min-h-0 overflow-hidden">
				<Tabs defaultValue="discovery" className="w-full h-full flex flex-col min-h-0">
					<TabsList className="grid w-full grid-cols-5 border-b sticky top-0 z-10 bg-background">
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

					<TabsContent value="discovery" className="flex-1 min-h-0 overflow-hidden p-0">
						<SchemaDiscoveryProvider>
							<div className="h-full min-h-0 min-w-0 overflow-hidden">
								<div className="h-full min-h-0 min-w-0 overflow-hidden">
									<div className="h-full min-h-0 min-w-0 overflow-auto orchestrator-scroll">
										<SchemaDiscoverySplitView
											tempComponent={
												<SchemaDiscoveryTemp 
													dataSourceId={dataSource.id}
													dataSourceName={dataSource.name}
													onSelectionChange={() => {}}
													onClose={() => {}}
												/>
											}
											enterpriseComponent={
												<SchemaDiscoveryStable 
													dataSourceId={dataSource.id}
													dataSourceName={dataSource.name}
													onSelectionChange={() => {}}
													onClose={() => {}}
												/>
											}
											className="h-full"
										/>
									</div>
								</div>
							</div>
						</SchemaDiscoveryProvider>
					</TabsContent>

					<TabsContent value="schema" className="flex-1 min-h-0 overflow-hidden p-0">
						<SchemaDiscoveryProvider>
							<div className="h-full min-h-0 min-w-0 overflow-hidden">
								<div className="h-full min-h-0 min-w-0 overflow-hidden">
									<div className="h-full min-h-0 min-w-0 overflow-auto orchestrator-scroll">
										<SchemaDiscoverySplitView
											tempComponent={
												<SchemaDiscoveryTemp 
													dataSourceId={dataSource.id}
													dataSourceName={dataSource.name}
													onSelectionChange={() => {}}
													onClose={() => {}}
												/>
											}
											enterpriseComponent={
												<SchemaDiscoveryStable 
													dataSourceId={dataSource.id}
													dataSourceName={dataSource.name}
													onSelectionChange={() => {}}
													onClose={() => {}}
												/>
											}
											className="h-full"
										/>
									</div>
								</div>
							</div>
						</SchemaDiscoveryProvider>
					</TabsContent>

					<TabsContent value="catalog" className="flex-1 min-h-0 overflow-auto p-4 orchestrator-scroll">
						<DataSourceCatalog dataSourceId={dataSource.id} />
					</TabsContent>

					<TabsContent value="lineage" className="flex-1 min-h-0 overflow-auto p-4 orchestrator-scroll">
						<DataLineageGraph dataSourceId={dataSource.id} />
					</TabsContent>

					<TabsContent value="scan-results" className="flex-1 min-h-0 overflow-auto p-4 orchestrator-scroll">
						<DataSourceScanResults dataSourceId={dataSource.id} />
					</TabsContent>
				</Tabs>
			</CardContent>

			{/* Local styles for invisible scrollbar and containment */}
			<style>{`
			  .orchestrator-scroll { scrollbar-width: thin; scrollbar-color: transparent transparent; }
			  .orchestrator-scroll::-webkit-scrollbar { width: 8px; height: 8px; }
			  .orchestrator-scroll::-webkit-scrollbar-thumb { background: transparent; border-radius: 12px; }
			  .orchestrator-scroll:hover::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.1); }
			  .dark .orchestrator-scroll:hover::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.12); }
			`}</style>
		</Card>
	)
}
