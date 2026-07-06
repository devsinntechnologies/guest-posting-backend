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
    console.log('Seeding database...');
    const adminPassword = await bcrypt.hash('Admin123!', 12);
    const contributorPassword = await bcrypt.hash('Contributor123!', 12);
    const userPassword = await bcrypt.hash('User123!', 12);
    const admin = await prisma.user.upsert({
        where: { email: 'admin@devsinn.com' },
        update: { role: client_1.UserRole.ADMIN },
        create: {
            name: 'Platform Admin',
            email: 'admin@devsinn.com',
            password: adminPassword,
            role: client_1.UserRole.ADMIN,
            isActive: true,
            emailVerifiedAt: new Date(),
            companyName: 'Devsinn',
        },
    });
    const contributor = await prisma.user.upsert({
        where: { email: 'contributor@devsinn.com' },
        update: { role: client_1.UserRole.CONTRIBUTOR },
        create: {
            name: 'Bob Contributor',
            email: 'contributor@devsinn.com',
            password: contributorPassword,
            role: client_1.UserRole.CONTRIBUTOR,
            isActive: true,
            companyName: 'Tech Blog Inc',
            websiteUrl: 'https://techblog.example.com',
        },
    });
    const user = await prisma.user.upsert({
        where: { email: 'user@devsinn.com' },
        update: { role: client_1.UserRole.USER },
        create: {
            name: 'Alex User',
            email: 'user@devsinn.com',
            password: userPassword,
            role: client_1.UserRole.USER,
            isActive: true,
            emailVerifiedAt: new Date(),
        },
    });
    const categories = await Promise.all([
        prisma.category.upsert({
            where: { slug: 'technology' },
            update: {},
            create: {
                name: 'Technology',
                slug: 'technology',
                description: 'Tech guest posts and articles',
                metaTitle: 'Technology Guest Posts',
                metaDescription: 'Submit technology guest posts to Devsinn Insights.',
            },
        }),
        prisma.category.upsert({
            where: { slug: 'marketing' },
            update: {},
            create: {
                name: 'Marketing',
                slug: 'marketing',
                description: 'Marketing and SEO content',
                metaTitle: 'Marketing Guest Posts',
            },
        }),
        prisma.category.upsert({
            where: { slug: 'development' },
            update: {},
            create: {
                name: 'Development',
                slug: 'development',
                description: 'Software development articles',
            },
        }),
    ]);
    const tags = await Promise.all([
        prisma.tag.upsert({
            where: { slug: 'nestjs' },
            update: {},
            create: { name: 'NestJS', slug: 'nestjs' },
        }),
        prisma.tag.upsert({
            where: { slug: 'seo' },
            update: {},
            create: { name: 'SEO', slug: 'seo' },
        }),
        prisma.tag.upsert({
            where: { slug: 'guest-posting' },
            update: {},
            create: { name: 'Guest Posting', slug: 'guest-posting' },
        }),
    ]);
    await Promise.all([
        prisma.package.upsert({
            where: { id: '00000000-0000-0000-0000-000000000001' },
            update: {},
            create: {
                id: '00000000-0000-0000-0000-000000000001',
                name: 'Basic',
                description: 'Single guest post with dofollow link',
                price: 49.99,
                currency: 'USD',
                features: ['1 guest post', '1 dofollow link', '30-day listing'],
                durationDays: 30,
                isActive: true,
            },
        }),
        prisma.package.upsert({
            where: { id: '00000000-0000-0000-0000-000000000002' },
            update: {},
            create: {
                id: '00000000-0000-0000-0000-000000000002',
                name: 'Standard',
                description: 'Guest post with social promotion',
                price: 99.99,
                currency: 'USD',
                features: [
                    '1 guest post',
                    '2 dofollow links',
                    'Social media promotion',
                    '60-day listing',
                ],
                durationDays: 60,
                isActive: true,
            },
        }),
        prisma.package.upsert({
            where: { id: '00000000-0000-0000-0000-000000000003' },
            update: {},
            create: {
                id: '00000000-0000-0000-0000-000000000003',
                name: 'Premium',
                description: 'Premium placement with homepage feature',
                price: 199.99,
                currency: 'USD',
                features: [
                    '1 guest post',
                    '3 dofollow links',
                    'Homepage feature',
                    'Newsletter inclusion',
                    '90-day listing',
                ],
                durationDays: 90,
                isActive: true,
            },
        }),
    ]);
    const articleData = [
        {
            title: 'Getting Started with NestJS',
            slug: 'getting-started-with-nestjs',
            status: client_1.ArticleStatus.PUBLISHED,
            publishedAt: new Date(),
            authorId: contributor.id,
            categoryId: categories[0].id,
        },
        {
            title: 'SEO Best Practices for 2026',
            slug: 'seo-best-practices-2026',
            status: client_1.ArticleStatus.PENDING_REVIEW,
            authorId: contributor.id,
            categoryId: categories[1].id,
        },
        {
            title: 'Draft: Advanced TypeScript Patterns',
            slug: 'advanced-typescript-patterns',
            status: client_1.ArticleStatus.DRAFT,
            authorId: contributor.id,
            categoryId: categories[2].id,
        },
        {
            title: 'Rejected Article Example',
            slug: 'rejected-article-example',
            status: client_1.ArticleStatus.REJECTED,
            rejectionReason: 'Content does not meet quality guidelines.',
            authorId: contributor.id,
            categoryId: categories[0].id,
        },
        {
            title: 'Approved Awaiting Publish',
            slug: 'approved-awaiting-publish',
            status: client_1.ArticleStatus.APPROVED,
            authorId: contributor.id,
            categoryId: categories[1].id,
        },
        {
            title: 'Archived Legacy Post',
            slug: 'archived-legacy-post',
            status: client_1.ArticleStatus.ARCHIVED,
            publishedAt: new Date('2024-01-01'),
            authorId: admin.id,
            categoryId: categories[0].id,
        },
    ];
    for (const data of articleData) {
        await prisma.article.upsert({
            where: { slug: data.slug },
            update: {},
            create: {
                ...data,
                content: `<p>Sample content for "${data.title}". Lorem ipsum dolor sit amet.</p>`,
                excerpt: `Excerpt for ${data.title}`,
                metaTitle: data.title,
                metaDescription: `Read about ${data.title} on Devsinn Insights.`,
                readingTimeMinutes: 5,
                articleTags: {
                    create: [{ tagId: tags[0].id }, { tagId: tags[1].id }],
                },
            },
        });
    }
    console.log('Seed completed:');
    console.log(`  Admin: ${admin.email} / Admin123!`);
    console.log(`  Contributor: ${contributor.email} / Contributor123!`);
    console.log(`  User: ${user.email} / User123!`);
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed.js.map