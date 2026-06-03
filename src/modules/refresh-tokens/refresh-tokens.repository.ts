import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RefreshToken } from './entities/refresh-token.entity';

@Injectable()
export class RefreshTokensRepository {
  constructor(
    @InjectRepository(RefreshToken)
    private readonly repo: Repository<RefreshToken>,
  ) {}

  async findById(id: string): Promise<RefreshToken | null> {
    return this.repo.findOne({ where: { id }, relations: ['user'] });
  }

  async findByTokenHash(tokenHash: string): Promise<RefreshToken | null> {
    return this.repo.findOne({ where: { tokenHash }, relations: ['user'] });
  }

  async findActiveByUserId(userId: string): Promise<RefreshToken[]> {
    return this.repo.find({
      where: { userId, isRevoked: false },
    });
  }

  async save(token: Partial<RefreshToken>): Promise<RefreshToken> {
    const entity = this.repo.create(token);
    return this.repo.save(entity);
  }

  async revokeById(id: string): Promise<void> {
    await this.repo.update(id, { isRevoked: true });
  }

  async revokeAllByUserId(userId: string): Promise<void> {
    await this.repo.update({ userId, isRevoked: false }, { isRevoked: true });
  }

  async deleteExpired(): Promise<void> {
    const now = new Date();
    await this.repo.createQueryBuilder().delete().where('expires_at < :now', { now }).execute();
  }
}
