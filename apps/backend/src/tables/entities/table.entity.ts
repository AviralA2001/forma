import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Index, In } from 'typeorm';

@Entity('tables')
@Index('idx_tables_project_id', ['project_id'])
@Index('tables_pkey', ['table_id'])
export class Table {
    @PrimaryGeneratedColumn('uuid')
    table_id: string;

    @Column('uuid')
    project_id: string;

    @Column()
    name: string;

    @Column({type: 'jsonb', default: []})
    columns: any[];

    @Column({ default: 'active' })
    status: string;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}