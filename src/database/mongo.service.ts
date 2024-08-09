import { Injectable } from '@nestjs/common';
import { Collection, Db, MongoClient } from 'mongodb';

@Injectable()
export class MongoService {
    userManagementDb: Db;

    USERS_COLLECTION_NAME = "users";
    BLOCKED_USERS_COLLECTION_NAME = "blocked-users";

    async onModuleInit(): Promise<void> {
        try {

            // Connect to MongoDB
            let mongoClient: MongoClient = await MongoClient.connect(process.env.MONGO_URL);
            this.userManagementDb = mongoClient.db("user-management");

            console.log(`Successfully connected to DB.`);

            await this.createIndexes();
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

    async createIndexes() {
        // Create indexes
        try {
            await Promise.all([
                this.getUsersCollection().createIndex({ username: "text" }, { unique: true }),
                this.getUsersCollection().createIndex({ id: 1 }, { unique: true }),
                this.getUsersCollection().createIndex({ birthdate: 1 }),

                this.getBlockedUsersCollection().createIndex({ blockedUserId: 1}),
                this.getBlockedUsersCollection().createIndex({ blockedByUserId: 1})
            ]);
        } catch (err) {
            console.log(`Error creating mongo indexes`, err);
        }

    }
}
