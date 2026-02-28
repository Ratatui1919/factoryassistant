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

let currentUser = null;
let currentUserData = null;
let currentMonth = new Date().getMonth();
let currentYear = new Date().getFullYear();
let selectedDay = null;
let currentLanguage = localStorage.getItem('vaillant_language') || 'ru';
let yearChart = null, statsChart = null, pieChart = null;

const BASE_RATE = 6.10;
const LUNCH_COST_REAL = 1.31;
const SATURDAY_BONUS = 25;
const NIGHT_BONUS_PERCENT = 20;
const SOCIAL_RATE = 0.094;
const HEALTH_RATE = 0.10;
const TAX_RATE = 0.19;
const NON_TAXABLE = 410;

const translations = {
  ru: { dashboard: 'Дашборд', calendar: 'Календарь', stats: 'Статистика', profile: 'Профиль', finance: 'Финансы' },
  sk: { dashboard: 'Nástenka', calendar: 'Kalendár', stats: 'Štatistika', profile: 'Profil', finance: 'Financie' },
  en: { dashboard: 'Dashboard', calendar: 'Calendar', stats: 'Statistics', profile: 'Profile', finance: 'Finance' },
  uk: { dashboard: 'Панель', calendar: 'Календар', stats: 'Статистика', profile: 'Профіль', finance: 'Фінанси' }
};

function showModal(id) { document.getElementById(id).style.display = 'flex'; }
function hideModal(id) { document.getElementById(id).style.display = 'none'; }
function showMessage(msg, isError = false) { alert(isError ? '❌ ' + msg : '✅ ' + msg); }

window.setLanguage = function(lang) {
  currentLanguage = lang;
  localStorage.setItem('vaillant_language', lang);
  document.querySelectorAll('.lang-btn').forEach(btn => btn.classList.remove('active'));
  document.querySelector(`.lang-btn[data-lang="${lang}"]`).classList.add('active');
  document.querySelectorAll('[data-lang]').forEach(el => {
    let key = el.getAttribute('data-lang');
    if (translations[lang] && translations[lang][key]) el.textContent = translations[lang][key];
  });
};

