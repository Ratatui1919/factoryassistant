// firebase-config.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut,
  onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// ИСПРАВЛЕННАЯ КОНФИГУРАЦИЯ
const firebaseConfig = {
  apiKey: "AIzaSyBn6fbSjjlT8dM41ov_uHEYPIDUfFgijo",
  authDomain: "vaillant-assistant.firebaseapp.com",
  projectId: "vaillant-assistant",
  storageBucket: "vaillant-assistant.appspot.com",  // ✅ ИСПРАВЛЕНО!
  messagingSenderId: "94125964883",
  appId: "1:94125964883:web:972621f4bfeaf2ab6e10a6"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { 
  auth, 
  db,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  doc,
  setDoc,
  getDoc,
  updateDoc
};
