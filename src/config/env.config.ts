import * as dotenv from 'dotenv';

let isTest = process.env.NODE_ENV === 'test';
dotenv.config();

export const env = {
    APP_PORT: process.env.APP_PORT,
    APP_ENV: process.env.APP_ENV,
    APP_KEY: process.env.APP_KEY,
    SALT_ROUND: 10,
    ROOT_PATH: process.cwd() + (isTest ? '/src' : ''),
    DATABASE: {
        CONNECT: process.env.DATABASE_CONNECT as any,
        HOST: process.env.DATABASE_HOST,
        PORT: Number(process.env.DATABASE_PORT),
        USER: process.env.DATABASE_USER,
        PASSWORD: process.env.DATABASE_PASSWORD,
        NAME: process.env.DATABASE_NAME
    },
    CHANNEL_NAME: 'test-lunch',
    SLACK_TOKEN: 'xoxb-1965530862418-2234605120034-CboegvD7tYWAE4rspv0bGoA5'
};