function getAvatarUrl(email) { 
  let name = email.split('@')[0];
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=00b060&color=fff&size=128`; 
}

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

// ===== НОВАЯ РЕГИСТРАЦИЯ (ПО EMAIL) =====
window.register = async function() {
  const email = document.getElementById('regEmail')?.value.trim();
  const pass = document.getElementById('regPass')?.value.trim();
  const confirm = document.getElementById('regConfirm')?.value.trim();
  
  if (!email || !pass || !confirm) return showMessage('Заполните все поля!', true);
  if (!email.includes('@')) return showMessage('Введите корректный email!', true);
  if (pass !== confirm) return showMessage('Пароли не совпадают!', true);
  if (pass.length < 6) return showMessage('Пароль должен быть минимум 6 символов!', true);
  
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
    const user = userCredential.user;
    
    // Используем часть email как имя для отображения
    const displayName = email.split('@')[0];
    
    const userData = {
      uid: user.uid,
      name: displayName,
      email: email,
      fullName: '',
      employeeId: '',
      cardId: '',
      records: [],
      quickSalaries: [],
      financialGoal: null,
      settings: { 
        hourlyRate: BASE_RATE, 
        lunchCost: LUNCH_COST_REAL, 
        nightBonus: NIGHT_BONUS_PERCENT,
        saturdayBonus: 1.5, 
        sundayBonus: 2.0, 
        extraBonus: 25,
        personalDoctorDays: 7, 
        accompanyDoctorDays: 6, 
        usedPersonalDoctor: 0, 
        usedAccompanyDoctor: 0, 
        usedWeekends: 0 
      },
      joinDate: new Date().toISOString(),
      createdAt: new Date().toISOString()
    };
    
    await setDoc(doc(db, "users", user.uid), userData);
    showMessage('Регистрация успешна! Теперь войдите.');
    
    document.getElementById('regEmail').value = '';
    document.getElementById('regPass').value = '';
    document.getElementById('regConfirm').value = '';
    
    window.showLoginForm();
    
  } catch (error) {
    console.error("Registration error:", error);
    if (error.code === 'auth/email-already-in-use') {
      showMessage('Этот email уже зарегистрирован!', true);
    } else {
      showMessage('Ошибка: ' + error.message, true);
    }
  }
};

// ===== НОВЫЙ ВХОД (ПО EMAIL) =====
window.login = async function() {
  const email = document.getElementById('loginEmail')?.value.trim();
  const pass = document.getElementById('loginPass')?.value.trim();
  
  if (!email || !pass) return showMessage('Введите email и пароль!', true);
  if (!email.includes('@')) return showMessage('Введите корректный email!', true);
  
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, pass);
    const user = userCredential.user;
    
    const userDoc = await getDoc(doc(db, "users", user.uid));
    if (userDoc.exists()) {
      currentUserData = userDoc.data();
      currentUser = { uid: user.uid, ...currentUserData };
      
      hideModal('authModal');
      document.getElementById('app').classList.remove('hidden');
      
      document.getElementById('fullName').value = currentUser.fullName || '';
      document.getElementById('employeeId').value = currentUser.employeeId || '';
      document.getElementById('cardId').value = currentUser.cardId || '';
      document.getElementById('email').value = currentUser.email || '';
      
      if (currentUser.settings) {
        document.getElementById('hourlyRate').value = currentUser.settings.hourlyRate || BASE_RATE;
        document.getElementById('lunchCost').value = currentUser.settings.lunchCost || LUNCH_COST_REAL;
        document.getElementById('nightBonus').value = currentUser.settings.nightBonus || NIGHT_BONUS_PERCENT;
        document.getElementById('saturdayBonus').value = currentUser.settings.saturdayBonus || 1.5;
        document.getElementById('sundayBonus').value = currentUser.settings.sundayBonus || 2.0;
        document.getElementById('extraBonus').value = currentUser.settings.extraBonus || 25;
        document.getElementById('personalDoctorDays').value = currentUser.settings.personalDoctorDays || 7;
        document.getElementById('accompanyDoctorDays').value = currentUser.settings.accompanyDoctorDays || 6;
        document.getElementById('usedPersonalDoctor').value = currentUser.settings.usedPersonalDoctor || 0;
        document.getElementById('usedAccompanyDoctor').value = currentUser.settings.usedAccompanyDoctor || 0;
        document.getElementById('usedWeekends').value = currentUser.settings.usedWeekends || 0;
      }
      
      document.getElementById('userName').textContent = currentUser.name || email.split('@')[0];
      document.getElementById('profileName').textContent = currentUser.name || email.split('@')[0];
      let avatarUrl = currentUser.avatar || getAvatarUrl(email);
      document.getElementById('avatarPreview').src = avatarUrl;
      document.getElementById('profileAvatar').src = avatarUrl;
      
      showMessage('Добро пожаловать!');
    } else {
      showMessage('Данные пользователя не найдены!', true);
    }
    
  } catch (error) {
    console.error("Login error:", error);
    if (error.code === 'auth/invalid-credential') {
      showMessage('Неверный email или пароль!', true);
    } else {
      showMessage('Ошибка входа: ' + error.message, true);
    }
  }
};

// ===== ОСТАЛЬНОЙ КОД БЕЗ ИЗМЕНЕНИЙ =====
window.logout = async function() {
  if (confirm('Выйти?')) { 
    await signOut(auth); 
    currentUser = null; 
    document.getElementById('app').classList.add('hidden'); 
    showModal('authModal'); 
    window.showLoginForm(); 
  }
};

window.setView = function(view) {
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  document.getElementById(view)?.classList.add('active');
  if (view === 'calendar') buildCalendar();
  if (view === 'stats') loadYearStats();
  if (view === 'finance') updateFinanceStats();
};

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
      document.getElementById('cardId').value = currentUser.cardId || '';
      document.getElementById('email').value = currentUser.email || '';
      
      if (currentUser.settings) {
        document.getElementById('hourlyRate').value = currentUser.settings.hourlyRate || BASE_RATE;
        document.getElementById('lunchCost').value = currentUser.settings.lunchCost || LUNCH_COST_REAL;
        document.getElementById('nightBonus').value = currentUser.settings.nightBonus || NIGHT_BONUS_PERCENT;
        document.getElementById('saturdayBonus').value = currentUser.settings.saturdayBonus || 1.5;
        document.getElementById('sundayBonus').value = currentUser.settings.sundayBonus || 2.0;
        document.getElementById('extraBonus').value = currentUser.settings.extraBonus || 25;
        document.getElementById('personalDoctorDays').value = currentUser.settings.personalDoctorDays || 7;
        document.getElementById('accompanyDoctorDays').value = currentUser.settings.accompanyDoctorDays || 6;
        document.getElementById('usedPersonalDoctor').value = currentUser.settings.usedPersonalDoctor || 0;
        document.getElementById('usedAccompanyDoctor').value = currentUser.settings.usedAccompanyDoctor || 0;
        document.getElementById('usedWeekends').value = currentUser.settings.usedWeekends || 0;
      }
      
      document.getElementById('userName').textContent = currentUser.name || currentUser.email.split('@')[0];
      document.getElementById('profileName').textContent = currentUser.name || currentUser.email.split('@')[0];
      let avatarUrl = currentUser.avatar || getAvatarUrl(currentUser.email);
      document.getElementById('avatarPreview').src = avatarUrl;
      document.getElementById('profileAvatar').src = avatarUrl;
      
      updateMonthDisplay();
      buildCalendar();
      calculateAllStats();
      loadFinancialGoal();
    }
  } else {
    currentUser = null;
    document.getElementById('app').classList.add('hidden');
    showModal('authModal');
    window.showLoginForm();
  }
});

window.onload = function() {
  hideModal('dayModal');
  setLanguage(currentLanguage);
  setTimeout(() => {
    let profileActions = document.querySelector('.profile-actions');
    if (profileActions && !document.getElementById('clearAllDataBtn')) {
      let clearBtn = document.createElement('button');
      clearBtn.id = 'clearAllDataBtn';
      clearBtn.className = 'btn-danger';
      clearBtn.innerHTML = '<i class="fas fa-trash"></i> Очистить все данные';
      clearBtn.onclick = window.clearAllData;
      profileActions.appendChild(clearBtn);
    }
  }, 500);
  showModal('authModal');
  window.showLoginForm();
};

function updateMonthDisplay() {
  const monthNames = ['Январь','Февраль','Март','Апрель','Май','Июнь','Июль','Август','Сентябрь','Октябрь','Ноябрь','Декабрь'];
  document.getElementById('currentMonth').innerText = monthNames[currentMonth] + ' ' + currentYear;
  document.getElementById('calendarMonth').innerText = monthNames[currentMonth] + ' ' + currentYear;
  document.getElementById('monthSelect').value = currentMonth;
  document.getElementById('yearSelect').value = currentYear;
  document.getElementById('financeMonth').innerText = monthNames[currentMonth] + ' ' + currentYear;
}

window.changeMonth = function(delta) {
  if (typeof delta === 'number') currentMonth += delta;
  else { currentMonth = parseInt(document.getElementById('monthSelect').value); currentYear = parseInt(document.getElementById('yearSelect').value); }
  if (currentMonth < 0) { currentMonth = 11; currentYear--; }
  if (currentMonth > 11) { currentMonth = 0; currentYear++; }
  updateMonthDisplay();
  buildCalendar();
  calculateAllStats();
};

function buildCalendar() {
  const grid = document.getElementById('calendarGrid');
  if (!grid) return;
  grid.innerHTML = '';
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  let firstDay = new Date(currentYear, currentMonth, 1).getDay();
  firstDay = firstDay === 0 ? 6 : firstDay - 1;
  const today = new Date(); today.setHours(0,0,0,0);
  for (let i = 0; i < firstDay; i++) { let empty = document.createElement('div'); empty.className = 'day empty'; grid.appendChild(empty); }
  for (let d = 1; d <= daysInMonth; d++) {
    let cell = document.createElement('div');
    let date = new Date(currentYear, currentMonth, d); date.setHours(0,0,0,0);
    let isPast = date <= today;
    cell.className = 'day'; if (!isPast) cell.classList.add('future');
    cell.innerHTML = `<span class="day-number">${d}</span><span class="day-icon">📅</span>`;
    if (currentUser && currentUser.records) {
      let dateStr = `${currentYear}-${String(currentMonth+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
      let record = currentUser.records.find(r => r.date === dateStr);
      if (record) {
        cell.classList.add(record.type);
        let iconSpan = cell.querySelector('.day-icon');
        if (iconSpan) { const icons = { work:'💼', night:'🌙', overtime:'⏰', sat:'📆', sun:'☀️', extra:'➕', sick:'🤒', vacation:'🏖️', doctor:'🩺', off:'❌' };
          iconSpan.textContent = icons[record.type] || '📅';
        }
      }
    }
    if (isPast) cell.onclick = () => { selectedDay = d; showModal('dayModal'); };
    grid.appendChild(cell);
  }
}

