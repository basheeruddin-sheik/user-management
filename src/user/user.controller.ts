import { Body, Controller, Delete, Get, Headers, HttpException, HttpStatus, Param, ParseUUIDPipe, Post, Put, Query, UsePipes } from '@nestjs/common';
import { UserPipe } from '../pipes/user.pipe';
import { CreateUserDto, createUserSchema, UpdateUserDto, updateUserSchema } from '../dto/user.dto';
import { UserService } from './user.service';
import { BlockService } from '../block/block.service';

@Controller('users')
export class UserController {
    constructor(
        private userService: UserService,
        private blockService: BlockService
    ) { }

    @Post("create")
    @UsePipes(new UserPipe(createUserSchema))
    async create(@Body() userInfo: CreateUserDto) {
        try {
            const isUsernameAvailable = await this.userService.getUserByUsername(userInfo.username);
            if (isUsernameAvailable) {
                throw new HttpException("Username already exists", HttpStatus.BAD_REQUEST);
            }
            const result = await this.userService.createUser(userInfo);

            return {
                message: 'User created successfully',
                statusCode: HttpStatus.CREATED,
                data: result
            }
        } catch (error) {
            if (error?.status === HttpStatus.BAD_REQUEST) {
                throw new HttpException({message: error.response, statusCode: HttpStatus.BAD_REQUEST}, HttpStatus.BAD_REQUEST)
            }
            throw new HttpException({message: 'Error while creating user', statusCode: HttpStatus.INTERNAL_SERVER_ERROR }, HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }

    @Get("get/id/:id")
    async getUser(
        @Headers("metainfo") metaInfo: any,
        @Param("id") id: string
    ) {
        try {
            const user = await this.userService.getUserById(id, metaInfo);
            if (!user) {
                throw new HttpException("User not found", HttpStatus.NOT_FOUND);
            }

            return {
                message: 'User Details',
                statusCode: HttpStatus.OK,
                data: user
            }
        } catch (error) {
            if (error?.status === HttpStatus.NOT_FOUND) {
                throw new HttpException({message: error.response, statusCode: HttpStatus.NOT_FOUND}, HttpStatus.NOT_FOUND)
            }
            throw new HttpException({message: 'Error while Getting user', statusCode: HttpStatus.INTERNAL_SERVER_ERROR}, HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }

    @Get("search")
    async searchUsers(
        @Headers("metainfo") metaInfo: any,
        @Query("username") username: string,
        @Query("minAge") minAge: number,
        @Query("maxAge") maxAge: number,
    ) {
        try {
            if(!username && !minAge && !maxAge) {
                throw new HttpException("Atleast one parameter is required(username, minAge, maxAge)", HttpStatus.BAD_REQUEST);
            }
            const users = await this.userService.searchUsers(username, +minAge, +maxAge, metaInfo.id);

            let userIds = users.map((user: any) => user.id);
            const blockedUserIds = await this.blockService.getBlockedUsers(metaInfo.id, userIds);

            const blockedUserIdsSet = new Set(blockedUserIds);
            const res_users =  users.filter((obj: any) => !blockedUserIdsSet.has(obj.id));
            
            return {
                message: 'User Details',
                statusCode: HttpStatus.OK,
                data: res_users
            }
        } catch (error) {
            console.log(error)
            if (error?.status === HttpStatus.BAD_REQUEST) {
                throw new HttpException({message: error.response, statusCode: HttpStatus.NOT_FOUND}, HttpStatus.NOT_FOUND)
            }
            throw new HttpException({message: 'Error while Getting user', statusCode: HttpStatus.INTERNAL_SERVER_ERROR}, HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }

    @Put("update/id/:id")
    async updateUser(
        @Headers("metainfo") metaInfo: any,
        @Body(new UserPipe(updateUserSchema)) userInfo: UpdateUserDto,
        @Param('id') id: string,
    ) {
        try {
            if (metaInfo?.id !== id) {
                throw new HttpException("Unauthorized to Updated", HttpStatus.UNAUTHORIZED);
            }

            const user = await this.userService.getUserById(id, metaInfo);
            if (!user) {
                throw new HttpException("User not found", HttpStatus.NOT_FOUND);
            }

            const isUsernameAvailable = await this.userService.getUserByUsername(userInfo.username);
            if (isUsernameAvailable && isUsernameAvailable.username !== user.username) {
                throw new HttpException("Username already exists", HttpStatus.BAD_REQUEST);
            }

            const result = await this.userService.updateUserById(id, userInfo);

            return {
                message: 'User updated successfully',
                statusCode: HttpStatus.OK,
                data: result
            }
        } catch (error) {
            console.log(error)
            if ([HttpStatus.NOT_FOUND, HttpStatus.UNAUTHORIZED, HttpStatus.BAD_REQUEST].includes(error?.status)) {
                throw new HttpException({message: error.response, statusCode: error.status}, error.status,)
            }
            throw new HttpException({message: 'Error while updating user', statusCode: HttpStatus.INTERNAL_SERVER_ERROR}, HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }

    @Delete("delete/id/:id")
    async deleteUser(
        @Headers("metainfo") metaInfo: any,
        @Param('id') id: string,
    ) {
        try {
            if (metaInfo?.id !== id) {
                throw new HttpException("Unauthorized to Delete", HttpStatus.UNAUTHORIZED);
            }

            const user = await this.userService.getUserById(id, metaInfo);
            if (!user) {
                throw new HttpException("User not found", HttpStatus.NOT_FOUND);
            }

            await this.userService.deleteUserById(id);

            return {
                message: 'User deleted successfully',
                statusCode: HttpStatus.OK
            }
        } catch (error) {
            if ([HttpStatus.NOT_FOUND, HttpStatus.UNAUTHORIZED].includes(error?.status)) {
                throw new HttpException({message: error.response, statusCode: error.status, }, error.status,)
            }
            throw new HttpException({message: 'Error while deleting user', statusCode: HttpStatus.INTERNAL_SERVER_ERROR}, HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }
}