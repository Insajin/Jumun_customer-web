# MCP E2E Tests

**Automated end-to-end testing with MCP Chrome DevTools**

## Overview

This directory contains E2E test scenarios designed for MCP (Model Context Protocol) Chrome DevTools automation.

## Why MCP?

Unlike traditional testing frameworks, MCP provides:
- ✅ Natural language test descriptions
- ✅ Direct DOM manipulation
- ✅ Screenshot capture
- ✅ Real browser behavior
- ✅ Easy debugging with snapshots

## Test Scenarios

### 1. `full-order-flow.md`
Complete customer journey from store selection to order tracking.

**Time:** ~30 seconds
**Complexity:** High
**Prerequisites:** Seeded database

### 2. `cart-management.md` (TODO)
Add, remove, update quantities in cart.

### 3. `realtime-updates.md` (TODO)
Verify order status updates via Supabase Realtime.

### 4. `brand-theming.md` (TODO)
Test brand-specific theme loading.

### 5. `pwa-install.md` (TODO)
Verify PWA installation flow.

## Running Tests

### Manual Execution

1. Start Next.js dev server:
```bash
cd customer-web
npm run dev
```

2. Open MCP Chrome DevTools

3. Follow test steps in markdown files

### Automated Execution (Future)

```bash
# Run all E2E tests
npm run test:e2e

# Run specific test
npm run test:e2e -- full-order-flow
```

## Test Structure

```
test/e2e/
├── README.md                  # This file
├── setup.md                   # Environment setup
├── helpers.md                 # Reusable MCP patterns
└── scenarios/
    ├── full-order-flow.md
    ├── cart-management.md
    ├── realtime-updates.md
    └── ...
```

## Best Practices

### 1. Use `data-testid` Attributes

```tsx
<button data-testid="checkout-button">
  주문하기
</button>
```

Then in test:
```typescript
await mcp__chrome-devtools__click({
  uid: 'checkout-button'
})
```

### 2. Wait for Content

Always wait for expected content:
```typescript
await mcp__chrome-devtools__wait_for({
  text: 'Expected Text',
  timeout: 5000
})
```

### 3. Take Snapshots

Verify DOM structure:
```typescript
const snapshot = await mcp__chrome-devtools__take_snapshot()
// Verify elements present
```

### 4. Capture Screenshots

Visual verification:
```typescript
await mcp__chrome-devtools__take_screenshot()
// Review screenshot for UI issues
```

## Flutter Web vs Next.js

| Feature | Flutter Web | Next.js + MCP |
|---------|-------------|---------------|
| DOM Access | ❌ Canvas only | ✅ Full HTML |
| MCP Snapshot | ❌ Blind | ✅ All elements |
| Click Elements | ❌ No UIDs | ✅ Every element |
| Form Fill | ❌ Impossible | ✅ Easy |
| Debug | ❌ Pixel hunting | ✅ Inspect DOM |

## CI/CD Integration

### GitHub Actions Example

```yaml
name: E2E Tests

on: [push, pull_request]

jobs:
  e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: supabase/setup-cli@v1

      - name: Start Supabase
        run: supabase start

      - name: Install dependencies
        run: npm install
        working-directory: customer-web

      - name: Start Next.js
        run: npm run dev &
        working-directory: customer-web

      - name: Run E2E tests
        run: npm run test:e2e
        working-directory: customer-web
```

## Debugging Failed Tests

1. **Check Snapshots**
   - Review last snapshot before failure
   - Look for missing elements

2. **Review Screenshots**
   - Visual errors obvious in screenshots
   - Compare with expected state

3. **Console Logs**
   - Check browser console
   - Look for JavaScript errors

4. **Network Tab**
   - Verify API calls successful
   - Check Supabase connection

## Coverage Goals

- [ ] 100% critical user paths
- [ ] All payment flows
- [ ] Realtime updates
- [ ] PWA installation
- [ ] Brand theming
- [ ] Error handling
- [ ] Offline scenarios

## Contributing

When adding new features, also add:
1. E2E test scenario (markdown)
2. `data-testid` attributes
3. Wait conditions
4. Screenshots

---

**Status**: ✅ Framework ready, scenarios being added

**Last Updated**: 2025-10-14
