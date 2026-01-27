// server.js
import express from "express";
import http from "http";
import { Server } from "socket.io";

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" }, // разрешаем подключения с любого URL
});

app.use(express.static(".")); // отдаём все файлы проекта (index.html, style.css)

io.on("connection", (socket) => {
  console.log("Новое подключение:", socket.id);

  // Создание комнаты
  socket.on("createRoom", (callback) => {
    const roomCode = Math.random().toString(36).substring(2, 7).toUpperCase();
    socket.join(roomCode);
    console.log(`Комната создана: ${roomCode}`);
    callback(roomCode);
  });

  // Присоединение к комнате
  socket.on("joinRoom", (roomCode, callback) => {
    const rooms = io.sockets.adapter.rooms;
    if (rooms.has(roomCode)) {
      socket.join(roomCode);
      callback(true);
      console.log(`Игрок ${socket.id} присоединился к комнате ${roomCode}`);
    } else {
      callback(false);
    }
  });
});

// Сервер запускается на Render или локально
server.listen(process.env.PORT || 3000, () => {
  console.log("Сервер запущен!");
});
