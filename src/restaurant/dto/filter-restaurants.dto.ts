import { Transform, Type } from "class-transformer";
import { IsArray, IsNumber, IsOptional } from "class-validator";


export class getByCategoriesDto {
  @IsOptional()
  @IsArray()
  categoryId?: number[];

  @IsOptional()
  @IsArray()
  ratings?: number[];

  @IsOptional()
  @IsNumber()
  page?: number = 1; // Valor padrão 1

  @IsOptional()
  @IsNumber()
  limit?: number = 10; // Valor padrão 10
}
export class FilterRestaurantRatingsDto {
    @IsOptional()
    @IsArray()
    @IsNumber({}, { each: true })
    @Transform(({ value }) => {
        if (!value) return undefined;
        
        if (typeof value === 'string' && value.includes(',')) {
            return value.split(',').map(v => parseInt(v.trim(), 10));
        }
        
        if (Array.isArray(value)) {
            return value.map(v => parseInt(v, 10));
        }
        
        return [parseInt(value, 10)];
    })
    ratings?: number[];
}