window.addRecord = async function(type) {
  if (!currentUser || !selectedDay) return;
  let dateStr = `${currentYear}-${String(currentMonth+1).padStart(2,'0')}-${String(selectedDay).padStart(2,'0')}`;
  let oldRecord = currentUser.records?.find(r => r.date === dateStr);
  if (oldRecord) {
    if (oldRecord.type === 'doctor') currentUser.settings.usedPersonalDoctor--;
    if (oldRecord.type === 'sat' || oldRecord.type === 'sun') currentUser.settings.usedWeekends--;
  }
  currentUser.records = currentUser.records?.filter(r => r.date !== dateStr) || [];
  if (type !== 'off') {
    currentUser.records.push({ date: dateStr, type: type, hours: 7.5 });
    if (type === 'doctor') currentUser.settings.usedPersonalDoctor++;
    if (type === 'sat' || type === 'sun') currentUser.settings.usedWeekends++;
  }
  await updateDoc(doc(db, "users", currentUser.uid), { records: currentUser.records, settings: currentUser.settings });
  hideModal('dayModal');
  buildCalendar();
  calculateAllStats();
};

window.closeModal = function() { hideModal('dayModal'); };

function calculateDayEarnings(record, rate, settings) {
  let hours = record.hours || 7.5;
  switch(record.type) {
    case 'night': return hours * rate * (1 + (settings?.nightBonus || NIGHT_BONUS_PERCENT)/100);
    case 'overtime': return hours * rate * 1.5;
    case 'sat': return hours * rate * 1.5 + SATURDAY_BONUS;
    case 'sun': return hours * rate * 2.0;
    case 'extra': return (hours/2) * rate * 1.36;
    case 'sick': return hours * rate * 0.6;
    default: return hours * rate;
  }
}

