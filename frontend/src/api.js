// frontend/src/api.js

/**
 * Bepaalt dynamisch de basis-URL voor de backend API.
 * 
 * - Lokaal (tijdens 'npm run dev' ): Gebruikt de URL uit het .env-bestand 
 *   (VITE_API_BASE_URL), die wijst naar de lokale backend.
 * 
 * - Live (op Render): Gebruikt de hardgecodeerde URL van de live backend,
 *   omdat de VITE_API_BASE_URL daar niet bestaat.
 */
const API_URL = process.env.REACT_APP_API_BASE_URL || 'https://nutricoach-project.onrender.com';

export default API_URL;
