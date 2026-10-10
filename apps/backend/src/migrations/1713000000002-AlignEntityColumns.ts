import { MigrationInterface, QueryRunner } from 'typeorm';

export class AlignEntityColumns1713000000002 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE projects
      ADD COLUMN IF NOT EXISTS created_by UUID
    `);

    await queryRunner.query(`
      ALTER TABLE tables
      ADD COLUMN IF NOT EXISTS status VARCHAR(20) NOT NULL DEFAULT 'active'
    `);

    await queryRunner.query(`
      ALTER TABLE rows
      ADD COLUMN IF NOT EXISTS created_by UUID
    `);

    await queryRunner.query(`
      ALTER TABLE rows
      ADD COLUMN IF NOT EXISTS status VARCHAR(20) NOT NULL DEFAULT 'active'
    `);

    await queryRunner.query(`
      ALTER TABLE rows
      ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP NOT NULL DEFAULT NOW()
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE rows DROP COLUMN IF EXISTS updated_at`);
    await queryRunner.query(`ALTER TABLE rows DROP COLUMN IF EXISTS status`);
    await queryRunner.query(`ALTER TABLE rows DROP COLUMN IF EXISTS created_by`);
    await queryRunner.query(`ALTER TABLE tables DROP COLUMN IF EXISTS status`);
    await queryRunner.query(`ALTER TABLE projects DROP COLUMN IF EXISTS created_by`);
  }
}
