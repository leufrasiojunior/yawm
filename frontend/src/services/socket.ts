import { io } from "socket.io-client";

export const socket = io("http://localhost:3000"); // ajuste porta se necessário
