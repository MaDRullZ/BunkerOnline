import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, { cors: { origin: "*" } });

const rooms = {}; // Хранилище комнат

io.on("connection", socket => {
  console.log("Игрок подключился:", socket.id);

  // Создание комнаты
  socket.on("createRoom", () => {
    const roomId = Math.random().toString(36).substring(2, 7).toUpperCase();
    rooms[roomId] = { host: socket.id, players: [], state: {} };
    socket.join(roomId);
    socket.emit("roomCreated", roomId);
  });

  // Присоединение к комнате
  socket.on("joinRoom", ({ roomId, name }) => {
    const room = rooms[roomId];
    if (!room) return socket.emit("error", "Комната не найдена");

    room.players.push({ id: socket.id, name, alive: true, role: null, data: {} });
    socket.join(roomId);
    io.to(roomId).emit("roomUpdate", room.players);
  });

  // Старт игры (только хост)
  socket.on("startGame", ({ roomId }) => {
    const room = rooms[roomId];
    if (!room || room.host !== socket.id) return;

    // Простейшие роли
    const shuffled = [...room.players].sort(() => Math.random() - 0.5);
    shuffled[0].role = "KEY";
    shuffled[1].role = "SABOTEUR";
    shuffled.slice(2).forEach(p => p.role = "SURVIVOR");

    // Простейшие отсеки
    room.state.sections = [
      { name: "Энергетика", integrity: 100 },
      { name: "Жизнеобеспечение", integrity: 100 },
      { name: "Медблок", integrity: 100 },
      { name: "Управление", integrity: 100 },
      { name: "Жилой", integrity: 100 }
    ];

    io.to(roomId).emit("gameStarted", room);
  });

  // Игрок отключился
  socket.on("disconnect", () => {
    for (const roomId in rooms) {
      const room = rooms[roomId];
      room.players = room.players.filter(p => p.id !== socket.id);
      io.to(roomId).emit("roomUpdate", room.players);
    }
  });
});

// Сервер слушает порт 3000
httpServer.listen(3000, () => console.log("Сервер запущен на порту 3000"));
