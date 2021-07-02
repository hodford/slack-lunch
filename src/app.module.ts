import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { databaseConfig } from './config/database.config';
import { SlackService } from './services/slack.service';
import { HistoryService } from './services/history.service';
import { UserService } from './services/user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './entities/user.entity';
import { UserRepository } from './repositories/user.repository';
import { HistoryEntity } from './entities/history.entity';
import { HistoryRepository } from './repositories/history.repository';

@Module({
    imports: [
        databaseConfig,
        TypeOrmModule.forFeature(
            [
                UserEntity,
                UserRepository,
                HistoryEntity,
                HistoryRepository
            ]
        )
    ],
    controllers: [AppController],
    providers: [AppService, SlackService, HistoryService, UserService]
})
export class AppModule {
}
