import { Controller, Get, Put, Body, UseInterceptors, UploadedFile, Post, Req } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UserProfileService } from './user-profile.service';

@Controller('profile')
export class UserProfileController {
  constructor(private readonly userProfileService: UserProfileService) {}

  @Get()
  getProfile(@Req() req) {
    // TODO: Get user from request
    return this.userProfileService.getProfile(req.user.id);
  }

  @Put()
  updateProfile(@Req() req, @Body() updateProfileDto: UpdateProfileDto) {
    return this.userProfileService.updateProfile(req.user.id, updateProfileDto);
  }

  @Post('avatar')
  @UseInterceptors(FileInterceptor('file'))
  uploadAvatar(@Req() req, @UploadedFile() file: any) {
    return this.userProfileService.uploadAvatar(req.user.id, file);
  }
}
