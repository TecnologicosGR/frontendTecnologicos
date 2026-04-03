import { useCallback, useEffect, useMemo, useState } from 'react';
import { publicCatalogService } from '../services/publicCatalog.service';

const PRODUCTS_CACHE_KEY = 'public_catalog_products_v2';
const CATEGORIES_CACHE_KEY = 'public_catalog_categories_v2';
const CACHE_TTL_MS = 60 * 1000;

let productsCache = { items: [], total: 0, timestamp: 0 };
let categoriesCache = { items: [], timestamp: 0 };
let loadProductsPromise = null;
let loadCategoriesPromise = null;
let streamStarted = false;
let streamInstance = null;
const listeners = new Set();

function isFresh(ts) {
  return Date.now() - ts < CACHE_TTL_MS;
}

function emit() {
  listeners.forEach((cb) => cb());
}

function hydrateCacheFromStorage() {
  if (productsCache.timestamp || categoriesCache.timestamp) return;

  try {
    const rawProducts = localStorage.getItem(PRODUCTS_CACHE_KEY);
    if (rawProducts) {
      const parsed = JSON.parse(rawProducts);
      if (Array.isArray(parsed.items) && typeof parsed.timestamp === 'number') {
        productsCache = {
          items: parsed.items,
          total: parsed.total || parsed.items.length,
          timestamp: parsed.timestamp
        };
      }
    }
  } catch (error) {
    console.warn('No se pudo hidratar cache de productos', error);
  }

  try {
    const rawCategories = localStorage.getItem(CATEGORIES_CACHE_KEY);
    if (rawCategories) {
      const parsed = JSON.parse(rawCategories);
      if (Array.isArray(parsed.items) && typeof parsed.timestamp === 'number') {
        categoriesCache = {
          items: parsed.items,
          timestamp: parsed.timestamp
        };
      }
    }
  } catch (error) {
    console.warn('No se pudo hidratar cache de categorias', error);
  }
}

function persistProductsCache() {
  try {
    localStorage.setItem(PRODUCTS_CACHE_KEY, JSON.stringify(productsCache));
  } catch (error) {
    console.warn('No se pudo persistir cache de productos', error);
  }
}

function persistCategoriesCache() {
  try {
    localStorage.setItem(CATEGORIES_CACHE_KEY, JSON.stringify(categoriesCache));
  } catch (error) {
    console.warn('No se pudo persistir cache de categorias', error);
  }
}

function mergeStockUpdates(stockItems) {
  if (!Array.isArray(stockItems) || productsCache.items.length === 0) return;

  const stockById = new Map(stockItems.map((item) => [item.id, item]));
  let hasChanges = false;

  const nextItems = productsCache.items.map((product) => {
    const stockUpdate = stockById.get(product.id);
    if (!stockUpdate) return product;

    if (
      product.existencias === stockUpdate.existencias &&
      product.precio_venta_normal === stockUpdate.precio_venta_normal &&
      product.activo === stockUpdate.activo
    ) {
      return product;
    }

    hasChanges = true;
    return {
      ...product,
      existencias: stockUpdate.existencias,
      precio_venta_normal: stockUpdate.precio_venta_normal,
      activo: stockUpdate.activo
    };
  });

  if (hasChanges) {
    productsCache = {
      ...productsCache,
      items: nextItems,
      timestamp: Date.now()
    };
    persistProductsCache();
    emit();
  }
}

function startRealtimeStream() {
  if (streamStarted) return;
  streamStarted = true;

  const connect = () => {
    streamInstance = publicCatalogService.createStockEventSource();

    streamInstance.addEventListener('stock-update', (event) => {
      try {
        const data = JSON.parse(event.data);
        mergeStockUpdates(data.items || []);
      } catch (error) {
        console.warn('Evento SSE invalido', error);
      }
    });

    streamInstance.onerror = () => {
      if (streamInstance) {
        streamInstance.close();
      }
      streamInstance = null;
      streamStarted = false;
      setTimeout(() => startRealtimeStream(), 4000);
    };
  };

  connect();
}

