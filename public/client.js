const socket = io();

const nameInput = document.getElementById("name");
const createBtn = document.getElementById("create");
const output = document.getElementById("output");

createBtn.addEventListener("click", () => {
  const name = nameInput.value.trim();
  if (!name) return;

  socket.emit("createRoom", name);
});

socket.on("roomCreated", ({ code, catastrophe }) => {
  output.innerHTML = `
    <p>Комната создана</p>
    <h2>Код: ${code}</h2>
    <p><b>Катастрофа:</b> ${catastrophe}</p>
  `;
});
