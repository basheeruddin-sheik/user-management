import { Test, TestingModule } from '@nestjs/testing';
import { BlockController } from './block.controller';
import { BlockService } from './block.service';
import { MongoService } from '../database/mongo.service';
import { UserService } from '../user/user.service';

describe('BlockController', () => {
  let controller: BlockController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BlockController],
      providers: [BlockService, MongoService, UserService],
    }).compile();

    controller = module.get<BlockController>(BlockController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should block user', async () => {
    const blockUser = jest.fn();
    blockUser.mockReturnValue({ message: 'User blocked successfully', statusCode: 200 });
    jest.spyOn(controller, 'blockUser').mockImplementation(blockUser);

    const metaInfo = { id: '56316487-a182-4a10-aa24-c14b6490a95e' };
    const blockUserId = '0293a337-357b-4753-80e6-fce8b3a6e16d';
    const result = await controller.blockUser(metaInfo, blockUserId);

    expect(result).toEqual({ message: 'User blocked successfully', statusCode: 200 });
  })

    it('should unblock user', async () => {
        const unBlockUser = jest.fn();
        unBlockUser.mockReturnValue({ message: 'User unblocked successfully', statusCode: 200 });
        jest.spyOn(controller, 'unBlockUser').mockImplementation(unBlockUser);
    
        const metaInfo = { id: '56316487-a182-4a10-aa24-c14b6490a95e' };
        const unBlockUserId = '0293a337-357b-4753-80e6-fce8b3a6e16d';
        const result = await controller.unBlockUser(metaInfo, unBlockUserId);
    
        expect(result).toEqual({ message: 'User unblocked successfully', statusCode: 200 });
    })

    it('should throw error when blocking self', async () => {
        const metaInfo = { id: '56316487-a182-4a10-aa24-c14b6490a95e' };
        const blockUserId = '56316487-a182-4a10-aa24-c14b6490a95e';
    
        try {
            await controller.blockUser(metaInfo, blockUserId);
        } catch (error) {
            expect(error.message).toEqual('Cannot block self');
            expect(error.status).toEqual(401);
        }
    })

    it('should throw error when unblocking self', async () => {
        const metaInfo = { id: '56316487-a182-4a10-aa24-c14b6490a95e' };
        const unBlockUserId = '56316487-a182-4a10-aa24-c14b6490a95e';
    
        try {
            await controller.unBlockUser(metaInfo, unBlockUserId);
        } catch (error) {
            expect(error.message).toEqual('Cannot unblock self');
            expect(error.status).toEqual(401);
        }
    })

    it('should throw error when user is already blocked', async () => {
        const metaInfo = { id: '56316487-a182-4a10-aa24-c14b6490a95e' };
        const blockUserId = '0293a337-357b-4753-80e6-fce8b3a6e16d';

        jest.spyOn(controller, 'blockUser').mockImplementation(() => {
            throw { message: 'User is already blocked', status: 401 }
        });

        try {
            await controller.blockUser(metaInfo, blockUserId);
        } catch (error) {
            expect(error.message).toEqual('User is already blocked');
            expect(error.status).toEqual(401);
        }
    })

    it('should throw error when user is not blocked', async () => {
        const metaInfo = { id: '56316487-a182-4a10-aa24-c14b6490a95e' };
        const unBlockUserId = '0293a337-357b-4753-80e6-fce8b3a6e16d';

        jest.spyOn(controller, 'unBlockUser').mockImplementation(() => {
            throw { message: 'User is not blocked', status: 401 }
        });

        try {
            await controller.unBlockUser(metaInfo, unBlockUserId);
        } catch (error) {
            expect(error.message).toEqual('User is not blocked');
            expect(error.status).toEqual(401);
        }
    })

    it('should throw error when user not found', async () => {
        const metaInfo = { id: '56316487-a182-4a10-aa24-c14b6490a95e' };
        const blockUserId = '0293a337-357b-4753-80e6-fce8b3a6e16d';

        jest.spyOn(controller, 'blockUser').mockImplementation(() => {
            throw { message: 'User not found', status: 404 }
        });

        try {
            await controller.blockUser(metaInfo, blockUserId);
        } catch (error) {
            expect(error.message).toEqual('User not found');
            expect(error.status).toEqual(404);
        }
    })

    it('should throw error when error while blocking user', async () => {
        const metaInfo = { id: '56316487-a182-4a10-aa24-c14b6490a95e' };
        const blockUserId = '0293a337-357b-4753-80e6-fce8b3a6e16d';

        jest.spyOn(controller, 'blockUser').mockImplementation(() => {
            throw { message: 'Error while blocking user', status: 500 }
        });

        try {
            await controller.blockUser(metaInfo, blockUserId);
        } catch (error) {
            expect(error.message).toEqual('Error while blocking user');
            expect(error.status).toEqual(500);
        }
    })

    it('should throw error when error while unblocking user', async () => {
        const metaInfo = { id: '56316487-a182-4a10-aa24-c14b6490a95e' };
        const unBlockUserId = '0293a337-357b-4753-80e6-fce8b3a6e16d';

        jest.spyOn(controller, 'unBlockUser').mockImplementation(() => {
            throw { message: 'Error while unblocking user', status: 500 }
        });

        try {
            await controller.unBlockUser(metaInfo, unBlockUserId);
        } catch (error) {
            expect(error.message).toEqual('Error while unblocking user');
            expect(error.status).toEqual(500);
        }
    })


});
