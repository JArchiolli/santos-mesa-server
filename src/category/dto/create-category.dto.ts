import { Prisma } from "@prisma/client";

export class CreateCategoryDto {
    name: string
    restaurant?: Prisma.RestaurantCreateNestedOneWithoutCategoryInput
}
