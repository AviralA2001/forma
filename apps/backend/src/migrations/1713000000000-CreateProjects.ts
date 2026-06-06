import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateProjects1713000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE projects (
        project_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        org_id UUID NOT NULL,
        status VARCHAR(20) DEFAULT 'draft',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    await queryRunner.query(`
      CREATE INDEX idx_projects_org_id ON projects(org_id)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS idx_projects_org_id`);
    await queryRunner.query(`DROP TABLE IF EXISTS projects`);
  }
}
