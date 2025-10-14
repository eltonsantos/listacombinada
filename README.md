# Lista Combinada — Landing (Vite + React)

Projeto Vite + React da landing page de convites, separada em componentes e integrada ao Firebase (Auth + Functions).

## Scripts
- npm i
- npm run dev
- npm run build
- npm run preview

## Estrutura
- src/components/Header.jsx — topo com logo
- src/components/InviteInfo.jsx — painel esquerdo (mensagem com/sem token + benefícios + deeplink opcional)
- src/components/AuthPanel.jsx — painel direito com cadastro/login + chamada joinByToken
- src/components/SuccessPanel.jsx — painel de sucesso com CTA da Play
- src/components/Footer.jsx — rodapé
- src/lib/firebase.js — inicialização Firebase (config do projeto do usuário)
- src/lib/functions.js — wrappers das Cloud Functions callable
- src/hooks/useToken.js — captura do <TOKEN> a partir do path/query
- src/styles.css — estilo (tema azul #2563EB)
- _redirects — Netlify SPA routing

## Observações
- Ajuste playUrl em AuthPanel.jsx quando tiver o link oficial da Play Store.
- As callable functions getInvitePublicInfo e joinByToken devem existir no seu Firebase.


## Variáveis de ambiente
Copie `.env.example` para `.env.local` (ou `.env`) e ajuste os valores se necessário.
O Vite expõe apenas variáveis que começam com `VITE_`.

## Git — mesmo repositório
Se quiser usar o mesmo repositório:
```bash
git init
git remote add origin <URL_DO_SEU_REPO>
git add .
git commit -m "feat: landing Vite + Firebase (convites)"
git push -u origin main
```
> O arquivo `.gitignore` já está configurado (node_modules, dist, env, logs).

## Deploy no Netlify
- O projeto inclui `netlify.toml` com `build = npm run build` e `publish = dist`.
- As rotas SPA estão configuradas tanto em `netlify.toml` quanto em `_redirects`.
