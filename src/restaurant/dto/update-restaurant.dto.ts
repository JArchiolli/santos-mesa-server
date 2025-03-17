import { PartialType } from '@nestjs/mapped-types';
import { CreateRestaurantDto } from './create-restaurant.dto';
import { Prisma } from '@prisma/client';

export class UpdateRestaurantDto extends PartialType(CreateRestaurantDto) {
    category?: Prisma.CategoryUpdateManyWithoutRestaurantNestedInput;
    location?: Prisma.LocationUpdateManyWithoutRestaurantNestedInput;
    rating?: Prisma.RatingUpdateManyWithoutRestaurantNestedInput;
}