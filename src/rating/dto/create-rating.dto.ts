import { IsInt, IsNotEmpty, IsOptional, IsArray, ArrayNotEmpty, IsString } from 'class-validator';

export class CreateRatingDto {
  @IsInt()
  @IsNotEmpty()
  value: number;

  @IsInt()
  @IsNotEmpty()
  restaurantId: number;

  @IsInt()
  @IsNotEmpty()
  userId: number;

  @IsOptional()
  @IsString()
  comments?: string;
}
