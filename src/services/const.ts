export const API_BASE_URL = import.meta.env.VITE_BASE_URL as string | undefined;
export const API_KEY = import.meta.env.VITE_API_KEY as string | undefined;

if (!API_BASE_URL) {
  throw new Error('VITE_BASE_URL is not set. Add it to .env and restart the dev server.');
}