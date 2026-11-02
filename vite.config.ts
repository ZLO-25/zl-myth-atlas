import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// GitHub Pages 會放在 /zl-myth-atlas/ 底下，部署流程用 BASE_PATH 指定；本機開發維持 /
export default defineConfig({
  base: process.env.BASE_PATH || '/',
  plugins: [react()],
  server: { port: 5173 },
});
