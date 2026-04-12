import { Injectable } from '@nestjs/common';
import { Connection } from 'typeorm';
import { TableColumn, Table, TableRow } from './types';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class TablesRepository {
  constructor(private readonly connection: Connection) {}

  async createTable(projectId: string, name: string, columns: TableColumn[]): Promise<Table> {
    const tableId = uuidv4();
    const query = `
      INSERT INTO tables (table_id, project_id, name, columns)
      VALUES ($1, $2, $3, $4)
      RETURNING table_id, project_id, name, columns, created_at, updated_at
    `;
    const result = await this.connection.query(query, [tableId, projectId, name, JSON.stringify(columns)]);
    return {
      ...result[0],
      columns: result[0].columns,
      row_count: 0,
    };
  }

  async getTablesByProjectId(projectId: string): Promise<Table[]> {
    const query = `
      SELECT t.table_id, t.project_id, t.name, t.columns, t.created_at, t.updated_at,
             COUNT(tr.row_id) as row_count
      FROM tables t
      LEFT JOIN table_rows tr ON t.table_id = tr.table_id
      WHERE t.project_id = $1
      GROUP BY t.table_id, t.project_id, t.name, t.columns, t.created_at, t.updated_at
      ORDER BY t.created_at DESC
    `;
    const results = await this.connection.query(query, [projectId]);
    return results.map(row => ({
      ...row,
      columns: row.columns,
      row_count: parseInt(row.row_count),
    }));
  }

  async getTableById(tableId: string): Promise<Table | null> {
    const query = `
      SELECT t.table_id, t.project_id, t.name, t.columns, t.created_at, t.updated_at,
             COUNT(tr.row_id) as row_count
      FROM tables t
      LEFT JOIN table_rows tr ON t.table_id = tr.table_id
      WHERE t.table_id = $1
      GROUP BY t.table_id, t.project_id, t.name, t.columns, t.created_at, t.updated_at
    `;
    const results = await this.connection.query(query, [tableId]);
    if (results.length === 0) return null;
    const row = results[0];
    return {
      ...row,
      columns: row.columns,
      row_count: parseInt(row.row_count),
    };
  }

  async updateTableName(tableId: string, newName: string): Promise<void> {
    const query = `UPDATE tables SET name = $1, updated_at = NOW() WHERE table_id = $2`;
    await this.connection.query(query, [newName, tableId]);
  }

  async updateTableColumns(tableId: string, columns: TableColumn[]): Promise<void> {
    const query = `UPDATE tables SET columns = $1, updated_at = NOW() WHERE table_id = $2`;
    await this.connection.query(query, [JSON.stringify(columns), tableId]);
  }

  async deleteTable(tableId: string): Promise<void> {
    const query = `DELETE FROM tables WHERE table_id = $1`;
    await this.connection.query(query, [tableId]);
  }

  async insertTableRows(tableId: string, rows: Omit<TableRow, 'row_id'>[]): Promise<void> {
    if (rows.length === 0) return;

    const values = rows.map(row => `('${uuidv4()}', '${tableId}', '${JSON.stringify(row.data).replace(/'/g, "''")}')`).join(', ');
    const query = `INSERT INTO table_rows (row_id, table_id, data) VALUES ${values}`;
    await this.connection.query(query);
  }

  async deleteTableRows(tableId: string): Promise<void> {
    const query = `DELETE FROM table_rows WHERE table_id = $1`;
    await this.connection.query(query, [tableId]);
  }

  async getTableRows(tableId: string): Promise<TableRow[]> {
    const query = `SELECT row_id, data FROM table_rows WHERE table_id = $1 ORDER BY created_at`;
    const results = await this.connection.query(query, [tableId]);
    return results.map(row => ({
      row_id: row.row_id,
      data: row.data,
    }));
  }

  async getRowCountForTable(tableId: string): Promise<number> {
    const query = `SELECT COUNT(*) as count FROM table_rows WHERE table_id = $1`;
    const result = await this.connection.query(query, [tableId]);
    return parseInt(result[0].count);
  }

  async isTableReferencedInMasterTable(tableId: string): Promise<boolean> {
    // This will be implemented when master tables are built
    // For now, return false
    return false;
  }
}