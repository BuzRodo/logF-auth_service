import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { RefreshTokensRepository } from './refresh-tokens.repository';
import { RefreshToken } from './entities/refresh-token.entity';

@Injectable()
export class RefreshTokensService {
  private readonly logger = new Logger(RefreshTokensService.name);

  constructor(private readonly refreshTokensRepository: RefreshTokensRepository) {}

  async findByTokenHash(tokenHash: string): Promise<RefreshToken | null> {
    return this.refreshTokensRepository.findByTokenHash(tokenHash);
  }

  async findActiveByUserId(userId: string): Promise<RefreshToken[]> {
    return this.refreshTokensRepository.findActiveByUserId(userId);
  }

  async create(data: {
    userId: string;
    tokenHash: string;
    expiresAt: Date;
    userAgent?: string;
    ipAddress?: string;
  }): Promise<RefreshToken> {
    this.logger.log(`Creating refresh token for user: ${data.userId}`);
    return this.refreshTokensRepository.save(data);
  }

  async revoke(id: string): Promise<void> {
    const token = await this.refreshTokensRepository.findById(id);
    if (!token) {
      throw new NotFoundException(`RefreshToken with id "${id}" not found`);
    }
    this.logger.log(`Revoking refresh token: ${id}`);
    await this.refreshTokensRepository.revokeById(id);
  }

  async revokeAllForUser(userId: string): Promise<void> {
    this.logger.log(`Revoking all refresh tokens for user: ${userId}`);
    await this.refreshTokensRepository.revokeAllByUserId(userId);
  }

  async cleanupExpired(): Promise<void> {
    this.logger.log('Cleaning up expired refresh tokens');
    await this.refreshTokensRepository.deleteExpired();
  }
}
