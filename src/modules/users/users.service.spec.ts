import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { UsersRepository } from './users.repository';
import { NotFoundException, ConflictException } from '@nestjs/common';

const mockUsersRepository = {
  findAll: jest.fn(),
  findById: jest.fn(),
  findByEmail: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
  softDelete: jest.fn(),
};

describe('UsersService', () => {
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UsersService, { provide: UsersRepository, useValue: mockUsersRepository }],
    }).compile();

    service = module.get<UsersService>(UsersService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return array of users', async () => {
      const users = [{ id: '1', fullName: 'Test User', email: 'test@test.com' }];
      mockUsersRepository.findAll.mockResolvedValue(users);
      const result = await service.findAll();
      expect(result).toEqual(users);
      expect(mockUsersRepository.findAll).toHaveBeenCalledTimes(1);
    });
  });

  describe('findOne', () => {
    it('should return a user when found', async () => {
      const user = { id: '1', fullName: 'Test User', email: 'test@test.com' };
      mockUsersRepository.findById.mockResolvedValue(user);
      const result = await service.findOne('1');
      expect(result).toEqual(user);
    });

    it('should throw NotFoundException when user not found', async () => {
      mockUsersRepository.findById.mockResolvedValue(null);
      await expect(service.findOne('non-existent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create and return a user', async () => {
      const dto = {
        fullName: 'New User',
        email: 'new@test.com',
        passwordHash: '$2b$10$' + 'a'.repeat(53),
      };
      mockUsersRepository.findByEmail.mockResolvedValue(null);
      mockUsersRepository.save.mockResolvedValue({ id: '2', ...dto });
      const result = await service.create(dto);
      expect(result.email).toBe(dto.email);
    });

    it('should throw ConflictException when email already exists', async () => {
      const dto = {
        fullName: 'New User',
        email: 'existing@test.com',
        passwordHash: '$2b$10$' + 'a'.repeat(53),
      };
      mockUsersRepository.findByEmail.mockResolvedValue({ id: '1', email: dto.email });
      await expect(service.create(dto)).rejects.toThrow(ConflictException);
    });
  });

  describe('remove', () => {
    it('should soft-delete a user', async () => {
      const user = { id: '1', fullName: 'Test', email: 'test@test.com' };
      mockUsersRepository.findById.mockResolvedValue(user);
      mockUsersRepository.softDelete.mockResolvedValue(undefined);
      await expect(service.remove('1')).resolves.not.toThrow();
      expect(mockUsersRepository.softDelete).toHaveBeenCalledWith('1');
    });
  });
});
