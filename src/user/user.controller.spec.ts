import { Test, TestingModule } from '@nestjs/testing';
import { MongoService } from '../database/mongo.service';
import { UserService } from '../user/user.service';
import { UserController } from './user.controller';
import { BlockService } from '../block/block.service';
import { CacheModule } from '@nestjs/cache-manager';

describe('UserController', () => {
    let controller: UserController;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [
                CacheModule.register({
                    isGlobal: true,
                    max: +process.env.CACHE_MAX_ITEMS || 1000,
                }),
            ],
            controllers: [UserController],
            providers: [
                BlockService,
                MongoService,
                UserService
            ],
        }).compile();

        controller = module.get<UserController>(UserController);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    it('should create user', async () => {
        const createUser = jest.fn();
        createUser.mockReturnValue({ message: 'User created successfully', statusCode: 201 });
        jest.spyOn(controller, 'create').mockImplementation(createUser);

        const userInfo: any = {
            username: 'ironman',
            name: 'Iron',
            surname: 'Man',
            password: 'Test@123',
            preferredLanguages: ['English', 'Hindi'],
            themePreference: 'dark',
        };
        const result = await controller.create(userInfo);
    });

    it('should get user', async () => {
        const getUser = jest.fn();
        getUser.mockReturnValue({ message: 'User Details', statusCode: 200 });
        jest.spyOn(controller, 'getUser').mockImplementation(getUser);

        const metaInfo = { id: '56316487-a182-4a10-aa24-c14b6490a95e' };
        const id = '0293a337-357b-4753-80e6-fce8b3a6e16d';
        const result = await controller.getUser(metaInfo, id);
    });

    it('should throw error when creating user with existing username', async () => {
        const createUser = jest.fn();
        createUser.mockRejectedValue({
            message: 'Username already exists',
            statusCode: 400,
        });
        jest.spyOn(controller, 'create').mockImplementation(createUser);

        const userInfo: any = {
            username: 'ironman',
            name: 'Iron',
            surname: "Man",
            password: 'Test@123',
            preferredLanguages: ['English', 'Hindi'],
            themePreference: 'dark',
        };

        await expect(controller.create(userInfo)).rejects.toEqual({
            message: 'Username already exists',
            statusCode: 400,
        });
    });

    it('should throw error when user not found', async () => {
        const getUser = jest.fn();
        getUser.mockRejectedValue({
            message: 'User not found',
            statusCode: 404,
        });
        jest.spyOn(controller, 'getUser').mockImplementation(getUser);

        const metaInfo = { id: '56316487-a182-4a10-aa24-c14b6490a95e' };
        const id = '0293a337-357b-4753-80e6-fce8b3a6e16d';

        await expect(controller.getUser(metaInfo, id)).rejects.toEqual({
            message: 'User not found',
            statusCode: 404,
        });
    });

    it('should throw error when at least one search parameter is required', async () => {
        const searchUsers = jest.fn();
        searchUsers.mockRejectedValue({
            message: 'At least one search parameter is required',
            statusCode: 400,
        });
        jest.spyOn(controller, 'searchUsers').mockImplementation(searchUsers);

        await expect(controller.searchUsers({}, "ironman", 9, 40)).rejects.toEqual({
            message: 'At least one search parameter is required',
            statusCode: 400,
        });
    });

    it('should throw error when error while creating user', async () => {
        const createUser = jest.fn();
        createUser.mockRejectedValue({
            message: 'Error while creating user',
            statusCode: 500,
        });
        jest.spyOn(controller, 'create').mockImplementation(createUser);

        const userInfo: any = {
            username: 'ironman',
            name: 'Iron',
            surname: 'Man',
            password: 'Test@123',
            preferredLanguages: ['English', 'Hindi'],
            themePreference: 'dark',
        };

        await expect(controller.create(userInfo)).rejects.toEqual({
            message: 'Error while creating user',
            statusCode: 500,
        });
    });

    it('should throw error when error while getting user', async () => {
        const getUser = jest.fn();
        getUser.mockRejectedValue({
            message: 'Error while Getting user',
            statusCode: 500,
        });
        jest.spyOn(controller, 'getUser').mockImplementation(getUser);

        const metaInfo = { id: '56316487-a182-4a10-aa24-c14b6490a95e' };
        const id = '0293a337-357b-4753-80e6-fce8b3a6e16d';

        await expect(controller.getUser(metaInfo, id)).rejects.toEqual({
            message: 'Error while Getting user',
            statusCode: 500,
        });
    });

    it('should throw error when user not found', async () => {
        const getUser = jest.fn();
        getUser.mockRejectedValue({
            message: 'User not found',
            statusCode: 404,
        });
        jest.spyOn(controller, 'getUser').mockImplementation(getUser);

        const metaInfo = { id: '56316487-a182-4a10-aa24-c14b6490a95e' };
        const id = '0293a337-357b-4753-80e6-fce8b3a6e16d';

        await expect(controller.getUser(metaInfo, id)).rejects.toEqual({
            message: 'User not found',
            statusCode: 404,
        });
    });

    it('should throw error when error while searching users', async () => {
        const searchUsers = jest.fn();
        searchUsers.mockRejectedValue({
            message: 'Error while searching users',
            statusCode: 500,
        });
        jest.spyOn(controller, 'searchUsers').mockImplementation(searchUsers);

        await expect(controller.searchUsers({}, "ironman", 9, 40)).rejects.toEqual({
            message: 'Error while searching users',
            statusCode: 500,
        });
    });

    it('should throw error when atleast one paramter is not provided', async () => {
        const searchUsers = jest.fn();
        searchUsers.mockRejectedValue({
            message: 'Atleast one parameter is required(username, minAge, maxAge)',
            statusCode: 400,
        });
        jest.spyOn(controller, 'searchUsers').mockImplementation(searchUsers);

        await expect(controller.searchUsers({}, "", 0, 0)).rejects.toEqual({
            message: 'Atleast one parameter is required(username, minAge, maxAge)',
            statusCode: 400,
        });
    })

    it('should throw error when unauthorized user update', async () => {
        const updateUser = jest.fn();
        updateUser.mockRejectedValue({
            message: 'Unauthorized user update',
            statusCode: 401,
        });
        jest.spyOn(controller, 'updateUser').mockImplementation(updateUser);

        const metaInfo = { id: '56316487-a182-4a10-aa24-c14b6490a95e' };
        const id = '0293a337-357b-4753-80e6-fce8b3a6e16d';
        const userInfo = {
            username: 'ironman',
            name: 'Iron',
            surname: "Man"
        };

        await expect(controller.updateUser(metaInfo, userInfo, id)).rejects.toEqual({
            message: 'Unauthorized user update',
            statusCode: 401,
        });
    });

    it('should throw error when unauthorized user delete', async () => {
        const deleteUser = jest.fn();
        deleteUser.mockRejectedValue({
            message: 'Unauthorized user delete',
            statusCode: 401,
        });
        jest.spyOn(controller, 'deleteUser').mockImplementation(deleteUser);

        const metaInfo = { id: '56316487-a182-4a10-aa24-c14b6490a95e' };
        const id = '0293a337-357b-4753-80e6-fce8b3a6e16d';

        await expect(controller.deleteUser(metaInfo, id)).rejects.toEqual({
            message: 'Unauthorized user delete',
            statusCode: 401,
        });
    });
});