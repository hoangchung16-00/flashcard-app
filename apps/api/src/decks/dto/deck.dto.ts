import { IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateDeckDto {
  @IsString()
  @MaxLength(100)
  title!: string;

  @IsOptional()
  @IsString()
  description?: string;
}

export class UpdateDeckDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;
}
