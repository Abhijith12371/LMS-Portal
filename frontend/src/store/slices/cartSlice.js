import { createSlice } from '@reduxjs/toolkit';

// Cart stores { course, couponCode, discountAmount, finalPrice }
const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    item:         null,   // LMS allows single-item checkout
    coupon:       null,
    finalPrice:   0,
    discountAmount: 0,
  },
  reducers: {
    addToCart(state, action) {
      state.item       = action.payload;
      state.finalPrice = action.payload.price;
      state.coupon     = null;
      state.discountAmount = 0;
    },
    applyCoupon(state, action) {
      const { discountAmount, finalPrice, coupon } = action.payload;
      state.coupon         = coupon;
      state.discountAmount = discountAmount;
      state.finalPrice     = finalPrice;
    },
    removeCoupon(state) {
      state.coupon         = null;
      state.discountAmount = 0;
      state.finalPrice     = state.item?.price || 0;
    },
    clearCart(state) {
      state.item           = null;
      state.coupon         = null;
      state.finalPrice     = 0;
      state.discountAmount = 0;
    },
  },
});

export const { addToCart, applyCoupon, removeCoupon, clearCart } = cartSlice.actions;
export default cartSlice.reducer;
