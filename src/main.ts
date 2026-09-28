import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Configuración de CORS
  app.enableCors({
    origin: [
      'http://localhost',
      'http://localhost:5173',
      'https://new-era-frontend-jqv9.vercel.app',
      'https://new-era-frontend-88rf.vercel.app',
      'https://new-era-frontend-gw3k.vercel.app'
    ],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  await app.listen(process.env.PORT || 3000);
}

bootstrap();
