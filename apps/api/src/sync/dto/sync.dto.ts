import { Type } from 'class-transformer';
import {
  IsArray,
  IsDateString,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import type { Rating } from '@flashcard/shared';

export class SyncDeckDto {
  @IsUUID()
  id!: string;

  @IsString()
  title!: string;

  @IsOptional()
  @IsString()
  description?: string | null;

  @IsDateString()
  updatedAt!: string;

  @IsOptional()
  @IsDateString()
  deletedAt?: string | null;
}

export class SyncCardDto {
  @IsUUID()
  id!: string;

  @IsUUID()
  deckId!: string;

  @IsString()
  front!: string;

  @IsString()
  back!: string;

  @IsInt()
  repetitions!: number;

  @IsInt()
  interval!: number;

  @IsOptional()
  easinessFactor?: number;

  @IsDateString()
  nextReview!: string;

  @IsDateString()
  updatedAt!: string;

  @IsOptional()
  @IsDateString()
  deletedAt?: string | null;
}

export class SyncRatingDto {
  @IsUUID()
  cardId!: string;

  @IsInt()
  @Min(0)
  @Max(3)
  rating!: Rating;

  @IsDateString()
  reviewedAt!: string;
}

export class SyncPushDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SyncDeckDto)
  decks!: SyncDeckDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SyncCardDto)
  cards!: SyncCardDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SyncRatingDto)
  ratings!: SyncRatingDto[];

  @IsDateString()
  clientUpdatedAt!: string;
}
