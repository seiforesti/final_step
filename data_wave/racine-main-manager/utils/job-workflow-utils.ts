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
