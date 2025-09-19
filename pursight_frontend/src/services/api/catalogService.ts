/**
 * Data Catalog Service
 * 
 * Service for managing data catalog operations including data sources,
 * assets, schemas, and lineage relationships.
 */

import { httpClient } from '../utils/httpClient';
import { 
  DataSource, 
  DataAsset, 
  Schema, 
  LineageRelationship,
  ApiResponse,
  PaginatedResponse,
  CreateDataSourceRequest,
  UpdateDataSourceRequest,
  CreateDataAssetRequest,
  UpdateDataAssetRequest,
  LineageRequest,
  SchemaDiscoveryRequest
} from '../../types/catalog';

export class CatalogService {
  private baseUrl = '/api/v1';

  // Data Sources
  async getDataSources(params?: {
    page?: number;
    size?: number;
    status?: string;
    type?: string;
    search?: string;
  }): Promise<PaginatedResponse<DataSource>> {
    const response = await httpClient.get(`${this.baseUrl}/data-sources`, { params });
    return response.data;
  }

  async getDataSource(id: string): Promise<ApiResponse<DataSource>> {
    const response = await httpClient.get(`${this.baseUrl}/data-sources/${id}`);
    return response.data;
  }

  async createDataSource(data: CreateDataSourceRequest): Promise<ApiResponse<DataSource>> {
    const response = await httpClient.post(`${this.baseUrl}/data-sources`, data);
    return response.data;
  }

  async updateDataSource(id: string, data: UpdateDataSourceRequest): Promise<ApiResponse<DataSource>> {
    const response = await httpClient.put(`${this.baseUrl}/data-sources/${id}`, data);
    return response.data;
  }

  async deleteDataSource(id: string, hardDelete = false): Promise<void> {
    await httpClient.delete(`${this.baseUrl}/data-sources/${id}`, {
      params: { hard_delete: hardDelete }
    });
  }

  async testDataSourceConnection(id: string): Promise<ApiResponse<{
    success: boolean;
    message: string;
    details?: any;
  }>> {
    const response = await httpClient.post(`${this.baseUrl}/data-sources/${id}/test-connection`);
    return response.data;
  }

  async discoverDataSourceSchema(id: string, fullScan = false): Promise<ApiResponse<{
    jobId: string;
    status: string;
    message: string;
  }>> {
    const response = await httpClient.post(`${this.baseUrl}/data-sources/${id}/discover`, {
      full_scan: fullScan
    });
    return response.data;
  }

  // Data Assets
  async getDataAssets(params?: {
    page?: number;
    size?: number;
    dataSourceId?: string;
    type?: string;
    classification?: string;
    search?: string;
  }): Promise<PaginatedResponse<DataAsset>> {
    const response = await httpClient.get(`${this.baseUrl}/data-assets`, { params });
    return response.data;
  }

  async getDataAsset(id: string, includeLineage = false): Promise<ApiResponse<DataAsset>> {
    const response = await httpClient.get(`${this.baseUrl}/data-assets/${id}`, {
      params: { include_lineage: includeLineage }
    });
    return response.data;
  }

  async createDataAsset(data: CreateDataAssetRequest): Promise<ApiResponse<DataAsset>> {
    const response = await httpClient.post(`${this.baseUrl}/data-assets`, data);
    return response.data;
  }

  async updateDataAsset(id: string, data: UpdateDataAssetRequest): Promise<ApiResponse<DataAsset>> {
    const response = await httpClient.put(`${this.baseUrl}/data-assets/${id}`, data);
    return response.data;
  }

  async deleteDataAsset(id: string, hardDelete = false): Promise<void> {
    await httpClient.delete(`${this.baseUrl}/data-assets/${id}`, {
      params: { hard_delete: hardDelete }
    });
  }

  async profileDataAsset(id: string, sampleSize = 1000): Promise<ApiResponse<{
    jobId: string;
    status: string;
    message: string;
  }>> {
    const response = await httpClient.post(`${this.baseUrl}/data-assets/${id}/profile`, {
      sample_size: sampleSize
    });
    return response.data;
  }

  // Schemas
  async getAssetSchema(assetId: string, version?: string): Promise<ApiResponse<Schema>> {
    const response = await httpClient.get(`${this.baseUrl}/schemas/${assetId}/schema`, {
      params: { version }
    });
    return response.data;
  }

  async getSchemaVersions(assetId: string): Promise<ApiResponse<{
    versions: Array<{
      version: string;
      createdAt: string;
      createdBy: string;
      changes: string[];
    }>;
  }>> {
    const response = await httpClient.get(`${this.baseUrl}/schemas/${assetId}/versions`);
    return response.data;
  }

