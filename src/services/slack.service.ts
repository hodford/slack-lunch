import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { WebClient } from '@slack/web-api';
import { Channel } from '@slack/web-api/dist/response/ConversationsListResponse';
import { env } from '../config/env.config';
import { UserService } from './user.service';

@Injectable()
export class SlackService {
    private client = new WebClient(env.SLACK_TOKEN);
    private channel: Channel;

    public constructor(@Inject(forwardRef(() => UserService)) private userService: UserService) {
        this.init();
    }

    async init() {
        this.channel = await this.getChannel();
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

    async sendAMessage() {
        await this.client.chat.postMessage({
            channel: this.channel.id,
            link_names: true,
            blocks: [
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
                            value: 'click_me_123'
                        },
                        {
                            type: 'button',
                            text: {
                                type: 'plain_text',
                                text: 'Bận',
                                emoji: true
                            },
                            value: 'click_me_123'
                        }
                    ]
                }
            ],
            text: `<@1233> hello`
        });
    }
}
