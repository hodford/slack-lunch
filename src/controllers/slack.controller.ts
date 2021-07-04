import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { SlackService } from '../services/slack.service';
import { LunchService } from '../services/lunch.service';

@Controller('slacks')
export class SlackController {
    constructor(private slackService: SlackService, private lunchService: LunchService) {
    }

    @Post('events')
    @HttpCode(HttpStatus.OK)
    handleEvents(@Body() body: any) {
        if (body.type === 'event_callback') {
            this.lunchService.handleEvent(body);
        }
        return { challenge: body.challenge };
    }

    @Post('interactive')
    @HttpCode(HttpStatus.OK)
    handleInteractive(@Body() body: any) {
        this.lunchService.handleInteractive(JSON.parse(body.payload));
    }

    @Post('commands')
    @HttpCode(HttpStatus.OK)
    handleCommands(@Body() body: any) {
        this.lunchService.handleCommands(body);
    }
}
