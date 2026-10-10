import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Index, In } from 'typeorm';

@Entity('rows')
@Index('idx_rows_table_id', ['table_id'])
@Index('rows_pkey', ['row_id'])
export class Row {
    @PrimaryGeneratedColumn('uuid')
    row_id: string;

    @Column('uuid')
    table_id: string;

    @Column({type: 'jsonb', default: []})
    data: Record<string, any>;

    @Column('uuid', { nullable: true })
    created_by: string | null;

    @Column({ default: 'active' })
    status: string;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}