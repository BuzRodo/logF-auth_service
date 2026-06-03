import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { PermissionsService } from './permissions.service';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { Permission } from './entities/permission.entity';

@ApiTags('permissions')
@Controller('permissions')
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all permissions' })
  @ApiResponse({ status: 200, description: 'List of permissions', type: [Permission] })
  findAll(): Promise<Permission[]> {
    return this.permissionsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a permission by ID' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Permission found', type: Permission })
  @ApiResponse({ status: 404, description: 'Permission not found' })
  findOne(@Param('id', ParseUUIDPipe) id: string): Promise<Permission> {
    return this.permissionsService.findOne(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new permission' })
  @ApiResponse({ status: 201, description: 'Permission created', type: Permission })
  @ApiResponse({ status: 409, description: 'Permission action already exists' })
  create(@Body() dto: CreatePermissionDto): Promise<Permission> {
    return this.permissionsService.create(dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a permission' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Permission updated', type: Permission })
  @ApiResponse({ status: 404, description: 'Permission not found' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdatePermissionDto,
  ): Promise<Permission> {
    return this.permissionsService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a permission' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 204, description: 'Permission deleted' })
  @ApiResponse({ status: 404, description: 'Permission not found' })
  remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.permissionsService.remove(id);
  }
}
