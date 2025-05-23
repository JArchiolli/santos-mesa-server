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
          ? (rating.reduce((acc, r) => acc + r.value, 0) / rating.length).toFixed(2)
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
  async findAll(
  queryParams: getByCategoriesDto,
  page: number = 1,
  limit: number = 10
) {
  const categoryIdsRaw = queryParams.categoryId;
  const ratingsRaw = queryParams.ratings;

  const categoryIds = categoryIdsRaw
    ? Array.isArray(categoryIdsRaw)
      ? categoryIdsRaw.map((id) => Number(id)).filter((n) => !isNaN(n))
      : [Number(categoryIdsRaw)].filter((n) => !isNaN(n))
    : [];

  const ratingsFilter = ratingsRaw
    ? Array.isArray(ratingsRaw)
      ? ratingsRaw.map((r) => Number(r)).filter((n) => !isNaN(n))
      : [Number(ratingsRaw)].filter((n) => !isNaN(n))
    : [];

  const search = queryParams.search?.trim().toLowerCase().replace(/^'+|'+$/g, '');
  const skip = (page - 1) * limit;

  const whereConditions: any = {};

  // Só aplica o filtro se o array tiver valores válidos
  if (categoryIds.length > 0) {
    whereConditions.categoryId = {
      in: categoryIds,
    };
  }

  const rawRestaurants = await this.prisma.restaurant.findMany({
    where: whereConditions,
    include: {
      category: true,
      location: true,
      rating: true,
    },
  });

  console.log('Search:', search);
  rawRestaurants.forEach(r => {
    console.log('Restaurante:', JSON.stringify(r.name), '=>', r.name.trim().toLowerCase());
  });

  let filteredRestaurants = rawRestaurants;

  if (search && search !== '') {
    filteredRestaurants = rawRestaurants.filter((restaurant) => {
      const name = restaurant.name.trim().toLowerCase();
      return name.startsWith(search) || name.includes(search);
    });
  }

  console.log('Total após filtro manual:', filteredRestaurants.length);

  const totalCount = filteredRestaurants.length;
  const paginatedRestaurants = filteredRestaurants.slice(skip, skip + limit);

  let restaurantsWithAvg = this.calculateAverageRatings(paginatedRestaurants).map(
    (restaurant) => ({
      ...restaurant,
      averageRating: Number(restaurant.averageRating),
    })
  );

  // Só aplica o filtro se ratings tiver valores
  if (ratingsFilter.length > 0) {
    restaurantsWithAvg = restaurantsWithAvg.filter((restaurant) => {
      const avg = restaurant.averageRating;
      return ratingsFilter.some((rating) => {
        switch (rating) {
          case 1:
            return avg >= 0.1 && avg <= 1.4;
          case 2:
            return avg >= 1.5 && avg <= 2.4;
          case 3:
            return avg >= 2.5 && avg <= 3.4;
          case 4:
            return avg >= 3.5 && avg <= 4.4;
          case 5:
            return avg >= 4.5 && avg <= 5;
          default:
            return false;
        }
      });
    });
  }

  const totalPages = Math.ceil(totalCount / limit);

  return {
    data: restaurantsWithAvg,
    pagination: {
      total: totalCount,
      totalPages,
      currentPage: page,
      perPage: limit,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    },
  };
}





  // async findRestaurantsByCategories(categoryIds: getByCategories) {
  //   if (!categoryIds || categoryIds.categoryId.length === 0) {
  //     const restaurants = await this.prisma.restaurant.findMany({
  //       include: {
  //         category: true,
  //         location: true,
  //         rating: true,
  //       },
  //     });

  //     return this.calculateAverageRatings(restaurants);
  //   }

  //   const restaurants = await this.prisma.restaurant.findMany({
  //     where: {
  //       categoryId: {
  //         in: categoryIds.categoryId,
  //       },
  //     },
  //     include: {
  //       category: true,
  //       location: true,
  //       rating: true,
  //     },
  //   });

  //   return this.calculateAverageRatings(restaurants);
  // }
  
  // async findAll(
  //   queryParams: getByCategoriesDto,
  //   page: number = 1,
  //   limit: number = 10
  // ) {
    
  //   const categoryIds = queryParams.categoryId
  //     ? Array.isArray(queryParams.categoryId)
  //       ? queryParams.categoryId
  //       : [queryParams.categoryId]
  //     : [];
  
  //   const skip = (page - 1) * limit;
    
  //   const totalCount = await this.prisma.restaurant.count({
  //     where: {
  //       ...(categoryIds.length > 0 && {
  //         categoryId: {
  //           in: categoryIds,
  //         },
  //       }),
  //     },
  //   });
  
  //   const restaurants = await this.prisma.restaurant.findMany({
  //     where: {
  //       ...(categoryIds.length > 0 && {
  //         categoryId: {
  //           in: categoryIds,
  //         },
  //       }),
  //     },
  //     include: {
  //       category: true,
  //       location: true,
  //       rating: true,
  //     },
  //     skip,
  //     take: limit, 
  //   });
  
  //   let restaurantsWithAvg = this.calculateAverageRatings(restaurants).map(restaurant => ({
  //     ...restaurant,
  //     averageRating: Number(restaurant.averageRating)
  //   }));
  
  //   const ratingsFilter = Array.isArray(queryParams.ratings) 
  //     ? queryParams.ratings.map(r => Number(r))
  //     : queryParams.ratings 
  //       ? [Number(queryParams.ratings)]
  //       : [];
  
  //   console.log('Applied ratings filter:', ratingsFilter);
  
  //   if (ratingsFilter.length > 0) {
  //     restaurantsWithAvg = restaurantsWithAvg.filter(restaurant => {
  //       const avg = restaurant.averageRating;
  //       return ratingsFilter.some(rating => {
  //         switch(rating) {
  //           case 1: return avg >= 0.1 && avg <= 1.4;
  //           case 2: return avg >= 1.5 && avg <= 2.4;
  //           case 3: return avg >= 2.5 && avg <= 3.4;
  //           case 4: return avg >= 3.5 && avg <= 4.4;
  //           case 5: return avg >= 4.5 && avg <= 5;
  //           default: return false;
  //         }
  //       });
  //     });
  //   }
  
  //   const totalPages = Math.ceil(totalCount / limit);
  
  //   return {
  //     data: restaurantsWithAvg,
  //     pagination: {
  //       total: totalCount,
  //       totalPages,
  //       currentPage: page,
  //       perPage: limit,
  //       hasNextPage: page < totalPages,
  //       hasPreviousPage: page > 1,
  //     },
  //   };
  // }
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

  async findUserWeeklyHighlights(userId: number, minRating: number = 3) {
    const now = new Date();
    const sunday = new Date(now);
    sunday.setDate(now.getDate() - now.getDay());
    sunday.setHours(0, 0, 0, 0);

    const saturday = new Date(sunday);
    saturday.setDate(sunday.getDate() + 6);
    saturday.setHours(23, 59, 59, 999);

    const userRatings = await this.prisma.rating.findMany({
      where: {
        userId,
        value: { gte: minRating }
      },
      include: {
        restaurant: {
          include: {
            category: true
          }
        }
      }
    });

    const likedCategoryIds = userRatings
      .map(r => r.restaurant?.category?.id)
      .filter((id): id is number => id !== undefined && id !== null);

    const restaurants = await this.prisma.restaurant.findMany({
      where: {
        ...(likedCategoryIds.length > 0 && {
          categoryId: { in: likedCategoryIds }
        }),
        rating: {
          some: {
            createdAt: { gte: sunday, lte: saturday }
          }
        }
      },
      include: {
        category: true,
        location: true,
        rating: {
          where: {
            createdAt: { gte: sunday, lte: saturday }
          }
        },
      },
    });

    const restaurantsWithAvg = this.calculateAverageRatings(restaurants)
      .map((rest, index) => ({
        ...rest,
        averageRating: parseFloat(rest.averageRating),
        ratingCount: restaurants[index].rating.length
      }))
      .filter(rest => rest.averageRating >= minRating);

    return restaurantsWithAvg
      .sort((a, b) => {
        const avgDiff = b.averageRating - a.averageRating;
        if (avgDiff !== 0) return avgDiff;
        return b.ratingCount - a.ratingCount;
      })
      .slice(0, 5);
  }

  async findSystemHighlights() {
    const restaurants = await this.prisma.restaurant.findMany({
      include: {
        category: true,
        location: true,
        rating: true,
      },
    });

    const restaurantsWithAvg = this.calculateAverageRatings(restaurants);

    const restaurantsWithCount = restaurantsWithAvg.map((restaurant, index) => ({
      ...restaurant,
      averageRating: parseFloat(restaurant.averageRating),
      ratingCount: restaurants[index].rating.length
    }));

    const filteredRestaurants = restaurantsWithCount.filter(r => r.ratingCount > 0);

    return filteredRestaurants
      .sort((a, b) => {
        const avgDiff = b.averageRating - a.averageRating;
        if (avgDiff !== 0) return avgDiff;

        return b.ratingCount - a.ratingCount;
      })
      .slice(0, 9);
  }

  async findWeeklyTopRated() {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  
    const restaurants = await this.prisma.restaurant.findMany({
      include: {
        category: true,
        location: true,
        rating: {
          where: {
            createdAt: {
              gte: oneWeekAgo
            }
          }
        },
      },
      where: {
        rating: {
          some: {
            createdAt: {
              gte: oneWeekAgo
            }
          }
        }
      }
    });
  
    const restaurantsWithAvg = this.calculateAverageRatings(restaurants);
  
    const restaurantsWithCount = restaurantsWithAvg.map((restaurant, index) => ({
      ...restaurant,
      averageRating: parseFloat(restaurant.averageRating),
      ratingCount: restaurants[index].rating.length,
      latestRating: restaurants[index].rating.length > 0 
        ? new Date(Math.max(...restaurants[index].rating.map(r => new Date(r.createdAt).getTime())))
        : null
    }));
  
    const filteredRestaurants = restaurantsWithCount.filter(r => r.ratingCount > 0);
  
    return filteredRestaurants
      .sort((a, b) => {
        const avgDiff = b.averageRating - a.averageRating;
        if (avgDiff !== 0) return avgDiff;
  
        const countDiff = b.ratingCount - a.ratingCount;
        if (countDiff !== 0) return countDiff;
  
        return b.latestRating - a.latestRating;
      })
      .slice(0, 5);
  }

  async findRecommendedRestaurants(userId: number, minRating: number = 3) {
    const allUserRatings = await this.prisma.rating.findMany({
      where: { userId },
      include: {
        restaurant: {
          include: {
            category: true
          }
        }
      }
    });

    const alreadyRatedRestaurantIds = allUserRatings
      .map(r => r.restaurantId)
      .filter((id): id is number => id !== undefined);

    const likedCategoryIds = allUserRatings
      .filter(rating => rating.value >= minRating)
      .map(rating => rating.restaurant?.category?.id)
      .filter((id): id is number => id !== undefined && id !== null);

    if (likedCategoryIds.length === 0) {
      const systemHighlights = await this.findSystemHighlights();
      return systemHighlights
        .filter(rest => rest.averageRating >= minRating)
        .slice(0, 9);
    }

    const recommended = await this.prisma.restaurant.findMany({
      where: {
        categoryId: { in: likedCategoryIds },
        id: { notIn: alreadyRatedRestaurantIds },
        rating: { some: {} }
      },
      include: {
        category: true,
        location: true,
        rating: true
      }
    });

    const processedRecommendations = this.calculateAverageRatings(recommended)
      .map(rest => ({
        ...rest,
        averageRating: parseFloat(rest.averageRating),
        ratingCount: rest.rating.length
      }))
      .filter(rest => rest.averageRating >= minRating)
      .sort((a, b) => {
        return (
          b.averageRating - a.averageRating ||
          b.ratingCount - a.ratingCount ||
          a.id - b.id
        );
      });

    if (processedRecommendations.length === 0) {
      const systemHighlights = await this.findSystemHighlights();
      return systemHighlights
        .filter(rest => rest.averageRating >= minRating)
        .slice(0, 9);
    }

    return processedRecommendations.slice(0, 5);
  }

  async findByName(name: string) {
    const restaurants = await this.prisma.restaurant.findMany({
      where: {
        name: {
          contains: name,
        }
      },
      include: {
        category: true,
        location: true,
        rating: true,
      },
    });
  
    const filteredRestaurants = restaurants.filter(restaurant => 
      restaurant.name.toLowerCase().includes(name.toLowerCase())
    );
  
    return this.calculateAverageRatings(filteredRestaurants);
  }
}
