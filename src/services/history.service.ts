import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { HistoryRepository } from '../repositories/history.repository';
import * as moment from 'moment';
import { MoreThan } from 'typeorm';
import { ActionEnum } from '../enums/action.enum';

@Injectable()
export class HistoryService {
    constructor(@InjectRepository(HistoryRepository) private historyRepo: HistoryRepository) {
    }

    public save(data) {
        return this.historyRepo.createOne(data);
    }

    public updateStatus(id, status) {
        return this.historyRepo.update(id, { status });
    }

    public findHistoryByMessageId(id: string) {
        return this.historyRepo.findOneOrFail({
            messageId: id
        });
    }

    public countRejectByUserId(id) {
        return this.historyRepo.count({
            userId: id,
            status: ActionEnum.REJECT,
            createdAt: MoreThan(moment().subtract(30, 'd'))
        });
    }
}
