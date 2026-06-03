import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from './entities/role.entity';

@Injectable()
export class RolesRepository {
  constructor(
    @InjectRepository(Role)
    private readonly repo: Repository<Role>,
  ) {}

  async findAll(): Promise<Role[]> {
    return this.repo.find({ where: { isActive: true } });
  }

  async findById(id: string): Promise<Role | null> {
    return this.repo.findOne({ where: { id } });
  }

  async findByName(name: string): Promise<Role | null> {
    return this.repo.findOne({ where: { name } });
  }

  async save(role: Partial<Role>): Promise<Role> {
    const entity = this.repo.create(role);
    return this.repo.save(entity);
  }

  async update(id: string, updates: Partial<Role>): Promise<Role | null> {
    await this.repo.update(id, updates);
    return this.findById(id);
  }

  async delete(id: string): Promise<void> {
    await this.repo.delete(id);
  }
}
