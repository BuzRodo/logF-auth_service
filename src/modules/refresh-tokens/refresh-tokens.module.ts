import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RefreshToken } from './entities/refresh-token.entity';
import { RefreshTokensService } from './refresh-tokens.service';
import { RefreshTokensRepository } from './refresh-tokens.repository';

@Module({
  imports: [TypeOrmModule.forFeature([RefreshToken])],
  providers: [RefreshTokensService, RefreshTokensRepository],
  exports: [RefreshTokensService, RefreshTokensRepository],
})
export class RefreshTokensModule {}
