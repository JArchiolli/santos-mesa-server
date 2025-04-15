import { Prisma } from "@prisma/client";

export class CreateRestaurantDto {
    name: string;
    url_img?: string;
    aboutUs: string  
    categoryId: number;
    locationId: number; 
    rating?: Prisma.RatingUncheckedCreateNestedManyWithoutRestaurantInput ;
}
