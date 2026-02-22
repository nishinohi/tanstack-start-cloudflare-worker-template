# Task Completion Checklist

## After Writing/Modifying Code

### 1. Code Quality
- [ ] No mutations (immutable patterns used)
- [ ] Functions < 50 lines
- [ ] Files < 800 lines (typical 200-400)
- [ ] No deep nesting (max 4 levels)
- [ ] No `console.log` statements
- [ ] No hardcoded values
- [ ] Proper error handling with try/catch
- [ ] Input validated with Zod

### 2. Tailwind/Styling
- [ ] No numeric color classes (use semantic colors)
- [ ] Semantic colors from `src/styles.css`

### 3. Security
- [ ] No hardcoded secrets
- [ ] User inputs validated
- [ ] No XSS/injection vulnerabilities
- [ ] Error messages don't leak sensitive data

### 4. Tests (80%+ coverage required)
- [ ] Unit tests for functions/utilities
- [ ] Integration tests for API/DB operations
- [ ] Tests follow TDD: RED → GREEN → REFACTOR

### 5. Run Commands
```bash
pnpm typecheck    # Must pass
pnpm lint         # Must pass
pnpm test         # Must pass
```

### 6. Pre-commit Hooks (auto-run via Lefthook)
- Prettier (JS/TS/JSON/CSS/MD)
- ESLint (JS/TS)
- Stylelint (CSS)

## Agents to Use
- After writing code → **code-reviewer** agent
- New features/bug fixes → **tdd-guide** agent
- Security concerns → **security-reviewer** agent
- Build fails → **build-error-resolver** agent
