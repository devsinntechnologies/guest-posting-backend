import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  SetMetadata,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../../prisma/prisma.service';
import { UserRole } from '@prisma/client';
import { IS_PUBLIC_KEY } from '../decorators/roles.decorator';
import type { JwtPayload } from '../decorators/current-user.decorator';
import { Request } from 'express';

export const OWNERSHIP_KEY = 'ownership';
export const OwnershipCheck = (resource: 'content') =>
  SetMetadata(OWNERSHIP_KEY, resource);

type AuthedRequest = Request & {
  user?: JwtPayload;
  params: { id?: string };
};

@Injectable()
export class OwnershipGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const resource = this.reflector.getAllAndOverride<string>(OWNERSHIP_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!resource) return true;

    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const request = context.switchToHttp().getRequest<AuthedRequest>();
    const user = request.user;
    if (!user) throw new ForbiddenException('Access denied');

    // ADMINs bypass ownership checks
    if (user.role === UserRole.ADMIN) {
      return true;
    }

    const id = request.params.id;
    if (!id) return true;

    if (resource === 'content') {
      const content = await this.prisma.content.findFirst({
        where: { id, deletedAt: null },
      });
      if (!content) throw new ForbiddenException('Content not found');
      if (content.authorId !== user.sub) {
        throw new ForbiddenException('You can only access your own content');
      }
    }

    return true;
  }
}