hydrateCacheFromStorage();

export function usePublicCatalog() {
  const [products, setProducts] = useState(productsCache.items);
  const [categories, setCategories] = useState(categoriesCache.items);
  const [loadingProducts, setLoadingProducts] = useState(productsCache.items.length === 0);
  const [loadingCategories, setLoadingCategories] = useState(categoriesCache.items.length === 0);
  const [error, setError] = useState(null);

  useEffect(() => {
    const updateFromCache = () => {
      setProducts(productsCache.items);
      setCategories(categoriesCache.items);
    };

    listeners.add(updateFromCache);
    return () => {
      listeners.delete(updateFromCache);
    };
  }, []);

  const fetchProducts = useCallback(async ({ force = false } = {}) => {
    if (!force && productsCache.items.length > 0 && isFresh(productsCache.timestamp)) {
      setProducts(productsCache.items);
      setLoadingProducts(false);
      return productsCache.items;
    }

    if (!loadProductsPromise) {
      setLoadingProducts(productsCache.items.length === 0);
      loadProductsPromise = publicCatalogService
        .getProducts({ limit: 1000, offset: 0 })
        .then((data) => {
          const items = Array.isArray(data.items) ? data.items : [];
          productsCache = {
            items,
            total: data.total || items.length,
            timestamp: Date.now()
          };
          persistProductsCache();
          emit();
          setError(null);
          return items;
        })
        .catch((err) => {
          setError(err.detail || 'Error al cargar productos');
          throw err;
        })
        .finally(() => {
          loadProductsPromise = null;
          setLoadingProducts(false);
        });
    }

    return loadProductsPromise;
  }, []);

  const fetchCategories = useCallback(async ({ force = false } = {}) => {
    if (!force && categoriesCache.items.length > 0 && isFresh(categoriesCache.timestamp)) {
      setCategories(categoriesCache.items);
      setLoadingCategories(false);
      return categoriesCache.items;
    }

    if (!loadCategoriesPromise) {
      setLoadingCategories(categoriesCache.items.length === 0);
      loadCategoriesPromise = publicCatalogService
        .getCategories()
        .then((items) => {
          categoriesCache = {
            items: Array.isArray(items) ? items : [],
            timestamp: Date.now()
          };
          persistCategoriesCache();
          emit();
          setError(null);
          return categoriesCache.items;
        })
        .catch((err) => {
          setError(err.detail || 'Error al cargar categorias');
          throw err;
        })
        .finally(() => {
          loadCategoriesPromise = null;
          setLoadingCategories(false);
        });
    }

    return loadCategoriesPromise;
  }, []);

  const getProductById = useCallback(async (id, { force = false } = {}) => {
    const numericId = Number(id);
    const fromCache = productsCache.items.find((item) => item.id === numericId);
    if (fromCache && !force) return fromCache;

    const product = await publicCatalogService.getProductById(numericId);

    const existingIndex = productsCache.items.findIndex((item) => item.id === numericId);
    if (existingIndex >= 0) {
      const next = [...productsCache.items];
      next[existingIndex] = product;
      productsCache = { ...productsCache, items: next, timestamp: Date.now() };
    } else {
      productsCache = {
        items: [...productsCache.items, product],
        total: productsCache.total + 1,
        timestamp: Date.now()
      };
    }

    persistProductsCache();
    emit();
    return product;
  }, []);

  useEffect(() => {
    fetchProducts().catch(() => {});
    fetchCategories().catch(() => {});
    startRealtimeStream();
  }, [fetchProducts, fetchCategories]);

  return useMemo(
    () => ({
      products,
      categories,
      loadingProducts,
      loadingCategories,
      error,
      fetchProducts,
      fetchCategories,
      getProductById,
      refreshProducts: () => fetchProducts({ force: true }),
      refreshCategories: () => fetchCategories({ force: true })
    }),
    [
      products,
      categories,
      loadingProducts,
      loadingCategories,
      error,
      fetchProducts,
      fetchCategories,
      getProductById
    ]
  );
}
