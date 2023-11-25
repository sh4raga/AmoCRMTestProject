import { Controller, Get, Query, Headers } from '@nestjs/common';
import { AppService } from './app.service';
import { UserDto } from './dto/user.dto';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  async getHello(@Query() query): Promise<string> {
    return await this.appService.updateCode(query?.code);
  }

  @Get('get-user')
  async getUser(
    @Query() query: UserDto,
    @Headers() headers: Record<string, string>,
  ): Promise<string> {
    return await this.appService.getUser(query, headers.authorization);
  }

  @Get('refresh-token')
  async refreshToken(@Query() query): Promise<any> {
    return await this.appService.refreshToken(query.code);
  }
}
