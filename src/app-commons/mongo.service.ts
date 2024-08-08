import { Injectable } from '@nestjs/common';
import { Collection, Db, MongoClient } from 'mongodb';

@Injectable()
export class MongoService {
    userManagementDb: Db;

    USERS_COLLECTION_NAME = "users";
    BLOCKED_USERS_COLLECTION_NAME = "blocked-users";

    async onModuleInit(): Promise<void> {
        try {
            let mongoClient: MongoClient = await MongoClient.connect(process.env.MONGO_URL);
            this.userManagementDb = mongoClient.db("user-management");

            console.log(`Successfully connected to DB.`);

            // TODO: need to create indexes for the collections
        } catch (e) {
            console.log('Error ', e);
        }
    }
    
    getUsersCollection(): Collection {
        return this.userManagementDb.collection(this.USERS_COLLECTION_NAME);
    }

    getBlockedUsersCollection(): Collection {
        return this.userManagementDb.collection(this.BLOCKED_USERS_COLLECTION_NAME);
    }
}
