import { useState, useCallback } from 'react';
import { categoriesService } from '../services/categories.service';

export function useCategories() {
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchCategories = useCallback(async (search = '') => {
    setLoading(true);
    setError(null);
    try {
      const data = await categoriesService.getAll(search);
      setCategories(data);
    } catch (err) {
      setError(err.detail || 'Error al cargar categorías');
    } finally {
      setLoading(false);
    }
  }, []);

  const createCategory = async (data) => {
      setLoading(true);
      try {
          await categoriesService.create(data);
          await fetchCategories();
          return { success: true };
      } catch (err) {
          return { success: false, error: err.detail || 'Error al crear categoría' };
      } finally {
          setLoading(false);
      }
  };

  const updateCategory = async (id, data) => {
      setLoading(true);
      try {
          await categoriesService.update(id, data);
          await fetchCategories();
          return { success: true };
      } catch (err) {
          return { success: false, error: err.detail || 'Error al actualizar categoría' };
      } finally {
          setLoading(false);
      }
  };

  const deleteCategory = async (id) => {
      setLoading(true);
      try {
          await categoriesService.delete(id);
          setCategories(prev => prev.filter(c => c.id !== id));
          return { success: true };
      } catch (err) {
          return { success: false, error: err.detail || 'Error al eliminar categoría' };
      } finally {
          setLoading(false);
      }
  }

  // Subcategories Logic
  const fetchSubcategories = useCallback(async (search = '') => {
      setLoading(true); // Share loading state? Or separate? Sharing for simplicity now.
      try {
          const data = await categoriesService.getAllSubcategories(search);
          setSubcategories(data);
      } catch (err) {
          console.error("Error loading subcategories", err);
      } finally {
          setLoading(false);
      }
  }, []);

  const createSubcategory = async (data) => {
      setLoading(true);
      try {
          await categoriesService.createSubcategory(data);
          await fetchSubcategories(); // Refresh list if we are viewing it
          return { success: true };
      } catch (err) {
          return { success: false, error: err.detail || 'Error al crear subcategoría' };
      } finally {
          setLoading(false);
      }
  }

  const deleteSubcategory = async (id) => {
      setLoading(true);
      try {
          await categoriesService.deleteSubcategory(id);
          setSubcategories(prev => prev.filter(s => s.id !== id));
          return { success: true };
      } catch (err) {
          return { success: false, error: err.detail || 'Error al eliminar subcategoría' };
      } finally {
          setLoading(false);
      }
  }

  return {
    categories,
    subcategories,
    loading,
    error,
    fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    fetchSubcategories,
    createSubcategory,
    deleteSubcategory
  };
}
