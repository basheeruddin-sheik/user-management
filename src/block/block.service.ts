import { Injectable } from '@nestjs/common';
import { MongoService } from '../database/mongo.service';
import * as moment from 'moment';

@Injectable()
export class BlockService {

    constructor(
        private mongoService: MongoService
    ) { }

    async blockUser(blockedUserId: string, blockedByUserId: string) {
        return await this.mongoService.getBlockedUsersCollection().insertOne({
            blockedByUserId,
            blockedUserId,
            blockedAt: moment().unix()
        });
    }

    async getBlockedUserById(blockedUserId: string, blockedByUserId: string) {
        return await this.mongoService.getBlockedUsersCollection().findOne({ blockedUserId, blockedByUserId });
    }

    async unBlockUser(blockedUserId: string, blockedByUserId: string) {
        return await this.mongoService.getBlockedUsersCollection().deleteOne({ blockedUserId, blockedByUserId });
    }

    async getBlockedUsers(blockedByUserId: string, userIds: string[]) {

        // Get Blocked by user and other users blocked current user
        const blockedUsers = await this.mongoService.getBlockedUsersCollection().aggregate([
            {
                $facet: {
                    blockedByYou: [
                        {
                            $match: {
                                blockedByUserId,
                                blockedUserId: { $in: userIds }
                            }
                        },
                        {
                            $project: {
                                _id: 0,
                                blockedUserId: 1,
                                blockedByUserId: 1
                            }
                        }
                    ],
                    blockedYou: [
                        {
                            $match: {
                                blockedByUserId: { $in: userIds },
                                blockedUserId: blockedByUserId
                            }
                        },
                        {
                            $project: {
                                _id: 0,
                                blockedUserId: 1,
                                blockedByUserId: 1
                            }
                        }
                    ]
                }
            },
            {
                $project: {
                    blockedUsers: {
                        $setUnion: ['$blockedByYou.blockedUserId', '$blockedYou.blockedByUserId']
                    }
                }
            },
        ]).toArray();

        return blockedUsers[0]?.blockedUsers || [];
    }
}
