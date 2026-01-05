import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

function parseOrigins(value?: string) {
  if (!value) return [];
  return value.split(',').map(v => v.trim()).filter(Boolean);
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const allowed = parseOrigins(process.env.CORS_ORIGIN);
  app.enableCors({
    origin: (origin, cb) => {
      // Allow non-browser tools (no Origin header)
      if (!origin) return cb(null, true);

      // Dev: allow all if CORS_ORIGIN is not set
      if (allowed.length === 0) return cb(null, true);

      // Exact match
      if (allowed.includes(origin)) return cb(null, true);

      // Allow any Vercel preview/prod if user provided a vercel app origin
      if (allowed.some(o => o.endsWith('.vercel.app')) && origin.endsWith('.vercel.app')) return cb(null, true);

      return cb(new Error('Not allowed by CORS'), false);
    },
    credentials: true,
    methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key'],
    preflightContinue: false,
    optionsSuccessStatus: 204,
  });

  const port = process.env.PORT ? Number(process.env.PORT) : 3001;
  await app.listen(port, '0.0.0.0');
  // eslint-disable-next-line no-console
  console.log(`Sol Bounties API running on :${port}`);
}
bootstrap();
