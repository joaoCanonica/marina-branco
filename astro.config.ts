import { defineConfig } from 'astro/config';
import { regulatorio } from './src/lib/integracao-regulatoria.ts';

export default defineConfig({
  site: 'https://CONFIRMAR-dominio.com.br',
  trailingSlash: 'never',
  build: { format: 'file' },
  integrations: [regulatorio()],
});
