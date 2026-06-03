import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateRoleDto {
  @ApiProperty({ example: 'ADMIN', description: 'Unique role name' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'Administrator', description: 'Human-readable display name' })
  @IsString()
  @IsNotEmpty()
  displayName: string;

  @ApiPropertyOptional({ description: 'Optional description' })
  @IsString()
  @IsOptional()
  description?: string;
}
