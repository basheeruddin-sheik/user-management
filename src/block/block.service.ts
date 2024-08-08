import { Injectable } from '@nestjs/common';
import { MongoService } from 'src/database/mongo.service';
import * as moment from 'moment';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class BlockService {

    constructor(
        private mongoService: MongoService
    ) { }

    async blockUser(blockedUserId: string, blockedByUserId: string, blockedUserName: string, blockedUserSurname: string, blockedUserUsername: string) {
        return await this.mongoService.getBlockedUsersCollection().insertOne({
            id: uuidv4(),
            blockedByUserId,
            blockedUserId,
            blockedUserName,
            blockedUserSurname,
            blockedUserUsername,
            blockedAt: moment().unix()
        });
    }

    async getBlockedUserById(blockedUserId: string, blockedByUserId: string) {
        return await this.mongoService.getBlockedUsersCollection().findOne({ blockedUserId, blockedByUserId });
    }

    async unBlockUser(blockedUserId: string, blockedByUserId: string) {
        return await this.mongoService.getBlockedUsersCollection().deleteOne({ blockedUserId, blockedByUserId });
    }
}
