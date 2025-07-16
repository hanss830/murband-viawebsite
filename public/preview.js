const socket = io();

socket.on("chatMessage", (data) => {
  const div = document.createElement("div");
  div.className = "message";
  div.innerHTML = `<b>${data.sender}</b>: ${data.text}`;
  document.getElementById("chatroom").appendChild(div);
  document.getElementById("chatroom").scrollTop = 9999;
});
