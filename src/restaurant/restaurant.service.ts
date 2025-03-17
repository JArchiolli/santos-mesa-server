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
        category: createRestaurantDto.category,
        location: createRestaurantDto.location,
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
    return this.prisma.restaurant.findMany();
  }

  findOne(id: number) {
    return this.prisma.restaurant.findFirst({ where: { id } })
  }

  update(id: number, updateRestaurantDto: UpdateRestaurantDto) {
    return this.prisma.restaurant.update({
      where: { id },
      data: updateRestaurantDto,
    });
  }

  remove(id: number) {
    return this.prisma.restaurant.delete({ where: { id } })
  }
}
