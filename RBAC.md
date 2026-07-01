# Role-Based Access Control (RBAC)

## Roles

| Role | Description |
|------|-------------|
| `SUPER_ADMIN` | Full platform access |
| `EDITOR` | Content review, publish, SEO management |
| `CONTRIBUTOR` | Submit and track own guest posts |

## Permission Matrix

| Action | Super Admin | Editor | Contributor |
|--------|:-----------:|:------:|:-----------:|
| Manage users | ✅ | ❌ | ❌ |
| Manage categories/tags | ✅ | ✅ (edit only) | ❌ |
| Delete categories/tags | ✅ | ❌ | ❌ |
| Manage pricing/packages | ✅ | ❌ | ❌ |
| View/manage all payments | ✅ | ❌ | ❌ |
| View own payments | ✅ | ✅ | ✅ |
| Submit articles | ✅ | ✅ | ✅ |
| Review/approve/reject | ✅ | ✅ | ❌ |
| Edit any article | ✅ | ✅ | ❌ |
| Edit own article (draft/pending/rejected) | ✅ | ✅ | ✅ |
| Publish articles | ✅ | ✅ | ❌ |
| Track own submissions | ✅ | ✅ | ✅ |
| Manage SEO pages | ✅ | ✅ | ❌ |
| Manage sponsored posts | ✅ | ❌ | ❌ |
| Request link insertions | ✅ | ❌ | ✅ |
| Manage link insertions | ✅ | ❌ | ❌ |
| Moderate comments | ✅ | ✅ | ❌ |
| Dashboard (platform stats) | ✅ | ✅ | ❌ |
| Dashboard (own stats) | ✅ | ✅ | ✅ |

## Enforcement

### `@Roles()` + `RolesGuard`

Applied at controller method level:

```typescript
@Roles(UserRole.SUPER_ADMIN, UserRole.EDITOR)
@UseGuards(RolesGuard)
```

Implementation: `src/common/guards/roles.guard.ts`

### Global JWT Guard

`JwtAuthGuard` is registered globally. Routes marked `@Public()` skip authentication.

Implementation: `src/common/guards/jwt-auth.guard.ts`

### Ownership Checks

Contributors are restricted to their own resources via service-layer checks:

- **Articles**: `ArticlesService.assertCanEdit()` — own articles only, and only in `DRAFT`, `PENDING_REVIEW`, or `REJECTED` status
- **Orders**: `GET /orders/my-orders` scoped to authenticated user
- **Link insertions**: contributors see only their own requests
- **Dashboard**: contributor stats scoped to `authorId`

Optional `OwnershipGuard` available for route-level enforcement: `src/common/guards/ownership.guard.ts`

## Decorators

| Decorator | Purpose |
|-----------|---------|
| `@Roles(...roles)` | Require specific roles |
| `@Public()` | Skip JWT authentication |
| `@Cacheable(seconds)` | Set cache headers on public SEO endpoints |
| `@CurrentUser()` | Extract JWT payload in controllers |

## Testing

RBAC unit tests: `src/common/guards/roles.guard.spec.ts`
