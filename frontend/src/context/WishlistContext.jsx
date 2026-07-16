import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from '../components/Toast';

const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
  const [wishlistItems, setWishlistItems] = useState(() => {
    try {
      const stored = localStorage.getItem('wishlist');
      return stored ? JSON.parse(stored) : [];
    } catch (err) {
      console.warn('Could not parse wishlist from localStorage. Starting fresh.');
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('wishlist', JSON.stringify(wishlistItems));
  }, [wishlistItems]);

  const addToWishlist = (product) => {
    if (wishlistItems.some(p => p._id === product._id)) {
      toast.info(`${product.name} is already in your wishlist!`);
      return;
    }
    setWishlistItems(prev => [...prev, product]);
    toast.success(`Added ${product.name} to wishlist! ❤️`);
  };

  const removeFromWishlist = (productId) => {
    const item = wishlistItems.find(p => p._id === productId);
    setWishlistItems(prev => prev.filter(p => p._id !== productId));
    if (item) {
      toast.info(`Removed ${item.name} from wishlist.`);
    }
  };

  const isWishlisted = (productId) => {
    return wishlistItems.some(p => p._id === productId);
  };

  const wishlistCount = wishlistItems.length;

  return (
    <WishlistContext.Provider value={{ wishlistItems, addToWishlist, removeFromWishlist, isWishlisted, wishlistCount }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};