function calculateDashboardStats() {
  if (!currentUser) return;
  let today = new Date(); today.setHours(0,0,0,0);
  let monthly = currentUser.records?.filter(r => {
    let d = new Date(r.date); d.setHours(0,0,0,0);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear && d <= today;
  }) || [];
  let workDays = monthly.filter(r => {
    let d = new Date(r.date); let dayOfWeek = d.getDay();
    return dayOfWeek !== 0 && dayOfWeek !== 6 && r.type !== 'off' && r.type !== 'sick' && r.type !== 'vacation';
  }).length;
  let rate = currentUser.settings?.hourlyRate || BASE_RATE;
  let lunchCost = (currentUser.settings?.lunchCost || LUNCH_COST_REAL) * workDays;
  let stats = { gross: 0, hours: 0, overtimeHours: 0, saturdays: 0, sundays: 0, extraBlocks: 0, doctorDays: 0 };
  monthly.forEach(r => {
    if (r.type === 'off') return;
    let hours = r.hours || 7.5; stats.hours += hours;
    let amount = calculateDayEarnings(r, rate, currentUser.settings); stats.gross += amount;
    if (r.type === 'overtime') stats.overtimeHours += hours;
    if (r.type === 'sat') stats.saturdays++;
    if (r.type === 'sun') stats.sundays++;
    if (r.type === 'extra') stats.extraBlocks++;
    if (r.type === 'doctor') stats.doctorDays++;
  });
  stats.gross += Math.floor(stats.extraBlocks / 2) * (currentUser.settings?.extraBonus || 25);
  stats.gross -= lunchCost;
  let social = stats.gross * SOCIAL_RATE;
  let health = stats.gross * HEALTH_RATE;
  let taxable = Math.max(stats.gross - social - health - NON_TAXABLE, 0);
  let tax = taxable * TAX_RATE;
  let net = stats.gross - social - health - tax;
  document.getElementById('gross').innerText = stats.gross.toFixed(2) + ' €';
  document.getElementById('net').innerText = net.toFixed(2) + ' €';
  document.getElementById('hoursWorked').innerText = stats.hours;
  document.getElementById('overtimeHours').innerText = stats.overtimeHours;
  document.getElementById('extraCount').innerText = stats.extraBlocks;
  document.getElementById('satCount').innerText = stats.saturdays + stats.sundays;
  document.getElementById('doctorCount').innerText = stats.doctorDays;
  document.getElementById('lunchCost').innerText = lunchCost.toFixed(2) + ' €';
}

