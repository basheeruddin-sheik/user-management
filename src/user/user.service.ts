import { Inject, Injectable } from '@nestjs/common';
import { MongoService } from '../database/mongo.service';
import { v4 as uuidv4 } from 'uuid';
import { ThemePreferenceTypes } from '../dto/user.dto';
import * as moment from 'moment';
import * as crypto from "crypto";

@Injectable()
export class UserService {

    constructor(
        private mongoService: MongoService
    ) { }

    async getUserByUsername(username: string) {
        return await this.mongoService.getUsersCollection().findOne({ username, isDeleted: { $ne: true } }, { projection: { _id: 0, username: 1 } });
    }

    async getUserById(id: string, metaInfo: any) {
        let projection: any;

        // If user is trying to get self, return all details
        if (metaInfo?.id === id) {
            projection = { 
                _id: 0,
                password: 0
            };
        }
        else { // Else return only public details
            projection = {
                _id: 0,
                name: 1,
                surname: 1,
                username: 1,
                birthdate: 1
            };
        }

        return await this.mongoService.getUsersCollection().findOne({ id, isDeleted: { $ne: true } }, { projection });
    }

    async createUser(userInfo: any) {
        userInfo.id = uuidv4();
        userInfo.password = crypto.createHash('sha256').update(userInfo?.password).digest('hex');
        userInfo.passwordLastUpdated = moment().unix();
        userInfo.birthdate = moment(userInfo.birthdate).unix();
        userInfo.themePreference = userInfo.themePreference || ThemePreferenceTypes.LIGHT;
        userInfo.metaInfo = { createdAt: moment().unix() };

        await this.mongoService.getUsersCollection().insertOne(userInfo);
        return userInfo;
    }

    async updateUserById(id: string, userInfo: any) {
        // Update user details
        userInfo.birthdate = moment(userInfo.birthdate).unix();
        if (userInfo.password) {
            userInfo.password = crypto.createHash('sha256').update(userInfo.password).digest('hex');
            userInfo.passwordLastUpdated = moment().unix();
        }
        userInfo['metaInfo.updatedAt'] = moment().unix();

        await this.mongoService.getUsersCollection().updateOne({ id, isDeleted: { $ne: true } }, { $set: userInfo });
        return userInfo;
    }

    async deleteUserById(id: string) {
        return await this.mongoService.getUsersCollection().updateOne({ id, isDeleted: { $ne: true } }, { $set: { isDeleted: true, "metaInfo.deletedAt": moment().unix() } });
    }

    async searchUsers(username: string, minAge: number, maxAge: number, id: string) {
        let query: any = { isDeleted: { $ne: true }, id: { $ne: id } };

        // If username is provided, search by username
        if (username) {
            query.username = new RegExp(username, "i");
        }

        // If minAge and maxAge are provided, search by age range
        if (minAge && maxAge) {
            query.birthdate = {
                $lte: moment().subtract(minAge, 'years').unix(),
                $gte: moment().subtract(maxAge, 'years').unix()
            };
        }
        else if (minAge) { // If only minAge is provided, search users older than minAge
            query.birthdate = { $lte: moment().subtract(minAge, 'years').unix() };
        }
        else if (maxAge) { // If only maxAge is provided, search users younger than maxAge
            query.birthdate = { $gte: moment().subtract(maxAge, 'years').unix() };
        }

        return await this.mongoService.getUsersCollection().find(query, { projection: { _id: 0, id: 1, name: 1, surname: 1, username: 1, birthdate: 1 } }).limit(15).toArray();
    }
}
