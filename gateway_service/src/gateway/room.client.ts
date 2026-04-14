import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';
import { RoomConfigUpdateDto } from './dto/configure-room.dto';

@Injectable()
export class RoomServiceClient {
  private readonly http: AxiosInstance;

  constructor(private readonly configService: ConfigService) {
    const baseURL = this.configService.get<string>(
      'ROOM_SERVICE_URL',
      'http://localhost:3002',
    );
    this.http = axios.create({ baseURL, timeout: 5000 });
  }

  async createRoom(payload: { guestId: string; displayName: string }) {
    const res = await this.http.post('/rooms', payload);
    return res.data;
  }

  async joinRoom(payload: { guestId: string; displayName: string; roomCode: string }) {
    const res = await this.http.post('/rooms/join', payload);
    return res.data;
  }

  async configureRoom(
    roomId: string,
    payload: { guestId: string; maxPlayers?: number; config?: RoomConfigUpdateDto },
  ) {
    const res = await this.http.patch(`/rooms/${roomId}/config`, payload);
    return res.data;
  }

  async startGame(roomId: string, payload: { guestId: string }) {
    const res = await this.http.post(`/rooms/${roomId}/start`, payload);
    return res.data;
  }

  async cancelRoom(roomId: string, payload: { guestId: string }) {
    const res = await this.http.delete(`/rooms/${roomId}`, { data: payload });
    return res.data;
  }

  async leaveRoom(roomId: string, guestId: string) {
    const res = await this.http.delete(`/rooms/${roomId}/players/${guestId}`);
    return res.data;
  }

  async getRoomState(roomId: string) {
    const res = await this.http.get(`/rooms/${roomId}`);
    return res.data;
  }

  async assignHost(roomId: string) {
    const res = await this.http.patch(`/rooms/${roomId}/host`);
    return res.data;
  }
}