window.quickAddSalary = async function() {
  if (!currentUser) return;
  let gross = parseFloat(document.getElementById('quickGross').value);
  let net = parseFloat(document.getElementById('quickNet').value);
  if (isNaN(gross) || isNaN(net)) return showMessage('Введите оба значения!', true);
  if (!currentUser.quickSalaries) currentUser.quickSalaries = [];
  let existingIndex = currentUser.quickSalaries.findIndex(s => s.month === currentMonth && s.year === currentYear);
  if (existingIndex !== -1) currentUser.quickSalaries[existingIndex] = { month: currentMonth, year: currentYear, gross, net, date: new Date().toISOString() };
  else currentUser.quickSalaries.push({ month: currentMonth, year: currentYear, gross, net, date: new Date().toISOString() });
  await updateDoc(doc(db, "users", currentUser.uid), { quickSalaries: currentUser.quickSalaries });
  document.getElementById('quickGross').value = ''; document.getElementById('quickNet').value = '';
  updateFinanceStats();
};

window.clearQuickSalary = async function() {
  if (!currentUser) return;
  currentUser.quickSalaries = currentUser.quickSalaries?.filter(s => !(s.month === currentMonth && s.year === currentYear)) || [];
  await updateDoc(doc(db, "users", currentUser.uid), { quickSalaries: currentUser.quickSalaries });
  showMessage('Зарплата удалена');
  updateFinanceStats();
};

function updateFinanceStats() {
  if (!currentUser) return;
  let dashboardNet = parseFloat(document.getElementById('net').innerText) || 0;
  let dashboardGross = parseFloat(document.getElementById('gross').innerText) || 0;
  let dashboardLunch = parseFloat(document.getElementById('lunchCost').innerText) || 0;
  let taxes = Math.max(dashboardGross - dashboardNet, 0);
  let savings = dashboardNet * 0.1;
  document.getElementById('financeNet').innerText = dashboardNet.toFixed(2) + ' €';
  document.getElementById('financeGross').innerText = dashboardGross.toFixed(2) + ' €';
  document.getElementById('financeTax').innerText = taxes.toFixed(2) + ' €';
  document.getElementById('financeLunch').innerText = dashboardLunch.toFixed(2) + ' €';
  document.getElementById('financeSavings').innerText = savings.toFixed(2) + ' €';
  document.getElementById('pieTotal').innerText = dashboardNet.toFixed(2) + ' €';
  buildPieChart(Math.max(dashboardNet, 0.01), Math.max(taxes, 0.01), Math.max(dashboardLunch, 0.01), Math.max(savings, 0.01));
  let tips = [ 'Откладывай минимум 10% от зарплаты', 'Используй надчасы для допдохода', 'Суббота +25€ бонуса', 'Ночные +20%', 'Следи за перепустками' ];
  document.getElementById('financeTip').innerText = tips[Math.floor(Math.random() * tips.length)];
}

function buildPieChart(net, tax, lunch, savings) {
  let canvas = document.getElementById('pieChart'); if (!canvas) return;
  if (pieChart) pieChart.destroy();
  let ctx = canvas.getContext('2d');
  pieChart = new Chart(ctx, { type: 'doughnut', data: { labels: ['Чистый доход','Налоги','Обеды','Сбережения'],
    datasets: [{ data: [net, tax, lunch, savings], backgroundColor: ['#00b060','#f59e0b','#ef4444','#8b5cf6'], borderWidth: 0 }] },
    options: { responsive: true, cutout: '70%', plugins: { legend: { position: 'bottom', labels: { color: '#fff' } } } }
  });
}

