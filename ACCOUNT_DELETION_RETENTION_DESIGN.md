# Account Deletion Retention and Anonymization Design

Status: **technical design implemented; production policy approval pending**.

Business decision dated 25 July 2026: the production cooling-off period is
**7 days**, and the deletion worker must remain disabled until the retention
policy, operational owner, schedule, retry procedure, and policy version have
been approved.

## Invariants

- The worker never hard-deletes the `users` row.
- Transactions, rentals, paid entitlements, event tickets, broadcast tickets, and compliance audit logs remain linked to an anonymized user ID.
- Login and bearer-token authentication reject users whose `deleted_at` is set.
- Direct profile identifiers are replaced or cleared.
- Watchlist and watch progress are deleted.
- Legal consent records remain, but their user-agent is cleared.
- Linked support-ticket contact details, free text, transaction reference, and attachment are removed.
- A completion audit records the approved policy version used for processing.

## Execution guards

The worker defaults to dry-run. Mutation requires all of:

```env
ACCOUNT_DELETION_WORKER_MODE=execute
ACCOUNT_DELETION_EXECUTION_ENABLED=true
ACCOUNT_DELETION_POLICY_VERSION=[APPROVED_POLICY_VERSION]
```

If any execution guard is missing, the worker fails closed.

## Commands

Dry-run:

```bash
npm run deletion-worker:dry-run
```

Execution after business/legal approval:

```bash
ACCOUNT_DELETION_WORKER_MODE=execute \
ACCOUNT_DELETION_EXECUTION_ENABLED=true \
ACCOUNT_DELETION_POLICY_VERSION=[APPROVED_POLICY_VERSION] \
npm run deletion-worker
```

## Decisions still required

- Retention duration for transactions, payment identifiers, antifraud records, rentals, entitlements, support tickets, and audit logs.
- Coin handling. The current VOD Prisma schema has no coin/wallet model, so no coin mutation is performed.
- Treatment of an active rental at the completion date. The technical default preserves the rental record but blocks account access.
- Whether users may receive a portable transaction archive before anonymization.
- Operational owner, execution schedule, retry procedure for `FAILED`, and incident escalation.
- Legal approval of the anonymization fields and the value of `ACCOUNT_DELETION_POLICY_VERSION`.

Do not enable execution in production until these decisions are approved.
