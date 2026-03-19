import React, { useState, useEffect, createContext, useContext, useCallback } from 'react';
import api from '../../../lib/axios';
import { useAuth } from '../../auth/hooks/useAuth';
import { useToast } from '../../../components/ui/toast';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [cart, setCart] = useState({
    items: [],
    subtotal: 0,
    impuestos: 0,
    total: 0
  });
  const [loading, setLoading] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false); // Global cart drawer state

  const fetchCart = useCallback(async () => {
    if (!user) {
      setCart({ items: [], subtotal: 0, impuestos: 0, total: 0 });
      return;
    }
    
    setLoading(true);
    try {
      const { data } = await api.get('/sales/cart');
      setCart(data);
    } catch (error) {
      console.error("Error fetching cart:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Load cart when user changes
  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const addToCart = async (productId, cantidad = 1) => {
    if (!user) {
       toast({
         title: "Sesión requerida",
         description: "Debes iniciar sesión para añadir productos al carrito.",
         variant: "destructive"
       });
       // Opcional: open login modal or redirect
       return false;
    }

    setLoading(true);
    try {
      await api.post('/sales/cart', {
        id_producto: productId,
        cantidad: cantidad
      });
      await fetchCart();
      setIsDrawerOpen(true); // Open drawer automatically
      toast({
        title: "¡Producto añadido!",
        description: "El producto se ha agregado a tu carrito.",
        variant: "success",
      });
      return true;
    } catch (error) {
      toast({
        title: "Error al añadir",
        description: error.response?.data?.detail || "No se pudo agregar al carrito.",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updateCartItem = async (productId, cantidad) => {
    setLoading(true);
    try {
      await api.patch(`/sales/cart/${productId}`, { cantidad });
      await fetchCart();
    } catch (error) {
       toast({
        title: "Error al actualizar",
        description: error.response?.data?.detail || "No se pudo actualizar el carrito.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const removeFromCart = async (productId) => {
    setLoading(true);
    try {
      await api.delete(`/sales/cart/${productId}`);
      await fetchCart();
    } catch (error) {
      console.error("Error removing item:", error);
    } finally {
      setLoading(false);
    }
  };

  const clearCart = async () => {
    setLoading(true);
    try {
      await api.delete('/sales/cart');
      await fetchCart();
    } catch (error) {
      console.error("Error clearing cart:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <CartContext.Provider value={{
      cart,
      loading,
      addToCart,
      updateCartItem,
      removeFromCart,
      clearCart,
      refreshCart: fetchCart,
      isDrawerOpen,
      setIsDrawerOpen
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
};
