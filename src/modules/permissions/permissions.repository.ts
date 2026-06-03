import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Permission } from './entities/permission.entity';

@Injectable()
export class PermissionsRepository {
  constructor(
    @InjectRepository(Permission)
    private readonly repo: Repository<Permission>,
  ) {}

  async findAll(): Promise<Permission[]> {
    return this.repo.find({ where: { isActive: true } });
  }

  async findById(id: string): Promise<Permission | null> {
    return this.repo.findOne({ where: { id } });
  }

  async findByAction(action: string): Promise<Permission | null> {
    return this.repo.findOne({ where: { action } });
  }

  async findByResource(resource: string): Promise<Permission[]> {
    return this.repo.find({ where: { resource, isActive: true } });
  }

  async save(permission: Partial<Permission>): Promise<Permission> {
    const entity = this.repo.create(permission);
    return this.repo.save(entity);
  }

  async update(id: string, updates: Partial<Permission>): Promise<Permission | null> {
    await this.repo.update(id, updates);
    return this.findById(id);
  }

  async delete(id: string): Promise<void> {
    await this.repo.delete(id);
  }
}