function loadYearStats() {
  if (!currentUser) return;
  let year = parseInt(document.getElementById('yearSelectStats').value);
  let today = new Date(); today.setHours(0,0,0,0);
  let rate = currentUser.settings?.hourlyRate || BASE_RATE;
  let yearRecords = currentUser.records?.filter(r => {
    let d = new Date(r.date); d.setHours(0,0,0,0);
    return d.getFullYear() === year && d <= today && r.type !== 'off';
  }) || [];
  let totalGross = 0, totalHours = 0, totalLunch = 0;
  let monthTotals = new Array(12).fill(0);
  yearRecords.forEach(r => {
    let d = new Date(r.date); let hours = r.hours || 7.5; totalHours += hours;
    let amount = calculateDayEarnings(r, rate, currentUser.settings); totalGross += amount;
    monthTotals[d.getMonth()] += amount;
    let dayOfWeek = d.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6 && r.type !== 'sick' && r.type !== 'vacation')
      totalLunch += currentUser.settings?.lunchCost || LUNCH_COST_REAL;
  });
  totalGross += Math.floor(yearRecords.filter(r => r.type === 'extra').length / 2) * (currentUser.settings?.extraBonus || 25);
  totalGross -= totalLunch;
  let monthNames = ['Январь','Февраль','Март','Апрель','Май','Июнь','Июль','Август','Сентябрь','Октябрь','Ноябрь','Декабрь'];
  let bestMonth = { value: 0, name: '' };
  monthTotals.forEach((total, index) => { if (total > bestMonth.value) { bestMonth.value = total; bestMonth.name = monthNames[index]; } });
  document.getElementById('totalEarned').innerText = totalGross.toFixed(2) + ' €';
  document.getElementById('totalHours').innerText = totalHours;
  document.getElementById('totalLunch').innerText = totalLunch.toFixed(2) + ' €';
  document.getElementById('bestMonth').innerText = bestMonth.name + ' ' + bestMonth.value.toFixed(0) + '€';
  buildStatsChart(monthTotals);
}

function buildStatsChart(monthTotals) {
  let canvas = document.getElementById('statsChart'); if (!canvas) return;
  if (statsChart) statsChart.destroy();
  statsChart = new Chart(canvas, { type: 'bar', data: { labels: ['Янв','Фев','Мар','Апр','Май','Июн','Июл','Авг','Сен','Окт','Ноя','Дек'],
    datasets: [{ label: 'Доход €', data: monthTotals, backgroundColor: 'rgba(0,176,96,0.7)', borderColor: '#00b060', borderWidth: 1 }] },
    options: { responsive: true, plugins: { legend: { labels: { color: '#fff' } } },
      scales: { y: { grid: { color: '#334155' }, ticks: { color: '#94a3b8' } }, x: { ticks: { color: '#94a3b8' } } }
    }
  });
}

window.saveProfile = async function() {
  if (!currentUser) return;
  currentUser.fullName = document.getElementById('fullName').value;
  currentUser.employeeId = document.getElementById('employeeId').value;
  currentUser.cardId = document.getElementById('cardId').value;
  currentUser.email = document.getElementById('email').value;
  currentUser.settings.hourlyRate = parseFloat(document.getElementById('hourlyRate').value) || BASE_RATE;
  currentUser.settings.lunchCost = parseFloat(document.getElementById('lunchCost').value) || LUNCH_COST_REAL;
  currentUser.settings.nightBonus = parseFloat(document.getElementById('nightBonus').value) || NIGHT_BONUS_PERCENT;
  currentUser.settings.saturdayBonus = parseFloat(document.getElementById('saturdayBonus').value) || 1.5;
  currentUser.settings.sundayBonus = parseFloat(document.getElementById('sundayBonus').value) || 2.0;
  currentUser.settings.extraBonus = parseFloat(document.getElementById('extraBonus').value) || 25;
  currentUser.settings.personalDoctorDays = parseInt(document.getElementById('personalDoctorDays').value) || 7;
  currentUser.settings.accompanyDoctorDays = parseInt(document.getElementById('accompanyDoctorDays').value) || 6;
  currentUser.settings.usedPersonalDoctor = parseInt(document.getElementById('usedPersonalDoctor').value) || 0;
  currentUser.settings.usedAccompanyDoctor = parseInt(document.getElementById('usedAccompanyDoctor').value) || 0;
  currentUser.settings.usedWeekends = parseInt(document.getElementById('usedWeekends').value) || 0;
  await updateDoc(doc(db, "users", currentUser.uid), {
    fullName: currentUser.fullName, employeeId: currentUser.employeeId, cardId: currentUser.cardId,
    email: currentUser.email, settings: currentUser.settings
  });
  showMessage('Профиль сохранён!');
  calculateAllStats();
};

window.clearAllData = async function() {
  if (!currentUser) return;
  if (confirm('Удалить ВСЕ данные?')) {
    currentUser.records = []; currentUser.quickSalaries = []; currentUser.financialGoal = null;
    currentUser.settings.usedPersonalDoctor = 0; currentUser.settings.usedAccompanyDoctor = 0; currentUser.settings.usedWeekends = 0;
    await updateDoc(doc(db, "users", currentUser.uid), {
      records: currentUser.records, quickSalaries: currentUser.quickSalaries,
      financialGoal: currentUser.financialGoal, settings: currentUser.settings
    });
    buildCalendar(); calculateAllStats(); showMessage('Все данные очищены');
  }
};

