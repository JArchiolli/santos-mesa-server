import { PartialType } from '@nestjs/mapped-types';
import { CreateRestaurantDto } from './create-restaurant.dto';
import { Prisma } from '@prisma/client';

export class UpdateRestaurantDto extends PartialType(CreateRestaurantDto) {
    categoryId?: number;
    locationId?: number;
    rating?: Prisma.RatingUncheckedCreateNestedManyWithoutRestaurantInput ;
}