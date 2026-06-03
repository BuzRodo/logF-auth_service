import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
  Index,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../users/entities/user.entity';
import { Permission } from '../../permissions/entities/permission.entity';

@Entity('roles')
export class Role {
  @ApiProperty({ description: 'Unique identifier' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'Role name (e.g., ADMIN, MANAGER, CASHIER)' })
  @Index({ unique: true })
  @Column({ length: 100 })
  name: string;

  @ApiProperty({ description: 'Human-readable display name' })
  @Column({ name: 'display_name', length: 150 })
  displayName: string;

  @ApiProperty({ description: 'Optional role description' })
  @Column({ type: 'text', nullable: true })
  description: string | null;

  @ApiProperty({ description: 'Whether the role is active' })
  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @ApiProperty({ description: 'Creation timestamp' })
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;

  @ManyToMany(() => User, (user) => user.roles)
  users: User[];

  @ManyToMany(() => Permission, (permission) => permission.roles, { eager: false })
  permissions: Permission[];
}
