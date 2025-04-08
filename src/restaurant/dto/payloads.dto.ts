import { IsNotEmpty } from "class-validator";
import { Transform } from 'class-transformer';

export class getByCategories {
    @IsNotEmpty()
    @Transform(({ value }) => (Array.isArray(value) ? value : [value]))
    categoryId: number[];
  
}
  