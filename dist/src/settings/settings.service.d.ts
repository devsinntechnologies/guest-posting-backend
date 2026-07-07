import { PrismaService } from '../prisma/prisma.service';
import { UpdateSettingDto } from './dto/setting.dto';
export declare class SettingsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getPublicSettings(): Promise<Record<string, string>>;
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
