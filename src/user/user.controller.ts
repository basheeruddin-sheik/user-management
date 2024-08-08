import { Body, Controller, HttpException, HttpStatus, Post, UsePipes } from '@nestjs/common';
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
}
