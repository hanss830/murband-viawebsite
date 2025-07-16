const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const fs = require("fs");
const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(__dirname));
app.use(express.json());

let users = JSON.parse(fs.readFileSync("./users.json"));
let banned = JSON.parse(fs.readFileSync("./banned.json"));
let unbanned = JSON.parse(fs.readFileSync("./unbanned.json"));

const roleIcons = {
  owner: "👑",
  admin: "🚀",
  member: "👤",
  bot: "🤖"
};

app.post("/login", (req, res) => {
  const { username, apikey } = req.body;
  const user = users.find(u => u.username === username && u.apikey === apikey);
  if (user) {
    res.json({ success: true, role: user.role });
  } else {
    res.json({ success: false });
  }
});

io.on("connection", (socket) => {
  socket.on("userJoin", ({ username, role }) => {
    io.emit("chatMessage", {
      sender: "🤖 Yano Bot",
      text: `Selamat datang, ${username}! Jangan toxic ya 😎`
    });
  });

  socket.on("chatMessage", (data) => {
    const { username, role, text } = data;
    const icon = roleIcons[role] || "👤";

    if (banned.includes(username)) {
      socket.emit("chatMessage", {
        sender: "🤖 Yano Bot",
        text: `Maaf ${username}, kamu telah dibanned 🚫`
      });
      return;
    }

    const lower = text.toLowerCase();
    if (lower.includes("http") || lower.includes("t.me") || lower.includes("wa.me") || lower.match(/kontol|bangsat|anjing/)) {
      socket.emit("chatMessage", {
        sender: "🤖 Yano Bot",
        text: `⚠️ ${username}, pesanmu mengandung kata terlarang.`
      });
      return;
    }

    if (role === "owner" || role === "admin") {
      if (text.startsWith(".ban ")) {
        const target = text.split(" ")[1];
        if (!banned.includes(target)) {
          banned.push(target);
          fs.writeFileSync("./banned.json", JSON.stringify(banned));
          io.emit("chatMessage", { sender: "🤖 Yano Bot", text: `${target} telah dibanned 🚫` });
        }
        return;
      }
      if (text.startsWith(".unban ")) {
        const target = text.split(" ")[1];
        banned = banned.filter(u => u !== target);
        fs.writeFileSync("./banned.json", JSON.stringify(banned));
        if (!unbanned.includes(target)) {
          unbanned.push(target);
          fs.writeFileSync("./unbanned.json", JSON.stringify(unbanned));
        }
        io.emit("chatMessage", { sender: "🤖 Yano Bot", text: `${target} telah di-unban 🎉` });
        return;
      }
      if (text.startsWith(".announce ")) {
        const msg = text.replace(".announce ", "");
        io.emit("chatMessage", {
          sender: "📣 Yano Bot",
          text: `PENGUMUMAN: ${msg}`
        });
        return;
      }
    }

    io.emit("chatMessage", {
      sender: `${icon} [${username} - ${role}]`,
      text
    });
  });
});

server.listen(3000, () => {
  console.log("Murband Chat aktif di http://localhost:3000");
});
