import { SettingsService } from './settings.service';
import { UpdateSettingDto } from './dto/setting.dto';
export declare class SettingsController {
    private readonly settingsService;
    constructor(settingsService: SettingsService);
    getPublicSettings(): Promise<Record<string, string>>;
    getAllSettings(): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        key: string;
        value: string;
        label: string | null;
        group: string | null;
        isPublic: boolean;
    }[]>;
    getSettingByKey(key: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        key: string;
        value: string;
        label: string | null;
        group: string | null;
        isPublic: boolean;
    }>;
    updateSetting(key: string, dto: UpdateSettingDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        key: string;
        value: string;
        label: string | null;
        group: string | null;
        isPublic: boolean;
    }>;
}
