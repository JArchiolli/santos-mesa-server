import { Injectable } from '@nestjs/common';
import { CreateRestaurantDto } from './dto/create-restaurant.dto';
import { UpdateRestaurantDto } from './dto/update-restaurant.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { DefaultAzureCredential } from '@azure/identity';
import { BlobServiceClient } from '@azure/storage-blob';
import { v1 } from 'uuid';
import { getByCategories } from './dto/payloads.dto';
import { getByCategoriesDto } from './dto/filter-restaurants.dto';



@Injectable()
export class RestaurantService {

  
  private calculateAverageRatings(restaurants) {
    return restaurants.map(({ rating, ...rest }) => {
      const averageRating =
        rating.length > 0
          ? rating.reduce((acc, r) => acc + r.value, 0) / rating.length
          : 0;
  
      return {
        ...rest,
        averageRating,
      };
    });
  }

  constructor(private prisma: PrismaService) { }

  async create(createRestaurantDto: CreateRestaurantDto, file) {
  
    const accountName = process.env.AZURE_STORAGE_ACCOUNT_NAME;
    if (!accountName) throw Error('Azure Storage accountName not found');

    const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
    if (!connectionString) throw Error('Azure Storage connection string not found');

    const BlobService = BlobServiceClient.fromConnectionString(connectionString);
    const containerClient = BlobService.getContainerClient("santosmesacontainer2");
    // containerClient.setAccessPolicy('blob');

    try {
      await containerClient.createIfNotExists();
    } catch (error) {
      throw new Error("Erro ao verificar/criar o container.");
    }


      const blobName = 'photo' + v1() + '.png';
      const blockBlobClient = containerClient.getBlockBlobClient(blobName);

      const uploadBlobResponse = await blockBlobClient.upload(file.buffer, file.size);
      console.log('Upload Status:', uploadBlobResponse._response.status);

      const blobUrl = `https://${accountName}.blob.core.windows.net/santosmesacontainer2/${blobName}`;

    return this.prisma.restaurant.create({
      data: {
        name: createRestaurantDto.name,
        aboutUs: createRestaurantDto.aboutUs,
        url_img: blobUrl,
        category: {
          connect: {
            id: Number(createRestaurantDto.categoryId)
          },
        },
        location: {
          connect: {
            id: Number(createRestaurantDto.locationId)
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
      }
    })
  }

  async findRestaurantsByCategories(categoryIds: getByCategories) {
    if (!categoryIds || categoryIds.categoryId.length === 0) {
      const restaurants = await this.prisma.restaurant.findMany({
        include: {
          category: true,
          location: true,
          rating: true,
        },
      });
  
      return this.calculateAverageRatings(restaurants);
    }
  
    const restaurants = await this.prisma.restaurant.findMany({
      where: {
        categoryId: {
          in: categoryIds.categoryId,
        },
      },
      include: {
        category: true,
        location: true,
        rating: true,
      },
    });
  
    return this.calculateAverageRatings(restaurants);
  }
  
  async findAll(
    queryParams: getByCategoriesDto, 
    minRating?: number, 
    maxRating?: number
  ) {
    const categoryIds = queryParams.categoryId
      ? Array.isArray(queryParams.categoryId)
        ? queryParams.categoryId
        : [queryParams.categoryId]
      : [];
  
    const restaurants = await this.prisma.restaurant.findMany({
      where: {
        ...(categoryIds.length > 0 && {
          categoryId: {
            in: categoryIds,
          },
        }),
      },
      include: {
        category: true,
        location: true,
        rating: true,
      },
    });
  
    const restaurantsWithAvg = this.calculateAverageRatings(restaurants);
  
    if (minRating !== undefined || maxRating !== undefined) {
      return restaurantsWithAvg.filter(restaurant => {
        const avg = restaurant.averageRating;
        return (
          (minRating === undefined || avg >= minRating) &&
          (maxRating === undefined || avg <= maxRating)
        );
      });
    }
  
    return restaurantsWithAvg;
  }

  async findAverageRatingsByRestaurants() {
    const restaurants = await this.prisma.restaurant.findMany({
      include: {
        category: true,
        location: true,
        rating: true,
      },
    });

    return this.calculateAverageRatings(restaurants)

  }



  async findAverageRatingsByRestaurant(id: number) {
    const restaurant = await this.prisma.restaurant.findFirst({
      where: { id },
      include: {
        category: true,
        location: true,
        rating: true,
      },
    });

    if (!restaurant) {
      return null;
    }

    const { rating, ...rest } = restaurant;
    const averageRating =
      rating.length > 0
        ? rating.reduce((acc, r) => acc + r.value, 0) / rating.length
        : 0;

    return {
      ...rest,
      averageRating,
    };
  }



async findOne(id: number, filters?: { ratings?: number[] }) {
  const ratingWhere: any = { restaurantId: id };
  
  if (filters?.ratings !== undefined) {
      const numericRatings = Array.isArray(filters.ratings)
          ? filters.ratings.map(r => Number(r))
          : [Number(filters.ratings)];
          
      ratingWhere.value = { 
          in: numericRatings.filter(r => !isNaN(r))
      };
  }

  return this.prisma.restaurant.findFirst({
      where: { id },
      include: {
          category: true,
          location: true,
          rating: {
              where: ratingWhere
          },
      }
  });
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
