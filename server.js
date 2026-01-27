import express from "express";
import http from "http";
import { Server } from "socket.io";

const app = express();
app.use(express.static("public"));

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" }
});

io.on("connection", (socket) => {
  socket.on("createRoom", (callback) => {
    const roomCode = Math.random().toString(36).substr(2, 5).toUpperCase();
    socket.join(roomCode);
    callback(roomCode);
  });

  socket.on("joinRoom", (roomCode, callback) => {
    const room = io.sockets.adapter.rooms.get(roomCode);
    callback(room ? true : false);
  });
});

server.listen(process.env.PORT || 3000);
