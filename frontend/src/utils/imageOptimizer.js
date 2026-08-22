/**
 * Image Optimization Helper
 * Automatically transforms image URLs (Cloudinary, Unsplash, etc.) to request optimal format (WebP/AVIF),
 * quality (q_auto / q_80), and specific target dimensions.
 */

/**
 * Transforms an image URL to deliver optimized format, quality, and resolution.
 * @param {string} url - Original image URL or base64 data-uri.
 * @param {Object} options - Transformation options.
 * @param {number} [options.width=800] - Target width in pixels.
 * @param {number} [options.quality=80] - Compression quality (0-100).
 * @param {string} [options.format='auto'] - Desired format ('auto', 'webp', 'avif').
 * @returns {string} Optimized URL.
 */
export const getOptimizedImageUrl = (url, options = {}) => {
  if (!url || typeof url !== 'string') return url;

  // 1. Data URIs or blob URLs cannot be transformed by CDN
  if (url.startsWith('data:') || url.startsWith('blob:')) {
    return url;
  }

  const { width = 800, quality = 80, format = 'auto' } = options;

  // 2. Cloudinary URLs (e.g. https://res.cloudinary.com/<cloud_name>/image/upload/v123456/...)
  if (url.includes('res.cloudinary.com') && url.includes('/upload/')) {
    // Prevent double-adding transformations if already present
    if (url.includes('/upload/f_auto') || url.includes('/upload/q_auto') || url.includes('/upload/w_')) {
      return url;
    }
    const transformString = `/upload/f_${format},q_auto,w_${width},c_limit/`;
    return url.replace('/upload/', transformString);
  }

  // 3. Unsplash URLs (e.g. https://images.unsplash.com/photo-...)
  if (url.includes('images.unsplash.com')) {
    try {
      const urlObj = new URL(url);
      urlObj.searchParams.set('auto', 'format');
      urlObj.searchParams.set('fit', 'crop');
      urlObj.searchParams.set('w', width.toString());
      urlObj.searchParams.set('q', quality.toString());
      return urlObj.toString();
    } catch {
      return url;
    }
  }

  // 4. Other standard image URLs
  return url;
};

/**
 * Preloads an image into browser cache.
 * @param {string} url - Image URL to preload.
 */
export const preloadImage = (url) => {
  if (!url || typeof url !== 'string' || url.startsWith('data:')) return;
  const img = new Image();
  img.src = url;
};

/**
 * Generates a tiny SVG placeholder blur data URI while image loads.
 * @param {number} width
 * @param {number} height
 */
export const getBlurPlaceholder = (width = 400, height = 300) => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}">
    <filter id="b" blurRadius="20">
      <feGaussianBlur stdDeviation="20" />
    </filter>
    <rect width="100%" height="100%" fill="#1e293b" />
    <rect width="100%" height="100%" fill="#334155" filter="url(#b)" opacity="0.5" />
  </svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
};
