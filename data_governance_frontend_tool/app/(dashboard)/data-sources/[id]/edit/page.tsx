'use client';

import { DataSourceForm } from '@/features/data-sources/components/DataSourceForm';

interface EditDataSourcePageProps {
  params: {
    id: string;
  };
}

export default function EditDataSourcePage({ params }: EditDataSourcePageProps) {
  return <DataSourceForm id={params.id} />;
}