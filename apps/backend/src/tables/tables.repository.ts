import { Injectable, Logger } from '@nestjs/common';
import { Connection, Repository } from 'typeorm';
import { Row } from './entities/row.entity';
import { Table } from './entities/table.entity'
import { masterTableReferences } from '../projects/publish-conditions';

@Injectable()
export class TablesRepository {
  private readonly logger = new Logger(TablesRepository.name);
  private readonly table_repository: Repository<Table>;
  private readonly row_repository: Repository<Row>;

  constructor(private readonly connection: Connection){
    this.table_repository = this.connection.getRepository(Table);
    this.row_repository = this.connection.getRepository(Row)
  }

  async createTable(projectId: string, name: string, columns: any[]): Promise<Table> {
    const table = this.table_repository.create({
      project_id: projectId,
      name,
      columns,
    })
    return this.table_repository.save(table);
  }

  async getTablesByProjectId(projectId: string): Promise<Table[]> {
    return this.table_repository.find({
      where: {
        project_id: projectId, 
        status: 'active'
      },
      order: {created_at: 'DESC'}
    });
  }

  async getTableById(tableId: string): Promise<Table | null> {
    return this.table_repository.findOne({
      where: {
        table_id: tableId, 
        status: 'active'
      }
    })
  }

  async updateTableName(tableId: string, newName: string): Promise<void> {
    await this.table_repository.update(
      { table_id: tableId },
      { name: newName, updated_at: new Date() }
    );
  }

  async updateTableColumns(tableId: string, columns: any[]): Promise<void> {
    await this.table_repository.update(
      { table_id: tableId },
      { columns: columns, updated_at: new Date() }
    );
  }

  async deleteTable(tableId: string): Promise<void> {
    await this.table_repository.update(
      { table_id: tableId },
      { status: 'deleted', updated_at: new Date() }
    );
    await this.deleteTableRows(tableId);  
  }

  async insertTableRows(tableId: string, rows: {data: Record<string, any>}[]): Promise<void> {
    if (rows.length === 0) return;

    for (const row of rows) {
      await this.row_repository.save({
        table_id: tableId,
        data: row.data,
        status: 'active',
      });
    }
  }

  async deleteTableRows(tableId: string): Promise<void> {
    await this.row_repository.update(
      { table_id: tableId },
      { status: 'deleted', updated_at: new Date() }
    );
  }

  async getTableRows(tableId: string): Promise<Row[]> {
    return await this.row_repository.find({
      where: {
        table_id: tableId,
        status: 'active'
      }
    })
  }

  async getRowCountForTable(tableId: string): Promise<number> {
    return await this.row_repository.count({
      where: {
        table_id: tableId,
        status: 'active'
      }
    });
  }

  async isTableReferencedInMasterTable(projectId: string, tableId: string): Promise<boolean> {
    try {
      const rows: { columns: unknown; joins: unknown }[] = await this.connection.query(
        `SELECT columns, joins FROM master_tables WHERE project_id = $1 AND status = 'active'`,
        [projectId]
      );
      return rows.some((row) => masterTableReferences(row.columns, row.joins, tableId));
    } catch (error) {
      this.logger.error(`Query failed for master_tables: ${error}`);
      if ((error as { code?: string }).code === '42P01') {
        return false;
      }
      throw error;
    }
  }
}