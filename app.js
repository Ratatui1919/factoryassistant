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
  updateDoc,
  collection,
  query,
  where,
  getDocs
} from './firebase-config.js';

// ===== ДАННЫЕ =====
let currentUser = null;
let currentUserData = null;
let currentMonth = new Date().getMonth();
let currentYear = new Date().getFullYear();

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
function showLoginForm() {
  document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.auth-form').forEach(f => f.classList.remove('active'));
  document.querySelectorAll('.auth-tab')[0].classList.add('active');
  document.getElementById('loginForm').classList.add('active');
}

function showRegisterForm() {
  document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.auth-form').forEach(f => f.classList.remove('active'));
  document.querySelectorAll('.auth-tab')[1].classList.add('active');
  document.getElementById('registerForm').classList.add('active');
}

// ===== РЕГИСТРАЦИЯ =====
async function register() {
  const name = document.getElementById('regName').value.trim();
  const pass = document.getElementById('regPass').value.trim();
  const confirm = document.getElementById('regConfirm').value.trim();
  
  if (!name || !pass || !confirm) return showMessage('Заполните все поля!', true);
  if (pass !== confirm) return showMessage('Пароли не совпадают!', true);
  if (pass.length < 6) return showMessage('Пароль должен быть минимум 6 символов!', true);
  
  try {
    const cleanName = name.replace(/[^a-zA-Z0-9]/g, '');
    const randomNum = Math.floor(Math.random() * 10000);
    const email = `user${randomNum}@vaillant.app`;
    
    const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
    const user = userCredential.user;
    
    const userData = {
      uid: user.uid,
      name: name,
      email: email,
      fullName: '',
      employeeId: '',
      records: [],
      settings: { 
        hourlyRate: 6.10, 
        lunchCost: 1.31 
      },
      createdAt: new Date().toISOString()
    };
    
    await setDoc(doc(db, "users", user.uid), userData);
    showMessage('Регистрация успешна! Теперь войдите.');
    
    document.getElementById('regName').value = '';
    document.getElementById('regPass').value = '';
    document.getElementById('regConfirm').value = '';
    showLoginForm();
    
  } catch (error) {
    console.error("Registration error:", error);
    showMessage('Ошибка: ' + error.message, true);
  }
}

// ===== ВХОД =====
async function login() {
  const name = document.getElementById('loginName').value.trim();
  const pass = document.getElementById('loginPass').value.trim();
  
  if (!name || !pass) return showMessage('Введите имя и пароль!', true);
  
  try {
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("name", "==", name));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return showMessage('Пользователь не найден!', true);
    }
    
    const userDoc = querySnapshot.docs[0];
    const userData = userDoc.data();
    
    const userCredential = await signInWithEmailAndPassword(auth, userData.email, pass);
    const user = userCredential.user;
    
    currentUserData = userData;
    currentUser = { uid: user.uid, ...userData };
    
    hideModal('authModal');
    document.getElementById('app').classList.remove('hidden');
    
    document.getElementById('fullName').value = currentUser.fullName || '';
    document.getElementById('employeeId').value = currentUser.employeeId || '';
    
    showMessage('Добро пожаловать!');
    
  } catch (error) {
    console.error("Login error:", error);
    showMessage('Ошибка входа: ' + error.message, true);
  }
}

// ===== ВЫХОД =====
async function logout() {
  if (confirm('Выйти?')) {
    await signOut(auth);
    currentUser = null;
    document.getElementById('app').classList.add('hidden');
    showModal('authModal');
    showLoginForm();
  }
}

// ===== ПРОФИЛЬ =====
async function saveProfile() {
  if (!currentUser) return;
  
  currentUser.fullName = document.getElementById('fullName').value;
  currentUser.employeeId = document.getElementById('employeeId').value;
  
  await updateDoc(doc(db, "users", currentUser.uid), {
    fullName: currentUser.fullName,
    employeeId: currentUser.employeeId
  });
  
  showMessage('Профиль сохранён!');
}

// ===== НАВИГАЦИЯ =====
function setView(view) {
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  document.getElementById(view).classList.add('active');
}

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
    showLoginForm();
  }
});

// ===== ЗАПУСК =====
window.onload = function() {
  hideModal('dayModal');
  showModal('authModal');
  showLoginForm();
};

// ===== ПРОСТЫЕ ФУНКЦИИ КАЛЕНДАРЯ =====
function changeMonth(delta) {
  currentMonth += delta;
  if (currentMonth < 0) { currentMonth = 11; currentYear--; }
  if (currentMonth > 11) { currentMonth = 0; currentYear++; }
  buildCalendar();
}

function buildCalendar() {
  const grid = document.getElementById('calendarGrid');
  if (!grid) return;
  grid.innerHTML = '';
  
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  
  for (let d = 1; d <= daysInMonth; d++) {
    const cell = document.createElement('div');
    cell.className = 'day';
    cell.innerHTML = d;
    grid.appendChild(cell);
  }
}

function addRecord(type) {
  console.log('addRecord', type);
  closeModal();
}

function closeModal() {
  hideModal('dayModal');
}

// ===== ДЕЛАЕМ ФУНКЦИИ ГЛОБАЛЬНЫМИ =====
window.showLoginForm = showLoginForm;
window.showRegisterForm = showRegisterForm;
window.login = login;
window.register = register;
window.logout = logout;
window.setView = setView;
window.saveProfile = saveProfile;
window.changeMonth = changeMonth;
window.addRecord = addRecord;
window.closeModal = closeModal;
window.quickAddSalary = function() {};
window.clearQuickSalary = function() {};
window.previewAvatar = function() {};
window.exportData = function() {};
window.setLanguage = function(lang) { 
  console.log('Language:', lang);
};
window.addToGoal = function() {};
window.withdrawFromGoal = function() {};
window.saveGoal = function() {};
window.clearGoal = function() {};
window.loadYearStats = function() {};
window.clearAllData = function() {};
