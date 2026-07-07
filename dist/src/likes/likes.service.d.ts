import { PrismaService } from '../prisma/prisma.service';
export declare class LikesService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    toggleLike(contentId: string, userId: string): Promise<{
        liked: boolean;
    }>;
    getLikesInfo(contentId: string, userId?: string): Promise<{
        count: number;
        liked: boolean;
    }>;
}
