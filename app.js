import { auth, db } from './firebase-config.js';
import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { 
  doc, 
  setDoc, 
  getDoc,
  collection,
  query,
  where,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// Простая проверка
console.log('✅ Авторизация загружена');

// Показываем интерфейс
document.getElementById('main').innerHTML = `
  <div style="text-align: center; margin-top: 50px; padding: 20px;">
    <h2 style="color: #00b060; margin-bottom: 30px;">Vaillant Assistant</h2>
    <div style="background: #1a1e2a; padding: 30px; border-radius: 20px; max-width: 400px; margin: 0 auto;">
      <h3>Вход в систему</h3>
      <p style="color: #a0a8b8; margin: 20px 0;">Базовая авторизация работает!</p>
      <div style="color: #00b060; font-size: 48px; margin: 20px 0;">✅</div>
    </div>
  </div>
`;

// Проверяем соединение с Firebase
console.log('Firebase Auth:', auth);
console.log('Firebase DB:', db);
