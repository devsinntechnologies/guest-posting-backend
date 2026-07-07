import {
  Body,
  Controller,
  Get,
  Param,
  Put,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { SettingsService } from './settings.service';
import { UpdateSettingDto } from './dto/setting.dto';
import { Public, Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';

@ApiTags('Site Settings')
@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  /**
   * Get public settings.
   * Public.
   */
  @Get()
  @Public()
  @ApiOperation({ summary: 'Public — Get public site settings dictionary' })
  getPublicSettings() {
    return this.settingsService.getPublicSettings();
  }

  /**
   * Get all site settings.
   * ADMIN only.
   */
  @Get('admin')
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'ADMIN — Get all site settings' })
  getAllSettings() {
    return this.settingsService.getAllSettings();
  }

  /**
   * Get site setting by key.
   * ADMIN only.
   */
  @Get(':key')
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'ADMIN — Get site setting by key' })
  @ApiParam({ name: 'key', description: 'Setting key identifier' })
  getSettingByKey(@Param('key') key: string) {
    return this.settingsService.getSettingByKey(key);
  }

  /**
   * Upsert site setting by key.
   * ADMIN only.
   */
  @Put(':key')
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'ADMIN — Create or update site setting' })
  @ApiParam({ name: 'key', description: 'Setting key identifier' })
  updateSetting(
    @Param('key') key: string,
    @Body() dto: UpdateSettingDto,
  ) {
    return this.settingsService.updateSetting(key, dto);
  }
}
