import { defineConfig } from 'vite';
import { copyFileSync, existsSync } from 'node:fs';

// copia os PDFs que estão na raiz do repositório para o site publicado
// (manual e material didático: são os endereços dos QR codes do panfleto)
const copiarPdfs = {
  name: 'copiar-pdfs',
  apply: 'build',
  closeBundle() {
    const lista = [
      ['manual.pdf', 'manual.pdf'],
      ['material.pdf', 'material.pdf'],
      ['material.pdf', 'material-didatico.pdf'],
      ['material-didatico.pdf', 'material-didatico.pdf']
    ];
    for (const [de, para] of lista) {
      if (existsSync(de)) copyFileSync(de, `dist/${para}`);
    }
  }
};

export default defineConfig({
  // caminhos relativos: o site funciona na raiz do domínio ou numa subpasta
  base: './',
  plugins: [copiarPdfs],
  server: { host: true },          // permite abrir pelo celular na mesma rede (npm run dev)
  preview: { host: true },
  build: {
    outDir: 'dist',
    assetsInlineLimit: 0,          // nunca embutir modelos/imagens no JS
    chunkSizeWarningLimit: 2000    // o model-viewer (three.js) é grande mesmo
  }
});
