"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcrypt = __importStar(require("bcrypt"));
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('Seeding Devsinn Insights database...');
    const adminPassword = await bcrypt.hash('Admin123!', 12);
    const userPassword = await bcrypt.hash('User123!', 12);
    const admin = await prisma.user.upsert({
        where: { email: 'admin@devsinn.com' },
        update: { role: client_1.UserRole.ADMIN },
        create: {
            name: 'Devsinn Admin',
            email: 'admin@devsinn.com',
            password: adminPassword,
            role: client_1.UserRole.ADMIN,
            isActive: true,
            emailVerifiedAt: new Date(),
            bio: 'Platform administration account.',
        },
    });
    const user = await prisma.user.upsert({
        where: { email: 'user@devsinn.com' },
        update: { role: client_1.UserRole.USER },
        create: {
            name: 'Nabil Developer',
            email: 'user@devsinn.com',
            password: userPassword,
            role: client_1.UserRole.USER,
            isActive: true,
            emailVerifiedAt: new Date(),
            bio: 'Writer and software engineer.',
        },
    });
    const tech = await prisma.category.upsert({
        where: { slug: 'technology' },
        update: {},
        create: {
            name: 'Technology',
            slug: 'technology',
            description: 'Articles about coding, hardware, software, and tools.',
            metaTitle: 'Technology | Devsinn Insights',
            metaDescription: 'Browse technology articles and guides on Devsinn Insights.',
            isActive: true,
        },
    });
    const business = await prisma.category.upsert({
        where: { slug: 'business' },
        update: {},
        create: {
            name: 'Business',
            slug: 'business',
            description: 'Insights into finance, marketing, and leadership.',
            metaTitle: 'Business & Finance | Devsinn Insights',
            metaDescription: 'Discover business trends and finance tips.',
            isActive: true,
        },
    });
    const plans = [
        {
            id: 'plan-basic-30',
            name: 'Basic Creator',
            description: 'Allows basic content publishing and drafting.',
            price: 19.99,
            durationDays: 30,
            features: ['Drafting and submission', 'Article block editor', '1 active published post'],
        },
        {
            id: 'plan-pro-30',
            name: 'Professional Writer',
            description: 'Allows drafting, revision, and unlimited publishing.',
            price: 49.99,
            durationDays: 30,
            features: ['Unlimited publishing', 'Video & PDF block types', 'Featured post visibility'],
        },
    ];
    for (const p of plans) {
        await prisma.subscriptionPlan.upsert({
            where: { id: p.id },
            update: {},
            create: {
                id: p.id,
                name: p.name,
                description: p.description,
                price: p.price,
                durationDays: p.durationDays,
                features: p.features,
                isActive: true,
            },
        });
    }
    const articlesData = [
        {
            title: 'Introduction to NestJS & Prisma',
            slug: 'intro-to-nestjs-and-prisma',
            status: client_1.ContentStatus.PUBLISHED,
            contentType: client_1.ContentType.ARTICLE,
            excerpt: 'Learn the fundamentals of NestJS framework coupled with Prisma ORM.',
            description: 'A comprehensive starter guide.',
            categoryId: tech.id,
            publishedAt: new Date(),
        },
        {
            title: 'Top Marketing Trends for 2026',
            slug: 'top-marketing-trends-2026',
            status: client_1.ContentStatus.PENDING_REVIEW,
            contentType: client_1.ContentType.ARTICLE,
            excerpt: 'Discover upcoming digital marketing strategies.',
            description: 'A study of consumer trends.',
            categoryId: business.id,
        },
        {
            title: 'Draft: Modern CSS Grid Layouts',
            slug: 'draft-modern-css-grid',
            status: client_1.ContentStatus.DRAFT,
            contentType: client_1.ContentType.ARTICLE,
            excerpt: 'Quick tips to master layout alignment.',
            description: 'A styling tutorial.',
            categoryId: tech.id,
        },
    ];
    for (const item of articlesData) {
        const created = await prisma.content.upsert({
            where: { slug: item.slug },
            update: {},
            create: {
                title: item.title,
                slug: item.slug,
                status: item.status,
                contentType: item.contentType,
                excerpt: item.excerpt,
                description: item.description,
                categoryId: item.categoryId,
                authorId: user.id,
                publishedAt: item.publishedAt,
            },
        });
        await prisma.contentBlock.create({
            data: {
                contentId: created.id,
                type: client_1.BlockType.PARAGRAPH,
                position: 0,
                textContent: `This is a sample paragraph block for the article "${item.title}".`,
            },
        });
    }
    const settings = [
        { key: 'site_name', value: 'Devsinn Insights', label: 'Site Name', group: 'general', isPublic: true },
        { key: 'site_description', value: 'A moderated publishing platform.', label: 'Description', group: 'general', isPublic: true },
        { key: 'contact_email', value: 'support@devsinn.com', label: 'Support Email', group: 'contact', isPublic: false },
    ];
    for (const s of settings) {
        await prisma.siteSetting.upsert({
            where: { key: s.key },
            update: {},
            create: {
                key: s.key,
                value: s.value,
                label: s.label,
                group: s.group,
                isPublic: s.isPublic,
            },
        });
    }
    console.log('Database seeding finished.');
    console.log(`  Admin User: ${admin.email} / Admin123!`);
    console.log(`  Regular User: ${user.email} / User123!`);
}
main()
    .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed.js.map