'use client';

import { DataSourceDetails } from '@/features/data-sources/components/DataSourceDetails';

interface DataSourceDetailPageProps {
  params: {
    id: string;
  };
}

export default function DataSourceDetailPage({ params }: DataSourceDetailPageProps) {
  return <DataSourceDetails id={params.id} />;
}