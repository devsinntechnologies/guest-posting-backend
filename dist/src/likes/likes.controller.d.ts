import { LikesService } from './likes.service';
import type { JwtPayload } from '../common/decorators/current-user.decorator';
export declare class LikesController {
    private readonly likesService;
    constructor(likesService: LikesService);
    toggleLike(contentId: string, user: JwtPayload): Promise<{
        liked: boolean;
    }>;
    getLikes(contentId: string, user?: JwtPayload): Promise<{
        count: number;
        liked: boolean;
    }>;
}
