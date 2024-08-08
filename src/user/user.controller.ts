import { Body, Controller, Get, Headers, HttpException, HttpStatus, Param, Post, UsePipes } from '@nestjs/common';
import { UserPipe } from './pipes/user.pipe';
import { CreateUserDto, createUserSchema } from './user.dto';
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
}