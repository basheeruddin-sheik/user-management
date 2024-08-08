import { Injectable } from '@nestjs/common';
import { MongoService } from '../database/mongo.service';
import { v4 as uuidv4 } from 'uuid';
import { CreateUserDto } from './user.dto';
import * as moment from 'moment';
import * as crypto from "crypto";

@Injectable()
export class UserService {

    constructor(
        private mongoService: MongoService
    ) { }

    async getUserByUsername(username: string) {
        return this.mongoService.getUsersCollection().findOne({ username }, { projection: { _id: 0, username: 1 } });
    }

    async getUserById(id: string, metaInfo: any) {
        let projection: any;
        if (metaInfo?.id === id) {
            projection = { 
                _id: 0,
                password: 0
            };
        }
        else {
            projection = {
                _id: 0,
                name: 1,
                surname: 1,
                username: 1,
                birthdate: 1
            };
        }

        return this.mongoService.getUsersCollection().findOne({ id }, { projection});
    }

    async createUser(userInfo: any) {
        userInfo.id = uuidv4();
        userInfo.password = crypto.createHash('sha256').update(userInfo?.password).digest('hex');
        userInfo.passwordLastUpdated = moment().unix();
        userInfo.birthdate = moment(userInfo.birthdate).unix();

        await this.mongoService.getUsersCollection().insertOne(userInfo);
        return userInfo;
    }
}
