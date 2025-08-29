export type CanvasSize = { width: number; height: number }
export type Position = { x: number; y: number }
export type NodeLike = { id: string; position: Position; size?: { w: number; h: number } }

function distance(a: Position, b: Position): number {
	const dx = a.x - b.x
	const dy = a.y - b.y
	return Math.sqrt(dx*dx + dy*dy)
}

export async function calculateOptimalNodePosition(existing: NodeLike[], canvas: CanvasSize): Promise<Position> {
	// Simple grid-based placement with minimal collision against existing nodes
	const grid = 40
	const margin = 16
	let best: Position = { x: Math.round(canvas.width/2), y: Math.round(canvas.height/2) }
	let bestScore = -Infinity
	for (let y = margin; y < canvas.height - margin; y += grid) {
		for (let x = margin; x < canvas.width - margin; x += grid) {
			const pos = { x, y }
			const minDist = existing.length === 0 ? Math.min(x, y) : Math.min(...existing.map(n => distance(pos, n.position)))
			const edgePenalty = Math.min(x, canvas.width - x, y, canvas.height - y)
			const score = minDist + edgePenalty * 0.1
			if (score > bestScore) { bestScore = score; best = pos }
		}
	}
	return best
}

export function clampToCanvas(pos: Position, canvas: CanvasSize): Position {
	return {
		x: Math.max(0, Math.min(canvas.width, pos.x)),
		y: Math.max(0, Math.min(canvas.height, pos.y))
	}
}

export function calculateWorkflowMetrics(workflow: any): any {
	return {
		nodeCount: workflow.nodes?.length || 0,
		connectionCount: workflow.connections?.length || 0,
		complexity: calculateComplexity(workflow),
		estimatedExecutionTime: estimateExecutionTime(workflow),
		resourceUsage: estimateResourceUsage(workflow)
	}
}

export function generateWorkflowCode(workflow: any): string {
	const nodes = workflow.nodes || []
	const connections = workflow.connections || []
	
	let code = `// Generated Workflow Code\n`
	code += `export const workflow = {\n`
	code += `  nodes: ${JSON.stringify(nodes, null, 2)},\n`
	code += `  connections: ${JSON.stringify(connections, null, 2)},\n`
	code += `  metadata: {\n`
	code += `    name: "${workflow.name || 'Unnamed Workflow'}",\n`
	code += `    description: "${workflow.description || ''}",\n`
	code += `    version: "${workflow.version || '1.0.0'}"\n`
	code += `  }\n`
	code += `}\n`
	
	return code
}

function calculateComplexity(workflow: any): number {
	const nodes = workflow.nodes || []
	const connections = workflow.connections || []
	return (nodes.length * 0.3) + (connections.length * 0.2)
}

function estimateExecutionTime(workflow: any): number {
	const nodes = workflow.nodes || []
	return nodes.length * 100 // 100ms per node as estimate
}

function estimateResourceUsage(workflow: any): any {
	const nodes = workflow.nodes || []
	return {
		memory: nodes.length * 10, // 10MB per node
		cpu: nodes.length * 0.1,   // 0.1 CPU cores per node
		storage: nodes.length * 5   // 5MB storage per node
	}
}

export function validateWorkflowStructure(workflow: any): { isValid: boolean; errors: string[] } {
	const errors: string[] = []
	
	if (!workflow.nodes || !Array.isArray(workflow.nodes)) {
		errors.push('Workflow must have a nodes array')
	}
	
	if (!workflow.connections || !Array.isArray(workflow.connections)) {
		errors.push('Workflow must have a connections array')
	}
	
	return { isValid: errors.length === 0, errors }
}

export function optimizeWorkflowPath(workflow: any): any {
	// Simple optimization: remove redundant connections
	const connections = workflow.connections || []
	const optimized = connections.filter((conn: any, index: number) => 
		!connections.slice(index + 1).some((other: any) => 
			other.source === conn.source && other.target === conn.target
		)
	)
	
	return { ...workflow, connections: optimized }
}

export function parseWorkflowJSON(json: string): any {
	try {
		return JSON.parse(json)
	} catch (error) {
		throw new Error(`Invalid workflow JSON: ${error}`)
	}
}

export function detectWorkflowCycles(workflow: any): boolean {
	const nodes = workflow.nodes || []
	const connections = workflow.connections || []
	
	// Simple cycle detection using DFS
	const visited = new Set()
	const recursionStack = new Set()
	
	function hasCycle(nodeId: string): boolean {
		if (recursionStack.has(nodeId)) return true
		if (visited.has(nodeId)) return false
		
		visited.add(nodeId)
		recursionStack.add(nodeId)
		
		const outgoingConnections = connections.filter((conn: any) => conn.source === nodeId)
		for (const conn of outgoingConnections) {
			if (hasCycle(conn.target)) return true
		}
		
		recursionStack.delete(nodeId)
		return false
	}
	
	for (const node of nodes) {
		if (hasCycle(node.id)) return true
	}
	
	return false
}

export function suggestWorkflowOptimizations(workflow: any): string[] {
	const suggestions: string[] = []
	
	const nodes = workflow.nodes || []
	const connections = workflow.connections || []
	
	if (nodes.length > 50) {
		suggestions.push('Consider breaking this workflow into smaller sub-workflows')
	}
	
	if (connections.length < nodes.length - 1) {
		suggestions.push('Some nodes appear to be disconnected')
	}
	
	if (detectWorkflowCycles(workflow)) {
		suggestions.push('Workflow contains cycles which may cause infinite loops')
	}
	
	return suggestions
}