window.exportData = function() {
  if (!currentUser) return;
  let data = { user: currentUser.name, records: currentUser.records, quickSalaries: currentUser.quickSalaries, financialGoal: currentUser.financialGoal, settings: currentUser.settings };
  let blob = new Blob([JSON.stringify(data, null, 2)], {type: 'application/json'});
  let url = URL.createObjectURL(blob);
  let a = document.createElement('a'); a.href = url; a.download = `vaillant_${currentUser.name}_${new Date().toISOString().split('T')[0]}.json`;
  a.click();
};

window.previewAvatar = function(input) {
  if (input.files && input.files[0]) {
    let reader = new FileReader();
    reader.onload = async function(e) {
      document.getElementById('avatarPreview').src = e.target.result;
      document.getElementById('profileAvatar').src = e.target.result;
      if (currentUser) { currentUser.avatar = e.target.result; await updateDoc(doc(db, "users", currentUser.uid), { avatar: currentUser.avatar }); }
    }; reader.readAsDataURL(input.files[0]);
  }
};

function calculateAllStats() { calculateDashboardStats(); updateWeekendStats(); buildYearChart(); updateFinanceStats(); }

function updateWeekendStats() {
  if (!currentUser) return;
  let today = new Date(); today.setHours(0,0,0,0);
  let daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  let weekendsThisMonth = 0;
  for (let d = 1; d <= daysInMonth; d++) {
    let date = new Date(currentYear, currentMonth, d); date.setHours(0,0,0,0);
    if ((date.getDay() === 0 || date.getDay() === 6) && date <= today) weekendsThisMonth++;
  }
  document.getElementById('weekendsThisMonth').innerText = weekendsThisMonth;
  let joinDate = new Date(currentUser.joinDate || Date.now()); joinDate.setHours(0,0,0,0);
  let monthsWorked = 0; let currentDate = new Date();
  for (let y = joinDate.getFullYear(); y <= currentDate.getFullYear(); y++) {
    for (let m = (y === joinDate.getFullYear() ? joinDate.getMonth() : 0); m <= (y === currentDate.getFullYear() ? currentDate.getMonth() : 11); m++) monthsWorked++;
  }
  let accruedWeekends = Math.floor(monthsWorked * 1.67);
  document.getElementById('accruedWeekends').innerText = accruedWeekends;
  document.getElementById('accruedWeekendsInput').value = accruedWeekends;
  let personalTotal = currentUser.settings?.personalDoctorDays || 7;
  let usedPersonal = currentUser.settings?.usedPersonalDoctor || 0;
  let accompanyTotal = currentUser.settings?.accompanyDoctorDays || 6;
  let usedAccompany = currentUser.settings?.usedAccompanyDoctor || 0;
  document.getElementById('doctorLeft').innerHTML = `${personalTotal - usedPersonal}/${personalTotal}`;
  document.getElementById('accompanyLeft').innerHTML = `${accompanyTotal - usedAccompany}/${accompanyTotal}`;
}

function buildYearChart() {
  let canvas = document.getElementById('yearChart'); if (!canvas || !currentUser) return;
  let months = new Array(12).fill(0);
  let today = new Date(); today.setHours(0,0,0,0);
  let rate = currentUser.settings?.hourlyRate || BASE_RATE;
  currentUser.records?.forEach(r => {
    if (r.type === 'off') return;
    let d = new Date(r.date); d.setHours(0,0,0,0);
    if (d > today) return;
    months[d.getMonth()] += calculateDayEarnings(r, rate, currentUser.settings);
  });
  if (yearChart) yearChart.destroy();
  yearChart = new Chart(canvas, { type: 'line', data: { labels: ['Янв','Фев','Мар','Апр','Май','Июн','Июл','Авг','Сен','Окт','Ноя','Дек'],
    datasets: [{ label: 'Доход €', data: months, borderColor: '#00b060', backgroundColor: 'rgba(0,176,96,0.15)', fill: true, tension: 0.4 }] },
    options: { responsive: true, plugins: { legend: { labels: { color: '#fff' } } },
      scales: { y: { grid: { color: '#334155' }, ticks: { color: '#94a3b8' } }, x: { ticks: { color: '#94a3b8' } } }
    }
  });
}

