import {Body, Controller, Get, Post} from '@nestjs/common';
import {AppService} from './app.service';

@Controller()
export class AppController {
    constructor(private readonly appService: AppService) {
    }

    @Get('/test')
    test() {
        return 'Server working!';
    }

    @Post('/remoteUser')
    remoteUserAdded(@Body() body: { localUser: string, remoteUser: string }) {
        if (body.localUser && body.remoteUser) {
            return this.appService.remoteUserAdded(body.localUser, body.remoteUser);
        } else {
            return 'No local or remote user';
        }
    }
}