  async compareSchemaVersions(assetId: string, version1: string, version2: string): Promise<ApiResponse<{
    differences: Array<{
      type: 'added' | 'removed' | 'modified';
      path: string;
      oldValue?: any;
      newValue?: any;
    }>;
  }>> {
    const response = await httpClient.get(`${this.baseUrl}/schemas/${assetId}/compare`, {
      params: { version1, version2 }
    });
    return response.data;
  }

  // Data Lineage
  async getAssetLineage(assetId: string, params?: {
    direction?: 'upstream' | 'downstream' | 'both';
    depth?: number;
  }): Promise<ApiResponse<{
    nodes: Array<{
      id: string;
      name: string;
      type: string;
      level: number;
    }>;
    edges: Array<{
      source: string;
      target: string;
      type: string;
      confidence: number;
    }>;
  }>> {
    const response = await httpClient.get(`${this.baseUrl}/lineage/${assetId}`, { params });
    return response.data;
  }

  async createLineageRelationship(data: LineageRequest): Promise<ApiResponse<LineageRelationship>> {
    const response = await httpClient.post(`${this.baseUrl}/lineage`, data);
    return response.data;
  }

  async analyzeImpact(assetId: string, changeType: string): Promise<ApiResponse<{
    impactedAssets: Array<{
      id: string;
      name: string;
      type: string;
      impactLevel: 'low' | 'medium' | 'high' | 'critical';
      reason: string;
    }>;
    recommendations: string[];
  }>> {
    const response = await httpClient.get(`${this.baseUrl}/lineage/${assetId}/impact-analysis`, {
      params: { change_type: changeType }
    });
    return response.data;
  }

  // Search and Discovery
  async searchAssets(query: string, params?: {
    types?: string[];
    dataSources?: string[];
    classifications?: string[];
    limit?: number;
  }): Promise<ApiResponse<{
    results: DataAsset[];
    facets: {
      types: Array<{ value: string; count: number }>;
      dataSources: Array<{ value: string; count: number }>;
      classifications: Array<{ value: string; count: number }>;
    };
    total: number;
  }>> {
    const response = await httpClient.post(`${this.baseUrl}/search/assets`, {
      query,
      ...params
    });
    return response.data;
  }

  async getPopularAssets(limit = 10): Promise<ApiResponse<DataAsset[]>> {
    const response = await httpClient.get(`${this.baseUrl}/assets/popular`, {
      params: { limit }
    });
    return response.data;
  }

  async getRecentlyAccessedAssets(limit = 10): Promise<ApiResponse<DataAsset[]>> {
    const response = await httpClient.get(`${this.baseUrl}/assets/recent`, {
      params: { limit }
    });
    return response.data;
  }

  // Metadata Management
  async updateAssetMetadata(assetId: string, metadata: Record<string, any>): Promise<ApiResponse<DataAsset>> {
    const response = await httpClient.patch(`${this.baseUrl}/data-assets/${assetId}/metadata`, {
      metadata
    });
    return response.data;
  }

  async addAssetTags(assetId: string, tags: string[]): Promise<ApiResponse<DataAsset>> {
    const response = await httpClient.post(`${this.baseUrl}/data-assets/${assetId}/tags`, {
      tags
    });
    return response.data;
  }

  async removeAssetTags(assetId: string, tags: string[]): Promise<ApiResponse<DataAsset>> {
    const response = await httpClient.delete(`${this.baseUrl}/data-assets/${assetId}/tags`, {
      data: { tags }
    });
    return response.data;
  }

  // Business Glossary
  async getGlossaryTerms(params?: {
    search?: string;
    category?: string;
  }): Promise<ApiResponse<Array<{
    id: string;
    name: string;
    definition: string;
    category: string;
    relatedTerms: string[];
    usageCount: number;
  }>>> {
    const response = await httpClient.get(`${this.baseUrl}/glossary/terms`, { params });
    return response.data;
  }

  async linkAssetToGlossaryTerm(assetId: string, termId: string): Promise<void> {
    await httpClient.post(`${this.baseUrl}/data-assets/${assetId}/glossary-terms`, {
      termId
    });
  }

  async unlinkAssetFromGlossaryTerm(assetId: string, termId: string): Promise<void> {
    await httpClient.delete(`${this.baseUrl}/data-assets/${assetId}/glossary-terms/${termId}`);
  }
}

// Create singleton instance
export const catalogService = new CatalogService();