import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTables1713000000001 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE tables (
        table_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        project_id UUID REFERENCES projects(project_id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        columns JSONB NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    await queryRunner.query(`
      CREATE INDEX idx_tables_project_id ON tables(project_id)
    `);

    await queryRunner.query(`
      CREATE TABLE table_rows (
        row_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        table_id UUID REFERENCES tables(table_id) ON DELETE CASCADE,
        data JSONB NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    await queryRunner.query(`
      CREATE INDEX idx_table_rows_table_id ON table_rows(table_id)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS idx_table_rows_table_id`);
    await queryRunner.query(`DROP TABLE IF EXISTS table_rows`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_tables_project_id`);
    await queryRunner.query(`DROP TABLE IF EXISTS tables`);
  }
}