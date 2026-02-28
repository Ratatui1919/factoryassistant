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

// ВАША КОНФИГУРАЦИЯ ИЗ FIREBASE
const firebaseConfig = {
  apiKey: "AIzaSyBn6fbSjjLTt8dm41ov_uHEYPIDUfFgiio",
  authDomain: "vaillant-assistant.firebaseapp.com",
  projectId: "vaillant-assistant",
  storageBucket: "vaillant-assistant.firebasestorage.app",
  messagingSenderId: "94125964883",
  appId: "1:94125964883:web:3d363c1ef033431a6e10a6"
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
