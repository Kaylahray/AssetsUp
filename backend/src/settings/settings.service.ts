import { Injectable } from '@nestjs/common';
import { CreateSettingsDto } from './dto/create-settings.dto';
import { UpdateSettingsDto } from './dto/update-settings.dto';

@Injectable()
export class SettingsService {
  private settings = [];

  findAll() {
    return this.settings;
  }

  findOne(id: string) {
    return this.settings.find(s => s.id === id);
  }

  create(createSettingsDto: CreateSettingsDto) {
    const newSetting = { id: Date.now().toString(), ...createSettingsDto };
    this.settings.push(newSetting);
    return newSetting;
  }

  update(id: string, updateSettingsDto: UpdateSettingsDto) {
    const setting = this.findOne(id);
    if (setting) {
      Object.assign(setting, updateSettingsDto);
    }
    return setting;
  }

  remove(id: string) {
    const idx = this.settings.findIndex(s => s.id === id);
    if (idx > -1) {
      return this.settings.splice(idx, 1);
    }
    return null;
  }
}
