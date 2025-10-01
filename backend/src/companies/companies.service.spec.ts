import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CompaniesService } from './companies.service';
import { Company } from './entities/company.entity';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';

describe('CompaniesService', () => {
  let service: CompaniesService;
  let repository: Repository<Company>;

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CompaniesService,
        {
          provide: getRepositoryToken(Company),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<CompaniesService>(CompaniesService);
    repository = module.get<Repository<Company>>(getRepositoryToken(Company));
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(repository).toBeDefined();
  });

  describe('create', () => {
    it('should create a new company', async () => {
      const dto: CreateCompanyDto = {
        name: 'Acme Inc',
        country: 'US',
        registrationNumber: 'REG-123',
      };

      const expected: Company = {
        id: 1,
        ...dto,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as Company;

      mockRepository.create.mockReturnValue(expected);
      mockRepository.save.mockResolvedValue(expected);

      const result = await service.create(dto);

      expect(mockRepository.create).toHaveBeenCalledWith(dto);
      expect(mockRepository.save).toHaveBeenCalledWith(expected);
      expect(result).toEqual(expected);
    });
  });

  describe('findAll', () => {
    it('should return an array of companies', async () => {
      const expected: Company[] = [
        {
          id: 1,
          name: 'Acme Inc',
          country: 'US',
          registrationNumber: 'REG-123',
          createdAt: new Date(),
          updatedAt: new Date(),
        } as Company,
      ];

      mockRepository.find.mockResolvedValue(expected);

      const result = await service.findAll();
      expect(mockRepository.find).toHaveBeenCalled();
      expect(result).toEqual(expected);
    });
  });

  describe('findOne', () => {
    it('should return a company when found', async () => {
      const expected: Company = {
        id: 1,
        name: 'Acme Inc',
        country: 'US',
        registrationNumber: 'REG-123',
        createdAt: new Date(),
        updatedAt: new Date(),
      } as Company;

      mockRepository.findOne.mockResolvedValue(expected);

      const result = await service.findOne(1);
      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(result).toEqual(expected);
    });

    it('should throw when company not found', async () => {
      mockRepository.findOne.mockResolvedValue(undefined);
      await expect(service.findOne(999)).rejects.toThrow('Company 999 not found');
    });
  });

  describe('update', () => {
    it('should merge and save updates', async () => {
      const existing: Company = {
        id: 1,
        name: 'Acme Inc',
        country: 'US',
        registrationNumber: 'REG-123',
        createdAt: new Date(),
        updatedAt: new Date(),
      } as Company;

      const updates: UpdateCompanyDto = { country: 'CA' };
      const saved = { ...existing, ...updates } as Company;

      mockRepository.findOne.mockResolvedValue(existing);
      mockRepository.save.mockResolvedValue(saved);

      const result = await service.update(1, updates);
      expect(mockRepository.save).toHaveBeenCalledWith(saved);
      expect(result).toEqual(saved);
    });
  });

  describe('remove', () => {
    it('should remove the company', async () => {
      const existing: Company = {
        id: 1,
        name: 'Acme Inc',
        country: 'US',
        registrationNumber: 'REG-123',
        createdAt: new Date(),
        updatedAt: new Date(),
      } as Company;

      mockRepository.findOne.mockResolvedValue(existing);
      mockRepository.remove.mockResolvedValue(existing);

      await service.remove(1);
      expect(mockRepository.remove).toHaveBeenCalledWith(existing);
    });
  });
});


