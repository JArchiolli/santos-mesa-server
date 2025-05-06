import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  ParseIntPipe,
} from '@nestjs/common';
import { FavoriteService } from './favorites.service';

@Controller('favorites')
export class FavoriteController {
  constructor(private readonly favoriteService: FavoriteService) {}

  @Post(':userId')
  async addFavorite(
    @Param('userId', ParseIntPipe) userId: number,
    @Body('restaurantId', ParseIntPipe) restaurantId: number,
  ) {
    return this.favoriteService.addFavorite(userId, restaurantId);
  }

  @Delete(':userId/:restaurantId')
  async removeFavorite(
    @Param('userId', ParseIntPipe) userId: number,
    @Param('restaurantId', ParseIntPipe) restaurantId: number,
  ) {
    return this.favoriteService.removeFavorite(userId, restaurantId);
  }

  @Get('user/:userId')
  async getUserFavorites(@Param('userId', ParseIntPipe) userId: number) {
    return this.favoriteService.getUserFavorites(userId);
  }

  @Get('check/:userId/:restaurantId')
  async checkFavorite(
    @Param('userId', ParseIntPipe) userId: number,
    @Param('restaurantId', ParseIntPipe) restaurantId: number,
  ) {
    return {
      isFavorite: await this.favoriteService.isFavorite(userId, restaurantId),
    };
  }

  @Get('restaurant/:restaurantId/count')
  async getRestaurantFavoriteCount(
    @Param('restaurantId', ParseIntPipe) restaurantId: number,
  ) {
    return {
      count: await this.favoriteService.countRestaurantFavorites(restaurantId),
    };
  }
}