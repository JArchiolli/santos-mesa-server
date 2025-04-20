import { Type } from "class-transformer";
import { IsArray, IsNumber, IsOptional } from "class-validator";
import { Transform } from 'class-transformer';

export class FilterRatingByUserDto {
    @IsNumber()
    @Type(() => Number)
    userId: number;

    @IsOptional()
    @IsArray()
    @IsNumber({}, { each: true })
    @Transform(({ value }) => {
        if (value === undefined || value === null) return undefined;
        if (Array.isArray(value)) return value.map(v => Number(v));
        return [Number(value)];
    })
    ratings?: number[];
}