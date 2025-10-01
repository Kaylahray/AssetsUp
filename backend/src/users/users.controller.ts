import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  findAll(@Query('page') page = 1, @Query('limit') limit = 10, @Query('role') role?: string) {
    return this.usersService.findAll(Number(page), Number(limit), role);
  }
  @Patch(':id/department')
  mapDepartment(@Param('id') id: string, @Body('department') department: any) {
    return this.usersService.mapUserToDepartment(id, department);
  }

  @Patch(':id/company')
  mapCompany(@Param('id') id: string, @Body('companyId') companyId: number) {
    return this.usersService.mapUserToCompany(id, companyId);
  }

  @Patch(':id/branch')
  mapBranch(@Param('id') id: string, @Body('branchId') branchId: number) {
    return this.usersService.mapUserToBranch(id, branchId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}
