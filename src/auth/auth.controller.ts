import { Controller, Post, Body, UploadedFile, UseInterceptors } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserService } from 'src/user/user.service';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
  ) {}

  @Post('register')
  @UseInterceptors(FileInterceptor('profilePicture'))
  create(@Body() createUserDto: CreateUserDto,
    @UploadedFile() file: Express.Multer.File
  ) {
    return this.userService.create(createUserDto, file);
  }

  @Post('login')
  async login(@Body() body: { email: string; password: string }) {
    return this.authService.login(await this.authService.validateUser(body.email, body.password));
  }
}
