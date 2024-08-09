import { Controller, Headers, HttpException, HttpStatus, Param, Post } from '@nestjs/common';
import { BlockService } from './block.service';
import { UserService } from '../user/user.service';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Users')
@Controller('users')
export class BlockController {

    constructor(
        private blockService: BlockService,
        private userService: UserService
    ) { }

    // API to block user
    @Post("block/:id")
    async blockUser(
        @Headers("metaInfo") metaInfo: any,
        @Param("id") blockUserId: string
    ) {
        try {
            // Check if user is trying to block self
            if(blockUserId === metaInfo.id) {
                throw new HttpException("Cannot block self", HttpStatus.UNAUTHORIZED)
            }

            // Check if user is already blocked
            const blockedUser = await this.blockService.getBlockedUserById(blockUserId, metaInfo.id);
            if (blockedUser) {
                throw new HttpException('User is already blocked', HttpStatus.UNAUTHORIZED)
            }

            // Get user details by ID
            const user: any = await this.userService.getUserById(blockUserId, metaInfo);
            if (!user) {
                throw new HttpException('User not found', HttpStatus.NOT_FOUND)
            }

            // Block user
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

    // API to unblock user
    @Post("unblock/:id")
    async unBlockUser(
        @Headers("metaInfo") metaInfo: any,
        @Param("id") unBlockUserId: string
    ) {
        try {
            // Check if user is trying to unblock self
            if(unBlockUserId === metaInfo.id) {
                throw new HttpException("Cannot unblock self", HttpStatus.UNAUTHORIZED)
            }

            // Check if user is already unblocked
            const blockedUser = await this.blockService.getBlockedUserById(unBlockUserId, metaInfo.id);
            if (!blockedUser) {
                throw new HttpException('User is not blocked', HttpStatus.UNAUTHORIZED)
            }

            // Unblock user
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
