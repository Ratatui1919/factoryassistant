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
  document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.auth-form').forEach(f => f.classList.remove('active'));
  document.querySelectorAll('.auth-tab')[0]?.classList.add('active');
  document.getElementById('loginForm')?.classList.add('active');
};

window.showRegisterForm = function() {
  document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.auth-form').forEach(f => f.classList.remove('active'));
  document.querySelectorAll('.auth-tab')[1]?.classList.add('active');
  document.getElementById('registerForm')?.classList.add('active');
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
    
    document.getElementById('regName').value = '';
    document.getElementById('regPass').value = '';
    document.getElementById('regConfirm').value = '';
    
    window.showLoginForm();
    
  } catch (error) {
    console.error("Registration error:", error);
    showMessage('Ошибка: ' + error.message, true);
  }
};

// ===== ВХОД (ЗАЩИЩЁННАЯ ВЕРСИЯ) =====
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
    document.getElementById('app').classList.remove('hidden');
    
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
    document.getElementById('app').classList.add('hidden');
    showModal('authModal');
    window.showLoginForm();
  }
};

// ===== ПРОФИЛЬ =====
window.saveProfile = async function() {
  if (!currentUser) return;
  
  const fullName = document.getElementById('fullName')?.value || '';
  const employeeId = document.getElementById('employeeId')?.value || '';
  
  await updateDoc(doc(db, "users", currentUser.uid), {
    fullName: fullName,
    employeeId: employeeId
  });
  
  showMessage('Профиль сохранён!');
};

// ===== НАВИГАЦИЯ =====
window.setView = function(view) {
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  document.getElementById(view)?.classList.add('active');
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
      
      const fullNameInput = document.getElementById('fullName');
      const employeeIdInput = document.getElementById('employeeId');
      if (fullNameInput) fullNameInput.value = currentUser.fullName || '';
      if (employeeIdInput) employeeIdInput.value = currentUser.employeeId || '';
    }
  } else {
    currentUser = null;
    document.getElementById('app').classList.add('hidden');
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

// ===== ПРОСТЫЕ ФУНКЦИИ КАЛЕНДАРЯ =====
window.changeMonth = function(delta) {
  currentMonth += delta;
  if (currentMonth < 0) { currentMonth = 11; currentYear--; }
  if (currentMonth > 11) { currentMonth = 0; currentYear++; }
};

window.openDayModal = function(day) {
  showModal('dayModal');
};

window.addRecord = function(type) {
  console.log('addRecord', type);
  hideModal('dayModal');
};

window.closeModal = function() {
  hideModal('dayModal');
};

// ===== ЗАГЛУШКИ =====
window.quickAddSalary = function() {};
window.clearQuickSalary = function() {};
window.previewAvatar = function() {};
window.exportData = function() {};
window.setLanguage = function(lang) {};
window.addToGoal = function() {};
window.withdrawFromGoal = function() {};
window.saveGoal = function() {};
window.clearGoal = function() {};
window.loadYearStats = function() {};
window.clearAllData = function() {};
