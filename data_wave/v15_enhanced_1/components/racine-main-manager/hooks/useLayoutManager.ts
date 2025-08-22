// hooks/useLayoutManager.ts
'use client'

import { useState, useCallback } from 'react'

export function useLayoutManager() {
	const [layout, setLayout] = useState<'default' | 'split' | 'grid'>('default')
	const set = useCallback((l: 'default' | 'split' | 'grid') => setLayout(l), [])
	return { layout, setLayout: set }
}
