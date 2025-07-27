import { Test, TestingModule } from "@nestjs/testing";
import { CategoryController } from "../src/category/category.controller";
import { CategoryService } from "../src/category/category.service";
import { CreateCategoryDto } from "../src/category/dto/create-category.dto";
import { UpdateCategoryDto } from "../src/category/dto/update-category.dto";

describe("CategoryController", () => {
  let controller: CategoryController;
  let service: CategoryService;

  const mockCategoryService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    findRootCategories: jest.fn(),
    getCategoryTree: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CategoryController],
      providers: [
        {
          provide: CategoryService,
          useValue: mockCategoryService,
        },
      ],
    }).compile();

    controller = module.get<CategoryController>(CategoryController);
    service = module.get<CategoryService>(CategoryService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("create", () => {
    it("should create a category", async () => {
      const createCategoryDto: CreateCategoryDto = {
        name: "Electronics",
        description: "Electronic devices",
      };

      const expectedResult = {
        id: "uuid-1",
        ...createCategoryDto,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockCategoryService.create.mockResolvedValue(expectedResult);

      const result = await controller.create(createCategoryDto);

      expect(service.create).toHaveBeenCalledWith(createCategoryDto);
      expect(result).toEqual(expectedResult);
    });
  });

  describe("findAll", () => {
    it("should return all categories", async () => {
      const expectedResult = [
        { id: "uuid-1", name: "Electronics" },
        { id: "uuid-2", name: "Vehicles" },
      ];

      mockCategoryService.findAll.mockResolvedValue(expectedResult);

      const result = await controller.findAll();

      expect(service.findAll).toHaveBeenCalledWith(false);
      expect(result).toEqual(expectedResult);
    });

    it("should return categories with children when includeChildren is true", async () => {
      const expectedResult = [
        { id: "uuid-1", name: "Electronics", children: [] },
      ];

      mockCategoryService.findAll.mockResolvedValue(expectedResult);

      const result = await controller.findAll("true");

      expect(service.findAll).toHaveBeenCalledWith(true);
      expect(result).toEqual(expectedResult);
    });
  });

  describe("findOne", () => {
    it("should return a category by id", async () => {
      const expectedResult = {
        id: "uuid-1",
        name: "Electronics",
        parent: null,
        children: [],
      };

      mockCategoryService.findOne.mockResolvedValue(expectedResult);

      const result = await controller.findOne("uuid-1");

      expect(service.findOne).toHaveBeenCalledWith("uuid-1");
      expect(result).toEqual(expectedResult);
    });
  });

  describe("update", () => {
    it("should update a category", async () => {
      const updateCategoryDto: UpdateCategoryDto = {
        name: "Updated Electronics",
      };

      const expectedResult = {
        id: "uuid-1",
        name: "Updated Electronics",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockCategoryService.update.mockResolvedValue(expectedResult);

      const result = await controller.update("uuid-1", updateCategoryDto);

      expect(service.update).toHaveBeenCalledWith("uuid-1", updateCategoryDto);
      expect(result).toEqual(expectedResult);
    });
  });

  describe("remove", () => {
    it("should remove a category", async () => {
      mockCategoryService.remove.mockResolvedValue(undefined);

      await controller.remove("uuid-1");

      expect(service.remove).toHaveBeenCalledWith("uuid-1");
    });
  });

  describe("getCategoryTree", () => {
    it("should return category tree", async () => {
      const expectedResult = [
        {
          id: "uuid-1",
          name: "Electronics",
          children: [{ id: "uuid-2", name: "Smartphones", children: [] }],
        },
      ];

      mockCategoryService.getCategoryTree.mockResolvedValue(expectedResult);

      const result = await controller.getCategoryTree();

      expect(service.getCategoryTree).toHaveBeenCalled();
      expect(result).toEqual(expectedResult);
    });
  });

  describe("findRootCategories", () => {
    it("should return root categories", async () => {
      const expectedResult = [
        {
          id: "uuid-1",
          name: "Electronics",
          children: [],
        },
      ];

      mockCategoryService.findRootCategories.mockResolvedValue(expectedResult);

      const result = await controller.findRootCategories();

      expect(service.findRootCategories).toHaveBeenCalled();
      expect(result).toEqual(expectedResult);
    });
  });
});
