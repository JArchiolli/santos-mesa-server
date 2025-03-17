import { Prisma } from "@prisma/client";

export class CreateRestaurantDto {
    name: string;
    url_img: string;
    aboutUs: string  
    category: Prisma.CategoryUpdateManyWithoutRestaurantNestedInput;
    location: Prisma.LocationUpdateManyWithoutRestaurantNestedInput; 
    rating?: Prisma.RatingUpdateManyWithoutRestaurantNestedInput;
}
