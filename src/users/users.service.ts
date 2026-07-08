import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import {
  AdminUpdateUserDto,
  AdminUserQueryDto,
  ChangePasswordDto,
  UpdateProfileDto,
} from './dto/user.dto';
import {
  createPaginatedResult,
  PaginatedResult,
} from '../common/dto/paginated-result.dto';
import { getPrismaSkipTake } from '../common/utils/pagination.util';
import { SubscriptionStatus, User } from '@prisma/client';

// Fields always excluded from public-facing responses
const USER_SAFE_SELECT = {
  id: true,
  name: true,
  email: true,
  role: true,
  avatarUrl: true,
  bio: true,
  website: true,
  linkedin: true,
  twitter: true,
  emailVerifiedAt: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
};

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * ADMIN: List all users with pagination, search, and filters.
   */
  async findAll(
    query: AdminUserQueryDto,
  ): Promise<PaginatedResult<Partial<User>>> {
    const { page, limit, search, role, sortOrder, isActive } = query;
    const { skip, take } = getPrismaSkipTake(page, limit);

    const where = {
      deletedAt: null,
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' as const } },
          { email: { contains: search, mode: 'insensitive' as const } },
        ],
      }),
      ...(role && { role }),
      ...(isActive !== undefined && { isActive }),
    };

    const orderBy = { createdAt: sortOrder ?? 'desc' } as const;

    const [items, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        select: {
          ...USER_SAFE_SELECT,
          deletedAt: true,
          subscriptions: {
            where: { status: SubscriptionStatus.ACTIVE },
            take: 1,
            orderBy: { createdAt: 'desc' },
          },
        },
        skip,
        take,
        orderBy,
      }),
      this.prisma.user.count({ where }),
    ]);

    return createPaginatedResult(items, total, page, limit);
  }

  /**
   * Get a single user's public profile by ID.
   */
  async findById(id: string): Promise<Partial<User>> {
    const user = await this.prisma.user.findFirst({
      where: { id, deletedAt: null },
      select: USER_SAFE_SELECT,
    });

    if (!user) {
      throw new NotFoundException('User not found.');
    }

    return user;
  }

  /**
   * Get the authenticated user's own full profile.
   */
  async getMyProfile(userId: string): Promise<Partial<User>> {
    const user = await this.prisma.user.findFirst({
      where: { id: userId, deletedAt: null },
      select: {
        ...USER_SAFE_SELECT,
        subscriptions: {
          where: { status: SubscriptionStatus.ACTIVE },
          take: 1,
          orderBy: { endDate: 'desc' },
          include: { plan: true },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found.');
    }

    return user;
  }

  /**
   * Update the authenticated user's own profile.
   */
  async updateProfile(
    userId: string,
    dto: UpdateProfileDto,
  ): Promise<Partial<User>> {
    const user = await this.prisma.user.findFirst({
      where: { id: userId, deletedAt: null },
    });

    if (!user) {
      throw new NotFoundException('User not found.');
    }

    return this.prisma.user.update({
      where: { id: userId },
      data: {
        ...(dto.name && { name: dto.name }),
        ...(dto.bio !== undefined && { bio: dto.bio }),
        ...(dto.website !== undefined && { website: dto.website }),
        ...(dto.linkedin !== undefined && { linkedin: dto.linkedin }),
        ...(dto.twitter !== undefined && { twitter: dto.twitter }),
        ...(dto.avatarUrl !== undefined && { avatarUrl: dto.avatarUrl }),
      },
      select: USER_SAFE_SELECT,
    });
  }

  /**
   * Change the authenticated user's password.
   */
  async changePassword(
    userId: string,
    dto: ChangePasswordDto,
  ): Promise<{ message: string }> {
    const user = await this.prisma.user.findFirst({
      where: { id: userId, deletedAt: null },
    });

    if (!user) {
      throw new NotFoundException('User not found.');
    }

    const valid = await bcrypt.compare(dto.currentPassword, user.password);
    if (!valid) {
      throw new BadRequestException('Current password is incorrect.');
    }

    if (dto.currentPassword === dto.newPassword) {
      throw new BadRequestException(
        'New password must be different from the current password.',
      );
    }

    const hashed = await bcrypt.hash(dto.newPassword, 12);

    await this.prisma.user.update({
      where: { id: userId },
      data: { password: hashed },
    });

    // Revoke all refresh tokens on password change
    await this.prisma.refreshToken.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });

    return { message: 'Password changed successfully. Please log in again.' };
  }

  /**
   * ADMIN: Update user role or active status.
   */
  async adminUpdateUser(
    id: string,
    dto: AdminUpdateUserDto,
  ): Promise<Partial<User>> {
    const user = await this.prisma.user.findFirst({
      where: { id, deletedAt: null },
    });

    if (!user) {
      throw new NotFoundException('User not found.');
    }

    return this.prisma.user.update({
      where: { id },
      data: {
        ...(dto.isActive !== undefined && { isActive: dto.isActive }),
        ...(dto.role && { role: dto.role }),
      },
      select: USER_SAFE_SELECT,
    });
  }

  /**
   * ADMIN: Soft-delete a user account.
   */
  async softDelete(
    adminId: string,
    targetUserId: string,
  ): Promise<{ message: string }> {
    if (adminId === targetUserId) {
      throw new ForbiddenException('You cannot delete your own account.');
    }

    const user = await this.prisma.user.findFirst({
      where: { id: targetUserId, deletedAt: null },
    });

    if (!user) {
      throw new NotFoundException('User not found.');
    }

    await this.prisma.user.update({
      where: { id: targetUserId },
      data: {
        deletedAt: new Date(),
        isActive: false,
      },
    });

    return { message: 'User account has been deactivated.' };
  }

  /**
   * Check if a user has an active subscription.
   * Used internally across modules.
   */
  async hasActiveSubscription(userId: string): Promise<boolean> {
    const now = new Date();
    const sub = await this.prisma.subscription.findFirst({
      where: {
        userId,
        status: SubscriptionStatus.ACTIVE,
        startDate: { lte: now },
        endDate: { gte: now },
      },
    });
    return !!sub;
  }
}
