import { Controller, Get, Post, Body, Patch, Param, Delete, UploadedFile, UseInterceptors, StreamableFile, Query } from '@nestjs/common';
import { RestaurantService } from './restaurant.service';
import { CreateRestaurantDto } from './dto/create-restaurant.dto';
import { UpdateRestaurantDto } from './dto/update-restaurant.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { DefaultAzureCredential } from '@azure/identity';
import { BlobServiceClient } from '@azure/storage-blob';
import { getByCategories } from './dto/payloads.dto';

@Controller('restaurant')
export class RestaurantController {
  constructor(private restaurantService: RestaurantService) { }

  @Post()
  @UseInterceptors(FileInterceptor('url_img'))
  async create(
    @Body() createRestaurantDto: CreateRestaurantDto,
    @UploadedFile() file: Express.Multer.File
  ) {
    return this.restaurantService.create(createRestaurantDto, file);
  }

  @Get()
  findAll() {
    return this.restaurantService.findAll();
  }

  @Get('by-categories')
  async getByCategories(@Query() param: getByCategories) {
   
    return this.restaurantService.findRestaurantsByCategories(param);
  }
  @Get('/average')
  findAverageRatingsByRestaurant() {
    return this.restaurantService.findAverageRatingsByRestaurants();
  }  

  
  @Get('/average/:id')
  findAverageRatingsByRestaurants(@Param('id') id: string) {
    return this.restaurantService.findAverageRatingsByRestaurant(+id);
  }  


  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.restaurantService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateRestaurantDto: UpdateRestaurantDto) {
    return this.restaurantService.update(+id, updateRestaurantDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.restaurantService.remove(+id);
  }
}
