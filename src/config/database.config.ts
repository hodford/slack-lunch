import { TypeOrmModule } from '@nestjs/typeorm';
import * as config from './orm.config';

export const databaseConfig = TypeOrmModule.forRoot(config);
