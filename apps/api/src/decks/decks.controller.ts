import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import type { JwtPayload } from '../auth/jwt.strategy';
import { CurrentUser } from '../auth/current-user.decorator';
import { successResponse } from '../shared/response.util';
import { DecksService } from './decks.service';
import { CreateDeckDto, UpdateDeckDto } from './dto/deck.dto';

@ApiTags('decks')
@ApiBearerAuth()
@Controller('decks')
export class DecksController {
  constructor(private readonly decksService: DecksService) {}

  @Get()
  @ApiOperation({ summary: 'List all decks' })
  @ApiResponse({ status: 200 })
  async findAll(@CurrentUser() user: JwtPayload) {
    const data = await this.decksService.findAll(user.sub);
    return successResponse(data);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get deck by id' })
  @ApiResponse({ status: 200 })
  async findOne(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    const data = await this.decksService.findOne(user.sub, id);
    return successResponse(data);
  }

  @Post()
  @ApiOperation({ summary: 'Create deck' })
  @ApiResponse({ status: 201 })
  async create(@CurrentUser() user: JwtPayload, @Body() dto: CreateDeckDto) {
    const data = await this.decksService.create(user.sub, dto);
    return successResponse(data);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update deck' })
  @ApiResponse({ status: 200 })
  async update(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() dto: UpdateDeckDto,
  ) {
    const data = await this.decksService.update(user.sub, id, dto);
    return successResponse(data);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete deck' })
  @ApiResponse({ status: 200 })
  async remove(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    const data = await this.decksService.remove(user.sub, id);
    return successResponse(data);
  }
}
