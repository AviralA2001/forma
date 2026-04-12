"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TablesRepository = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("typeorm");
const uuid_1 = require("uuid");
let TablesRepository = class TablesRepository {
    constructor(connection) {
        this.connection = connection;
    }
    async createTable(projectId, name, columns) {
        const tableId = (0, uuid_1.v4)();
        const query = `
      INSERT INTO tables (table_id, project_id, name, columns)
      VALUES ($1, $2, $3, $4)
      RETURNING table_id, project_id, name, columns, created_at, updated_at
    `;
        const result = await this.connection.query(query, [tableId, projectId, name, JSON.stringify(columns)]);
        return Object.assign(Object.assign({}, result[0]), { columns: result[0].columns, row_count: 0 });
    }
    async getTablesByProjectId(projectId) {
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
        return results.map(row => (Object.assign(Object.assign({}, row), { columns: row.columns, row_count: parseInt(row.row_count) })));
    }
    async getTableById(tableId) {
        const query = `
      SELECT t.table_id, t.project_id, t.name, t.columns, t.created_at, t.updated_at,
             COUNT(tr.row_id) as row_count
      FROM tables t
      LEFT JOIN table_rows tr ON t.table_id = tr.table_id
      WHERE t.table_id = $1
      GROUP BY t.table_id, t.project_id, t.name, t.columns, t.created_at, t.updated_at
    `;
        const results = await this.connection.query(query, [tableId]);
        if (results.length === 0)
            return null;
        const row = results[0];
        return Object.assign(Object.assign({}, row), { columns: row.columns, row_count: parseInt(row.row_count) });
    }
    async updateTableName(tableId, newName) {
        const query = `UPDATE tables SET name = $1, updated_at = NOW() WHERE table_id = $2`;
        await this.connection.query(query, [newName, tableId]);
    }
    async updateTableColumns(tableId, columns) {
        const query = `UPDATE tables SET columns = $1, updated_at = NOW() WHERE table_id = $2`;
        await this.connection.query(query, [JSON.stringify(columns), tableId]);
    }
    async deleteTable(tableId) {
        const query = `DELETE FROM tables WHERE table_id = $1`;
        await this.connection.query(query, [tableId]);
    }
    async insertTableRows(tableId, rows) {
        if (rows.length === 0)
            return;
        const values = rows.map(row => `('${(0, uuid_1.v4)()}', '${tableId}', '${JSON.stringify(row.data).replace(/'/g, "''")}')`).join(', ');
        const query = `INSERT INTO table_rows (row_id, table_id, data) VALUES ${values}`;
        await this.connection.query(query);
    }
    async deleteTableRows(tableId) {
        const query = `DELETE FROM table_rows WHERE table_id = $1`;
        await this.connection.query(query, [tableId]);
    }
    async getTableRows(tableId) {
        const query = `SELECT row_id, data FROM table_rows WHERE table_id = $1 ORDER BY created_at`;
        const results = await this.connection.query(query, [tableId]);
        return results.map(row => ({
            row_id: row.row_id,
            data: row.data,
        }));
    }
    async getRowCountForTable(tableId) {
        const query = `SELECT COUNT(*) as count FROM table_rows WHERE table_id = $1`;
        const result = await this.connection.query(query, [tableId]);
        return parseInt(result[0].count);
    }
    async isTableReferencedInMasterTable(tableId) {
        return false;
    }
};
TablesRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeorm_1.Connection])
], TablesRepository);
exports.TablesRepository = TablesRepository;
//# sourceMappingURL=tables.repository.js.map