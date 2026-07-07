import { CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../../prisma/prisma.service';
export declare const OWNERSHIP_KEY = "ownership";
export declare const OwnershipCheck: (resource: "content") => import("@nestjs/common").CustomDecorator<string>;
export declare class OwnershipGuard implements CanActivate {
    private reflector;
    private prisma;
    constructor(reflector: Reflector, prisma: PrismaService);
    canActivate(context: ExecutionContext): Promise<boolean>;
}
