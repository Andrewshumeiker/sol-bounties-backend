# Sol Bounties API (NestJS)

Backend MVP para:
- Login por firma con Phantom (Solana)
- Usuarios (in-memory por ahora)
- Badges (registry)
- Bounties (mock list)
- Listo para deploy en Railway

## Endpoints (contract)
- POST `/auth/challenge`  body: `{ publicKey }` -> `{ message, nonce }`
- POST `/auth/verify`     body: `{ publicKey, signature, message, nonce }` -> `{ token, user }`
- GET  `/users/me`        header: `Authorization: Bearer <token>`
- GET  `/bounties`

## Variables de entorno
Ver `.env.example`.

En Railway (Variables):
- `JWT_SECRET` (obligatorio en prod)
- `CORS_ORIGIN` (URL del frontend de Vercel, ej: `https://tu-app.vercel.app`)
- Railway inyecta `PORT` automáticamente.

## Local
```bash
npm install
cp .env.example .env
npm run start:dev
```

## Railway deploy (rápido)
1) Subir a GitHub
2) Railway → New Project → Deploy from GitHub
3) Variables: `JWT_SECRET`, `CORS_ORIGIN`
4) Build: `npm run build`
5) Start: `npm run start:prod`
