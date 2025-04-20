import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, NotFoundException, Query } from '@nestjs/common';
import { RatingService } from './rating.service';
import { CreateRatingDto } from './dto/create-rating.dto';
import { UpdateRatingDto } from './dto/update-rating.dto';
import { FilterRatingByUserDto } from './dto/filter-rating.dto';

@Controller('rating')
export class RatingController {
  constructor(private readonly ratingService: RatingService) {}

  @Post()
  create(@Body() createRatingDto: CreateRatingDto) {
    return this.ratingService.create(createRatingDto);
  }

  @Get()
  findAll() {
    return this.ratingService.findAll();
  }

  
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ratingService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateRatingDto: UpdateRatingDto) {
    return this.ratingService.update(+id, updateRatingDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.ratingService.remove(+id);
  }
  
  
  @Get('user/:userId')
  findAllByUserId(
      @Param('userId', ParseIntPipe) userId: number,
      @Query() filters: FilterRatingByUserDto
  ) {
      return this.ratingService.findAllByUserId(userId, {
          ratings: filters.ratings
      });
  }

  @Get('/restaurant/:id')
  async findAllByRestaurantId(@Param('id') restaurantId: string) {
    try {
      return await this.ratingService.findAllByRestaurantId(parseInt(restaurantId));
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new NotFoundException(error);
    }
  }
}
