---
name: verify
description: Run full project lint and tests to verify code quality before committing or marking work done
---

Run lint and tests in sequence:

```bash
bun run lint && bun run test
```

If lint errors exist:
1. Fix auto-fixable issues with `bunx eslint --fix .`
2. Fix remaining issues manually
3. Re-run `bun run lint` to confirm

If tests fail:
1. Show failures grouped by test file
2. Fix the underlying code (not the test) unless the test is wrong
3. Re-run `bun run test` to confirm
