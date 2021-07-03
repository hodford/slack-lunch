import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { BaseEntity } from '@hodfords/typeorm-helper';
import { UserEntity } from './user.entity';

@Entity('History')
export class HistoryEntity extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    status: number;

    @ManyToOne(() => UserEntity, (user) => user.histories)
    user: UserEntity;

    @Column()
    userId: number;

    @CreateDateColumn()
    createdAt: Date;
}
