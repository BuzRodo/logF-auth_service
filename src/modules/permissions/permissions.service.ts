import { Injectable, NotFoundException, ConflictException, Logger } from '@nestjs/common';
import { PermissionsRepository } from './permissions.repository';
import { Permission } from './entities/permission.entity';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';

@Injectable()
export class PermissionsService {
  private readonly logger = new Logger(PermissionsService.name);

  constructor(private readonly permissionsRepository: PermissionsRepository) {}

  async findAll(): Promise<Permission[]> {
    return this.permissionsRepository.findAll();
  }

  async findOne(id: string): Promise<Permission> {
    const permission = await this.permissionsRepository.findById(id);
    if (!permission) {
      throw new NotFoundException(`Permission with id "${id}" not found`);
    }
    return permission;
  }

  async create(dto: CreatePermissionDto): Promise<Permission> {
    const existing = await this.permissionsRepository.findByAction(dto.action);
    if (existing) {
      throw new ConflictException(`Permission with action "${dto.action}" already exists`);
    }
    this.logger.log(`Creating permission: ${dto.action}`);
    return this.permissionsRepository.save(dto);
  }

  async update(id: string, dto: UpdatePermissionDto): Promise<Permission> {
    await this.findOne(id);
    this.logger.log(`Updating permission: ${id}`);
    const updated = await this.permissionsRepository.update(id, dto);
    if (!updated) {
      throw new NotFoundException(`Permission with id "${id}" could not be updated`);
    }
    return updated;
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);
    this.logger.log(`Deleting permission: ${id}`);
    await this.permissionsRepository.delete(id);
  }
}
