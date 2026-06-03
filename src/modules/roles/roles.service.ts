import { Injectable, NotFoundException, ConflictException, Logger } from '@nestjs/common';
import { RolesRepository } from './roles.repository';
import { Role } from './entities/role.entity';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';

@Injectable()
export class RolesService {
  private readonly logger = new Logger(RolesService.name);

  constructor(private readonly rolesRepository: RolesRepository) {}

  async findAll(): Promise<Role[]> {
    return this.rolesRepository.findAll();
  }

  async findOne(id: string): Promise<Role> {
    const role = await this.rolesRepository.findById(id);
    if (!role) {
      throw new NotFoundException(`Role with id "${id}" not found`);
    }
    return role;
  }

  async create(dto: CreateRoleDto): Promise<Role> {
    const existing = await this.rolesRepository.findByName(dto.name);
    if (existing) {
      throw new ConflictException(`Role with name "${dto.name}" already exists`);
    }
    this.logger.log(`Creating role: ${dto.name}`);
    return this.rolesRepository.save(dto);
  }

  async update(id: string, dto: UpdateRoleDto): Promise<Role> {
    await this.findOne(id);
    this.logger.log(`Updating role: ${id}`);
    const updated = await this.rolesRepository.update(id, dto);
    if (!updated) {
      throw new NotFoundException(`Role with id "${id}" could not be updated`);
    }
    return updated;
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);
    this.logger.log(`Deleting role: ${id}`);
    await this.rolesRepository.delete(id);
  }
}
