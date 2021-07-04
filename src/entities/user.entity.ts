import { Column, CreateDateColumn, Entity, OneToMany, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { BaseEntity } from '@hodfords/typeorm-helper';
import { HistoryEntity } from './history.entity';
import { RelationCondition } from '@hodfords/typeorm-helper/decorators/relation-condition.decorator';
import { ActionEnum } from '../enums/action.enum';
import * as moment from 'moment';

@Entity('User')
export class UserEntity extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ nullable: true })
    name: string;

    @Column({ nullable: true })
    slackId: string;

    @CreateDateColumn()
    createdAt: Date;

    @OneToMany(() => HistoryEntity, (history) => history.user)
    histories: HistoryEntity[];

    @RelationCondition((query) => {
        query.orderBy('id', 'DESC');
        query.andWhere(
            ' "lastHistory".id in (select max(id) from "History" "maxHistory" where "maxHistory"."userId" = "lastHistory"."userId") '
        );
        query.andWhere(' "lastHistory"."status" = :status ', {
            status: ActionEnum.OK
        });
    })
    @OneToOne(() => HistoryEntity, (history) => history.user)
    lastHistory: HistoryEntity;

    @RelationCondition((query) => {
        query.orderBy('id', 'DESC');
        query.andWhere(
            ' "lastActionToday".id in (select max(id) from "History" "maxHistory" where "maxHistory"."userId" = "lastActionToday"."userId") '
        );
        query.andWhere(' "lastActionToday"."createdAt" > now() - interval \'12 hour\' ');
    })
    @OneToOne(() => HistoryEntity, (history) => history.user)
    lastActionToday: HistoryEntity;
}
