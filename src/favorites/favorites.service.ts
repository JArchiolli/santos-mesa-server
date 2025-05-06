import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FavoriteService {
  constructor(private prisma: PrismaService) {}

  async addFavorite(userId: number, restaurantId: number) {
    const restaurant = await this.prisma.restaurant.findUnique({
      where: { id: restaurantId },
    });

    if (!restaurant) {
      throw new NotFoundException('Restaurante não encontrado');
    }

    const existingFavorite = await this.prisma.favorite.findUnique({
      where: {
        userId_restaurantId: {
          userId,
          restaurantId,
        },
      },
    });

    if (existingFavorite) {
      throw new ConflictException('Este restaurante já está nos favoritos');
    }

    return this.prisma.favorite.create({
      data: {
        userId,
        restaurantId,
      },
      include: {
        restaurant: {
          include: {
            category: true,
            location: true,
            rating: true,
          },
        },
      },
    });
  }

  async removeFavorite(userId: number, restaurantId: number) {
      return await this.prisma.favorite.delete({
        where: {
          userId_restaurantId: {
            userId,
            restaurantId,
          },
        },
      });
  }

  async getUserFavorites(userId: number) {
    return this.prisma.favorite.findMany({
      where: { userId },
      include: {
        restaurant: {
          include: {
            category: true,
            location: true,
            rating: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async isFavorite(userId: number, restaurantId: number) {
    const favorite = await this.prisma.favorite.findUnique({
      where: {
        userId_restaurantId: {
          userId,
          restaurantId,
        },
      },
    });
    return !!favorite;
  }

  async countRestaurantFavorites(restaurantId: number) {
    return this.prisma.favorite.count({
      where: { restaurantId },
    });
  }
}