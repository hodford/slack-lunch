import { EntityRepository } from 'typeorm';
import { BaseRepository } from '@hodfords/typeorm-helper';
import { UserEntity } from '../entities/user.entity';

@EntityRepository(UserEntity)
export class UserRepository extends BaseRepository<UserEntity> {
    findUserBySlackId(slackId) {
        return this.findOne({ slackId });
    }
}
