# Devsinn Insights — Entity Relationship Diagram

```mermaid
erDiagram
    User ||--o{ Article : "authors"
    User ||--o{ Comment : "writes"
    User ||--o{ SubmissionLog : "acts"
    User ||--o{ Order : "places"
    User ||--o{ SponsoredPost : "sponsors"
    User ||--o{ LinkInsertion : "requests"
    User ||--o{ Notification : "receives"
    User ||--o{ RefreshToken : "has"

    Category ||--o{ Article : "contains"
    Category ||--o| Category : "parent/child"

    Article ||--o{ ArticleTag : "tagged"
    Tag ||--o{ ArticleTag : "used in"
    Article ||--o{ Comment : "has"
    Article ||--o{ SubmissionLog : "tracked by"
    Article ||--o{ Order : "linked to"
    Article ||--o{ SponsoredPost : "promoted as"
    Article ||--o{ LinkInsertion : "target of"

    Package ||--o{ Order : "purchased via"
    Order ||--o| LinkInsertion : "pays for"

    Comment ||--o| Comment : "replies to"

    User {
        uuid id PK
        string name
        string email UK
        string password
        enum role
        string companyName
        string websiteUrl
        string avatarUrl
        boolean isActive
        datetime emailVerifiedAt
        datetime deletedAt
        datetime createdAt
        datetime updatedAt
    }

    Article {
        uuid id PK
        string title
        string slug UK
        text content
        string excerpt
        string featuredImageUrl
        uuid authorId FK
        uuid categoryId FK
        enum status
        string targetUrl
        string anchorText
        string metaTitle
        string metaDescription
        string metaKeywords
        int readingTimeMinutes
        int viewCount
        string rejectionReason
        datetime publishedAt
        datetime deletedAt
        datetime createdAt
        datetime updatedAt
    }

    Category {
        uuid id PK
        string name
        string slug UK
        string description
        string metaTitle
        string metaDescription
        uuid parentCategoryId FK
        datetime createdAt
        datetime updatedAt
    }

    Tag {
        uuid id PK
        string name
        string slug UK
        datetime createdAt
    }

    ArticleTag {
        uuid articleId PK,FK
        uuid tagId PK,FK
    }

    Comment {
        uuid id PK
        uuid articleId FK
        uuid userId FK
        string guestName
        string guestEmail
        text content
        enum status
        uuid parentCommentId FK
        datetime deletedAt
        datetime createdAt
    }

    SubmissionLog {
        uuid id PK
        uuid articleId FK
        uuid actorId FK
        enum fromStatus
        enum toStatus
        string note
        datetime createdAt
    }

    Package {
        uuid id PK
        string name
        string description
        decimal price
        string currency
        json features
        int durationDays
        boolean isActive
        datetime createdAt
        datetime updatedAt
    }

    Order {
        uuid id PK
        uuid userId FK
        uuid packageId FK
        uuid articleId FK
        decimal amount
        string currency
        enum status
        string paymentGateway
        string gatewayTransactionId UK
        string invoiceUrl
        datetime createdAt
        datetime updatedAt
    }

    SponsoredPost {
        uuid id PK
        uuid articleId FK
        uuid userId FK
        datetime startDate
        datetime endDate
        enum placement
        boolean isActive
    }

    LinkInsertion {
        uuid id PK
        uuid requestedById FK
        uuid targetArticleId FK
        string anchorText
        string destinationUrl
        enum status
        decimal price
        uuid paymentId FK
        datetime createdAt
    }

    Notification {
        uuid id PK
        uuid userId FK
        enum type
        string title
        string message
        boolean isRead
        json metadata
        datetime createdAt
    }

    EmailLog {
        uuid id PK
        string toEmail
        string templateName
        string subject
        enum status
        string errorMessage
        datetime sentAt
        datetime createdAt
    }

    SeoPage {
        uuid id PK
        enum pageType
        uuid referenceId
        string slug UK
        string metaTitle
        string metaDescription
        string h1Heading
        text customContent
        datetime createdAt
        datetime updatedAt
    }

    RefreshToken {
        uuid id PK
        uuid userId FK
        string tokenHash
        datetime expiresAt
        datetime revokedAt
        datetime createdAt
    }
```

## Indexes

- `users.email` — unique
- `articles.slug`, `articles.status`, `articles.categoryId`, `articles.authorId`
- `categories.slug`, `tags.slug`, `seo_pages.slug`
- `orders.gatewayTransactionId` — unique (idempotent webhooks)
- `refresh_tokens.tokenHash`

## Cascade Rules

- User deletion cascades to articles, orders, notifications, refresh tokens
- Article deletion cascades to comments, submission logs, article tags
- Category/tag deletion sets null on article FK or cascades join table rows
