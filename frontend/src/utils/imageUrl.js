// Utility helper to format image URLs consistently across all components
export const formatImageUrl = (url) => {
  if (!url) return '';
  // If it's already an absolute HTTP/HTTPS URL (Cloudinary, Unsplash, external CDN)
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  // If it's a relative local backend path like /uploads/image-123.png
  const backendBase = import.meta.env.VITE_API_URL 
    ? import.meta.env.VITE_API_URL.replace('/api', '')
    : 'http://localhost:5000';
  return `${backendBase}${url.startsWith('/') ? '' : '/'}${url}`;
};
