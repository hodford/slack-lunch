import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { WebClient } from '@slack/web-api';
import { Channel } from '@slack/web-api/dist/response/ConversationsListResponse';
import { env } from '../config/env.config';
import { UserService } from './user.service';
import { Block, KnownBlock } from '@slack/types';

@Injectable()
export class SlackService {
    private client = new WebClient(env.SLACK_TOKEN);
    private channel: Channel;

    public constructor(@Inject(forwardRef(() => UserService)) private userService: UserService) {
        this.init();
    }

    async init() {
        this.channel = await this.getChannel();
        await this.updateMembers();
    }

    async updateMembers() {
        await this.userService.addUsers(await this.getMembersInChannel());
    }

    async getUser(id) {
        let user = await this.client.users.info({ user: id });

        return user.user;
    }

    async getChannel() {
        return (
            await this.client.conversations.list({
                types: 'private_channel'
            })
        ).channels.find((channel) => channel.name === env.CHANNEL_NAME);
    }

    async getMembersInChannel() {
        return (
            await this.client.conversations.members({
                channel: this.channel.id
            })
        ).members;
    }

    async sendAMessage(blocks: (KnownBlock | Block)[]) {
        return await this.client.chat.postMessage({
            channel: this.channel.id,
            blocks: blocks,
            text: 'Fuck'
        });
    }

    async updateMessage(messageId, blocks) {
        return await this.client.chat.update({
            channel: this.channel.id,
            ts: messageId,
            blocks: blocks
        });
    }
}
