import React, { createContext, useContext, useState, useEffect } from 'react';
import { ICartItem, IMenuItem, IMenuVariant, IMenuAddOn, ICoupon } from '../types';
import { couponService } from '../services/coupon.service';
import { useToast } from '@chakra-ui/react';

interface CartContextType {
  items: ICartItem[];
  totalCount: number;
  subtotal: number;
  discount: number;
  taxAmount: number;
  grandTotal: number;
  appliedCoupon: ICoupon | null;
  isApplyingCoupon: boolean;
  addItem: (
    item: IMenuItem,
    quantity?: number,
    variant?: IMenuVariant,
    addOns?: IMenuAddOn[],
    notes?: string
  ) => void;
  updateQuantity: (cartItemId: string, newQuantity: number) => void;
  removeItem: (cartItemId: string) => void;
  clearCart: () => void;
  applyCoupon: (code: string) => Promise<boolean>;
  removeCoupon: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'vyntra_customer_cart';
const COUPON_STORAGE_KEY = 'vyntra_customer_coupon';

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const toast = useToast();
  const [items, setItems] = useState<ICartItem[]>(() => {
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [appliedCoupon, setAppliedCoupon] = useState<ICoupon | null>(() => {
    try {
      const stored = localStorage.getItem(COUPON_STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [discount, setDiscount] = useState<number>(0);
  const [isApplyingCoupon, setIsApplyingCoupon] = useState<boolean>(false);

  // Persist items
  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch {
      // Storage quota fallback
    }
  }, [items]);

  // Persist coupon
  useEffect(() => {
    if (appliedCoupon) {
      localStorage.setItem(COUPON_STORAGE_KEY, JSON.stringify(appliedCoupon));
    } else {
      localStorage.removeItem(COUPON_STORAGE_KEY);
    }
  }, [appliedCoupon]);

  // Calculate Subtotal
  const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0);

  // Re-calculate or re-validate coupon discount when subtotal changes
  useEffect(() => {
    if (!appliedCoupon) {
      setDiscount(0);
      return;
    }

    if (subtotal < appliedCoupon.minOrderAmount) {
      setDiscount(0);
      setAppliedCoupon(null);
      toast({
        title: 'Coupon Removed',
        description: `Order total is below minimum required (₹${appliedCoupon.minOrderAmount}) for coupon ${appliedCoupon.code}`,
        status: 'warning',
        duration: 3500,
        isClosable: true,
      });
      return;
    }

    let calculatedDiscount = 0;
    if (appliedCoupon.discountType === 'percentage') {
      calculatedDiscount = (subtotal * appliedCoupon.discountValue) / 100;
      if (appliedCoupon.maxDiscount && calculatedDiscount > appliedCoupon.maxDiscount) {
        calculatedDiscount = appliedCoupon.maxDiscount;
      }
    } else {
      calculatedDiscount = appliedCoupon.discountValue;
    }

    calculatedDiscount = Math.min(calculatedDiscount, subtotal);
    setDiscount(Math.round(calculatedDiscount * 100) / 100);
  }, [subtotal, appliedCoupon]);

  // Tax calculation (Combined standard 7.5% - state + city)
  const taxableAmount = Math.max(0, subtotal - discount);
  const taxAmount = Math.round(taxableAmount * 0.075 * 100) / 100;
  const grandTotal = Math.round((taxableAmount + taxAmount) * 100) / 100;

  const totalCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const generateCartItemId = (
    menuItemId: string,
    variant?: IMenuVariant,
    addOns: IMenuAddOn[] = []
  ): string => {
    const varPart = variant?.name ? `_v:${variant.name}` : '';
    const addOnPart = addOns.length
      ? `_a:${addOns
          .map((a) => a.name)
          .sort()
          .join(',')}`
      : '';
    return `${menuItemId}${varPart}${addOnPart}`;
  };

  const addItem = (
    item: IMenuItem,
    quantity = 1,
    variant?: IMenuVariant,
    addOns: IMenuAddOn[] = [],
    notes = ''
  ) => {
    const variantAdjustment = variant?.priceAdjustment || 0;
    const addOnsTotal = addOns.reduce((sum, a) => sum + a.price, 0);
    const unitPrice = item.basePrice + variantAdjustment + addOnsTotal;
    const totalPrice = Math.round(unitPrice * quantity * 100) / 100;
    const cartItemId = generateCartItemId(item._id, variant, addOns);

    setItems((prevItems) => {
      const existingIndex = prevItems.findIndex((i) => i.cartItemId === cartItemId);
      if (existingIndex > -1) {
        const updated = [...prevItems];
        const newQty = updated[existingIndex].quantity + quantity;
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: newQty,
          totalPrice: Math.round(unitPrice * newQty * 100) / 100,
          notes: notes || updated[existingIndex].notes,
        };
        return updated;
      } else {
        const newItem: ICartItem = {
          cartItemId,
          menuItem: item,
          quantity,
          selectedVariant: variant,
          selectedAddOns: addOns,
          notes,
          unitPrice,
          totalPrice,
        };
        return [...prevItems, newItem];
      }
    });

    toast({
      title: 'Added to Cart',
      description: `${quantity}x ${item.name} added to your order`,
      status: 'success',
      duration: 2000,
      isClosable: true,
      position: 'bottom-right',
    });
  };

  const updateQuantity = (cartItemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItem(cartItemId);
      return;
    }

    setItems((prev) =>
      prev.map((item) => {
        if (item.cartItemId === cartItemId) {
          return {
            ...item,
            quantity: newQuantity,
            totalPrice: Math.round(item.unitPrice * newQuantity * 100) / 100,
          };
        }
        return item;
      })
    );
  };

  const removeItem = (cartItemId: string) => {
    setItems((prev) => prev.filter((item) => item.cartItemId !== cartItemId));
    toast({
      title: 'Item Removed',
      description: 'Item removed from your cart',
      status: 'info',
      duration: 1500,
      isClosable: true,
    });
  };

  const clearCart = () => {
    setItems([]);
    setAppliedCoupon(null);
    setDiscount(0);
  };

  const applyCoupon = async (code: string): Promise<boolean> => {
    if (!code.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a coupon code',
        status: 'error',
      });
      return false;
    }

    setIsApplyingCoupon(true);
    try {
      const result = await couponService.validate(code, subtotal);
      if (result.valid) {
        setAppliedCoupon(result.coupon);
        setDiscount(result.discount);
        toast({
          title: 'Coupon Applied!',
          description: `You saved $${result.discount.toFixed(2)} with coupon ${code.toUpperCase()}`,
          status: 'success',
          duration: 3000,
        });
        return true;
      }
      return false;
    } catch (err: any) {
      const message = err.response?.data?.message || 'Invalid or expired coupon code';
      toast({
        title: 'Coupon Failed',
        description: message,
        status: 'error',
        duration: 3500,
      });
      return false;
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setDiscount(0);
    toast({
      title: 'Coupon Removed',
      status: 'info',
      duration: 1500,
    });
  };

  return (
    <CartContext.Provider
      value={{
        items,
        totalCount,
        subtotal,
        discount,
        taxAmount,
        grandTotal,
        appliedCoupon,
        isApplyingCoupon,
        addItem,
        updateQuantity,
        removeItem,
        clearCart,
        applyCoupon,
        removeCoupon,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

