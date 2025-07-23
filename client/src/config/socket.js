import { io } from 'socket.io-client';

const URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5050';
export const socket = io(URL, {
  autoConnect: false,
  reconnectionAttempts: 3,
  reconnectionDelay: 1000,
  transports: ['websocket']
});