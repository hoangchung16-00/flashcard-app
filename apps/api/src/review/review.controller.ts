import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import type { JwtPayload } from '../auth/jwt.strategy';
import { CurrentUser } from '../auth/current-user.decorator';
import { RateCardDto } from '../cards/dto/card.dto';
import { successResponse } from '../shared/response.util';
import { ReviewService } from './review.service';

@ApiTags('review')
@ApiBearerAuth()
@Controller('review')
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  @Get('due')
  @ApiOperation({ summary: 'Get due cards for review' })
  @ApiResponse({ status: 200 })
  async getDue(
    @CurrentUser() user: JwtPayload,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const data = await this.reviewService.getDueCards(
      user.sub,
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 50,
    );
    return successResponse(data);
  }

  @Get('due/count')
  @ApiOperation({ summary: 'Get count of due cards' })
  @ApiResponse({ status: 200 })
  async getDueCount(@CurrentUser() user: JwtPayload) {
    const data = await this.reviewService.getDueCount(user.sub);
    return successResponse({ count: data });
  }

  @Post(':cardId/rate')
  @ApiOperation({ summary: 'Rate a card after review' })
  @ApiResponse({ status: 200 })
  async rate(
    @CurrentUser() user: JwtPayload,
    @Param('cardId') cardId: string,
    @Body() dto: RateCardDto,
  ) {
    const data = await this.reviewService.rateCard(
      user.sub,
      cardId,
      dto.rating,
    );
    return successResponse(data);
  }
}
