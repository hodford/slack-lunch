import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserRepository } from '../repositories/user.repository';
import { SlackService } from './slack.service';
import { In, Not } from 'typeorm';

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(UserRepository) private userRepo: UserRepository,
        @Inject(forwardRef(() => SlackService)) private slackService: SlackService
    ) {
    }

    async addUsers(slackMemberIds: string[]) {
        await this.userRepo.delete({
            slackId: Not(In(slackMemberIds))
        });
        for (let id of slackMemberIds) {
            if (!(await this.userRepo.findUserBySlackId(id))) {
                let slackUser = await this.slackService.getUser(id);
                await this.userRepo.createOne({
                    name: slackUser.name,
                    slackId: slackUser.id
                });
            }
        }
    }
}
