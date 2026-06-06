import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

@Entity('projects')
@Index('idx_projects_org_id', ['org_id'])
export class Project {
  @PrimaryGeneratedColumn('uuid')
  project_id: string;

  @Column('varchar', { length: 255 })
  name: string;

  @Column('uuid')
  org_id: string;

  @Column('varchar', { length: 20, default: 'draft' })
  status: 'draft' | 'published' | 'closed' | 'deleted';

  @Column('uuid', { nullable: true })
  created_by: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