function loadFinancialGoal() {
  if (!currentUser?.financialGoal) return;
  let goal = currentUser.financialGoal;
  document.getElementById('goalNameDisplay').innerText = goal.name;
  document.getElementById('goalTarget').innerText = goal.amount.toFixed(2) + ' €';
  document.getElementById('goalName').value = goal.name;
  document.getElementById('goalAmount').value = goal.amount;
  document.getElementById('goalSaved').innerText = (goal.saved || 0).toFixed(2) + ' €';
  let remaining = Math.max(goal.amount - (goal.saved || 0), 0);
  document.getElementById('goalRemaining').innerText = remaining.toFixed(2) + ' €';
  let percent = Math.min(((goal.saved || 0) / goal.amount) * 100, 100);
  document.getElementById('goalPercent').innerText = percent.toFixed(1) + '%';
  document.getElementById('goalProgressBar').style.width = percent + '%';
  document.querySelector('.goal-inputs').style.display = 'none';
  document.getElementById('goalProgress').style.display = 'block';
  document.getElementById('goalActions').style.display = 'flex';
  updateHistoryList();
}

function updateHistoryList() {
  if (!currentUser?.financialGoal?.history) return;
  let history = currentUser.financialGoal.history;
  let html = '';
  history.slice().reverse().slice(0,10).forEach(item => {
    let icon = item.type === 'add' ? '➕' : '➖';
    let color = item.type === 'add' ? '#00b060' : '#ef4444';
    html += `<div class="history-item"><span>${icon} ${item.date}</span><span style="color:${color}">${item.type === 'add' ? '+' : '-'}${item.amount.toFixed(2)} €</span><span style="color:#94a3b8;">(баланс: ${item.balance.toFixed(2)} €)</span></div>`;
  });
  document.getElementById('goalHistory').innerHTML = html || '<div style="color:#94a3b8;">История пуста</div>';
}

window.saveGoal = async function() {
  let name = document.getElementById('goalName').value.trim();
  let amount = parseFloat(document.getElementById('goalAmount').value);
  if (!name || isNaN(amount) || amount <= 0) return showMessage('Введите название и сумму цели', true);
  currentUser.financialGoal = { name, amount, saved: 0, history: [], date: new Date().toISOString() };
  await updateDoc(doc(db, "users", currentUser.uid), { financialGoal: currentUser.financialGoal });
  showMessage('Цель сохранена');
  loadFinancialGoal();
};

window.clearGoal = async function() {
  if (!currentUser?.financialGoal) return;
  if (confirm('Удалить цель?')) {
    currentUser.financialGoal = null;
    await updateDoc(doc(db, "users", currentUser.uid), { financialGoal: null });
    showMessage('Цель удалена');
    document.querySelector('.goal-inputs').style.display = 'flex';
    document.getElementById('goalProgress').style.display = 'none';
  }
};

window.addToGoal = async function() {
  if (!currentUser?.financialGoal) return;
  let amount = parseFloat(prompt('Сколько добавить?', '100'));
  if (isNaN(amount) || amount <= 0) return showMessage('Введите сумму', true);
  currentUser.financialGoal.saved = (currentUser.financialGoal.saved || 0) + amount;
  currentUser.financialGoal.history = currentUser.financialGoal.history || [];
  currentUser.financialGoal.history.push({ type: 'add', amount, date: new Date().toLocaleString(), balance: currentUser.financialGoal.saved });
  await updateDoc(doc(db, "users", currentUser.uid), { financialGoal: currentUser.financialGoal });
  loadFinancialGoal(); showMessage(`Добавлено ${amount} €`);
};

window.withdrawFromGoal = async function() {
  if (!currentUser?.financialGoal) return;
  let amount = parseFloat(prompt('Сколько снять?', '50'));
  if (isNaN(amount) || amount <= 0) return showMessage('Введите сумму', true);
  if (amount > (currentUser.financialGoal.saved || 0)) return showMessage('Недостаточно средств', true);
  currentUser.financialGoal.saved -= amount;
  currentUser.financialGoal.history = currentUser.financialGoal.history || [];
  currentUser.financialGoal.history.push({ type: 'withdraw', amount, date: new Date().toLocaleString(), balance: currentUser.financialGoal.saved });
  await updateDoc(doc(db, "users", currentUser.uid), { financialGoal: currentUser.financialGoal });
  loadFinancialGoal(); showMessage(`Снято ${amount} €`);
};

