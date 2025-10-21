import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, collection, addDoc, onSnapshot, query, orderBy } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// ✅ Your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyC8MO_cr9atswaMiUhVkf35E2U6wcO7whw",
  authDomain: "classchat-623f7.firebaseapp.com",
  projectId: "classchat-623f7",
  storageBucket: "classchat-623f7.firebasestorage.app",
  messagingSenderId: "321893895637",
  appId: "1:321893895637:web:5b19d9e5324fb66b3bc15c"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// References
const chatBox = document.getElementById("chat-box");
const input = document.getElementById("message-input");
const sendBtn = document.getElementById("send-btn");
const messagesRef = collection(db, "messages");

// Get username
let username = localStorage.getItem("username");
if (!username) {
  username = prompt("Enter your name:");
  localStorage.setItem("username", username);
}
document.getElementById("user-info").textContent = `Logged in as: ${username}`;

// Send message
sendBtn.addEventListener("click", async () => {
  const text = input.value.trim();
  if (!text) return;

  await addDoc(messagesRef, {
    name: username,
    text: text,
    createdAt: Date.now()
  });

  input.value = "";
});

// Listen for realtime updates
const q = query(messagesRef, orderBy("createdAt"));
onSnapshot(q, (snapshot) => {
  chatBox.innerHTML = "";
  snapshot.forEach((doc) => {
    const data = doc.data();
    const messageDiv = document.createElement("div");
    const time = new Date(data.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    messageDiv.classList.add("message");
    messageDiv.classList.add(data.name === username ? "sent" : "received");
    messageDiv.innerHTML = `
      <strong>${data.name}</strong><br>${data.text}
      <div class="timestamp">${time}</div>
    `;
    chatBox.appendChild(messageDiv);
  });
  chatBox.scrollTop = chatBox.scrollHeight;
});
