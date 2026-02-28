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
  const modal = document.getElementById(id);
  if (modal) modal.style.display = 'flex';
}

function hideModal(id) {
  const modal = document.getElementById(id);
  if (modal) modal.style.display = 'none';
}

function showMessage(msg, isError = false) {
  alert(isError ? '❌ ' + msg : '✅ ' + msg);
}

// ===== ФОРМЫ =====
window.showLoginForm = function() {
  const tabs = document.querySelectorAll('.auth-tab');
  const forms = document.querySelectorAll('.auth-form');
  tabs.forEach(t => t.classList.remove('active'));
  forms.forEach(f => f.classList.remove('active'));
  if (tabs[0]) tabs[0].classList.add('active');
  const loginForm = document.getElementById('loginForm');
  if (loginForm) loginForm.classList.add('active');
};

window.showRegisterForm = function() {
  const tabs = document.querySelectorAll('.auth-tab');
  const forms = document.querySelectorAll('.auth-form');
  tabs.forEach(t => t.classList.remove('active'));
  forms.forEach(f => f.classList.remove('active'));
  if (tabs[1]) tabs[1].classList.add('active');
  const registerForm = document.getElementById('registerForm');
  if (registerForm) registerForm.classList.add('active');
};

// ===== РЕГИСТРАЦИЯ =====
window.register = async function() {
  const name = document.getElementById('regName')?.value.trim();
  const pass = document.getElementById('regPass')?.value.trim();
  const confirm = document.getElementById('regConfirm')?.value.trim();
  
  if (!name || !pass || !confirm) return showMessage('Заполните все поля!', true);
  if (pass !== confirm) return showMessage('Пароли не совпадают!', true);
  if (pass.length < 6) return showMessage('Пароль должен быть минимум 6 символов!', true);
  
  try {
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
    
    if (document.getElementById('regName')) document.getElementById('regName').value = '';
    if (document.getElementById('regPass')) document.getElementById('regPass').value = '';
    if (document.getElementById('regConfirm')) document.getElementById('regConfirm').value = '';
    
    window.showLoginForm();
    
  } catch (error) {
    console.error("Registration error:", error);
    showMessage('Ошибка: ' + error.message, true);
  }
};

// ===== ВХОД =====
window.login = async function() {
  const name = document.getElementById('loginName')?.value.trim();
  const pass = document.getElementById('loginPass')?.value.trim();
  
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
    const app = document.getElementById('app');
    if (app) app.classList.remove('hidden');
    
    const fullNameInput = document.getElementById('fullName');
    const employeeIdInput = document.getElementById('employeeId');
    if (fullNameInput) fullNameInput.value = currentUser.fullName || '';
    if (employeeIdInput) employeeIdInput.value = currentUser.employeeId || '';
    
    showMessage('Добро пожаловать!');
    
  } catch (error) {
    console.error("Login error:", error);
    showMessage('Ошибка входа: ' + error.message, true);
  }
};

// ===== ВЫХОД =====
window.logout = async function() {
  if (confirm('Выйти?')) {
    await signOut(auth);
    currentUser = null;
    const app = document.getElementById('app');
    if (app) app.classList.add('hidden');
    showModal('authModal');
    window.showLoginForm();
  }
};

// ===== ПРОФИЛЬ =====
window.saveProfile = async function() {
  if (!currentUser) return;
  
  const fullName = document.getElementById('fullName')?.value || '';
  const employeeId = document.getElementById('employeeId')?.value || '';
  
  currentUser.fullName = fullName;
  currentUser.employeeId = employeeId;
  
  await updateDoc(doc(db, "users", currentUser.uid), {
    fullName: fullName,
    employeeId: employeeId
  });
  
  showMessage('Профиль сохранён!');
};

// ===== НАВИГАЦИЯ =====
window.setView = function(view) {
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  const selectedView = document.getElementById(view);
  if (selectedView) selectedView.classList.add('active');
};

// ===== СЛЕДИМ ЗА СОСТОЯНИЕМ =====
onAuthStateChanged(auth, async (user) => {
  if (user) {
    const userDoc = await getDoc(doc(db, "users", user.uid));
    if (userDoc.exists()) {
      currentUserData = userDoc.data();
      currentUser = { uid: user.uid, ...currentUserData };
      
      hideModal('authModal');
      const app = document.getElementById('app');
      if (app) app.classList.remove('hidden');
      
      const fullNameInput = document.getElementById('fullName');
      const employeeIdInput = document.getElementById('employeeId');
      if (fullNameInput) fullNameInput.value = currentUser.fullName || '';
      if (employeeIdInput) employeeIdInput.value = currentUser.employeeId || '';
    }
  } else {
    currentUser = null;
    const app = document.getElementById('app');
    if (app) app.classList.add('hidden');
    showModal('authModal');
    window.showLoginForm();
  }
});

// ===== ЗАПУСК =====
window.onload = function() {
  console.log("App started");
  hideModal('dayModal');
  showModal('authModal');
  window.showLoginForm();
};

// ===== ФУНКЦИИ КАЛЕНДАРЯ =====
window.changeMonth = function(delta) {
  currentMonth += delta;
  if (currentMonth < 0) { currentMonth = 11; currentYear--; }
  if (currentMonth > 11) { currentMonth = 0; currentYear++; }
  window.buildCalendar();
};

window.buildCalendar = function() {
  const grid = document.getElementById('calendarGrid');
  if (!grid) return;
  grid.innerHTML = '';
  
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDay = new Date(currentYear, currentMonth, 1).getDay();
  const firstDayIndex = firstDay === 0 ? 6 : firstDay - 1;
  
  for (let i = 0; i < firstDayIndex; i++) {
    const empty = document.createElement('div');
    empty.className = 'day empty';
    grid.appendChild(empty);
  }
  
  for (let d = 1; d <= daysInMonth; d++) {
    const cell = document.createElement('div');
    cell.className = 'day';
    cell.textContent = d;
    
    const today = new Date();
    const date = new Date(currentYear, currentMonth, d);
    
    if (date < today) {
      cell.onclick = () => window.openDayModal(d);
    }
    
    grid.appendChild(cell);
  }
};

window.openDayModal = function(day) {
  showModal('dayModal');
};

window.addRecord = function(type) {
  console.log('addRecord', type);
  window.closeModal();
};

window.closeModal = function() {
  hideModal('dayModal');
};

// ===== ЗАГЛУШКИ =====
window.quickAddSalary = function() { console.log('quickAddSalary'); };
window.clearQuickSalary = function() { console.log('clearQuickSalary'); };
window.previewAvatar = function() { console.log('previewAvatar'); };
window.exportData = function() { console.log('exportData'); };
window.setLanguage = function(lang) { console.log('Language:', lang); };
window.addToGoal = function() { console.log('addToGoal'); };
window.withdrawFromGoal = function() { console.log('withdrawFromGoal'); };
window.saveGoal = function() { console.log('saveGoal'); };
window.clearGoal = function() { console.log('clearGoal'); };
window.loadYearStats = function() { console.log('loadYearStats'); };
window.clearAllData = function() { console.log('clearAllData'); };
