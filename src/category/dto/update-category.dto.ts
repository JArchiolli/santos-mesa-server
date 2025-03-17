import { PartialType } from '@nestjs/mapped-types';
import { CreateCategoryDto } from './create-category.dto';
import { Prisma } from '@prisma/client';

export class UpdateCategoryDto extends PartialType(CreateCategoryDto) {
    restaurant?: Prisma.RestaurantCreateNestedOneWithoutCategoryInput;
}
