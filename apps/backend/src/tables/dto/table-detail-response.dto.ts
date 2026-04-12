import { TableColumn, TableRow } from '../types';

export class TableDetailResponseDto {
  table_id: string;
  name: string;
  columns: TableColumn[];
  rows: TableRow[];
}