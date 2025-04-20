import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateRatingDto } from './dto/create-rating.dto';
import { UpdateRatingDto } from './dto/update-rating.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class RatingService {
  constructor(private readonly prisma: PrismaService) { }

  async create(createRatingDto: CreateRatingDto) {
    const { value, restaurantId, userId, comments } = createRatingDto;

    try {
      const rating = await this.prisma.rating.create({
        data: {
          value,
          restaurant: {
            connect: { id: restaurantId },
          },
          user: {
            connect: { id: userId },
          },
          comments: comments
        }
      });

      return rating;
    } catch (error) {
      throw new Error(`Failed to create rating: ${error}`);
    }
  }

  async findAll() {
    return this.prisma.rating.findMany();
  }

  async findOne(id: number) {
    const rating = await this.prisma.rating.findUnique({
      where: { id },
    });

    if (!rating) {
      throw new NotFoundException(`Rating with id ${id} not found`);
    }

    return rating;
  }

  async update(id: number, updateRatingDto: UpdateRatingDto) {
    const { value, restaurantId, userId, comments } = updateRatingDto;

    const rating = await this.prisma.rating.findUnique({
      where: { id },
    });

    if (!rating) {
      throw new NotFoundException(`Rating with id ${id} not found`);
    }

    try {
      const updatedRating = await this.prisma.rating.update({
        where: { id },
        data: {
          value,
          restaurant: {
            connect: { id: restaurantId },
          },
          user: {
            connect: { id: userId },
          },
          comments: comments
        }
      });

      return updatedRating;
    } catch (error) {
      throw new Error(`Failed to update rating: ${error}`);
    }
  }

  async remove(id: number) {
    const rating = await this.prisma.rating.findUnique({
      where: { id },
    });

    if (!rating) {
      throw new NotFoundException(`Rating with id ${id} not found`);
    }

    try {
      await this.prisma.rating.delete({
        where: { id },
      });
      return { message: `Rating with id ${id} successfully removed` };
    } catch (error) {
      throw new Error(`Failed to remove rating: ${error}`);
    }
  }

  async findAllByUserId(userId: number, filters?: { ratings?: number[] }) {
    const where: any = { userId };
    
    if (filters?.ratings !== undefined) {
        where.value = { 
            in: Array.isArray(filters.ratings) 
                ? filters.ratings.map(r => Number(r)) 
                : [Number(filters.ratings)]
        };
    }

    const ratings = await this.prisma.rating.findMany({
        where,
        include: {
            restaurant: {
                select: {
                    name: true
                }
            },
            user: {
                select: {
                    userName: true
                }
            }
        }
    });

    if (!ratings || ratings.length === 0) {
        throw new NotFoundException(`No ratings found for user ${userId} with the specified filters`);
    }
    return ratings;
}



  async findAllByRestaurantId(restaurantId: number) {
    const ratings = await this.prisma.rating.findMany({
      where: { restaurantId },
      include: {
        restaurant: {
          select: {
            name: true
          }
        },
        user: {
          select: {
            userName: true,
            exibitionName: true,
            profilePicture: true
          }
        }
      }
    });

    if (!ratings || ratings.length === 0) {
      throw new NotFoundException(`No ratings found for restaurant with id ${restaurantId}`);
    }

    return ratings;
  }
}
