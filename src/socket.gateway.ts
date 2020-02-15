import {OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer} from '@nestjs/websockets';
import {Server, Socket} from 'socket.io';
import {QueryParams} from './interface';

@WebSocketGateway()
export class SocketGateway implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit {
    os = require('os');

    @WebSocketServer()
    server: Server;
    connections: Socket[] = [];
    freeConnectionsWithRoulette: Array<{
        myRouletteSocketId: string;
        connection: Socket;
        roomName?: string;
    }> = [];

    afterInit() {
        this.server.emit('connect');
    }

    handleConnection(client: Socket, ...args): any {
        this.connections.push(client);
    }

    @SubscribeMessage('initMessage')
    handleEvent(client: Socket, params: QueryParams) {
        this.freeConnectionsWithRoulette.push(
            {
                myRouletteSocketId: params.myRouletteSocketId,
                connection: client,
            });
    }

    handleDisconnect(client: Socket): any {
        for (let i = 0; i < this.connections.length; i++) {
            if (this.connections[i] === client) {
                this.connections.splice(i, 1);
            }
        }
        for (let i = 0; i < this.freeConnectionsWithRoulette.length; i++) {
            if (this.freeConnectionsWithRoulette[i].connection === client) {
                this.freeConnectionsWithRoulette.splice(i, 1);
            }
        }
    }

    @SubscribeMessage('messageToUser')
    handleMessage(client: Socket, message: string) {
        const keys = Object.keys(client.rooms);
        for (let i = 0; i < keys.length; i++) {
            if (keys[i] !== client.id) {
                client.broadcast.to(keys[i]).emit('messageToUser', message);
            }
        }
    }

    @SubscribeMessage('gameMove')
    handleGameMove(client: Socket, message: string) {
        const keys = Object.keys(client.rooms);
        for (let i = 0; i < keys.length; i++) {
            if (keys[i] !== client.id) {
                client.broadcast.to(keys[i]).emit('gameMove', message);
            }
        }
    }

    sendMessageToRoom(room) {
        this.server.in(room).emit('messageToUser: ', room);
    }

}
