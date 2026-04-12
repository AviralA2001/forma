import { Entity, Column, PrimaryColumn, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

@Entity('projects')
@Index('idx_projects_owner_id', ['owner_id'])
export class Project {
  @PrimaryColumn('uuid')
  project_id: string;

  @Column('varchar', { length: 255 })
  name: string;

  @Column('uuid')
  owner_id: string;

  @Column('varchar', { length: 20, default: 'draft' })
  status: 'draft' | 'published';

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
