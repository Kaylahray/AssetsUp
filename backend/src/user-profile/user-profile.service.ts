import { Injectable } from '@nestjs/common';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class UserProfileService {
  async getProfile(userId: string) {
    // TODO: Fetch user profile from DB
    return {};
  }

  async updateProfile(userId: string, updateProfileDto: UpdateProfileDto) {
    // TODO: Update user profile in DB
    return {};
  }

  async uploadAvatar(userId: string, file: any) {
    // TODO: Save avatar file and update user profile
    return {};
  }
}
