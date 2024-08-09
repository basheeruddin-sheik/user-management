import { Body, Controller, Delete, Get, Headers, HttpException, HttpStatus, Inject, Param, ParseUUIDPipe, Post, Put, Query, UsePipes } from '@nestjs/common';
import { UserPipe } from '../pipes/user.pipe';
import { CreateUserDto, createUserSchema, UpdateUserDto, updateUserSchema } from '../dto/user.dto';
import { UserService } from './user.service';
import { BlockService } from '../block/block.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';


@Controller('users')
export class UserController {
    constructor(
        @Inject(CACHE_MANAGER) private cacheManager: Cache,
        private userService: UserService,
        private blockService: BlockService
    ) { }

    // API to create user
    @Post("create")
    @UsePipes(new UserPipe(createUserSchema))
    async create(@Body() userInfo: CreateUserDto) {
        try {
            // Check if username already exists
            const isUsernameAvailable = await this.userService.getUserByUsername(userInfo.username);
            if (isUsernameAvailable) {
                throw new HttpException("Username already exists", HttpStatus.BAD_REQUEST);
            }

            // Create user
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

    // API to get user by ID
    @Get("get/id/:id")
    async getUser(
        @Headers("metainfo") metaInfo: any,
        @Param("id") id: string
    ) {
        try {

            // If cache is enabled, check if data is present in cache
            const cacheKey = `get_${id}_by_${metaInfo?.id}`;
            const cachedData = await this.cacheManager.get(cacheKey);
            if (cachedData) {
                return cachedData;
            }

            // Get user by ID
            const user = await this.userService.getUserById(id, metaInfo);
            if (!user) {
                throw new HttpException("User not found", HttpStatus.NOT_FOUND);
            }

            // Store data in cache
            await this.cacheManager.set(cacheKey, user, +process.env.CACHE_TTL);

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

    // API to search users
    @Get("search")
    async searchUsers(
        @Headers("metainfo") metaInfo: any,
        @Query("username") username: string,
        @Query("minAge") minAge: number,
        @Query("maxAge") maxAge: number,
    ) {
        try {
            // If cache is enabled, check if data is present in cache
            const cacheKey = `search_users_by_${metaInfo?.id}_${username}_${minAge}_${maxAge}`;
            const cachedData = await this.cacheManager.get(cacheKey);
            if (cachedData) {
                return cachedData;
            }

            // Check if atleast one parameter is provided
            if(!username && !minAge && !maxAge) {
                throw new HttpException("Atleast one parameter is required(username, minAge, maxAge)", HttpStatus.BAD_REQUEST);
            }


            // Get users based on search criteria
            const users = await this.userService.searchUsers(username, +minAge, +maxAge, metaInfo.id);

            // Map user ids
            let userIds = users.map((user: any) => user.id);

            // Get blocked users
            const blockedUserIds = await this.blockService.getBlockedUsers(metaInfo.id, userIds);

            // Filter out response userd excluding blocked users
            const blockedUserIdsSet = new Set(blockedUserIds);
            const res_users =  users.filter((obj: any) => !blockedUserIdsSet.has(obj.id));

            // Store data in cache
            await this.cacheManager.set(cacheKey, res_users, +process.env.CACHE_TTL);
            
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

    // API to update user
    @Put("update/id/:id")
    async updateUser(
        @Headers("metainfo") metaInfo: any,
        @Body(new UserPipe(updateUserSchema)) userInfo: UpdateUserDto,
        @Param('id') id: string,
    ) {
        try {
            // Check if user is authorized to update
            if (metaInfo?.id !== id) {
                throw new HttpException("Unauthorized to Updated", HttpStatus.UNAUTHORIZED);
            }

            // Get user by ID
            const user: any = await this.userService.getUserById(id, metaInfo);
            if (!user) {
                throw new HttpException("User not found", HttpStatus.NOT_FOUND);
            }

            // Check if username already exists
            const isUsernameAvailable = await this.userService.getUserByUsername(userInfo.username);
            if (isUsernameAvailable && isUsernameAvailable.username !== user.username) {
                throw new HttpException("Username already exists", HttpStatus.BAD_REQUEST);
            }

            // Update user
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

    // API to delete user
    @Delete("delete/id/:id")
    async deleteUser(
        @Headers("metainfo") metaInfo: any,
        @Param('id') id: string,
    ) {
        try {
            // Check if user is authorized to delete
            if (metaInfo?.id !== id) {
                throw new HttpException("Unauthorized to Delete", HttpStatus.UNAUTHORIZED);
            }

            // Get user by ID
            const user = await this.userService.getUserById(id, metaInfo);
            if (!user) {
                throw new HttpException("User not found", HttpStatus.NOT_FOUND);
            }

            // Delete user
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