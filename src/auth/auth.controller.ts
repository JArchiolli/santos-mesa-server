import { Controller, Post, Body, UploadedFile, UseInterceptors, Put, Param, ParseIntPipe, UnauthorizedException, Get, Delete } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserService } from 'src/user/user.service';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { UpdateUserDto } from 'src/user/dto/update-user.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
  ) {}

  @Post('register')
  @UseInterceptors(FileInterceptor('profilePicture'))
  create(@Body() createUserDto: CreateUserDto,
    @UploadedFile() file?: Express.Multer.File
  ) {
    return this.userService.create(createUserDto, file);
  }

  @Post('login')
  async login(@Body() body: { email: string; password: string }) {
    try {
      const user = await this.authService.validateUser(body.email, body.password);
      return this.authService.login(user);
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Falha na autenticação');
    }
  }


  
  @Put('update/:id')
  @UseInterceptors(FileInterceptor('profilePicture'))
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
    @UploadedFile() file?: Express.Multer.File
  ) {
    return this.userService.update(id, updateUserDto, file);
  }


  
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const user = await this.userService.findOne(+id); 

    if (user?.role !== 'ADM') {
      throw new UnauthorizedException('Apenas adms podem acessar essa rota');
    }

    return this.userService.findAll(); 
  }

  @Delete('delete/:userId')
  delete(@Param('userId', ParseIntPipe) userId: number) {
    return this.userService.remove(+userId);
  }


  
}