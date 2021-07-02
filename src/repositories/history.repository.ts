import { EntityRepository } from 'typeorm';
import { BaseRepository } from '@hodfords/typeorm-helper';
import { HistoryEntity } from '../entities/history.entity';

@EntityRepository(HistoryEntity)
export class HistoryRepository extends BaseRepository<HistoryEntity> {}
