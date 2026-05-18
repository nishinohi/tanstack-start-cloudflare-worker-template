---
paths:
  - "apps/web/src/routes/**/*.{ts,tsx}, apps/web/src/features/**/*.{ts,tsx}"
---

# Cloudflare D1 Constraints

## No Transactions

Cloudflare D1 does **not** support transactions. Never use `db.transaction()` or any transaction-based patterns in database operations.
Instead, design database operations to be idempotent and handle partial failures gracefully without relying on transactional guarantees.

```typescript
// WRONG: D1 does not support transactions
await db.transaction(async (tx) => {
  await tx.insert(orders).values(order)
  await tx.insert(orderItems).values(items)
})

// CORRECT: Execute statements individually
await db.insert(orders).values(order)
await db.insert(orderItems).values(items)
```

If atomicity is critical, consider using D1's `batch()` API, which executes multiple statements in a single round-trip (all-or-nothing semantics within a single batch call).

```typescript
// CORRECT: Use batch for atomic multi-statement operations
await db.batch([
  db.insert(orders).values(order),
  db.insert(orderItems).values(items),
])
```
