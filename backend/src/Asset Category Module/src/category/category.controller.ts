import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from "@nestjs/swagger";
import { CategoryService } from "./category.service";
import { CreateCategoryDto } from "./dto/create-category.dto";
import { UpdateCategoryDto } from "./dto/update-category.dto";
import { CategoryResponseDto } from "./dto/category-response.dto";

@ApiTags("categories")
@Controller("categories")
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post()
  @ApiOperation({ summary: "Create a new category" })
  @ApiResponse({
    status: 201,
    description: "Category created successfully",
    type: CategoryResponseDto,
  })
  @ApiResponse({
    status: 409,
    description: "Category with this name already exists",
  })
  async create(@Body() createCategoryDto: CreateCategoryDto) {
    return await this.categoryService.create(createCategoryDto);
  }

  @Get()
  @ApiOperation({ summary: "Get all categories" })
  @ApiQuery({
    name: "includeChildren",
    required: false,
    type: Boolean,
    description: "Include child categories in response",
  })
  @ApiResponse({
    status: 200,
    description: "Categories retrieved successfully",
    type: [CategoryResponseDto],
  })
  async findAll(@Query("includeChildren") includeChildren?: string) {
    const include = includeChildren === "true";
    return await this.categoryService.findAll(include);
  }

  @Get("tree")
  @ApiOperation({ summary: "Get category tree structure" })
  @ApiResponse({
    status: 200,
    description: "Category tree retrieved successfully",
    type: [CategoryResponseDto],
  })
  async getCategoryTree() {
    return await this.categoryService.getCategoryTree();
  }

  @Get("root")
  @ApiOperation({ summary: "Get root categories (categories without parent)" })
  @ApiResponse({
    status: 200,
    description: "Root categories retrieved successfully",
    type: [CategoryResponseDto],
  })
  async findRootCategories() {
    return await this.categoryService.findRootCategories();
  }

  @Get(":id")
  @ApiOperation({ summary: "Get category by ID" })
  @ApiParam({ name: "id", description: "Category ID" })
  @ApiResponse({
    status: 200,
    description: "Category retrieved successfully",
    type: CategoryResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: "Category not found",
  })
  async findOne(@Param("id", ParseUUIDPipe) id: string) {
    return await this.categoryService.findOne(id);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update category" })
  @ApiParam({ name: "id", description: "Category ID" })
  @ApiResponse({
    status: 200,
    description: "Category updated successfully",
    type: CategoryResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: "Category not found",
  })
  @ApiResponse({
    status: 409,
    description: "Category with this name already exists",
  })
  async update(
    @Param("id", ParseUUIDPipe) id: string,
    @Body() updateCategoryDto: UpdateCategoryDto
  ) {
    return await this.categoryService.update(id, updateCategoryDto);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Delete category" })
  @ApiParam({ name: "id", description: "Category ID" })
  @ApiResponse({
    status: 204,
    description: "Category deleted successfully",
  })
  @ApiResponse({
    status: 404,
    description: "Category not found",
  })
  @ApiResponse({
    status: 400,
    description: "Cannot delete category with children",
  })
  async remove(@Param("id", ParseUUIDPipe) id: string) {
    await this.categoryService.remove(id);
  }
}
