import { Controller, Get, Post, Body } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
  ) { }

  @Get('hello')
  getData() {
    return {message: 'Hello world'};
  }

  @Post('ussd')
  postData(@Body() body) {
    const args = {
      phoneNumber: body.phoneNumber,
      sessionId: body.sessionId,
      serviceCode: body.serviceCode,
      text: body.text
    };

    const resp = this.appService.runUSSD(args);
    return resp;
  }

  @Post('ussdv2')
  postDataV2(@Body() body) {
    const args = {
      phoneNumber: body.phoneNumber,
      sessionId: body.sessionId,
      serviceCode: body.serviceCode,
      text: body.text
    };

    const resp = this.appService.runUSSDV2(args);
    return resp;
  }
}
