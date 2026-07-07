import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class LikesService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Toggle like on a content item.
   * If already liked, remove like. If not liked, add like.
   */
  async toggleLike(contentId: string, userId: string): Promise<{ liked: boolean }> {
    const content = await this.prisma.content.findFirst({
      where: { id: contentId, deletedAt: null },
    });

    if (!content) {
      throw new NotFoundException('Content not found.');
    }

    const existingLike = await this.prisma.like.findUnique({
      where: {
        contentId_userId: {
          contentId,
          userId,
        },
      },
    });

    if (existingLike) {
      await this.prisma.like.delete({
        where: {
          contentId_userId: {
            contentId,
            userId,
          },
        },
      });
      return { liked: false };
    } else {
      await this.prisma.like.create({
        data: {
          contentId,
          userId,
        },
      });
      return { liked: true };
    }
  }

  /**
   * Get the like count and whether the user has liked it.
   */
  async getLikesInfo(contentId: string, userId?: string): Promise<{ count: number; liked: boolean }> {
    const content = await this.prisma.content.findFirst({
      where: { id: contentId, deletedAt: null },
    });

    if (!content) {
      throw new NotFoundException('Content not found.');
    }

    const [count, userLike] = await Promise.all([
      this.prisma.like.count({
        where: { contentId },
      }),
      userId
        ? this.prisma.like.findUnique({
            where: {
              contentId_userId: {
                contentId,
                userId,
              },
            },
          })
        : null,
    ]);

    return {
      count,
      liked: !!userLike,
    };
  }
}
