# Garra Pega-Pega · realidade aumentada

Site em **Vite** com o braço hidráulico A-81 e a garra Pega-Pega em 3D: a garra pega a palavra IGOR, as peças são numeradas, e o botão "Ver em realidade aumentada" põe o modelo na mesa pelo celular.

## Rodar no computador

Precisa do **Node.js 22** (nodejs.org).

```bash
npm install
npm run dev
```

Abra o endereço que aparecer (http://localhost:5173). O terminal também mostra um endereço "Network": abrindo ele no celular, na mesma rede Wi-Fi, dá para testar o site no celular. A realidade aumentada exige https, então ela só funciona depois de publicar.

Para gerar a versão final: `npm run build` (cria a pasta `dist`). Para conferir: `npm run preview`.

## Publicar no Render

1. **Envie o projeto para o GitHub.** Crie um repositório (ex.: `garra-pega-pega-ra`). Na página dele, clique em "uploading an existing file", arraste **todo o conteúdo desta pasta** (menos `node_modules` e `dist`, se existirem) e clique em "Commit changes".
2. **No Render** (render.com), entre com a conta do GitHub.
3. Clique em **New → Blueprint**, escolha o repositório e clique em **Apply**. O arquivo `render.yaml` já tem tudo configurado:
   - comando de build: `npm ci && npm run build`;
   - pasta publicada: `dist`;
   - Node 22;
   - o tipo de arquivo certo para o `.usdz`, sem o qual a realidade aumentada não abre no iPhone.
4. Espere o build terminar (1 a 3 minutos). O site fica em `https://garra-pega-pega-ra.onrender.com` (ou o nome que o Render der).

**Sem Blueprint:** clique em New → Static Site e use Build Command `npm ci && npm run build` e Publish Directory `dist`. Em Environment, adicione `NODE_VERSION` = `22`. Em Settings → Headers, adicione Path `/*.usdz`, Name `Content-Type`, Value `model/vnd.usdz+zip`.

Cada novo envio para o GitHub (Commit) publica o site de novo sozinho.

## Onde mexer

| O que | Arquivo |
|---|---|
| Textos da página, nome do grupo | `index.html` |
| Cores, fontes, tamanhos | `src/style.css` |
| Botões, barra da garra, números das peças, QR code | `src/main.js` |
| Posições dos números e fases da animação | `src/hot_grab.json` |
| Modelos 3D (Android/computador e iPhone) | `public/models/*.glb` e `*.usdz` |
| Imagens de espera | `public/img/` |

Ao trocar um modelo, mantenha o mesmo nome de arquivo.
