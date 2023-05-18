import { Module, HttpModule } from '@nestjs/common';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { XmlformParser } from './xmlform-parser';

@Module({
  imports: [
    HttpModule,
  ],
  controllers: [
    AppController,
  ],
  providers: [
    AppService,
    XmlformParser,
  ]
})
export class AppModule {}
