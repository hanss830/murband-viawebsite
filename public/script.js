const socket = io();
let userData = {};

function login() {
  const username = document.getElementById("username").value.trim();
  const apikey = document.getElementById("apikey").value.trim();

  if (!username || !apikey) {
    alert("Lengkapi username dan API key!");
    return;
  }

  fetch("/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, apikey })
  })
    .then(res => res.json())
    .then(res => {
      if (res.success) {
        userData = { username, role: res.role };
        document.getElementById("login-section").style.display = "none";
        document.getElementById("chat-section").style.display = "block";
        socket.emit("userJoin", userData);
      } else {
        alert("API Key tidak valid!");
      }
    });
}

function sendMessage() {
  const msg = document.getElementById("message").value.trim();
  if (!msg) return;

  socket.emit("chatMessage", {
    username: userData.username,
    role: userData.role,
    text: msg
  });

  document.getElementById("message").value = "";
}

socket.on("chatMessage", (data) => {
  const div = document.createElement("div");
  div.className = "message";
  div.innerHTML = `<b>${data.sender}</b>: ${data.text}`;
  document.getElementById("chatroom").appendChild(div);
  document.getElementById("chatroom").scrollTop = 9999;

  // Jika tag ke admin, munculkan notifikasi
  if (data.text.includes("@admin") || data.text.includes("@"+userData.username)) {
    if (Notification.permission === "granted") {
      new Notification("Mention!", { body: data.text });
    } else {
      Notification.requestPermission();
    }
  }
});
