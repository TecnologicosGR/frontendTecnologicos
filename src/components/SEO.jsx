import { useEffect } from 'react';

/**
 * Componente SEO para actualizar de manera dinámica el título, la descripción
 * y las palabras clave de la página en el head del documento.
 * 
 * @param {string} title - Título de la página (ej: "Catálogo")
 * @param {string} description - Descripción corta optimizada para buscadores
 * @param {string} keywords - Palabras clave separadas por comas
 */
export default function SEO({ title, description, keywords }) {
  useEffect(() => {
    // 1. Título principal
    const baseTitle = "Tecno-logicos GR";
    const formattedTitle = title ? `${title} | ${baseTitle}` : `${baseTitle} | Servicio Técnico y Accesorios en Valledupar`;
    document.title = formattedTitle;

    // Función auxiliar para actualizar o crear etiquetas meta
    const updateMetaTag = (name, property, value) => {
      if (!value) return;
      const selector = name ? `meta[name="${name}"]` : `meta[property="${property}"]`;
      let element = document.head.querySelector(selector);
      
      if (element) {
        element.setAttribute('content', value);
      } else {
        element = document.createElement('meta');
        if (name) element.setAttribute('name', name);
        if (property) element.setAttribute('property', property);
        element.setAttribute('content', value);
        document.head.appendChild(element);
      }
    };

    // 2. Descripción
    if (description) {
      updateMetaTag('description', null, description);
      updateMetaTag(null, 'og:description', description);
      updateMetaTag('twitter:description', null, description);
    }

    // 3. Palabras clave
    if (keywords) {
      updateMetaTag('keywords', null, keywords);
    }

    // 4. Título para redes sociales
    if (title) {
      updateMetaTag(null, 'og:title', formattedTitle);
      updateMetaTag('twitter:title', null, formattedTitle);
    }

  }, [title, description, keywords]);

  return null;
}
