/**
 * Utility function untuk mendapatkan URL logo yang konsisten
 * Menggunakan environment variable VITE_API_BASE_URL untuk production
 */
export const getLogoUrl = (): string => {
  const baseUrl = import.meta.env.VITE_API_BASE_URL || 'https://api.mostara.id/api'
  return `${baseUrl}/uploads/logos/logo1.jpg`
}