---
paths:
  - "apps/web/src/**/*.{tsx,ts}"
---

# Error Display Conventions

## Overview

Use different display methods depending on the source of the error.

| Error Source | Display Method |
|---|---|
| Form validation | `<FormMessage>` component (inline) |
| API / server function calls | `toast.error()` (toast notification) |

---

## Form Validation Errors

Validation errors from React Hook Form + Zod are displayed using `<FormMessage>`, defined in `src/components/ui/form.tsx`. It automatically renders the error message below the field.

```tsx
<FormField
  control={form.control}
  name="email"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Email</FormLabel>
      <FormControl>
        <Input {...field} />
      </FormControl>
      <FormMessage /> {/* validation errors appear here automatically */}
    </FormItem>
  )}
/>
```

### Additional inline messages (server-side checks)

When extra inline feedback is needed below a field (e.g., handle availability check), add a custom `<p>` element alongside `<FormMessage>`.

```tsx
{handleStatus === 'taken' && (
  <p className="text-invalid text-sm">
    <span className="mr-2 font-bold">{handle}</span>
    is already taken
  </p>
)}
<FormMessage />
```

---

## API / Server Function Errors

Errors caught in `useMutation`'s `onError` or in a `try/catch` block are displayed via `toast.error()` by default.

```tsx
import { toast } from 'sonner'

const mutation = useMutation({
  mutationFn: someServerFn,
  onError: () => toast.error('Something went wrong. Please try again.'),
})
```

### Exception: consider inline display instead

If any of the following conditions apply, consider displaying the error inline on screen rather than as a toast, and **ask the user which approach to use before implementing**.

- The error is tied to a specific form field (e.g., duplicates or format issues only detectable server-side)
- The user needs to correct their input immediately
- The error message is too long to fit comfortably in a toast

> **Rule**: When in doubt, always ask the user — "Should this error be shown as a toast or displayed on screen?" — before implementing.

---

## Error Message Management

Collect error messages in the `ERROR` object in `const.ts`.

```typescript
// Setup/const.ts
export const ERROR = {
  setupFailed: 'Registration failed. Please try again.',
  cancelFailed: 'Failed to cancel registration. Please try again.',
} as const
```

Zod validation messages are written inline in the schema definition in `validation.ts`.
