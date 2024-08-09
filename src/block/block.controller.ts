import { Controller, Headers, HttpException, HttpStatus, Param, Post } from '@nestjs/common';
import { BlockService } from './block.service';
import { UserService } from '../user/user.service';

@Controller('users')
export class BlockController {

    constructor(
        private blockService: BlockService,
        private userService: UserService
    ) { }

    @Post("block/id/:id")
    async blockUser(
        @Headers("metaInfo") metaInfo: any,
        @Param("id") blockUserId: string
    ) {
        try {
            if(blockUserId === metaInfo.id) {
                throw new HttpException("Cannot block self", HttpStatus.UNAUTHORIZED)
            }

            const blockedUser = await this.blockService.getBlockedUserById(blockUserId, metaInfo.id);
            if (blockedUser) {
                throw new HttpException('User is already blocked', HttpStatus.UNAUTHORIZED)
            }

            const user: any = await this.userService.getUserById(blockUserId, metaInfo);
            if (!user) {
                throw new HttpException('User not found', HttpStatus.NOT_FOUND)
            }

            await this.blockService.blockUser(blockUserId, metaInfo.id, user?.name, user?.surname, user?.username);

            return {
                message: 'User blocked successfully',
                statusCode: HttpStatus.OK,
            }
        } catch (error) {
            if ([HttpStatus.NOT_FOUND, HttpStatus.UNAUTHORIZED].includes(error?.status)) {
                throw new HttpException({message: error.response, statusCode: error.status}, error.status)
            }
            throw new HttpException({message: 'Error while blocking user', statusCode: HttpStatus.INTERNAL_SERVER_ERROR}, HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }

    @Post("unblock/id/:id")
    async unBlockUser(
        @Headers("metaInfo") metaInfo: any,
        @Param("id") unBlockUserId: string
    ) {
        try {
            if(unBlockUserId === metaInfo.id) {
                throw new HttpException("Cannot unblock self", HttpStatus.UNAUTHORIZED)
            }

            const blockedUser = await this.blockService.getBlockedUserById(unBlockUserId, metaInfo.id);
            if (!blockedUser) {
                throw new HttpException('User is not blocked', HttpStatus.UNAUTHORIZED)
            }

            await this.blockService.unBlockUser(unBlockUserId, metaInfo.id);

            return {
                message: 'User unblocked successfully',
                statusCode: HttpStatus.OK,
            }
        } catch (error) {
            if ([HttpStatus.NOT_FOUND, HttpStatus.UNAUTHORIZED].includes(error?.status)) {
                throw new HttpException({message: error.response, statusCode: error.status}, error.status)
            }
            throw new HttpException({message: 'Error while unblocking user', statusCode: HttpStatus.INTERNAL_SERVER_ERROR}, HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }
}
