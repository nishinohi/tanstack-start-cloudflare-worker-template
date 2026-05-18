---
paths:
  - "apps/web/src/**/*.{tsx,css}"
  - "packages/**/*.{tsx,css}"
---

# Tailwind CSS Styling Rules

## Prohibition of Numeric Color Specifications

**Do not use** Tailwind CSS default color palette with numeric specifications:

```tsx
// ❌ NG: Numeric color specifications
<div className="bg-gray-100 text-red-500 border-blue-300" />

// ✅ OK: Semantic colors
<div className="bg-muted text-destructive border-border" />
```

## Using Semantic Colors

When specifying colors, use semantic colors defined in `apps/web/src/styles.css`:

### Basic Colors

| Purpose        | Color Names                                      | Example             |
| -------------- | ------------------------------------------------ | ------------------- |
| Background     | `background`, `card`, `popover`, `muted`         | `bg-background`     |
| Text           | `foreground`, `muted-foreground`                 | `text-foreground`   |
| Accent         | `primary`, `secondary`, `accent`                 | `text-primary`      |
| Danger/Error   | `destructive`                                    | `text-destructive`  |
| Border         | `border`, `input`                                | `border-border`     |
| Focus          | `ring`                                           | `ring-ring`         |

### Paired Colors (Background and Text Sets)

| Component      | Background          | Text                        |
| -------------- | ------------------- | --------------------------- |
| Card           | `bg-card`           | `text-card-foreground`      |
| Popover        | `bg-popover`        | `text-popover-foreground`   |
| Primary        | `bg-primary`        | `text-primary-foreground`   |
| Secondary      | `bg-secondary`      | `text-secondary-foreground` |
| Accent         | `bg-accent`         | `text-accent-foreground`    |
| Muted          | `bg-muted`          | `text-muted-foreground`     |
| Destructive    | `bg-destructive`    | `text-destructive-foreground` |

### Sidebar-Specific Colors

| Purpose          | Color Names                                            |
| ---------------- | ------------------------------------------------------ |
| Background/Text  | `sidebar`, `sidebar-foreground`                        |
| Primary          | `sidebar-primary`, `sidebar-primary-foreground`        |
| Accent           | `sidebar-accent`, `sidebar-accent-foreground`          |
| Border/Ring      | `sidebar-border`, `sidebar-ring`                       |

### Chart Colors

| Purpose      | Color Names                                        |
| ------------ | -------------------------------------------------- |
| Data Display | `chart-1`, `chart-2`, `chart-3`, `chart-4`, `chart-5` |

## Adding New Semantic Colors

If existing colors are insufficient, add them to `apps/web/src/styles.css`:

1. Define light mode colors in `:root`
2. Define dark mode colors in `.dark`
3. Register as Tailwind colors in `@theme inline`

```css
/* Example: Adding validation error colors */
:root {
  --invalid: oklch(57.7% 0.245 27.325deg);
  --invalid-foreground: oklch(100% 0 0deg);
}

.dark {
  --invalid: oklch(63.7% 0.237 25.331deg);
  --invalid-foreground: oklch(100% 0 0deg);
}

@theme inline {
  --color-invalid: var(--invalid);
  --color-invalid-foreground: var(--invalid-foreground);
}
```

## Allowed Exceptions

- Avoid adding semantic colors for non-reusable cases
  - Numeric color specifications from default palette are allowed for non-reusable colors
  - Leave a comment explaining why semantic colors were not used
- Opacity adjustments
  - Opacity specifications like `bg-primary/50` are allowed
- Hover/Focus states
  - `hover:bg-primary/80` is allowed
- External libraries
  - Existing styles within shadcn/ui components can be used as-is
- Black and white
  - `white`, `black` are allowed
  - However, ensure visibility in both light and dark modes
  - Prefer semantic colors when they can substitute
- `transparent`, `current`, `inherit`: These keywords are allowed
