import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  const cachePort = env.VITE_CACHE_PORT;
  const isDebug = env.VITE_DEBUG === 'true';	

  console.log('Vite loaded with:', { cachePort, isDebug });

  return {
    server: {
      port: env.VITE_PAGE_PORT ? parseInt(env.VITE_PAGE_PORT) : 5173,
      open: true,
      logLevel: isDebug ? 'info' : 'error',
    },
  };
});