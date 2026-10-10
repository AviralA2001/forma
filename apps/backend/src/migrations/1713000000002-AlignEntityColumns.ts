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

    await queryRunner.query(`
      UPDATE tables SET status = 'active' WHERE status IS NULL;
      ALTER TABLE tables ALTER COLUMN status SET DEFAULT 'active';
      ALTER TABLE tables ALTER COLUMN status SET NOT NULL;

      UPDATE rows SET status = 'active' WHERE status IS NULL;
      ALTER TABLE rows ALTER COLUMN status SET DEFAULT 'active';
      ALTER TABLE rows ALTER COLUMN status SET NOT NULL;

      UPDATE rows SET updated_at = COALESCE(updated_at, created_at, NOW()) WHERE updated_at IS NULL;
      ALTER TABLE rows ALTER COLUMN updated_at SET DEFAULT NOW();
      ALTER TABLE rows ALTER COLUMN updated_at SET NOT NULL;

      UPDATE tables SET created_at = NOW() WHERE created_at IS NULL;
      ALTER TABLE tables ALTER COLUMN created_at SET DEFAULT NOW();
      ALTER TABLE tables ALTER COLUMN created_at SET NOT NULL;

      UPDATE tables SET updated_at = COALESCE(updated_at, created_at, NOW()) WHERE updated_at IS NULL;
      ALTER TABLE tables ALTER COLUMN updated_at SET DEFAULT NOW();
      ALTER TABLE tables ALTER COLUMN updated_at SET NOT NULL;

      UPDATE rows SET created_at = NOW() WHERE created_at IS NULL;
      ALTER TABLE rows ALTER COLUMN created_at SET DEFAULT NOW();
      ALTER TABLE rows ALTER COLUMN created_at SET NOT NULL;
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
