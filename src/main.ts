import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();

  await app.listen(3030);
  console.log('[New Santos Mesa] Server running - port 3030');
}
bootstrap();
