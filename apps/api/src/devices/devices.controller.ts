import { Body, Controller, Get, Post, Put } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import type { JwtPayload } from '../auth/jwt.strategy';
import { CurrentUser } from '../auth/current-user.decorator';
import { successResponse } from '../shared/response.util';
import { DevicesService } from './devices.service';
import {
  RegisterDeviceDto,
  UpdateNotificationSettingsDto,
} from './dto/device.dto';

@ApiTags('devices')
@ApiBearerAuth()
@Controller('devices')
export class DevicesController {
  constructor(private readonly devicesService: DevicesService) {}

  @Post('token')
  @ApiOperation({ summary: 'Register FCM device token' })
  @ApiResponse({ status: 200 })
  async registerToken(
    @CurrentUser() user: JwtPayload,
    @Body() dto: RegisterDeviceDto,
  ) {
    const data = await this.devicesService.registerToken(user.sub, dto);
    return successResponse(data);
  }

  @Get('settings')
  @ApiOperation({ summary: 'Get notification settings' })
  @ApiResponse({ status: 200 })
  async getSettings(@CurrentUser() user: JwtPayload) {
    const data = await this.devicesService.getSettings(user.sub);
    return successResponse(data);
  }

  @Put('settings')
  @ApiOperation({ summary: 'Update notification settings' })
  @ApiResponse({ status: 200 })
  async updateSettings(
    @CurrentUser() user: JwtPayload,
    @Body() dto: UpdateNotificationSettingsDto,
  ) {
    const data = await this.devicesService.updateSettings(user.sub, dto);
    return successResponse(data);
  }
}
