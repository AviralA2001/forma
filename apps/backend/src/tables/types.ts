export interface TableColumn {
  column_id: string;
  name: string;
  data_type: 'text' | 'number';
}

export interface Table {
  table_id: string;
  project_id: string;
  name: string;
  columns: TableColumn[];
  row_count: number;
  created_at: Date;
  updated_at: Date;
}

export interface TableRow {
  row_id: string;
  data: Record<string, any>;
}