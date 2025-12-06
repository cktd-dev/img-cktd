import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, process.cwd(), '');
  
  // Attempt to find the key in various locations
  // 1. VITE_API_KEY (Vercel UI / .env file)
  // 2. API_KEY (System / Legacy)
  const apiKey = env.VITE_API_KEY || env.API_KEY || process.env.VITE_API_KEY || process.env.API_KEY;

  return {
    plugins: [react()],
    define: {
      // Define a global constant string that will be replaced at build time
      // This avoids "process is not defined" errors in the browser
      '__GEMINI_API_KEY__': JSON.stringify(apiKey),
    },
  }
})