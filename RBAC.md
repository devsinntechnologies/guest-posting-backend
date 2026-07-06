# Role-Based Access Control

## Roles

| Role | Description |
|------|-------------|
| `ADMIN` | Full platform control — users, content, categories, tags, submissions, comments, packages |
| `CONTRIBUTOR` | Submit guest posts, track submissions, edit own drafts |
| `USER` | Registered visitor — read articles, comment, bookmark (Phase 2), purchase packages (Phase 2) |

## Default registration role

New signups receive the `USER` role. Admins can promote users to `CONTRIBUTOR` from the admin panel.

## Route access (frontend)

| Route | Allowed roles |
|-------|----------------|
| `/admin/*` | `ADMIN` |
| `/contributor/*` | `CONTRIBUTOR` |
| `/blog`, public pages | Everyone (including guests) |

## Backend enforcement

Use `@Roles(UserRole.ADMIN)` on protected admin endpoints. Contributors are restricted in service-layer checks for article ownership and status changes.
