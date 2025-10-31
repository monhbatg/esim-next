# Purchase Flow Documentation

## 🛒 Overview

The eSIM Next application now has a complete purchase and checkout system with payment processing.

## ✨ Features Implemented

### 1. **Checkout Context** (`contexts/CheckoutContext.tsx`)
- Manages selected plan state across the application
- Provides `useCheckout()` hook for accessing purchase data
- Handles checkout flow state management

### 2. **Marketplace Integration** (`app/marketplace/page.tsx`)
- "Purchase Plan" button on each eSIM plan
- Authentication check before purchase
- Automatic login redirect for unauthenticated users
- Preserves selected plan during login flow

### 3. **Checkout Page** (`app/checkout/page.tsx`)
- Complete payment form with validation
- Multiple payment method options (Credit Card, PayPal, Apple Pay)
- Real-time order summary
- Secure checkout with encryption badge
- Protected route (requires authentication)
- Price breakdown with taxes

### 4. **Success Page** (`app/checkout/success/page.tsx`)
- Celebration with confetti animation
- Order confirmation with unique order number
- Next steps for eSIM activation
- Email notification confirmation
- Quick access to profile and marketplace

## 🚀 Complete User Flow

### Flow 1: Authenticated User Purchase

```
1. User browses marketplace
2. User clicks "Purchase Plan" on a plan
3. ✅ System checks: User is authenticated
4. Plan data is stored in CheckoutContext
5. User is redirected to /checkout
6. User fills in payment details
7. User submits payment
8. System processes payment (2 second simulation)
9. User is redirected to /checkout/success
10. Success page shows order confirmation
```

### Flow 2: Unauthenticated User Purchase

```
1. User (not logged in) browses marketplace
2. User clicks "Purchase Plan" on a plan
3. ⚠️ System checks: User is NOT authenticated
4. Plan data is stored in sessionStorage
5. Redirect path (/checkout) is stored
6. User is redirected to /login
7. User logs in
8. Plan data is restored from sessionStorage
9. User is automatically redirected to /checkout
10. Plan appears in checkout form
11. User completes purchase
12. User sees success page
```

## 📋 Routes

| Route | Description | Protection |
|-------|-------------|-----------|
| `/marketplace` | Browse and select eSIM plans | Public |
| `/checkout` | Payment and order details | Protected (requires login) |
| `/checkout/success` | Order confirmation | Protected (requires login) |

## 🎯 Purchase Flow Details

### Marketplace → Checkout Logic

```tsx
const handlePurchase = (plan) => {
  if (!isAuthenticated) {
    // Not logged in: Store plan and redirect to login
    sessionStorage.setItem('pendingPurchase', JSON.stringify(plan));
    sessionStorage.setItem('redirectAfterLogin', '/checkout');
    router.push('/login');
  } else {
    // Logged in: Go directly to checkout
    setSelectedPlan(plan);
    router.push('/checkout');
  }
};
```

### Checkout Page Features

**Payment Form Includes:**
- Email address (auto-filled from user account)
- Phone number
- Card number
- Cardholder name
- Expiry date
- CVV
- Terms & conditions checkbox

**Order Summary Shows:**
- Selected plan details (country, flag, data, duration)
- Plan features list
- Subtotal
- Processing fee ($0.00)
- Taxes (10%)
- Total amount
- Security encryption badge

### Success Page Features

**Displays:**
- ✅ Success icon with animation
- 🎊 Confetti celebration (3 seconds)
- Unique order number (e.g., ESIM-ABC123XYZ)
- Email notification confirmation
- Activation instructions (4-step guide)
- Quick action buttons (View My eSIMs, Browse More Plans)
- Support contact link

## 💾 Data Flow

### CheckoutContext State
```typescript
{
  selectedPlan: EsimPlan | null,
  setSelectedPlan: (plan) => void,
  clearCheckout: () => void
}
```

### SessionStorage Keys
```typescript
'pendingPurchase': string      // Stores plan JSON during login flow
'redirectAfterLogin': string   // Stores '/checkout' for post-login redirect
```

## 🧪 Testing the Purchase Flow

### Test Scenario 1: Direct Purchase (Logged In)

1. **Login** with any credentials
2. Go to **Marketplace**
3. Click **"Purchase Plan"** on any eSIM
4. ✅ Should go directly to checkout page
5. See order summary with selected plan
6. Fill in payment details (use test data):
   - Card: 4242 4242 4242 4242
   - Expiry: 12/25
   - CVV: 123
7. Click **"Pay $XX.XX"**
8. ✅ Should see success page with confetti
9. See unique order number
10. Click **"View My eSIMs"** to go to profile

### Test Scenario 2: Purchase Without Login

1. **Logout** (if logged in)
2. Go to **Marketplace**
3. Click **"Purchase Plan"** on any eSIM
4. ✅ Should redirect to login page
5. Enter any email/password and login
6. ✅ Should automatically redirect to checkout
7. ✅ Selected plan should be loaded
8. Complete payment
9. ✅ Should see success page

### Test Scenario 3: Multiple Purchases

1. Complete a purchase (see success page)
2. Click **"Browse More Plans"**
3. ✅ Should return to marketplace
4. Select a different plan
5. ✅ Should update checkout with new plan
6. Complete another purchase
7. ✅ Each should have unique order number

## 🔐 Security Features

### Current Implementation

- ✅ Protected checkout route (requires authentication)
- ✅ Form validation (required fields)
- ✅ Secure checkout badge display
- ✅ Terms & conditions acceptance
- ⚠️ Mock payment processing (no real charges)

### For Production

