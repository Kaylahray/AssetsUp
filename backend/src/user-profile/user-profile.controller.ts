import { Controller, Get, Put, Body, UseInterceptors, UploadedFile, Post, Req } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UserProfileService } from './user-profile.service';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiBody, ApiConsumes } from '@nestjs/swagger';

@ApiTags('User Profile')
@ApiBearerAuth()
@Controller('profile')
export class UserProfileController {
  constructor(private readonly userProfileService: UserProfileService) {}

  @Get()
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'User profile returned successfully.' })
  getProfile(@Req() req) {
    // TODO: Get user from request
    return this.userProfileService.getProfile(req.user.id);
  }

  @Put()
  @ApiOperation({ summary: 'Update user profile' })
  @ApiBody({ type: UpdateProfileDto })
  @ApiResponse({ status: 200, description: 'User profile updated successfully.' })
  updateProfile(@Req() req, @Body() updateProfileDto: UpdateProfileDto) {
    return this.userProfileService.updateProfile(req.user.id, updateProfileDto);
  }

  @Post('avatar')
  @ApiOperation({ summary: 'Upload user avatar' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Avatar image file',
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Avatar uploaded successfully.' })
  @UseInterceptors(FileInterceptor('file'))
  uploadAvatar(@Req() req, @UploadedFile() file: any) {
    return this.userProfileService.uploadAvatar(req.user.id, file);
  }
}