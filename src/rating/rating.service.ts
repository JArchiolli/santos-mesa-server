import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateRatingDto } from './dto/create-rating.dto';
import { UpdateRatingDto } from './dto/update-rating.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class RatingService {
  constructor(private readonly prisma: PrismaService) {}

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
            ? {
                create: comments.map(comment => ({
                  message: comment.text, 
                })),
              }
            : undefined,
        },
        include: {
          comments: true, 
        },
      });

      return rating;
    } catch (error) {
      throw new Error(`Failed to create rating: ${error}`);
    }
  }

  async findAll() {
    return this.prisma.rating.findMany({
      include: {
        comments: true,  
      },
    });
  }

  async findOne(id: number) {
    const rating = await this.prisma.rating.findUnique({
      where: { id },
      include: {
        comments: true, 
      },
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
            ? {
                create: comments.map(comment => ({
                  message: comment.text, 
                })),
              }
            : undefined,
        },
        include: {
          comments: true,  
        },
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
      throw new Error(`Failed to remove rating: ${error }`);
    }
  }
}
