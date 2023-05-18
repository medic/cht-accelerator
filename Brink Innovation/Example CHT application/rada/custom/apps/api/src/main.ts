/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: true
  });
  const globalPrefix = 'v1';
  const port = process.env.PORT || 3333;

  app.setGlobalPrefix(globalPrefix);

  await app.listen(
    port,
    () => {
      console.log('Listening at http://localhost:' + port + '/' + globalPrefix);
    }
  );

}

bootstrap();
