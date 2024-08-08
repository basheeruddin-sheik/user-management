import { Body, Controller, Delete, Get, Headers, HttpException, HttpStatus, Param, ParseUUIDPipe, Post, Put, UsePipes } from '@nestjs/common';
import { UserPipe } from './pipes/user.pipe';
import { CreateUserDto, createUserSchema, UpdateUserDto, updateUserSchema } from './user.dto';
import { UserService } from './user.service';

@Controller('users')
export class UserController {
    constructor(
        private userService: UserService
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
            console.log('Error while checking username availability', error);
            if (error?.status === HttpStatus.BAD_REQUEST) {
                throw new HttpException({
                    message: error.response,
                    statusCode: HttpStatus.BAD_REQUEST,
                }, HttpStatus.BAD_REQUEST)
            }
            throw new HttpException({
                message: 'Error while creating user',
                statusCode: HttpStatus.INTERNAL_SERVER_ERROR
            }, HttpStatus.INTERNAL_SERVER_ERROR)
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
            console.log('Error while getting user details', error);
            if (error?.status === HttpStatus.NOT_FOUND) {
                throw new HttpException({
                    message: error.response,
                    statusCode: HttpStatus.NOT_FOUND,
                }, HttpStatus.NOT_FOUND)
            }
            throw new HttpException({
                message: 'Error while creating user',
                statusCode: HttpStatus.INTERNAL_SERVER_ERROR
            }, HttpStatus.INTERNAL_SERVER_ERROR)
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

            const result = await this.userService.updateUserById(id, userInfo);

            return {
                message: 'User updated successfully',
                statusCode: HttpStatus.OK,
                data: result
            }
        } catch (error) {
            console.log('Error while updating user details', error);
            if ([HttpStatus.NOT_FOUND, HttpStatus.UNAUTHORIZED].includes(error?.status)) {
                throw new HttpException({
                    message: error.response,
                    statusCode: error.status,
                }, error.status,)
            }
            throw new HttpException({
                message: 'Error while creating user',
                statusCode: HttpStatus.INTERNAL_SERVER_ERROR
            }, HttpStatus.INTERNAL_SERVER_ERROR)
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
            console.log('Error while updating user details', error);
            if ([HttpStatus.NOT_FOUND, HttpStatus.UNAUTHORIZED].includes(error?.status)) {
                throw new HttpException({
                    message: error.response,
                    statusCode: error.status,
                }, error.status,)
            }
            throw new HttpException({
                message: 'Error while creating user',
                statusCode: HttpStatus.INTERNAL_SERVER_ERROR
            }, HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }
}