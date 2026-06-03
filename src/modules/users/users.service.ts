import { Injectable, NotFoundException, ConflictException, Logger } from '@nestjs/common';
import { UsersRepository } from './users.repository';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(private readonly usersRepository: UsersRepository) {}

  async findAll(): Promise<User[]> {
    this.logger.log('Fetching all users');
    return this.usersRepository.findAll();
  }

  async findOne(id: string): Promise<User> {
    const user = await this.usersRepository.findById(id);
    if (!user) {
      throw new NotFoundException(`User with id "${id}" not found`);
    }
    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findByEmail(email);
  }

  async create(dto: CreateUserDto): Promise<User> {
    const existing = await this.usersRepository.findByEmail(dto.email);
    if (existing) {
      throw new ConflictException(`User with email "${dto.email}" already exists`);
    }

    this.logger.log(`Creating user with email: ${dto.email}`);
    return this.usersRepository.save({
      fullName: dto.fullName,
      email: dto.email,
      passwordHash: dto.passwordHash,
    });
  }

  async update(id: string, dto: UpdateUserDto): Promise<User> {
    await this.findOne(id);
    this.logger.log(`Updating user: ${id}`);
    const updated = await this.usersRepository.update(id, dto);
    if (!updated) {
      throw new NotFoundException(`User with id "${id}" could not be updated`);
    }
    return updated;
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);
    this.logger.log(`Soft-deleting user: ${id}`);
    await this.usersRepository.softDelete(id);
  }
}
