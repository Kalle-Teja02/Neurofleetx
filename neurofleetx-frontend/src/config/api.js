// Central API base URL — reads from .env (VITE_API_URL)
// Set VITE_API_URL in .env for local dev or Render environment variables for production
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8082';

export default API_URL;
