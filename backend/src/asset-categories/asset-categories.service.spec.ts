import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AssetCategoriesService } from './asset-categories.service';
import { AssetCategory } from './asset-category.entity';
import { CreateAssetCategoryDto } from './dto/asset-category.dto';

describe('AssetCategoriesService', () => {
  let service: AssetCategoriesService;
  let repository: Repository<AssetCategory>;

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
        AssetCategoriesService,
        {
          provide: getRepositoryToken(AssetCategory),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<AssetCategoriesService>(AssetCategoriesService);
    repository = module.get<Repository<AssetCategory>>(getRepositoryToken(AssetCategory));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new asset category', async () => {
      const createDto: CreateAssetCategoryDto = {
        name: 'IT Equipment',
        description: 'Computers and IT equipment',
      };

      const expectedCategory = {
        id: 1,
        ...createDto,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockRepository.create.mockReturnValue(expectedCategory);
      mockRepository.save.mockResolvedValue(expectedCategory);

      const result = await service.create(createDto);

      expect(mockRepository.create).toHaveBeenCalledWith(createDto);
      expect(mockRepository.save).toHaveBeenCalledWith(expectedCategory);
      expect(result).toEqual(expectedCategory);
    });
  });

  describe('findAll', () => {
    it('should return an array of asset categories', async () => {
      const expectedCategories = [
        {
          id: 1,
          name: 'IT Equipment',
          description: 'Computers and IT equipment',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockRepository.find.mockResolvedValue(expectedCategories);

      const result = await service.findAll();

      expect(mockRepository.find).toHaveBeenCalledWith({
        order: { createdAt: 'DESC' },
      });
      expect(result).toEqual(expectedCategories);
    });
  });
});
