import { TableColumn, TableRow } from '@forma/shared';

const API_URL = 'http://localhost:3001';

export interface TableResponse {
  table_id: string;
  name: string;
  column_count: number;
  row_count: number;
  created_at: Date;
}

export interface TableDetailResponse {
  table_id: string;
  name: string;
  columns: TableColumn[];
  rows: TableRow[];
}

export const tablesApi = {
  async uploadTable(projectId: string, file: File): Promise<TableResponse> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_URL}/projects/${projectId}/tables/upload`, {
      method: 'POST',
      body: formData,
    });
    if (!response.ok) throw new Error('Failed to upload table');
    return response.json();
  },

  async getTables(projectId: string): Promise<TableResponse[]> {
    const response = await fetch(`${API_URL}/projects/${projectId}/tables`);
    if (!response.ok) throw new Error('Failed to fetch tables');
    return response.json();
  },

  async getTableDetail(projectId: string, tableId: string): Promise<TableDetailResponse> {
    const response = await fetch(`${API_URL}/projects/${projectId}/tables/${tableId}`);
    if (!response.ok) throw new Error('Failed to fetch table detail');
    return response.json();
  },

  async renameTable(projectId: string, tableId: string, newName: string): Promise<TableResponse> {
    const response = await fetch(`${API_URL}/projects/${projectId}/tables/${tableId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ new_name: newName }),
    });
    if (!response.ok) throw new Error('Failed to rename table');
    return response.json();
  },

  async renameColumn(
    projectId: string,
    tableId: string,
    columnId: string,
    newName: string
  ): Promise<TableDetailResponse> {
    const response = await fetch(`${API_URL}/projects/${projectId}/tables/${tableId}/columns/${columnId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ new_name: newName }),
    });
    if (!response.ok) throw new Error('Failed to rename column');
    return response.json();
  },

  async deleteTable(projectId: string, tableId: string): Promise<void> {
    const response = await fetch(`${API_URL}/projects/${projectId}/tables/${tableId}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete table');
  },

  async reuploadTable(projectId: string, tableId: string, file: File): Promise<TableDetailResponse> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_URL}/projects/${projectId}/tables/${tableId}/reupload`, {
      method: 'POST',
      body: formData,
    });
    if (!response.ok) throw new Error('Failed to reupload table');
    return response.json();
  },
};