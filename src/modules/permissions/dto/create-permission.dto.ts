import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePermissionDto {
  @ApiProperty({ example: 'users:read', description: 'Action identifier (resource:operation)' })
  @IsString()
  @IsNotEmpty()
  action: string;

  @ApiProperty({ example: 'users', description: 'Resource this permission applies to' })
  @IsString()
  @IsNotEmpty()
  resource: string;

  @ApiPropertyOptional({ description: 'Optional description' })
  @IsString()
  @IsOptional()
  description?: string;
}
