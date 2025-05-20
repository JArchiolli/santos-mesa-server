import { Transform, Type } from "class-transformer";
import { IsArray, IsNumber, IsOptional, IsString } from "class-validator";


export class getByCategoriesDto {
  @IsOptional()
  @Transform(({ value }) => Array.isArray(value) ? value : [value])
  @IsArray()
  categoryId?: string[];

  @IsOptional()
  @Transform(({ value }) => Array.isArray(value) ? value : [value])
  @IsArray()
  ratings?: string[];

  @IsOptional()
  @IsString()
  search?: string;


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