**Required Additions:**
- [ ] Real payment gateway integration (Stripe, PayPal)
- [ ] PCI DSS compliance
- [ ] Card validation (Luhn algorithm)
- [ ] CVV verification
- [ ] 3D Secure authentication
- [ ] Fraud detection
- [ ] HTTPS only
- [ ] Backend payment processing
- [ ] Webhook handling for payment status
- [ ] Idempotency keys for duplicate prevention
- [ ] Receipt generation
- [ ] Email notifications (SendGrid/Resend)
- [ ] Order history storage (database)

## 📱 Payment Methods

### Currently Supported (UI Only)

1. **💳 Credit Card** - Active (form displayed)
2. **PayPal** - Placeholder (button shown)
3. **Apple Pay** - Placeholder (button shown)

### For Production

To add real payment methods:

```typescript
// Stripe Integration Example
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement } from '@stripe/react-stripe-js';

const stripePromise = loadStripe('your_publishable_key');

// In checkout component
<Elements stripe={stripePromise}>
  <CheckoutForm />
</Elements>
```

## 📧 Email Notifications

### Success Page Message

> "We've sent your eSIM QR code and activation instructions to your email address."

### For Production Email Content

**Subject:** Your eSIM is Ready! - Order #{ORDER_NUMBER}

**Body:**
- Order confirmation
- eSIM QR code (embedded image)
- Activation instructions
- Device compatibility information
- Support contact information
- Receipt/invoice

## 🎨 UI/UX Features

### Checkout Page
- Clean, modern design
- Two-column layout (form + summary)
- Responsive mobile design
- Real-time form validation
- Loading states during processing
- Clear pricing breakdown
- Security indicators

### Success Page
- Celebratory confetti animation
- Clear visual success indicator
- Step-by-step activation guide
- Multiple CTA buttons
- Help/support access

## 🔄 State Management

### Purchase State Flow

```
Marketplace (Browse)
    ↓
Click "Purchase Plan"
    ↓
[Check Authentication]
    ↓              ↓
  YES             NO
    ↓              ↓
Set Plan      Store in sessionStorage
    ↓              ↓
Checkout    → Login → Restore Plan → Checkout
    ↓
Payment Form
    ↓
Processing (2s simulation)
    ↓
Clear checkout state
    ↓
Success Page
```

## 📝 Files Structure

```
app/
├── checkout/
│   ├── page.tsx              # Main checkout page with payment form
│   └── success/
│       └── page.tsx          # Order success/confirmation page
├── marketplace/
│   └── page.tsx              # Updated with purchase logic
└── login/
    └── page.tsx              # Updated with pending purchase handling

contexts/
└── CheckoutContext.tsx       # Checkout state management

types/
└── index.ts                  # Added EsimPlan interface
```

## 🐛 Error Handling

### Current Handling

- ✅ No plan selected → Redirect to marketplace
- ✅ Not authenticated → Redirect to login
- ✅ Form validation → Required field errors
- ✅ Already authenticated on login → Skip to destination

### For Production

Add handling for:
- [ ] Payment declined
- [ ] Network errors
- [ ] Invalid card details
- [ ] Expired session
- [ ] Server errors
- [ ] Timeout errors

## 📊 Analytics & Tracking

### Recommended Tracking Points

1. **Purchase Initiated** - User clicks "Purchase Plan"
2. **Checkout Started** - User reaches checkout page
3. **Payment Info Entered** - User fills form
4. **Payment Submitted** - User clicks pay button
5. **Purchase Completed** - Success page reached
6. **Purchase Abandoned** - User leaves checkout

### Implementation Example

```typescript
// Google Analytics / Mixpanel
trackEvent('purchase_initiated', {
  plan_id: plan.id,
  plan_country: plan.country,
  plan_price: plan.price
});
```

## 🎯 Next Steps for Production

1. **Payment Gateway Integration**
   - Set up Stripe/PayPal account
   - Add API keys to environment variables
   - Implement payment processing backend

2. **Database Setup**
   - Store orders
   - Store purchase history
   - Link orders to user accounts

3. **Email Service**
   - Set up SendGrid/Resend
   - Create email templates
   - Generate and send QR codes

4. **Backend API**
   - Create order processing endpoints
   - Implement webhook handlers
   - Add order verification

5. **Testing**
   - Unit tests for checkout flow
   - Integration tests for payment
   - E2E tests for complete purchase flow

## 💡 Usage Examples

### Using Checkout Context

```tsx
import { useCheckout } from '@/contexts/CheckoutContext';

function MyComponent() {
  const { selectedPlan, setSelectedPlan, clearCheckout } = useCheckout();
  
  // Set a plan for checkout
  setSelectedPlan(planData);
  
  // Clear checkout after purchase
  clearCheckout();
  
  // Access current plan
  console.log(selectedPlan?.country);
}
```

### Programmatic Navigation to Checkout

```tsx
import { useRouter } from 'next/navigation';
import { useCheckout } from '@/contexts/CheckoutContext';

function PurchaseButton({ plan }) {
  const router = useRouter();
  const { setSelectedPlan } = useCheckout();
  
  const handleClick = () => {
    setSelectedPlan(plan);
    router.push('/checkout');
  };
  
  return <button onClick={handleClick}>Buy Now</button>;
}
```

## ✅ Summary

The complete purchase flow is now functional with:
- ✅ Marketplace with purchase buttons
- ✅ Authentication check before purchase
- ✅ Seamless login redirect with plan preservation
- ✅ Professional checkout page with payment form
- ✅ Order summary and pricing
- ✅ Success page with order confirmation
- ✅ Activation instructions
- ✅ Protected routes
- ✅ Mobile responsive design
- ✅ Dark mode support

The system is ready for backend integration and payment gateway setup!

