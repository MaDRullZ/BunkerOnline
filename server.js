import express from "express";
import http from "http";
import { Server } from "socket.io";

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

const rooms = {};

function generateCharacter(name) {
  const bags = ["рюкзак", "сумка", "чемодан"];
  const phobias = ["темнота", "высота", "замкнутые пространства"];
  const health = Math.floor(Math.random() * 100) + 1;
  const hobbies = ["чтение", "спорт", "рисование", "игры"];
  const traits = ["смелый", "осторожный", "умный", "эмоциональный"];
  const disasters = [
    "землетрясение", "ураган", "наводнение", "пожар", "взрыв"
  ];

  return {
    name,
    bag: bags[Math.floor(Math.random() * bags.length)],
    phobia: phobias[Math.floor(Math.random() * phobias.length)],
    health,
    hobby: hobbies[Math.floor(Math.random() * hobbies.length)],
    trait: traits[Math.floor(Math.random() * traits.length)],
    disaster: disasters[Math.floor(Math.random() * disasters.length)]
  };
}

function generateRoomCode() {
  return Math.random().toString(36).substring(2, 7).toUpperCase();
}

io.on("connection", (socket) => {
  console.log("Игрок подключился:", socket.id);

  socket.on("createRoom", (callback) => {
    const roomCode = generateRoomCode();
    rooms[roomCode] = {
      players: [],
      disaster: generateCharacter("").disaster // случайная катастрофа
    };

    const character = generateCharacter("Игрок 1");
    rooms[roomCode].players.push(character);

    socket.join(roomCode);
    callback(roomCode);

    // отправляем всем игрокам в комнате статус катастрофы
    io.to(roomCode).emit("updateRoom", rooms[roomCode]);
  });

  socket.on("joinRoom", (roomCode, callback) => {
    roomCode = roomCode.toUpperCase();
    if (!rooms[roomCode]) {
      callback(false);
      return;
    }

    const character = generateCharacter(`Игрок ${rooms[roomCode].players.length + 1}`);
    rooms[roomCode].players.push(character);

    socket.join(roomCode);
    callback(true);

    io.to(roomCode).emit("updateRoom", rooms[roomCode]);
  });

  socket.on("disconnect", () => {
    console.log("Игрок отключился:", socket.id);
    // Можно добавить удаление из комнат при отключении
  });
});

server.listen(3000, () => {
  console.log("Сервер запущен на http://localhost:3000");
});
