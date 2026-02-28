import { 
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
} from './firebase-config.js';

// ===== ДАННЫЕ =====
let currentUser = null;
let currentUserData = null;

// ===== ВСПОМОГАТЕЛЬНЫЕ =====
function showModal(id) {
  document.getElementById(id).style.display = 'flex';
}

function hideModal(id) {
  document.getElementById(id).style.display = 'none';
}

function showMessage(msg, isError = false) {
  alert(isError ? '❌ ' + msg : '✅ ' + msg);
}

// ===== ФОРМЫ =====
window.showLoginForm = function() {
  document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.auth-form').forEach(f => f.classList.remove('active'));
  document.querySelectorAll('.auth-tab')[0].classList.add('active');
  document.getElementById('loginForm').classList.add('active');
};

window.showRegisterForm = function() {
  document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.auth-form').forEach(f => f.classList.remove('active'));
  document.querySelectorAll('.auth-tab')[1].classList.add('active');
  document.getElementById('registerForm').classList.add('active');
};

// ===== РЕГИСТРАЦИЯ =====
window.register = async function() {
  const name = document.getElementById('regName').value.trim();
  const pass = document.getElementById('regPass').value.trim();
  const confirm = document.getElementById('regConfirm').value.trim();
  
  if (!name || !pass || !confirm) return showMessage('Заполните все поля!', true);
  if (pass !== confirm) return showMessage('Пароли не совпадают!', true);
  
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, `${name}@temp.com`, pass);
    const user = userCredential.user;
    
    const userData = {
      uid: user.uid,
      name: name,
      fullName: '',
      employeeId: '',
      records: [],
      settings: { hourlyRate: 6.10 }
    };
    
    await setDoc(doc(db, "users", user.uid), userData);
    showMessage('Регистрация успешна!');
  } catch (error) {
    showMessage('Ошибка: ' + error.message, true);
  }
};

// ===== ВХОД =====
window.login = async function() {
  const name = document.getElementById('loginName').value.trim();
  const pass = document.getElementById('loginPass').value.trim();
  
  if (!name || !pass) return showMessage('Введите имя и пароль!', true);
  
  try {
    const userCredential = await signInWithEmailAndPassword(auth, `${name}@temp.com`, pass);
    const user = userCredential.user;
    
    const userDoc = await getDoc(doc(db, "users", user.uid));
    if (userDoc.exists()) {
      currentUserData = userDoc.data();
      currentUser = { uid: user.uid, ...currentUserData };
      
      hideModal('authModal');
      document.getElementById('app').classList.remove('hidden');
      
      document.getElementById('fullName').value = currentUser.fullName || '';
      document.getElementById('employeeId').value = currentUser.employeeId || '';
      
      showMessage('Добро пожаловать!');
    }
  } catch (error) {
    showMessage('Ошибка входа: ' + error.message, true);
  }
};

// ===== ВЫХОД =====
window.logout = async function() {
  if (confirm('Выйти?')) {
    await signOut(auth);
    currentUser = null;
    document.getElementById('app').classList.add('hidden');
    showModal('authModal');
  }
};

// ===== ПРОФИЛЬ =====
window.saveProfile = async function() {
  if (!currentUser) return;
  
  currentUser.fullName = document.getElementById('fullName').value;
  currentUser.employeeId = document.getElementById('employeeId').value;
  
  await updateDoc(doc(db, "users", currentUser.uid), {
    fullName: currentUser.fullName,
    employeeId: currentUser.employeeId
  });
  
  showMessage('Профиль сохранён!');
};

// ===== НАВИГАЦИЯ =====
window.setView = function(view) {
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  document.getElementById(view).classList.add('active');
};

// ===== СЛЕДИМ ЗА СОСТОЯНИЕМ =====
onAuthStateChanged(auth, async (user) => {
  if (user) {
    const userDoc = await getDoc(doc(db, "users", user.uid));
    if (userDoc.exists()) {
      currentUserData = userDoc.data();
      currentUser = { uid: user.uid, ...currentUserData };
      
      hideModal('authModal');
      document.getElementById('app').classList.remove('hidden');
      
      document.getElementById('fullName').value = currentUser.fullName || '';
      document.getElementById('employeeId').value = currentUser.employeeId || '';
    }
  } else {
    currentUser = null;
    document.getElementById('app').classList.add('hidden');
    showModal('authModal');
  }
});

// ===== ЗАПУСК =====
window.onload = function() {
  hideModal('dayModal');
  showModal('authModal');
  window.showLoginForm();
};

// ===== КАЛЕНДАРЬ (ПРОСТАЯ ВЕРСИЯ) =====
window.changeMonth = function() {};
window.addRecord = function() {};
window.closeModal = function() {};
