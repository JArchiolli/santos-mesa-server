import { Injectable } from '@nestjs/common';
import { CreateRestaurantDto } from './dto/create-restaurant.dto';
import { UpdateRestaurantDto } from './dto/update-restaurant.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class RestaurantService {
  constructor(private prisma: PrismaService) { }

  create(createRestaurantDto: CreateRestaurantDto) {
    return this.prisma.restaurant.create({
      data: {
        name: createRestaurantDto.name,
        aboutUs: createRestaurantDto.aboutUs,
        url_img: createRestaurantDto.url_img,
        category: {
          connect: {
            id: createRestaurantDto.categoryId
          },
        },
        location: {
          connect: {
            id: createRestaurantDto.locationId
          },
        },
        rating: createRestaurantDto.rating
      },
      select: {
        id: true,
        location: true,
        url_img: true,
        aboutUs: true,
        name: true,
        category: true,
        rating: true
      }
    })
  }

  findAll() {
    return this.prisma.restaurant.findMany({
      include: {
        category: true,
        location: true,
        rating: true,
      },
    });
  }

  findOne(id: number) {
    return this.prisma.restaurant.findFirst({
      where: { id },
      include: {
        category: true,
        location: true,
        rating: true,
      }
    })
  }

  update(id: number, updateRestaurantDto: UpdateRestaurantDto) {
    return this.prisma.restaurant.update({
      where: { id },
      data: {
        name: updateRestaurantDto.name,
        url_img: updateRestaurantDto.url_img,
        aboutUs: updateRestaurantDto.aboutUs,
        category: {
          connect: {
            id: updateRestaurantDto.categoryId
          },
        },
        location: {
          connect: {
            id: updateRestaurantDto.locationId
          },
        },
        rating: updateRestaurantDto.rating,
      },
    });
  }

  remove(id: number) {
    return this.prisma.restaurant.delete({ where: { id } })
  }
}
