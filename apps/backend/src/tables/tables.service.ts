import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { parse } from 'csv-parse/sync';
import { TablesRepository } from './tables.repository';
import { TableColumn, Table, TableRow } from './types';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class TablesService {
  constructor(private readonly tablesRepository: TablesRepository) {}

  async uploadTable(projectId: string, csvBuffer: Buffer, filename: string): Promise<Table> {
    // Parse CSV
    const csvContent = csvBuffer.toString('utf-8');
    const { headers, rows } = this.parseCSV(csvContent);

    if (headers.length === 0) {
      throw new BadRequestException('CSV must have at least one column');
    }

    if (rows.length === 0) {
      throw new BadRequestException('CSV must have at least one row of data');
    }

    // Generate unique column names and infer types
    const columns = this.generateColumns(headers, rows);

    // Create table name from filename (remove .csv extension)
    const tableName = filename.replace(/\.csv$/i, '') || 'Untitled Table';

    // Create table
    const table = await this.tablesRepository.createTable(projectId, tableName, columns);

    // Insert rows
    const tableRows: Omit<TableRow, 'row_id'>[] = rows.map(rowData => ({
      data: this.mapRowToColumnIds(columns, rowData),
    }));
    await this.tablesRepository.insertTableRows(table.table_id, tableRows);

    const row_count = await this.tablesRepository.getRowCountForTable(table.table_id);

    // Return updated table with row count
    return { ...table, row_count };
  }

  async getTables(projectId: string): Promise<Table[]> {
    return this.tablesRepository.getTablesByProjectId(projectId);
  }

  async getTableDetail(tableId: string): Promise<{ table: Table; rows: TableRow[] }> {
    const table = await this.tablesRepository.getTableById(tableId);
    if (!table) {
      throw new NotFoundException('Table not found');
    }

    const rows = await this.tablesRepository.getTableRows(tableId);
    return { table, rows };
  }

  async renameTable(tableId: string, newName: string): Promise<Table> {
    const table = await this.tablesRepository.getTableById(tableId);
    if (!table) {
      throw new NotFoundException('Table not found');
    }

    await this.tablesRepository.updateTableName(tableId, newName);
    return this.tablesRepository.getTableById(tableId);
  }

  async renameColumn(tableId: string, columnId: string, newName: string): Promise<{ table: Table; rows: TableRow[] }> {
    const table = await this.tablesRepository.getTableById(tableId);
    if (!table) {
      throw new NotFoundException('Table not found');
    }

    const column = table.columns.find(c => c.column_id === columnId);
    if (!column) {
      throw new NotFoundException('Column not found');
    }
    // Update column name
    const updatedColumns = table.columns.map(c =>
      c.column_id === columnId ? { ...c, name: newName } : c
    );

    await this.tablesRepository.updateTableColumns(tableId, updatedColumns);

    // Return updated table detail
    return this.getTableDetail(tableId);
  }

  async deleteTable(tableId: string): Promise<void> {
    const table = await this.tablesRepository.getTableById(tableId);
    if (!table) {
      throw new NotFoundException('Table not found');
    }

    // Check if table is referenced in master table
    const isReferenced = await this.tablesRepository.isTableReferencedInMasterTable(table.project_id, tableId);
    if (isReferenced) {
      throw new BadRequestException('Cannot delete table that is referenced in master table');
    }

    await this.tablesRepository.deleteTable(tableId);
  }

  async reuploadTable(tableId: string, csvBuffer: Buffer): Promise<{ table: Table; rows: TableRow[] }> {
    const table = await this.tablesRepository.getTableById(tableId);
    if (!table) {
      throw new NotFoundException('Table not found');
    }

    // Parse new CSV
    const csvContent = csvBuffer.toString('utf-8');
    const { headers, rows } = this.parseCSV(csvContent);

    if (headers.length === 0) {
      throw new BadRequestException('CSV must have at least one column');
    }

    if (rows.length === 0) {
      throw new BadRequestException('CSV must have at least one row of data');
    }

    // Generate new columns (keep same column_ids if possible, but re-infer types)
    const newColumns = this.generateColumns(headers, rows);

    // Update table columns
    await this.tablesRepository.updateTableColumns(tableId, newColumns);

    // Delete existing rows and insert new ones
    await this.tablesRepository.deleteTableRows(tableId);
    const tableRows: Omit<TableRow, 'row_id'>[] = rows.map(rowData => ({
      data: this.mapRowToColumnIds(newColumns, rowData),
    }));
    await this.tablesRepository.insertTableRows(tableId, tableRows);

    // Return updated table detail
    return this.getTableDetail(tableId);
  }

  private parseCSV(csvContent: string): { headers: string[]; rows: string[][] } {
    const records = parse(csvContent.replace(/^\uFEFF/, ''), {
      columns: false,
      skip_empty_lines: true,
      trim: true,
      relax_column_count: true,
    }) as string[][];

    if (records.length === 0) {
      throw new BadRequestException('CSV file is empty');
    }

    const [headers, ...rows] = records;
    return { headers, rows };
  }

  private generateColumns(headers: string[], rows: string[][]): TableColumn[] {
    const columns: TableColumn[] = [];
    const usedNames = new Set<string>();

    headers.forEach((header, index) => {
      // Handle duplicate names
      let name = header || `Column ${index + 1}`;
      let counter = 1;
      while (usedNames.has(name)) {
        name = `${header || `Column ${index + 1}`}_${counter}`;
        counter++;
      }
      usedNames.add(name);

      // Infer data type
      const dataType = this.inferColumnType(rows.map(row => row[index]));

      columns.push({
        column_id: uuidv4(),
        name,
        data_type: dataType,
      });
    });

    return columns;
  }

  private inferColumnType(values: string[]): 'text' | 'number' {
    // Sample up to 100 values
    const sampleValues = values.slice(0, 100);

    // Check if all non-empty values can be parsed as numbers
    const numericValues = sampleValues.filter(v => v && v.trim()).every(v => {
      const num = parseFloat(v.trim());
      return !isNaN(num) && isFinite(num);
    });

    return numericValues ? 'number' : 'text';
  }

  private mapRowToColumnIds(columns: TableColumn[], rowData: string[]): Record<string, any> {
    const data: Record<string, any> = {};
    columns.forEach((column, index) => {
      const value = rowData[index] || '';
      data[column.column_id] = column.data_type === 'number' && value
        ? parseFloat(value)
        : value;
    });
    return data;
  }
}