import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import type { Rating } from '@flashcard/shared';

export class CreateCardDto {
  @IsString()
  front!: string;

  @IsString()
  back!: string;
}

export class UpdateCardDto {
  @IsOptional()
  @IsString()
  front?: string;

  @IsOptional()
  @IsString()
  back?: string;
}

export class RateCardDto {
  @IsInt()
  @Min(0)
  @Max(3)
  rating!: Rating;
}
