import {Injectable} from '@nestjs/common';
import {SocketGateway} from './socket.gateway';

@Injectable()
export class AppService {
    constructor(private socket: SocketGateway) {}

    remoteUserAdded(localUserSocketId: string, remoteUserSocketId: string) {
        const localUser = this.socket.freeConnectionsWithRoulette.find((user) => {
            return (user.myRouletteSocketId === localUserSocketId);
        });
        const remoteUser = this.socket.freeConnectionsWithRoulette.find((user) => {
            return (user.myRouletteSocketId === remoteUserSocketId);
        });
        const roomName = this.selectRoomName(localUser.connection.id, remoteUser.connection.id);
        localUser.connection.join(roomName);
        remoteUser.connection.join(roomName);
        localUser.roomName = roomName;
        remoteUser.roomName = roomName;
        this.socket.sendMessageToRoom(roomName);
    }

    selectRoomName(mySocketId: string, remoteSocketId: string) {
        if (mySocketId < remoteSocketId) {
            return mySocketId + ' : ' + remoteSocketId;
        } else {
            return remoteSocketId + ' : ' + mySocketId;
        }
    }
}
