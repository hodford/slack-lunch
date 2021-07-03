import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { env } from './config/env.config';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    await app.listen(env.APP_PORT);
}

bootstrap();
