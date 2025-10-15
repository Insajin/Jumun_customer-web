# E2E Test: Complete Order Flow

**MCP Chrome DevTools Automation**

## Test Scenario

Simulate a complete customer journey from QR scan to order tracking.

## Prerequisites

- Local environment running:
  - Supabase: `http://127.0.0.1:54321`
  - Next.js: `http://localhost:3001`
  - Test data seeded in database

## Test Steps

### 1. Navigate to Store Selection

```typescript
await mcp__chrome-devtools__navigate_page({
  url: 'http://localhost:3001/stores'
})

await mcp__chrome-devtools__wait_for({
  text: '매장 찾기',
  timeout: 5000
})

await mcp__chrome-devtools__take_snapshot()
// Expected: Store list with at least one store
```

### 2. Select Store and View Menu

```typescript
// Click first store card
await mcp__chrome-devtools__click({
  uid: 'store-card-uuid' // Get from snapshot
})

await mcp__chrome-devtools__wait_for({
  text: 'Coffee Co Gangnam', // Store name
  timeout: 5000
})

await mcp__chrome-devtools__take_snapshot()
// Expected: Menu page with categories and items
```

### 3. Add Item to Cart

```typescript
// Click "담기" button on first menu item
await mcp__chrome-devtools__click({
  uid: 'add-to-cart-item-uuid'
})

// Verify cart badge updated
await mcp__chrome-devtools__wait_for({
  text: '1개 담김',
  timeout: 3000
})

await mcp__chrome-devtools__take_screenshot()
```

### 4. Open Cart

```typescript
await mcp__chrome-devtools__click({
  uid: 'cart-button'
})

await mcp__chrome-devtools__wait_for({
  text: '장바구니',
  timeout: 3000
})

await mcp__chrome-devtools__take_snapshot()
// Expected: Cart page with items
```

### 5. Proceed to Checkout

```typescript
await mcp__chrome-devtools__click({
  uid: 'checkout-button'
})

await mcp__chrome-devtools__wait_for({
  text: '주문 정보 입력',
  timeout: 3000
})
```

### 6. Fill Customer Information

```typescript
await mcp__chrome-devtools__fill({
  uid: 'customer-name-input',
  value: 'Test User'
})

await mcp__chrome-devtools__fill({
  uid: 'customer-phone-input',
  value: '01012345678'
})

await mcp__chrome-devtools__take_snapshot()
```

### 7. Select Pickup Time

```typescript
await mcp__chrome-devtools__click({
  uid: 'pickup-time-20' // 20 minutes
})

await mcp__chrome-devtools__take_screenshot()
```

### 8. Submit Order

```typescript
await mcp__chrome-devtools__click({
  uid: 'submit-order-button'
})

// Wait for order creation
await mcp__chrome-devtools__wait_for({
  text: '주문 추적',
  timeout: 10000
})

await mcp__chrome-devtools__take_snapshot()
// Expected: Order tracking page with pending status
```

### 9. Verify Order Tracking

```typescript
// Check order status
const snapshot = await mcp__chrome-devtools__take_snapshot()

// Verify order details present
// - Order number
// - Store info
// - Items list
// - Total price
// - Status timeline

await mcp__chrome-devtools__take_screenshot()
```

## Success Criteria

✅ Store list loads correctly
✅ Menu page displays items
✅ Cart updates when items added
✅ Checkout form accepts input
✅ Order created successfully
✅ Order tracking page displays
✅ Real-time status visible

## Expected Time

~30 seconds for complete flow

## Failure Scenarios

### Database Empty
- Store list shows "매장이 없습니다"
- Skip test or seed data first

### Network Error
- Pages timeout
- Check Supabase connection

### Validation Error
- Phone number format rejected
- Use valid test number (01012345678)

## Notes

- This test validates the entire customer journey
- All interactions are DOM-based (impossible with Flutter Web!)
- MCP can run this test automatically in CI/CD
