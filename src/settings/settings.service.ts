import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateSettingDto } from './dto/setting.dto';

@Injectable()
export class SettingsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get all public settings (e.g. site description, social links).
   * Public endpoint.
   */
  async getPublicSettings() {
    const settings = await this.prisma.siteSetting.findMany({
      where: { isPublic: true },
      select: {
        key: true,
        value: true,
        label: true,
        group: true,
      },
    });

    // Format as a simple key-value dictionary for frontend convenience
    return settings.reduce(
      (acc, s) => {
        acc[s.key] = s.value;
        return acc;
      },
      {} as Record<string, string>,
    );
  }

  /**
   * ADMIN: Get a specific site setting by key.
   */
  async getSettingByKey(key: string) {
    const setting = await this.prisma.siteSetting.findUnique({
      where: { key },
    });

    if (!setting) {
      throw new NotFoundException(`Setting with key "${key}" not found.`);
    }

    return setting;
  }

  /**
   * ADMIN: Get all settings (public & private).
   */
  async getAllSettings() {
    return this.prisma.siteSetting.findMany({
      orderBy: { key: 'asc' },
    });
  }

  /**
   * ADMIN: Create or update a site setting by key (upsert).
   */
  async updateSetting(key: string, dto: UpdateSettingDto) {
    return this.prisma.siteSetting.upsert({
      where: { key },
      update: {
        value: dto.value,
        ...(dto.label !== undefined && { label: dto.label }),
        ...(dto.group !== undefined && { group: dto.group }),
        ...(dto.isPublic !== undefined && { isPublic: dto.isPublic }),
      },
      create: {
        key,
        value: dto.value,
        label: dto.label || key,
        group: dto.group || 'general',
        isPublic: dto.isPublic ?? false,
      },
    });
  }
}
