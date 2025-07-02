import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// The name of your GitHub repository.
const GITHUB_REPOSITORY_NAME = 'Search-V4';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env variables from .env files. The third parameter '' makes it load all variables.
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    plugins: [react()],
    // This is the base path of your site. For GitHub Pages, it's the repository name.
    // This ensures that asset links in the built HTML are correct.
    // e.g., /Search-V4/vite.svg instead of /vite.svg
    base: `/${GITHUB_REPOSITORY_NAME}/`,
    build: {
      outDir: 'dist',
      // Externalize dependencies that are loaded via the importmap in index.html
      // This tells Vite not to bundle them.
      rollupOptions: {
        external: ['jspdf', 'html2canvas', 'gapi-script', 'xlsx'],
      },
    },
    // Make environment variables available in your client-side code.
    define: {
      'process.env.API_KEY': JSON.stringify(env.API_KEY),
      'process.env.GOOGLE_API_KEY': JSON.stringify(env.GOOGLE_API_KEY),
      'process.env.GOOGLE_CLIENT_ID': JSON.stringify(env.GOOGLE_CLIENT_ID),
    },
  }
})