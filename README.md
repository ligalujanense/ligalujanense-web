# Liga Lujanense de Fútbol

Sitio público y panel administrativo de la Liga Lujanense de Fútbol.

## Stack

- Next.js 15 (App Router) + React 19
- Supabase (auth, base de datos, storage)
- Tailwind CSS
- Deploy: Cloudflare Workers vía [OpenNext](https://opennext.js.org/cloudflare)

## Desarrollo local

```bash
npm install
npm run dev
```

Requiere un `.env.local` con `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` y `SUPABASE_SERVICE_ROLE_KEY`.

## Deploy

Build command: `npm run cf:build`
Deploy command: `npx wrangler deploy`
