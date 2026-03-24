# Deploy do Portfolio

Este projeto é um portfólio React construído com Vite. Abaixo estão as instruções para fazer o deploy da aplicação.

## Pré-requisitos
- Node.js instalado
- Conta no GitHub (já configurado)
- Conta em uma plataforma de deploy (Vercel, Netlify, etc.)

## Build Local
Para testar o build localmente:
```bash
npm run build
npm run preview
```

## Opções de Deploy

### 1. Vercel (Recomendado)
1. Acesse [vercel.com](https://vercel.com) e faça login.
2. Clique em "New Project".
3. Conecte seu repositório GitHub (`andregabrielnc/andregabriel`).
4. Configure:
   - Framework Preset: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
5. Clique em "Deploy". O deploy será automático em cada push.

### 2. Netlify
1. Acesse [netlify.com](https://netlify.com) e faça login.
2. Clique em "Sites" > "Deploy manually" ou conecte o GitHub.
3. Para deploy manual:
   - Execute `npm run build` localmente.
   - Arraste a pasta `dist` para o Netlify.
4. Para deploy automático:
   - Conecte o repositório GitHub.
   - Build settings: `npm run build`, publish directory: `dist`.

### 3. GitHub Pages
1. No repositório GitHub, vá para "Settings" > "Pages".
2. Source: "GitHub Actions".
3. Crie um workflow em `.github/workflows/deploy.yml`:
   ```yaml
   name: Deploy to GitHub Pages

   on:
     push:
       branches: [ main ]

   jobs:
     build-and-deploy:
       runs-on: ubuntu-latest
       steps:
         - name: Checkout
           uses: actions/checkout@v4

         - name: Setup Node
           uses: actions/setup-node@v4
           with:
             node-version: 18

         - name: Install dependencies
           run: npm ci

         - name: Build
           run: npm run build

         - name: Deploy
           uses: peaceiris/actions-gh-pages@v3
           with:
             github_token: ${{ secrets.GITHUB_TOKEN }}
             publish_dir: ./dist
   ```
4. Push o workflow. O site será disponível em `https://andregabrielnc.github.io/andregabriel/`.

## Notas
- Para GitHub Pages com subpath, adicione `base: '/andregabriel/'` no `vite.config.js`.
- Certifique-se de que o repositório é público para GitHub Pages gratuito.</content>
<parameter name="filePath">c:\portfolio\claude.md