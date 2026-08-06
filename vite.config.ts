import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

const UPSTREAM = 'https://api.thecatapi.com/v1'

export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  if (command === 'serve' && !env.CAT_API_KEY) {
    console.warn(
      '\n  CAT_API_KEY is not set. Requests go out unauthenticated and ' +
        'TheCatAPI applies stricter rate limits.\n',
    )
  }

  return {
    plugins: [react()],
    server: {
      proxy: {
        '/api': {
          target: UPSTREAM,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ''),
          headers: env.CAT_API_KEY
            ? { 'x-api-key': env.CAT_API_KEY }
            : undefined,
        },
      },
    },
  }
})
