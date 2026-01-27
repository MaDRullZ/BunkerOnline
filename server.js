import express from "express";
import http from "http";
import { Server } from "socket.io";
import OpenAI from "openai";

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const rooms = {};

function generateRoomCode() {
  return Math.random().toString(36).substring(2, 7).toUpperCase();
}

async function generateCharacterData(playerCount) {
  const prompt = `
Сгенерируй ${playerCount} персонажей для игры Бункер Online.
Для каждого персонажа дай: Имя, Пол, Телосложение, Здоровье (1-100), Багаж, Фобии и страхи, Доп. сведения, Хобби и увлечения, Человеческая черта.
Выведи в JSON массив.
Также сгенерируй одну катастрофу.
`;

  const response = await openai.chat.completions.create({
    model: "gpt-5-mini",
    messages: [{ role: "user", content: prompt }]
  });

  const text = response.choices[0].message.content;
  let characters = [];
  let disaster = "неизвестная катастрофа";

  try {
    const jsonStart = text.indexOf("[");
    const jsonEnd = text.lastIndexOf("]") + 1;
    characters = JSON.parse(text.substring(jsonStart, jsonEnd));
    const disasterMatch = text.substring(jsonEnd).match(/катастрофа[:\-]?\s*(.*)/i);
    if(disasterMatch) disaster = disasterMatch[1].trim();
  } catch(e) {
    console.error("Ошибка парсинга AI:", e);
  }

  return { characters, disaster };
}

io.on("connection", (socket) => {
  console.log("Игрок подключился:", socket.id);

  socket.on("createRoom", async (callback) => {
    const roomCode = generateRoomCode();
    const aiData = await generateCharacterData(1);
    rooms[roomCode] = { players: aiData.characters, disaster: aiData.disaster };
    socket.join(roomCode);
    callback(roomCode);
    io.to(roomCode).emit("updateRoom", rooms[roomCode]);
  });

  socket.on("joinRoom", async (roomCode, callback) => {
    roomCode = roomCode.toUpperCase();
    if(!rooms[roomCode]) { callback(false); return; }
    const aiData = await generateCharacterData(1);
    rooms[roomCode].players.push(aiData.characters[0]);
    socket.join(roomCode);
    callback(true);
    io.to(roomCode).emit("updateRoom", rooms[roomCode]);
  });
});

server.listen(3000, () => console.log("Сервер запущен на http://localhost:3000"));
