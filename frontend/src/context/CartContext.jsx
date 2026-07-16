import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

const stableStringify = (obj) => {
  if (!obj || typeof obj !== 'object') {
    return JSON.stringify(obj);
  }
  const keys = Object.keys(obj).sort();
  const sorted = {};
  for (const key of keys) {
    const val = obj[key];
    sorted[key] = (val && typeof val === 'object') ? JSON.parse(stableStringify(val)) : val;
  }
  return JSON.stringify(sorted);
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) return JSON.parse(savedCart);
    
    return [];
  });

  // Persist cart items to localStorage on state change
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (product, quantity = 1, options = {}) => {
    setCartItems((prevItems) => {
      // Find item with same product ID and same options (like prescription type, lens selection)
      const existingItemIndex = prevItems.findIndex(
        (item) => item.product._id === product._id && stableStringify(item.options) === stableStringify(options)
      );

      if (existingItemIndex > -1) {
        const updatedItems = [...prevItems];
        updatedItems[existingItemIndex].quantity += quantity;
        return updatedItems;
      } else {
        return [...prevItems, { product, quantity, options }];
      }
    });
  };

  const removeFromCart = (productId, options = {}) => {
    setCartItems((prevItems) =>
      prevItems.filter(
        (item) => !(item.product._id === productId && stableStringify(item.options) === stableStringify(options))
      )
    );
  };

  const updateQuantity = (productId, quantity, options = {}) => {
    if (quantity <= 0) {
      removeFromCart(productId, options);
      return;
    }
    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.product._id === productId && stableStringify(item.options) === stableStringify(options)
          ? { ...item, quantity }
          : item
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const updateOptions = (productId, oldOptions, newOptions) => {
    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.product._id === productId && stableStringify(item.options) === stableStringify(oldOptions)
          ? { ...item, options: { ...item.options, ...newOptions } }
          : item
      )
    );
  };

  // Selectors
  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);
  
  const cartTotal = cartItems.reduce((total, item) => total + item.product.price * item.quantity, 0);

  // FIXED: cartLensCharges is always 0 - clean up dead code and confusing naming
  const cartLensCharges = 0;
  const cartSubtotal = cartTotal;
  const cartDelivery = 0;

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        updateOptions,
        clearCart,
        cartCount,
        cartTotal,
        cartLensCharges,
        cartSubtotal,
        cartDelivery,
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
