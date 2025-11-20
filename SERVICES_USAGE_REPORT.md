# Services Folder Usage Report

This document lists which service files are actually being used in the project.

## ✅ USED FILES

### 📁 services/create/
- ✅ **cart.tsx** - Used in `lib/cart-context.tsx` (addItemToCart, getOrCreateCart)
- ✅ **order.tsx** - Used in `app/checkout/page.tsx` (createOrder)
- ✅ **user.tsx** - Used in `app/signup/page.tsx` (createUserDocument)

### 📁 services/read/
- ✅ **banner.tsx** - Used in multiple home components:
  - `components/home/Hero.tsx`
  - `components/home/Collections.tsx`
  - `components/home/ForHer.tsx`
  - `components/home/Press.tsx`
  - `components/home/ForHim.tsx`
- ✅ **cart.tsx** - Used in `lib/cart-context.tsx` (getCart)
- ✅ **category.tsx** - Used in `lib/product-filters.ts` (getAllCategories)
- ✅ **order.tsx** - Used in:
  - `app/orders/page.tsx` (Order, OrderItem types)
  - `lib/order-helpers.ts` (getOrderItems, OrderItem type)
- ✅ **product.tsx** - Used in:
  - `lib/product-filters.ts` (getAllProducts)
  - `lib/order-helpers.ts` (getAllProductsById)
- ✅ **stock.tsx** - Used in:
  - `lib/cart-context.tsx` (checkStockAvailability)
  - `lib/order-helpers.ts` (getStocksByProductId)
- ✅ **subCategory.tsx** - Used in `lib/product-filters.ts` (getAllSubCategories)
- ✅ **user.tsx** - Used in:
  - `app/checkout/page.tsx` (getUserData)
  - `app/profile/page.tsx` (getUserData, updateUserName)
- ✅ **user-addresses.tsx** - Used in `app/profile/page.tsx` (addUserAddress, getUserAddresses, deleteUserAddress)
- ✅ **user-orders.tsx** - Used in `app/orders/page.tsx` (getUserOrders, getOrderItemsForOrder)

### 📁 services/update/
- ✅ **cart.tsx** - Used in `lib/cart-context.tsx` (updateCartItems, removeCartItem, clearCart, updateCartItemQuantity)
- ✅ **order.tsx** - Used in:
  - `lib/order-helpers.ts` (addOrUpdateOrderItem)
  - `services/update/user-order.tsx` (cancelOrder, cancelOrderItem, updateOrderItemStatus)
- ✅ **product.tsx** - Used in:
  - `lib/order-helpers.ts` (updateStockQuantity)
  - `services/update/user-order.tsx` (updateStockQuantity)
- ✅ **user-order.tsx** - Used in `app/orders/page.tsx` (cancelUserOrder, cancelUserOrderItem, returnUserOrderItem)

---

## ❌ UNUSED FILES

### 📁 services/create/
- ❌ banner.tsx
- ❌ brand.tsx
- ❌ category.tsx
- ❌ charges.tsx
- ❌ deliverySchedule.tsx
- ❌ extra.tsx
- ❌ freeOffer.tsx
- ❌ kitchen.tsx
- ❌ notification.tsx
- ❌ payment.tsx
- ❌ product.tsx
- ❌ status.tsx
- ❌ store.tsx
- ❌ subCategory.tsx
- ❌ subscription.tsx
- ❌ transaction.tsx
- ❌ unit.tsx
- ❌ warehouse.tsx

### 📁 services/read/
- ❌ analytics.tsx
- ❌ brand.tsx
- ❌ charges.tsx
- ❌ deliverySchedule.tsx
- ❌ extra.tsx
- ❌ freeOffer.tsx
- ❌ kitchen.tsx
- ❌ notification.tsx
- ❌ payment.tsx
- ❌ status.tsx
- ❌ store.tsx
- ❌ subscription.tsx
- ❌ transaction.tsx
- ❌ unit.tsx
- ❌ wallet.tsx
- ❌ warehouse.tsx

### 📁 services/update/
- ❌ banner.tsx
- ❌ brand.tsx
- ❌ category.tsx
- ❌ charges.tsx
- ❌ cod.tsx
- ❌ deliverySchedule.tsx
- ❌ extra.tsx
- ❌ freeOffer.tsx
- ❌ kitchen.tsx
- ❌ payment.tsx
- ❌ status.tsx
- ❌ store.tsx
- ❌ subCategory.tsx
- ❌ unit.tsx
- ❌ user.tsx
- ❌ wallet.tsx
- ❌ warehouse.tsx

### 📁 services/delete/
- ❌ **ALL FILES** - No delete operations are currently being used in the project
  - banner.tsx
  - brand.tsx
  - category.tsx
  - charges.tsx
  - deliverySchedule.tsx
  - extra.tsx
  - freeOffer.tsx
  - kitchen.tsx
  - notification.tsx
  - order.tsx
  - payment.tsx
  - product.tsx
  - status.tsx
  - store.tsx
  - subCategory.tsx
  - unit.tsx
  - user.tsx
  - warehouse.tsx

---

## 📊 Summary Statistics

### Total Files:
- **Create**: 21 files (3 used, 18 unused) - 14% usage
- **Read**: 26 files (11 used, 15 unused) - 42% usage
- **Update**: 20 files (4 used, 16 unused) - 20% usage
- **Delete**: 18 files (0 used, 18 unused) - 0% usage

### Overall:
- **Total Files**: 85 files
- **Used**: 18 files (21%)
- **Unused**: 67 files (79%)

---

## 📝 Notes

1. **Delete folder**: Completely unused - all 18 files are not referenced anywhere
2. **Most used folder**: `services/read/` with 11 files in use
3. **Core functionality**: The project primarily uses:
   - Cart operations (create, read, update)
   - Order operations (create, read, update)
   - User operations (create, read, update)
   - Product/Category/Stock operations (read)
   - Banner operations (read)

4. **Potential cleanup**: 67 unused files could be removed if not needed for future features

