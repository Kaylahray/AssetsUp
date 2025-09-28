import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DepartmentsService } from './departments.service';
import { Department } from './department.entity';
import { CreateDepartmentDto } from './dto/department.dto';

describe('DepartmentsService', () => {
  let service: DepartmentsService;
  let repository: Repository<Department>;

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
        DepartmentsService,
        {
          provide: getRepositoryToken(Department),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<DepartmentsService>(DepartmentsService);
    repository = module.get<Repository<Department>>(getRepositoryToken(Department));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new department', async () => {
      const createDto: CreateDepartmentDto = {
        name: 'Engineering',
        companyId: 1,
        description: 'Software development department',
      };

      const expectedDepartment = {
        id: 1,
        ...createDto,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockRepository.create.mockReturnValue(expectedDepartment);
      mockRepository.save.mockResolvedValue(expectedDepartment);

      const result = await service.create(createDto);

      expect(mockRepository.create).toHaveBeenCalledWith(createDto);
      expect(mockRepository.save).toHaveBeenCalledWith(expectedDepartment);
      expect(result).toEqual(expectedDepartment);
    });
  });

  describe('findByCompany', () => {
    it('should return departments for a specific company', async () => {
      const companyId = 1;
      const expectedDepartments = [
        {
          id: 1,
          name: 'Engineering',
          companyId: 1,
          description: 'Software development department',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockRepository.find.mockResolvedValue(expectedDepartments);

      const result = await service.findByCompany(companyId);

      expect(mockRepository.find).toHaveBeenCalledWith({
        where: { companyId },
        order: { createdAt: 'DESC' },
      });
      expect(result).toEqual(expectedDepartments);
    });
  });

  describe('getDepartmentStats', () => {
    it('should return department statistics', async () => {
      const departmentId = 1;
      const expectedStats = { userCount: 0, assetCount: 0 };

      mockRepository.findOne.mockResolvedValue({
        id: departmentId,
        name: 'Engineering',
        companyId: 1,
      });

      const result = await service.getDepartmentStats(departmentId);

      expect(result).toEqual(expectedStats);
    });
  });
});
