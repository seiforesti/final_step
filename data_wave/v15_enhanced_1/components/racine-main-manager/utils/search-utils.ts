import React, { ReactNode } from 'react';
import { File } from 'lucide-react';

export function formatSearchTime(date: string | number | Date): string {
  try {
    const d = new Date(date);
    if (Number.isNaN(d.getTime())) return '';
    return d.toLocaleString();
  } catch {
    return '';
  }
}

export function highlightSearchTerms(text: string | undefined, query: string): ReactNode {
  if (!text || !query) return text ?? '';
  try {
    const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${escaped})`, 'ig');
    const parts = text.split(regex);
    return parts.map((part, idx) =>
      regex.test(part)
        ? React.createElement('mark', { key: idx, className: 'bg-yellow-200 rounded px-0.5' }, part)
        : React.createElement('span', { key: idx }, part)
    );
  } catch {
    return text;
  }
}

export function getSearchResultIcon(type: string) {
  // Provide a conservative default icon to avoid crashes
  return File;
}
