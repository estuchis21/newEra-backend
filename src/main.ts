import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 1. Prefijo global para todas las rutas del backend (/api)
  app.setGlobalPrefix('api');

  // 2. Configuración de CORS dinámica
  app.enableCors({
    origin: (origin, callback) => {
      // Permitir peticiones sin origen (como Postman, cURL o servidor a servidor)
      if (!origin) return callback(null, true);

      const isAllowed =
        origin.startsWith('http://localhost') ||
        /\.vercel\.app$/.test(origin); // Permite cualquier subdominio de Vercel

      if (isAllowed) {
        callback(null, true);
      } else {
        callback(new Error('Bloqueado por políticas de CORS'));
      }
    },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // 3. Puerto de escucha (Render asigna process.env.PORT dinámicamente)
  await app.listen(process.env.PORT || 3000);
}

bootstrap();