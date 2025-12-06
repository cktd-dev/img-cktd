import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, process.cwd(), '');
  
  // Vercel sometimes puts keys in process.env, sometimes in the loaded env. 
  // We check all standard variations to be safe.
  // Priority: VITE_API_KEY (Standard) -> API_KEY (Legacy/Backend)
  const apiKey = env.VITE_API_KEY || env.API_KEY || process.env.VITE_API_KEY || process.env.API_KEY;

  return {
    plugins: [react()],
    define: {
      // Safely inject the key. If missing, it becomes undefined (handled in service)
      'process.env.API_KEY': JSON.stringify(apiKey),
    },
  }
})