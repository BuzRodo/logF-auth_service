import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service';

/**
 * AuthController
 *
 * NOTE: Login and JWT endpoints are not yet implemented.
 * This controller will host future authentication endpoints.
 */
@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('status')
  @ApiOperation({ summary: 'Get auth service status' })
  @ApiResponse({ status: 200, description: 'Service status' })
  getStatus() {
    return this.authService.getStatus();
  }
}
