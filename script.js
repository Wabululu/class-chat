// Import Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, addDoc, onSnapshot, query, orderBy, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyATrOxvYhh_QTyYhs7MdNyBO6fnQml_czw",
  authDomain: "mutvibe-chat.firebaseapp.com",
  projectId: "mutvibe-chat",
  storageBucket: "mutvibe-chat.firebasestorage.app",
  messagingSenderId: "683154678453",
  appId: "1:683154678453:web:afeae8469eecaff88214fc"
};

// Init Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

// Username
let username = localStorage.getItem("mutvibe_username");
if (!username) {
  username = prompt("Enter your name:");
  localStorage.setItem("mutvibe_username", username || "Anonymous");
}

const chatBox = document.getElementById("chat-box");
const sendBtn = document.getElementById("sendBtn");
const msgInput = document.getElementById("message");
const emojiBtn = document.getElementById("emojiBtn");
const emojiPicker = document.getElementById("emojiPicker");
const imageBtn = document.getElementById("imageBtn");
const imageInput = document.getElementById("imageInput");

emojiBtn.addEventListener("click", () => {
  emojiPicker.style.display = emojiPicker.style.display === "none" ? "block" : "none";
});

emojiPicker.addEventListener("emoji-click", (e) => {
  msgInput.value += e.detail.unicode;
});

sendBtn.addEventListener("click", sendMessage);
msgInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") sendMessage();
});

imageBtn.addEventListener("click", () => imageInput.click());
imageInput.addEventListener("change", uploadImage);

async function uploadImage() {
  const file = imageInput.files[0];
  if (!file) return;

  const fileRef = ref(storage, `images/${Date.now()}_${file.name}`);
  await uploadBytes(fileRef, file);
  const imageUrl = await getDownloadURL(fileRef);

  await addDoc(collection(db, "messages"), {
    username,
    imageUrl,
    timestamp: serverTimestamp()
  });
}

async function sendMessage() {
  const message = msgInput.value.trim();
  if (message) {
    await addDoc(collection(db, "messages"), {
      username,
      message,
      timestamp: serverTimestamp()
    });
    msgInput.value = "";
  }
}

// Real-time messages
const q = query(collection(db, "messages"), orderBy("timestamp"));
onSnapshot(q, (snapshot) => {
  chatBox.innerHTML = "";
  snapshot.forEach((doc) => {
    const data = doc.data();
    const div = document.createElement("div");
    div.classList.add("message");
    div.classList.add(data.username === username ? "sent" : "received");

    let content = `<b>${data.username}</b><br>`;
    if (data.message) content += `${data.message}`;
    if (data.imageUrl) content += `<br><img src="${data.imageUrl}" alt="Image">`;
    content += `<div class="time">${formatTime(data.timestamp?.toDate())}</div>`;

    div.innerHTML = content;
    chatBox.appendChild(div);
  });
  chatBox.scrollTop = chatBox.scrollHeight;
});

function formatTime(date) {
  if (!date) return "";
  const h = date.getHours().toString().padStart(2, "0");
  const m = date.getMinutes().toString().padStart(2, "0");
  return `${h}:${m}`;
}
