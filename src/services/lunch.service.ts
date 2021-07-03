import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserRepository } from '../repositories/user.repository';
import { loadRelations } from '@hodfords/typeorm-helper';
import * as moment from 'moment';
import { UserEntity } from '../entities/user.entity';

@Injectable()
export class LunchService {
    constructor(@InjectRepository(UserRepository) private userRepo: UserRepository) {
        this.selectUser();
    }

    async selectUser() {
        let users = await this.userRepo.find();
        await loadRelations(users, 'lastHistory');

        //Filter ông nào mới vào
        users = this.filterNewUser(users);

        // Filter ông nào mới đặt trong vòng 7 ngày gần nhất
        users = this.filterActiveUser(users);

        users = this.createRandomScore(users);
        console.log(users);
    }

    createRandomScore(users: UserEntity[]) {
        users.sort((a, b) => {
            if (!a.lastHistory) {
                return -1;
            }

            if (a.lastHistory.createdAt < b.lastHistory.createdAt) {
                return -1;
            }

            return 1;
        });

        users = users.reverse();

        let i = 0;
        let randomScore = 1;
        for (let user of users) {
            i++;
            let randomScores = [];
            for (let j = 0; j < i; j++) {
                randomScores.push(randomScore++);
            }
            (user as any).randomScores = randomScores;
        }

        return users;
    }

    filterNewUser(users: UserEntity[]) {
        let oldUsers = users.filter((user) => moment(user.createdAt).isBefore(moment().add('5', 'd')));
        if (oldUsers.length) {
            return oldUsers;
        }

        return users;
    }

    filterActiveUser(users: UserEntity[]) {
        let oldUsers = users.filter((user) => {
            if (!user.lastHistory) {
                return true;
            }
            return moment(user.lastHistory.createdAt).isBefore(moment().add('5', 'd'));
        });

        if (oldUsers.length) {
            return oldUsers;
        }

        return users;
    }
}
