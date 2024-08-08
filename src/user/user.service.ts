import { Injectable } from '@nestjs/common';
import { MongoService } from '../app-commons/mongo.service';
import { v4 as uuidv4 } from 'uuid';
import { CreateUserDto } from './user.dto';

@Injectable()
export class UserService {

    constructor(
        private mongoService: MongoService
    ) { }

    async getUserByUsername(username: string) {
        return this.mongoService.getUsersCollection().findOne({ username }, { projection: { _id: 0, username: 1 } });
    }

    async createUser(userInfo: CreateUserDto) {
        userInfo.id = uuidv4();
        await this.mongoService.getUsersCollection().insertOne(userInfo);
        return userInfo;
    }
}
