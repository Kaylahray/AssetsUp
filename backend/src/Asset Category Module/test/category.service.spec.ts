import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import {
  ConflictException,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { CategoryService } from "../src/category/category.service";
import { Category } from "../src/category/entities/category.entity";
import { CreateCategoryDto } from "../src/category/dto/create-category.dto";

describe("CategoryService", () => {
  let service: CategoryService;
  let repository: Repository<Category>;

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    count: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoryService,
        {
          provide: getRepositoryToken(Category),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<CategoryService>(CategoryService);
    repository = module.get<Repository<Category>>(getRepositoryToken(Category));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("create", () => {
    it("should create a category successfully", async () => {
      const createCategoryDto: CreateCategoryDto = {
        name: "Electronics",
        description: "Electronic devices",
      };

      const savedCategory = {
        id: "uuid-1",
        ...createCategoryDto,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockRepository.findOne.mockResolvedValue(null);
      mockRepository.create.mockReturnValue(savedCategory);
      mockRepository.save.mockResolvedValue(savedCategory);

      const result = await service.create(createCategoryDto);

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { name: createCategoryDto.name },
      });
      expect(mockRepository.create).toHaveBeenCalledWith({
        name: createCategoryDto.name,
        parent: null,
        description: createCategoryDto.description,
      });
      expect(result).toEqual(savedCategory);
    });

    it("should throw ConflictException if category name already exists", async () => {
      const createCategoryDto: CreateCategoryDto = {
        name: "Electronics",
      };

      const existingCategory = { id: "uuid-1", name: "Electronics" };
      mockRepository.findOne.mockResolvedValue(existingCategory);

      await expect(service.create(createCategoryDto)).rejects.toThrow(
        ConflictException
      );
      expect(mockRepository.save).not.toHaveBeenCalled();
    });

    it("should create category with parent", async () => {
      const parentCategory = {
        id: "parent-uuid",
        name: "Electronics",
      };

      const createCategoryDto: CreateCategoryDto = {
        name: "Smartphones",
        parentId: "parent-uuid",
      };

      const savedCategory = {
        id: "uuid-1",
        name: "Smartphones",
        parent: parentCategory,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockRepository.findOne
        .mockResolvedValueOnce(null) // Check for duplicate name
        .mockResolvedValueOnce(parentCategory); // Find parent
      mockRepository.create.mockReturnValue(savedCategory);
      mockRepository.save.mockResolvedValue(savedCategory);

      const result = await service.create(createCategoryDto);

      expect(result).toEqual(savedCategory);
    });

    it("should throw NotFoundException if parent category does not exist", async () => {
      const createCategoryDto: CreateCategoryDto = {
        name: "Smartphones",
        parentId: "non-existent-uuid",
      };

      mockRepository.findOne
        .mockResolvedValueOnce(null) // Check for duplicate name
        .mockResolvedValueOnce(null); // Parent not found

      await expect(service.create(createCategoryDto)).rejects.toThrow(
        NotFoundException
      );
    });
  });

  describe("findAll", () => {
    it("should return all categories", async () => {
      const categories = [
        { id: "uuid-1", name: "Electronics" },
        { id: "uuid-2", name: "Vehicles" },
      ];

      mockRepository.find.mockResolvedValue(categories);

      const result = await service.findAll();

      expect(mockRepository.find).toHaveBeenCalledWith({
        relations: ["parent"],
        order: { name: "ASC" },
      });
      expect(result).toEqual(categories);
    });

    it("should return categories with children when includeChildren is true", async () => {
      const categories = [{ id: "uuid-1", name: "Electronics", children: [] }];

      mockRepository.find.mockResolvedValue(categories);

      const result = await service.findAll(true);

      expect(mockRepository.find).toHaveBeenCalledWith({
        relations: ["parent", "children"],
        order: { name: "ASC" },
      });
      expect(result).toEqual(categories);
    });
  });

  describe("findOne", () => {
    it("should return category by id", async () => {
      const category = {
        id: "uuid-1",
        name: "Electronics",
        parent: null,
        children: [],
      };

      mockRepository.findOne.mockResolvedValue(category);

      const result = await service.findOne("uuid-1");

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: "uuid-1" },
        relations: ["parent", "children"],
      });
      expect(result).toEqual(category);
    });

    it("should throw NotFoundException if category not found", async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne("non-existent-uuid")).rejects.toThrow(
        NotFoundException
      );
    });
  });

  describe("remove", () => {
    it("should remove category successfully", async () => {
      const category = {
        id: "uuid-1",
        name: "Electronics",
        children: [],
      };

      mockRepository.findOne.mockResolvedValue(category);
      mockRepository.count.mockResolvedValue(0);
      mockRepository.remove.mockResolvedValue(category);

      await service.remove("uuid-1");

      expect(mockRepository.count).toHaveBeenCalledWith({
        where: { parent: { id: "uuid-1" } },
      });
      expect(mockRepository.remove).toHaveBeenCalledWith(category);
    });

    it("should throw BadRequestException if category has children", async () => {
      const category = {
        id: "uuid-1",
        name: "Electronics",
        children: [],
      };

      mockRepository.findOne.mockResolvedValue(category);
      mockRepository.count.mockResolvedValue(2); // Has children

      await expect(service.remove("uuid-1")).rejects.toThrow(
        BadRequestException
      );
      expect(mockRepository.remove).not.toHaveBeenCalled();
    });
  });
});
