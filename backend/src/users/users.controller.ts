import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiBody } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({ status: 201, description: 'User created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 409, description: 'Email already exists' })
  @ApiBody({ type: CreateUserDto })
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all users with pagination' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiQuery({ name: 'role', required: false, enum: ['admin', 'user', 'manager'] })
  @ApiResponse({ status: 200, description: 'Users retrieved successfully' })
  findAll(@Query('page') page = 1, @Query('limit') limit = 10, @Query('role') role?: string) {
    return this.usersService.findAll(Number(page), Number(limit), role);
  }

  @Patch(':id/department')
  @ApiOperation({ summary: 'Map user to department' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'User mapped to department successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiBody({ schema: { properties: { department: { type: 'object' } } } })
  mapDepartment(@Param('id') id: string, @Body('department') department: any) {
    return this.usersService.mapUserToDepartment(id, department);
  }

  @Patch(':id/company')
  @ApiOperation({ summary: 'Map user to company' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'User mapped to company successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiBody({ schema: { properties: { companyId: { type: 'number', example: 1 } } } })
  mapCompany(@Param('id') id: string, @Body('companyId') companyId: number) {
    return this.usersService.mapUserToCompany(id, companyId);
  }

  @Patch(':id/branch')
  @ApiOperation({ summary: 'Map user to branch' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'User mapped to branch successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiBody({ schema: { properties: { branchId: { type: 'number', example: 3 } } } })
  mapBranch(@Param('id') id: string, @Body('branchId') branchId: number) {
    return this.usersService.mapUserToBranch(id, branchId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'User retrieved successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update user details' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'User updated successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiBody({ type: UpdateUserDto })
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete user' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'User deleted successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}