import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { publicApi } from './api';

const CART_STORAGE_KEY = 'kasturi_cart';

const CartContext = createContext(null);

function loadCart() {
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveCart(cart) {
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
}

export function CartProvider({ children }) {
  const [cart, setCart] = useState(loadCart); // { productId: quantity }
  const [quote, setQuote] = useState(null);
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const quoteTimer = useRef(null);

  // Persist to localStorage whenever cart changes
  useEffect(() => {
    saveCart(cart);
  }, [cart]);

  // Fetch quote with debounce whenever cart changes
  useEffect(() => {
    if (quoteTimer.current) clearTimeout(quoteTimer.current);

    const items = Object.entries(cart)
      .filter(([, qty]) => qty > 0)
      .map(([productId, quantity]) => ({ productId, quantity }));

    if (items.length === 0) {
      setQuote(null);
      setQuoteLoading(false);
      return;
    }

    setQuoteLoading(true);
    quoteTimer.current = setTimeout(() => {
      publicApi
        .getQuote(items)
        .then((q) => {
          setQuote(q);
          setQuoteLoading(false);
        })
        .catch(() => setQuoteLoading(false));
    }, 300);

    return () => {
      if (quoteTimer.current) clearTimeout(quoteTimer.current);
    };
  }, [cart]);

  const addToCart = useCallback((productId) => {
    setCart((prev) => ({ ...prev, [productId]: (prev[productId] || 0) + 1 }));
  }, []);

  const removeFromCart = useCallback((productId) => {
    setCart((prev) => {
      const newQty = (prev[productId] || 0) - 1;
      if (newQty <= 0) {
        const { [productId]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [productId]: newQty };
    });
  }, []);

  const removeProduct = useCallback((productId) => {
    setCart((prev) => {
      const { [productId]: _, ...rest } = prev;
      return rest;
    });
  }, []);

  const clearCart = useCallback(() => {
    setCart({});
    setQuote(null);
  }, []);

  const setQuantity = useCallback((productId, qty) => {
    setCart((prev) => {
      if (qty <= 0) {
        const { [productId]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [productId]: qty };
    });
  }, []);

  const totalItems = Object.values(cart).reduce((sum, q) => sum + q, 0);

  const cartItems = Object.entries(cart)
    .filter(([, qty]) => qty > 0)
    .map(([productId, quantity]) => ({ productId, quantity }));

  const openDrawer = useCallback(() => setDrawerOpen(true), []);
  const closeDrawer = useCallback(() => setDrawerOpen(false), []);
  const toggleDrawer = useCallback(() => setDrawerOpen((v) => !v), []);

  return (
    <CartContext.Provider
      value={{
        cart,
        cartItems,
        quote,
        quoteLoading,
        totalItems,
        addToCart,
        removeFromCart,
        removeProduct,
        clearCart,
        setQuantity,
        drawerOpen,
        openDrawer,
        closeDrawer,
        toggleDrawer,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within a CartProvider');
  return ctx;
}
