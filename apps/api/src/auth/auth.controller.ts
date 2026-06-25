import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { successResponse } from '../shared/response.util';
import { AuthService, type AuthTokens } from './auth.service';
import type { ApiResponse as FlashcardApiResponse } from '@flashcard/shared';
import { Public } from './jwt-auth.guard';
import {
  GoogleAuthDto,
  LoginDto,
  RefreshTokenDto,
  RegisterDto,
} from './dto/auth.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  @ApiOperation({ summary: 'Register with email and password' })
  @ApiResponse({ status: 201 })
  async register(
    @Body() dto: RegisterDto,
  ): Promise<FlashcardApiResponse<AuthTokens>> {
    const data = await this.authService.register(dto);
    return successResponse(data);
  }

  @Public()
  @Post('login')
  @ApiOperation({ summary: 'Login with email and password' })
  @ApiResponse({ status: 200 })
  async login(@Body() dto: LoginDto): Promise<FlashcardApiResponse<AuthTokens>> {
    const data = await this.authService.login(dto);
    return successResponse(data);
  }

  @Public()
  @Post('google')
  @ApiOperation({ summary: 'Login with Google ID token' })
  @ApiResponse({ status: 200 })
  async google(
    @Body() dto: GoogleAuthDto,
  ): Promise<FlashcardApiResponse<AuthTokens>> {
    const data = await this.authService.googleAuth(dto);
    return successResponse(data);
  }

  @Public()
  @Post('refresh')
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiResponse({ status: 200 })
  async refresh(
    @Body() dto: RefreshTokenDto,
  ): Promise<FlashcardApiResponse<AuthTokens>> {
    const data = await this.authService.refresh(dto.refreshToken);
    return successResponse(data);
  }
}
