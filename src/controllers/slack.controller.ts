import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { SlackService } from '../services/slack.service';

@Controller('slacks')
export class SlackController {
    constructor(private slackService: SlackService) {
    }

    @Post('events')
    @HttpCode(HttpStatus.OK)
    handleEvents(@Body() body: any) {
        console.log('ok', body);
        return { challenge: body.challenge };
    }

    @Post('interactive')
    @HttpCode(HttpStatus.OK)
    handleInteractive(@Body() body: any) {
        console.log(body);
    }
}
