import { Injectable, Logger } from '@nestjs/common';

/**
 * AuthService - Identity & Security orchestration
 *
 * NOTE: Login and JWT functionality are not yet implemented.
 * This service serves as the foundation for future authentication logic.
 */
@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  /**
   * Placeholder: Authentication logic will be implemented here.
   * Future features: login, token generation, token refresh, logout.
   */
  getStatus(): { status: string; message: string } {
    return {
      status: 'ready',
      message: 'Auth service is up. Login and JWT features are not yet implemented.',
    };
  }
}
