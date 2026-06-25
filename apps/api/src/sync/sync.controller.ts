import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import type { JwtPayload } from '../auth/jwt.strategy';
import { CurrentUser } from '../auth/current-user.decorator';
import { successResponse } from '../shared/response.util';
import { SyncPushDto } from './dto/sync.dto';
import { SyncService } from './sync.service';

@ApiTags('sync')
@ApiBearerAuth()
@Controller('sync')
export class SyncController {
  constructor(private readonly syncService: SyncService) {}

  @Post('push')
  @ApiOperation({ summary: 'Push local changes to server' })
  @ApiResponse({ status: 200 })
  async push(@CurrentUser() user: JwtPayload, @Body() dto: SyncPushDto) {
    const data = await this.syncService.push(user.sub, dto);
    return successResponse(data);
  }

  @Get('pull')
  @ApiOperation({ summary: 'Pull server changes since timestamp' })
  @ApiResponse({ status: 200 })
  async pull(
    @CurrentUser() user: JwtPayload,
    @Query('since') since?: string,
  ) {
    const data = await this.syncService.pull(user.sub, since);
    return successResponse(data);
  }
}
