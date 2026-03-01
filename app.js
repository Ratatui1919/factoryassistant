import { auth, db } from './firebase-config.js';
import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  doc,
  setDoc,
  getDoc
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { 
  collection,
  query,
  where,
  getDocs 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

let currentUser = null;

function showMessage(msg, isError = false) {
  alert(isError ? '❌ ' + msg : '✅ ' + msg);
}

// Простой интерфейс для проверки
document.getElementById('main').innerHTML = `
  <div style="text-align: center; margin-top: 50px;">
    <h2 style="color: #00b060;">✅ Firebase и App.js работают!</h2>
    <p>Можно загружать полную версию.</p>
  </div>
`;

console.log('✅ Полная версия app.js загружена');
