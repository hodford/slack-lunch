import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { HistoryRepository } from '../repositories/history.repository';

@Injectable()
export class HistoryService {
    constructor(@InjectRepository(HistoryRepository) historyRepo: HistoryRepository) {}
}
