import { Controller, Get, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import type { JwtPayload } from '../auth/jwt.strategy';
import { CurrentUser } from '../auth/current-user.decorator';
import { successResponse } from '../shared/response.util';
import { SearchService } from './search.service';

@ApiTags('search')
@ApiBearerAuth()
@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  @ApiOperation({ summary: 'Search decks and cards' })
  @ApiResponse({ status: 200 })
  async search(
    @CurrentUser() user: JwtPayload,
    @Query('q') q: string,
  ) {
    const data = await this.searchService.search(user.sub, q ?? '');
    return successResponse(data);
  }
}
