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
import { JwtPayload } from '../decorators/current-user.decorator';
import { Request } from 'express';

export const OWNERSHIP_KEY = 'ownership';
export const OwnershipCheck = (resource: 'article' | 'order') =>
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

    if (user.role === UserRole.ADMIN) {
      return true;
    }

    const id = request.params.id;
    if (!id) return true;

    if (resource === 'article') {
      const article = await this.prisma.article.findFirst({
        where: { id, deletedAt: null },
      });
      if (!article) throw new ForbiddenException('Article not found');
      if (article.authorId !== user.sub) {
        throw new ForbiddenException('You can only access your own articles');
      }
    }

    if (resource === 'order') {
      const order = await this.prisma.order.findUnique({ where: { id } });
      if (!order) throw new ForbiddenException('Order not found');
      if (order.userId !== user.sub) {
        throw new ForbiddenException('You can only access your own orders');
      }
    }

    return true;
  }
}
