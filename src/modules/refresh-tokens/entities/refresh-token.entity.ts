import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../users/entities/user.entity';

@Entity('refresh_tokens')
export class RefreshToken {
  @ApiProperty({ description: 'Unique identifier' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'Hashed token value' })
  @Index()
  @Column({ name: 'token_hash', length: 255 })
  tokenHash: string;

  @ApiProperty({ description: 'Client user agent' })
  @Column({ name: 'user_agent', type: 'text', nullable: true })
  userAgent: string | null;

  @ApiProperty({ description: 'Client IP address' })
  @Column({ name: 'ip_address', length: 45, nullable: true })
  ipAddress: string | null;

  @ApiProperty({ description: 'Whether the token has been revoked' })
  @Column({ name: 'is_revoked', default: false })
  isRevoked: boolean;

  @ApiProperty({ description: 'Token expiration timestamp' })
  @Column({ name: 'expires_at', type: 'timestamptz' })
  expiresAt: Date;

  @ApiProperty({ description: 'Creation timestamp' })
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @ApiProperty({ description: 'Associated user' })
  @ManyToOne(() => User, (user) => user.refreshTokens, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'user_id' })
  userId: string;
}
