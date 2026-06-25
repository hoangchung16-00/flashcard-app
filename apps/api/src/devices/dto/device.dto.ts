import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class RegisterDeviceDto {
  @IsString()
  token!: string;

  @IsOptional()
  @IsString()
  platform?: string;
}

export class UpdateNotificationSettingsDto {
  @IsOptional()
  enabled?: boolean;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(23)
  reminderHour?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(59)
  reminderMinute?: number;

  @IsOptional()
  @IsString()
  timezone?: string;
}
