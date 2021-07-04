import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { LunchService } from './lunch.service';
import { SlackService } from './slack.service';

@Injectable()
export class TaskService {
    private readonly logger = new Logger(TaskService.name);

    constructor(private lunchService: LunchService, private slackService: SlackService) {
    }

    @Cron('0 0 10 * * 1-5')
    selectUserForLunch() {
        this.logger.debug('Called when the current second is 45');
        this.lunchService.selectUserAndSendMessage();
    }

    @Cron('0 0 * * * *')
    updateMembers() {
        this.logger.debug('Called when the current second is 45');
        this.slackService.updateMembers();
    }
}
