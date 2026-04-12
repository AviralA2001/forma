import { Connection } from 'typeorm';
import { TableColumn, Table, TableRow } from './types';
export declare class TablesRepository {
    private readonly connection;
    constructor(connection: Connection);
    createTable(projectId: string, name: string, columns: TableColumn[]): Promise<Table>;
    getTablesByProjectId(projectId: string): Promise<Table[]>;
    getTableById(tableId: string): Promise<Table | null>;
    updateTableName(tableId: string, newName: string): Promise<void>;
    updateTableColumns(tableId: string, columns: TableColumn[]): Promise<void>;
    deleteTable(tableId: string): Promise<void>;
    insertTableRows(tableId: string, rows: Omit<TableRow, 'row_id'>[]): Promise<void>;
    deleteTableRows(tableId: string): Promise<void>;
    getTableRows(tableId: string): Promise<TableRow[]>;
    getRowCountForTable(tableId: string): Promise<number>;
    isTableReferencedInMasterTable(tableId: string): Promise<boolean>;
}
