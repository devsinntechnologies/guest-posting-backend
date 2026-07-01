import { PrismaService } from '../prisma/prisma.service';
import { CreateLinkInsertionDto, UpdateLinkInsertionStatusDto } from './dto/link-insertions.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { UserRole } from '@prisma/client';
export declare class LinkInsertionsService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(query: PaginationDto, userId?: string, role?: UserRole): Promise<import("../common/dto/pagination.dto").PaginatedResult<{
        payment: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            currency: string;
            status: import("@prisma/client").$Enums.OrderStatus;
            gatewayTransactionId: string | null;
            userId: string;
            packageId: string | null;
            articleId: string | null;
            amount: import("@prisma/client/runtime/library").Decimal;
            paymentGateway: string;
            invoiceUrl: string | null;
        } | null;
        requestedBy: {
            id: string;
            email: string;
            name: string;
        };
        targetArticle: {
            id: string;
            slug: string;
            title: string;
        };
    } & {
        id: string;
        createdAt: Date;
        price: import("@prisma/client/runtime/library").Decimal;
        status: import("@prisma/client").$Enums.LinkInsertionStatus;
        anchorText: string;
        targetArticleId: string;
        destinationUrl: string;
        paymentId: string | null;
        requestedById: string;
    }>>;
    create(dto: CreateLinkInsertionDto, userId: string): Promise<{
        targetArticle: {
            id: string;
            slug: string;
            title: string;
        };
    } & {
        id: string;
        createdAt: Date;
        price: import("@prisma/client/runtime/library").Decimal;
        status: import("@prisma/client").$Enums.LinkInsertionStatus;
        anchorText: string;
        targetArticleId: string;
        destinationUrl: string;
        paymentId: string | null;
        requestedById: string;
    }>;
    updateStatus(id: string, dto: UpdateLinkInsertionStatusDto): Promise<{
        id: string;
        createdAt: Date;
        price: import("@prisma/client/runtime/library").Decimal;
        status: import("@prisma/client").$Enums.LinkInsertionStatus;
        anchorText: string;
        targetArticleId: string;
        destinationUrl: string;
        paymentId: string | null;
        requestedById: string;
    }>;
}
