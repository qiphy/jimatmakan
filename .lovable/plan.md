

## Checkout Page Plan

### What we're building
A checkout page (`/checkout/:listingId`) where users can review a listing, select quantity, choose a payment method, and place an order that gets saved to the `orders` table in Supabase.

### Changes

**1. New page: `src/pages/CheckoutPage.tsx`**
- Receives listing ID from URL params
- Fetches listing details + vendor name from Supabase
- Shows: item image/emoji, title, vendor, price breakdown (original vs discounted), weight
- Quantity selector (capped at listing's available quantity)
- Order summary: subtotal, savings amount
- Payment method selection (Touch 'n Go, Credit/Debit Card, Bank Transfer) — UI-only selection matching existing profile payment patterns
- "Place Order" button that inserts into `orders` table with `buyer_id`, `vendor_id`, `listing_id`, `quantity`, `weight_kg`, `total_price`, `status: 'pending'`
- Success state with confirmation message and navigation back to browse
- Back button to return to previous page

**2. Update `src/components/FoodListingCard.tsx`**
- Wire the "Buy Now" button to navigate to `/checkout/{listing.id}` using `useNavigate`

**3. Update `src/App.tsx`**
- Add `/checkout/:listingId` route wrapped in `ProtectedRoute`

**4. Update `src/contexts/LanguageContext.tsx`**
- Add translation keys: `checkout`, `orderSummary`, `quantity`, `subtotal`, `youSave`, `selectPayment`, `placeOrder`, `orderPlaced`, `orderConfirmation`, `backToBrowse`, `itemUnavailable`

### Technical details
- No database changes needed — the `orders` table already has the right schema
- The existing `update_impact_on_order` trigger will handle impact metrics when orders are marked completed
- Payment is UI-only (no real payment processing) — just records the selected method
- Uses existing Supabase client and auth context patterns

