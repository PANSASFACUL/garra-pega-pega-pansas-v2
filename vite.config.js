import { defineConfig } from 'vite';

export default defineConfig({
  // caminhos relativos: o site funciona na raiz do domínio ou numa subpasta
  base: './',
  server: { host: true },          // permite abrir pelo celular na mesma rede (npm run dev)
  preview: { host: true },
  build: {
    outDir: 'dist',
    assetsInlineLimit: 0,          // nunca embutir modelos/imagens no JS
    chunkSizeWarningLimit: 2000    // o model-viewer (three.js) é grande mesmo
  }
});
