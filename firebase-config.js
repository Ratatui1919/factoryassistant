import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";

const firebaseConfig = {
  apiKey: "AIzaSyBn6fbSjjLTt8dm41ov_uHEYPIDUfFgiio",
  authDomain: "vaillant-assistant.firebaseapp.com",
  projectId: "vaillant-assistant",
  storageBucket: "vaillant-assistant.appspot.com",
  messagingSenderId: "94125964883",
  appId: "1:94125964883:web:3d363c1ef033431a6e10a6"
};

const app = initializeApp(firebaseConfig);
console.log('✅ Firebase инициализирован');
export default app;
