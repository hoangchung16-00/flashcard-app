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
import { CardsService } from './cards.service';
import { CreateCardDto, UpdateCardDto } from './dto/card.dto';

@ApiTags('cards')
@ApiBearerAuth()
@Controller('decks/:deckId/cards')
export class CardsController {
  constructor(private readonly cardsService: CardsService) {}

  @Get()
  @ApiOperation({ summary: 'List cards in deck' })
  @ApiResponse({ status: 200 })
  async findAll(
    @CurrentUser() user: JwtPayload,
    @Param('deckId') deckId: string,
  ) {
    const data = await this.cardsService.findAll(user.sub, deckId);
    return successResponse(data);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get card by id' })
  @ApiResponse({ status: 200 })
  async findOne(
    @CurrentUser() user: JwtPayload,
    @Param('deckId') deckId: string,
    @Param('id') id: string,
  ) {
    const data = await this.cardsService.findOne(user.sub, deckId, id);
    return successResponse(data);
  }

  @Post()
  @ApiOperation({ summary: 'Create card' })
  @ApiResponse({ status: 201 })
  async create(
    @CurrentUser() user: JwtPayload,
    @Param('deckId') deckId: string,
    @Body() dto: CreateCardDto,
  ) {
    const data = await this.cardsService.create(user.sub, deckId, dto);
    return successResponse(data);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update card' })
  @ApiResponse({ status: 200 })
  async update(
    @CurrentUser() user: JwtPayload,
    @Param('deckId') deckId: string,
    @Param('id') id: string,
    @Body() dto: UpdateCardDto,
  ) {
    const data = await this.cardsService.update(user.sub, deckId, id, dto);
    return successResponse(data);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete card' })
  @ApiResponse({ status: 200 })
  async remove(
    @CurrentUser() user: JwtPayload,
    @Param('deckId') deckId: string,
    @Param('id') id: string,
  ) {
    const data = await this.cardsService.remove(user.sub, deckId, id);
    return successResponse(data);
  }
}
