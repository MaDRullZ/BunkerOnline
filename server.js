import express from "express";
import http from "http";
import { Server } from "socket.io";

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

io.on("connection", (socket) => {
  socket.on("createRoom", (cb) => {
    const code = Math.random().toString(36).substring(2, 7).toUpperCase();
    socket.join(code);
    cb(code);
  });

  socket.on("joinRoom", ({ code, name }) => {
    socket.join(code);
    io.to(code).emit("message", `${name} подключился`);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
