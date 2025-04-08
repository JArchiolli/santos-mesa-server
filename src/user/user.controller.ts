import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, UploadedFile } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('user')
@UseGuards(AuthGuard('jwt'))
export class UserController {
  constructor(private readonly userService: UserService) { }

  @Get('profile')
  getProfile() {
    return { message: 'Usuário autenticado!' };
  }
}
