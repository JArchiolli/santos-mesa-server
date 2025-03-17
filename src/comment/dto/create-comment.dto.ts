import { IsInt, IsOptional, IsString, IsNotEmpty } from 'class-validator';

export class CreateCommentDto {
  @IsOptional() 
  @IsInt()
  commentId?: number;

  @IsInt()
  @IsNotEmpty()
  ratingId: number;  

  @IsOptional()
  @IsInt()
  userId?: number; 

  @IsString()
  @IsNotEmpty()
  message: string; 
}
