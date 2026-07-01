# Guest Post Workflow

## State Machine

```
DRAFT → PENDING_REVIEW → APPROVED → PUBLISHED
                       ↘ REJECTED
PUBLISHED → ARCHIVED
REJECTED → PENDING_REVIEW (resubmission)
```

Invalid transitions return **HTTP 422 Unprocessable Entity**.

## Transitions & Rules

| From | To | Who | Requirements |
|------|-----|-----|--------------|
| DRAFT | PENDING_REVIEW | Contributor/Editor/Admin | Article content complete |
| PENDING_REVIEW | APPROVED | Editor/Admin | Category must be assigned |
| PENDING_REVIEW | REJECTED | Editor/Admin | `rejectionReason` required |
| APPROVED | PUBLISHED | Editor/Admin | Sets `publishedAt`, generates slug if missing |
| REJECTED | PENDING_REVIEW | Contributor (own) | Resubmission cycle |
| PUBLISHED | ARCHIVED | Editor/Admin | — |

## Audit Trail

Every transition creates a `SubmissionLog` row:

- `articleId`, `actorId`, `fromStatus`, `toStatus`, `note`, `createdAt`

## Notification Triggers

| Event | Recipients | Type |
|-------|-----------|------|
| Submit for review | Submitter + all Editors/Admins | `SUBMISSION_RECEIVED` |
| Status changed | Submitter | `STATUS_CHANGED` |
| Rejected | Submitter | `ARTICLE_REJECTED` |
| Published | Submitter | `ARTICLE_PUBLISHED` |

## Email Triggers

| Event | Template | Recipient |
|-------|----------|-----------|
| Submit | `submission_received` | Submitter |
| Published | `article_published` | Submitter (includes public URL) |
| Rejected | `article_rejected` | Submitter (includes reason) |
| Payment confirmed | `payment_confirmed` | Buyer |

Emails are queued via BullMQ (`email` queue) and logged in `EmailLog`.

## API Endpoints

- `POST /api/v1/articles` — create (optionally submit with `submit: true`)
- `PATCH /api/v1/articles/:id/status` — transition status (Editor/Admin)
- Submission history available via `WorkflowService.getHistory(articleId)`

## Implementation

State machine logic: `src/workflow/workflow.state-machine.ts`  
Transition service: `src/workflow/workflow.service.ts`  
Article integration: `src/articles/articles.service.ts`
