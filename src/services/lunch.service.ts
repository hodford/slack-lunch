import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserRepository } from '../repositories/user.repository';
import { loadRelations } from '@hodfords/typeorm-helper';
import * as moment from 'moment';
import { UserEntity } from '../entities/user.entity';
import { randomInt } from 'crypto';
import { SlackService } from './slack.service';
import { ActionEnum } from '../enums/action.enum';
import { HistoryService } from './history.service';
import { HistoryEntity } from '../entities/history.entity';

@Injectable()
export class LunchService {
    constructor(
        @InjectRepository(UserRepository) private userRepo: UserRepository,
        private slackService: SlackService,
        private historyService: HistoryService
    ) {
        // this.selectUserAndSendMessage();
    }

    async selectUserAndSendMessage() {
        await this.slackService.init();
        let user = await this.selectUser();
        let message = await this.slackService.sendAMessage([
            {
                type: 'section',
                text: {
                    type: 'mrkdwn',
                    text: `Hello <@${user.slackId}>. Một đàn con thơ đang chờ bạn đặt cơm.`
                }
            },
            {
                type: 'actions',
                elements: [
                    {
                        type: 'button',
                        text: {
                            type: 'plain_text',
                            text: 'Ok để tao',
                            emoji: true
                        },
                        style: 'primary',
                        value: ActionEnum.OK
                    },
                    {
                        type: 'button',
                        text: {
                            type: 'plain_text',
                            text: 'Bận',
                            emoji: true
                        },
                        style: 'danger',
                        value: ActionEnum.REJECT
                    }
                ]
            }
        ]);
        await this.historyService.save({
            userId: user.id,
            status: ActionEnum.DRAFT,
            messageId: message.message.ts
        });
    }

    async handleEvent(payload) {
        if (payload.event.type === 'app_mention') {
            if (payload.event.text.includes('pickUser')) {
                await this.selectUserAndSendMessage();
            }
        }
    }

    async handleCommands(payload) {
        if (payload.command === '/pickuser') {
            await this.selectUserAndSendMessage();
        }
    }

    async handleInteractive(payload) {
        if (payload.type === 'block_actions') {
            let history = await this.historyService.findHistoryByMessageId(payload.message.ts);
            await history.loadRelation('user');
            if (payload.user.id !== history.user.slackId) {
                return await this.slackService.sendAMessage([
                    {
                        type: 'section',
                        text: {
                            type: 'mrkdwn',
                            text: `Fuck <@${payload.user.id}>. Chỗ nguời lớn nói chuyện, không phận sự miễn click linh tinh.`
                        }
                    }
                ]);
            }
            if (history.status !== ActionEnum.DRAFT) {
                return await this.slackService.sendAMessage([
                    {
                        type: 'section',
                        text: {
                            type: 'mrkdwn',
                            text: `Fuck <@${history.user.slackId}>. Chọn 1 lần thôi, chọn lằm chọn lốn.`
                        }
                    }
                ]);
            }
            if (payload.actions[0].value === ActionEnum.OK) {
                this.approve(history);
            } else if (payload.actions[0].value === ActionEnum.REJECT) {
                this.reject(history);
            }
        }
    }

    async reject(history: HistoryEntity) {
        let countReject = await this.historyService.countRejectByUserId(history.userId);
        await this.slackService.sendAMessage([
            {
                type: 'section',
                text: {
                    type: 'mrkdwn',
                    text: `Fuck <@${history.user.slackId}>. Bạn đã rũ bỏ trách nhiệm ${countReject} lần trong vòng 30 ngày.`
                }
            }
        ]);
        await this.historyService.updateStatus(history.id, ActionEnum.REJECT);
        await this.updateMessage(history, ActionEnum.REJECT);
        await this.selectUserAndSendMessage();
    }

    async approve(history: HistoryEntity) {
        await this.slackService.sendAMessage([
            {
                type: 'section',
                text: {
                    type: 'mrkdwn',
                    text: `Đội ơn <@${history.user.slackId}>. Bạn là nguời đẹp trai nhất trưa nay.`
                }
            }
        ]);
        await this.historyService.updateStatus(history.id, ActionEnum.OK);
        await this.updateMessage(history, ActionEnum.OK);
    }

    async updateMessage(history: HistoryEntity, status: ActionEnum) {
        await this.slackService.updateMessage(history.messageId, [
            {
                type: 'section',
                text: {
                    type: 'mrkdwn',
                    text: `Hello <@${history.user.slackId}>. Một đàn con thơ đang chờ bạn đặt cơm.`
                }
            },
            {
                type: 'actions',
                elements: [
                    {
                        type: 'button',
                        text: {
                            type: 'plain_text',
                            text: status === ActionEnum.OK ? ':tada: Approved' : ':x: Rejected',
                            emoji: true
                        }
                    }
                ]
            }
        ]);
    }

    async selectUser() {
        let users = await this.userRepo.find();
        await loadRelations(users, ['lastHistory', 'lastActionToday']);

        //Filter ông nào mới vào
        users = this.filterNewUser(users);

        // Filter ông nào mới đặt trong vòng 7 ngày gần nhất
        users = this.filterActiveUser(users);

        // Filter user, who sent a message today
        users = this.filterTodayUser(users);

        // Tạo random score
        let randomScore = this.createRandomScore(users);

        users = randomScore.users;

        let randomPoint = randomInt(1, randomScore.score);

        // Chọn user
        return users.find((u: any) => u.randomScores.includes(randomPoint));
    }

    createRandomScore(users: UserEntity[]) {
        users.sort((a, b) => {
            if (!a.lastHistory) {
                return -1;
            }

            if (a.lastHistory.createdAt < b.lastHistory.createdAt) {
                return -1;
            }

            return 1;
        });

        users = users.reverse();

        let i = 0;
        let randomScore = 1;
        for (let user of users) {
            i++;
            let randomScores = [];
            for (let j = 0; j < i; j++) {
                randomScores.push(randomScore++);
            }
            (user as any).randomScores = randomScores;
        }

        return { users, score: randomScore };
    }

    filterNewUser(users: UserEntity[]) {
        let oldUsers = users.filter((user) => moment(user.createdAt).isBefore(moment().add('5', 'd')));
        if (oldUsers.length) {
            return oldUsers;
        }

        return users;
    }

    filterActiveUser(users: UserEntity[]) {
        let oldUsers = users.filter((user) => {
            if (!user.lastHistory) {
                return true;
            }
            return moment(user.lastHistory.createdAt).isBefore(moment().add('5', 'd'));
        });

        if (oldUsers.length) {
            return oldUsers;
        }

        return users;
    }

    filterTodayUser(users: UserEntity[]) {
        let newUsers = users.filter((user) => !user.lastActionToday);
        if (newUsers.length) {
            return newUsers;
        }
        return users;
    }
}
