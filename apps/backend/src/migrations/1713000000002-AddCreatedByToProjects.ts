import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCreatedByToProjects1713000000002 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE projects
      ADD COLUMN IF NOT EXISTS created_by UUID
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE projects
      DROP COLUMN IF EXISTS created_by
    `);
  }
}
