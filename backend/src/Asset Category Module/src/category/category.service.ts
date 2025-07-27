import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Category } from "./entities/category.entity";
import { CreateCategoryDto } from "./dto/create-category.dto";
import { UpdateCategoryDto } from "./dto/update-category.dto";

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>
  ) {}

  async create(createCategoryDto: CreateCategoryDto): Promise<Category> {
    const { name, parentId, ...rest } = createCategoryDto;

    // Check if category name already exists
    const existingCategory = await this.categoryRepository.findOne({
      where: { name },
    });

    if (existingCategory) {
      throw new ConflictException(
        `Category with name '${name}' already exists`
      );
    }

    // Validate parent category if provided
    let parent: Category | null = null;
    if (parentId) {
      parent = await this.categoryRepository.findOne({
        where: { id: parentId },
      });
      if (!parent) {
        throw new NotFoundException(
          `Parent category with ID '${parentId}' not found`
        );
      }
    }

    const category = this.categoryRepository.create({
      name,
      parent,
      ...rest,
    });

    return await this.categoryRepository.save(category);
  }

  async findAll(includeChildren = false): Promise<Category[]> {
    const relations = includeChildren ? ["parent", "children"] : ["parent"];

    return await this.categoryRepository.find({
      relations,
      order: { name: "ASC" },
    });
  }

  async findRootCategories(): Promise<Category[]> {
    return await this.categoryRepository.find({
      where: { parent: null },
      relations: ["children"],
      order: { name: "ASC" },
    });
  }

  async findOne(id: string): Promise<Category> {
    const category = await this.categoryRepository.findOne({
      where: { id },
      relations: ["parent", "children"],
    });

    if (!category) {
      throw new NotFoundException(`Category with ID '${id}' not found`);
    }

    return category;
  }

  async update(
    id: string,
    updateCategoryDto: UpdateCategoryDto
  ): Promise<Category> {
    const category = await this.findOne(id);
    const { name, parentId, ...rest } = updateCategoryDto;

    // Check for name conflicts if name is being updated
    if (name && name !== category.name) {
      const existingCategory = await this.categoryRepository.findOne({
        where: { name },
      });
      if (existingCategory) {
        throw new ConflictException(
          `Category with name '${name}' already exists`
        );
      }
    }

    // Handle parent category update
    if (parentId !== undefined) {
      if (parentId === null) {
        category.parent = null;
      } else if (parentId === id) {
        throw new BadRequestException("Category cannot be its own parent");
      } else {
        const parent = await this.categoryRepository.findOne({
          where: { id: parentId },
        });
        if (!parent) {
          throw new NotFoundException(
            `Parent category with ID '${parentId}' not found`
          );
        }

        // Check for circular reference
        if (await this.wouldCreateCircularReference(id, parentId)) {
          throw new BadRequestException(
            "This would create a circular reference"
          );
        }

        category.parent = parent;
      }
    }

    // Update other fields
    Object.assign(category, { name, ...rest });

    return await this.categoryRepository.save(category);
  }

  async remove(id: string): Promise<void> {
    const category = await this.findOne(id);

    // Check if category has children
    const childrenCount = await this.categoryRepository.count({
      where: { parent: { id } },
    });

    if (childrenCount > 0) {
      throw new BadRequestException(
        "Cannot delete category that has child categories. Delete or reassign children first."
      );
    }

    await this.categoryRepository.remove(category);
  }

  private async wouldCreateCircularReference(
    categoryId: string,
    newParentId: string
  ): Promise<boolean> {
    let currentParentId = newParentId;

    while (currentParentId) {
      if (currentParentId === categoryId) {
        return true;
      }

      const parent = await this.categoryRepository.findOne({
        where: { id: currentParentId },
        relations: ["parent"],
      });

      currentParentId = parent?.parent?.id;
    }

    return false;
  }

  async getCategoryTree(): Promise<Category[]> {
    const rootCategories = await this.categoryRepository.find({
      where: { parent: null },
      relations: ["children"],
      order: { name: "ASC" },
    });

    // Recursively load all children
    for (const category of rootCategories) {
      await this.loadCategoryChildren(category);
    }

    return rootCategories;
  }

  private async loadCategoryChildren(category: Category): Promise<void> {
    const children = await this.categoryRepository.find({
      where: { parent: { id: category.id } },
      relations: ["children"],
      order: { name: "ASC" },
    });

    category.children = children;

    for (const child of children) {
      await this.loadCategoryChildren(child);
    }
  }
}
