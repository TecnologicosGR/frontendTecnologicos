import { useState, useCallback } from 'react';
import { productsService } from '../services/products.service';

export function useProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Import Logic
  const validateFile = async (file) => {
    setLoading(true);
    try {
      const data = await productsService.validateImport(file);
      return { success: true, data };
    } catch (err) {
      return { success: false, error: err.detail || 'Error en validación' };
    } finally {
      setLoading(false);
    }
  };

  const uploadFile = async (file) => {
    setLoading(true);
    try {
      await productsService.uploadImport(file);
      await fetchProducts(); // Refresh list
      return { success: true };
    } catch (err) {
      return { success: false, error: err.detail || 'Error en carga masiva' };
    } finally {
      setLoading(false);
    }
  };


  const fetchProducts = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const data = await productsService.getAll(params);
      setProducts(data);
    } catch (err) {
      setError(err.detail || 'Error al cargar productos');
    } finally {
      setLoading(false);
    }
  }, []);

  const createProduct = async (data) => {
    setLoading(true);
    try {
      await productsService.create(data);
      await fetchProducts();
      return { success: true };
    } catch (err) {
       return { success: false, error: err.detail || 'Error al crear producto' };
    } finally {
      setLoading(false);
    }
  };

  const updateProduct = async (id, data) => {
    setLoading(true);
    try {
      await productsService.update(id, data);
      await fetchProducts();
      return { success: true };
    } catch (err) {
      return { success: false, error: err.detail || 'Error al actualizar producto' };
    } finally {
      setLoading(false);
    }
  };

  const deleteProduct = async (id) => {
      setLoading(true);
      try {
          await productsService.delete(id);
          setProducts(prev => prev.filter(p => p.id !== id));
          return { success: true };
      } catch (err) {
          return { success: false, error: err.detail || 'Error al eliminar producto' };
      } finally {
          setLoading(false);
      }
  }

  return {
    products,
    loading,
    error,
    fetchProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    validateFile,
    uploadFile
  };
}
