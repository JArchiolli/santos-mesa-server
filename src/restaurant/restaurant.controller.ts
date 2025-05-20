import { Controller, Get, Post, Body, Patch, Param, Delete, UploadedFile, UseInterceptors, StreamableFile, Query, UsePipes, ValidationPipe, ParseIntPipe, DefaultValuePipe } from '@nestjs/common';
import { RestaurantService } from './restaurant.service';
import { CreateRestaurantDto } from './dto/create-restaurant.dto';
import { UpdateRestaurantDto } from './dto/update-restaurant.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { DefaultAzureCredential } from '@azure/identity';
import { BlobServiceClient } from '@azure/storage-blob';
import { getByCategories } from './dto/payloads.dto';
import { FilterRestaurantRatingsDto, getByCategoriesDto } from './dto/filter-restaurants.dto';

@Controller('restaurant')
export class RestaurantController {
  constructor(private restaurantService: RestaurantService) { }

  @Post()
  @UseInterceptors(FileInterceptor('url_img'))
  async create(
    @Body() createRestaurantDto: CreateRestaurantDto,
    @UploadedFile() file?: Express.Multer.File
  ) {
    return this.restaurantService.create(createRestaurantDto, file);
  }

  @Get()
  @UsePipes(new ValidationPipe({ transform: true }))
  async findRestaurantsByCategories(
    @Query() query: getByCategoriesDto,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number = 1,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number = 10
  ) {
    return this.restaurantService.findAll(query, page, limit);
  }

  // @Get('by-categories')
  // async getByCategories(@Query() param: getByCategories) {

  //   return this.restaurantService.findRestaurantsByCategories(param);
  // }
  // @Get('/average')
  // findAverageRatingsByRestaurant() {
  //   return this.restaurantService.findAverageRatingsByRestaurants();
  // }


  @Get('/average/:id')
  findAverageRatingsByRestaurants(@Param('id') id: string) {
    return this.restaurantService.findAverageRatingsByRestaurant(+id);
  }


  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @Query() filters: FilterRestaurantRatingsDto
  ) {
    return this.restaurantService.findOne(id, filters);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateRestaurantDto: UpdateRestaurantDto) {
    return this.restaurantService.update(+id, updateRestaurantDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.restaurantService.remove(+id);
  }

  @Get('highlights/weekly/:userId')
  async getUserWeeklyHighlights(
    @Param('userId', ParseIntPipe) userId: number,
    @Query('minRating', new DefaultValuePipe(3), ParseIntPipe) minRating?: number
  ) {
    return this.restaurantService.findUserWeeklyHighlights(userId, minRating);
  }

  @Get('highlights/system')
  findSystemHighlights() {
    return this.restaurantService.findSystemHighlights();
  }

  @Get('highlights/weekly')
  findWeeklyTopRated() {
    return this.restaurantService.findWeeklyTopRated();
  }

  @Get('recommendations/:userId')
  async getRecommendations(
    @Param('userId', ParseIntPipe) userId: number,
    @Query('minRating', new DefaultValuePipe(3), ParseIntPipe) minRating?: number
  ) {
    return this.restaurantService.findRecommendedRestaurants(userId, minRating);
  }
}
