// BUG-007 FIX: Remove hardcoded LAN IP fallback
export const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/';
