// Dynamically resolves API Base URL for local dev and production deployment (Vercel/Render)
export const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/$/, '');
