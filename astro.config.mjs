import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';

export default defineConfig({
  output: 'server',
  // The upload API is authenticated with a bearer secret (see /api/upload),
  // and the iPhone Shortcut sends no Origin header, so origin-check CSRF
  // protection would block it.
  security: { checkOrigin: false },
  adapter: cloudflare({
    platformProxy: { enabled: true },
  }),
});
