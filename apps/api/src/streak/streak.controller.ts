import { Controller, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import type { JwtPayload } from '../auth/jwt.strategy';
import { CurrentUser } from '../auth/current-user.decorator';
import { successResponse } from '../shared/response.util';
import { StreakService } from './streak.service';

@ApiTags('streak')
@ApiBearerAuth()
@Controller('streak')
export class StreakController {
  constructor(private readonly streakService: StreakService) {}

  @Get()
  @ApiOperation({ summary: 'Get current streak' })
  @ApiResponse({ status: 200 })
  async getStreak(@CurrentUser() user: JwtPayload) {
    const data = await this.streakService.getStreak(user.sub);
    return successResponse(data);
  }
}
