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
let currentLanguage = localStorage.getItem('vaillant_language') || 'en';
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
  ru: {
    dashboard: 'Дашборд',
    calendar: 'Календарь',
    stats: 'Статистика',
    profile: 'Профиль',
    finance: 'Финансы',
    netSalary: 'Чистая зарплата',
    grossSalary: 'Грязная',
    hours: 'Часов',
    lunches: 'Обеды',
    overtime: 'Переработки',
    extraBlocks: 'Экстра блоки',
    saturdays: 'Субботы',
    doctorVisits: 'Перепустки',
    weekendsThisMonth: 'Выходные в этом месяце',
    accruedWeekends: 'Накоплено выходных',
    doctorLeft: 'Перепустки осталось',
    accompanyLeft: 'Сопровождение',
    monthlyIncome: 'Доход по месяцам',
    totalStats: 'Общая статистика',
    totalEarned: 'Всего заработано',
    totalHours: 'Всего часов',
    totalLunch: 'Потрачено на обеды',
    bestMonth: 'Лучший месяц',
    employee: 'Сотрудник завода',
    personalData: 'Личные данные',
    fullName: 'Полное имя',
    employeeId: 'Табельный номер',
    cardId: 'Номер карты',
    email: 'Email',
    salarySettings: 'Настройки зарплаты',
    hourlyRate: 'Базовая ставка (€/час)',
    lunchCost: 'Стоимость обеда (€/день)',
    nightBonus: 'Ночная доплата (%)',
    saturdayBonus: 'Коэф. субботы',
    sundayBonus: 'Коэф. воскресенья',
    extraBonus: 'Бонус за экстра блок (€)',
    vacations: 'Отпуска и перепустки',
    accruedWeekendsLabel: 'Накоплено выходных (1.67/мес)',
    usedWeekends: 'Использовано выходных',
    personalDoctor: 'Перепустки (личные)',
    usedPersonalDoctor: 'Использовано личных',
    accompanyDoctor: 'Перепустки (сопровождение)',
    usedAccompanyDoctor: 'Использовано сопровождения',
    export: 'Экспорт данных',
    financeAnalytics: 'Финансовая аналитика',
    netIncome: 'Чистый доход',
    taxes: 'Налоги',
    savings: 'Сбережения',
    financialTip: 'Финансовый совет',
    selectDayType: 'Выберите тип дня',
    work: 'Смена',
    nightShift: 'Ночная смена',
    sick: 'Больничный',
    vacation: 'Отпуск',
    doctor: 'Перепустка',
    dayOff: 'Выходной',
    cancel: 'Отмена',
    saveChanges: 'Сохранить изменения',
    goal: 'Моя финансовая цель',
    goalName: 'Название цели',
    goalAmount: 'Сумма цели',
    goalSaved: 'Накоплено',
    goalTarget: 'Цель',
    goalRemaining: 'Осталось',
    saveGoal: 'Сохранить цель',
    deleteGoal: 'Удалить цель',
    add: 'Добавить',
    withdraw: 'Снять',
    history: 'Последние операции',
    currentMonth: 'Текущий месяц',
    importPDF: 'Импорт из PDF',
    uploadPDF: 'Загрузить PDF с зарплатой',
    processing: 'Обработка...',
    importSuccess: 'Данные за {count} месяцев успешно импортированы',
    importError: 'Ошибка при обработке PDF'
  },
  sk: {
    dashboard: 'Nástenka',
    calendar: 'Kalendár',
    stats: 'Štatistika',
    profile: 'Profil',
    finance: 'Financie',
    netSalary: 'Čistá mzda',
    grossSalary: 'Hrubá',
    hours: 'Hodiny',
    lunches: 'Obed',
    overtime: 'Nadčasy',
    extraBlocks: 'Extra bloky',
    saturdays: 'Soboty',
    doctorVisits: 'Lekár',
    weekendsThisMonth: 'Víkendy tento mesiac',
    accruedWeekends: 'Nahromadené víkendy',
    doctorLeft: 'Lekár zostáva',
    accompanyLeft: 'Sprievod',
    monthlyIncome: 'Príjem podľa mesiacov',
    totalStats: 'Celková štatistika',
    totalEarned: 'Celkový zárobok',
    totalHours: 'Celkom hodín',
    totalLunch: 'Mínus obedy',
    bestMonth: 'Najlepší mesiac',
    employee: 'Zamestnanec',
    personalData: 'Osobné údaje',
    fullName: 'Celé meno',
    employeeId: 'Osobné číslo',
    cardId: 'Číslo karty',
    email: 'Email',
    salarySettings: 'Nastavenia mzdy',
    hourlyRate: 'Základná sadzba (€/hod)',
    lunchCost: 'Cena obeda (€/deň)',
    nightBonus: 'Nočný príplatok (%)',
    saturdayBonus: 'Sobota koeficient',
    sundayBonus: 'Nedeľa koeficient',
    extraBonus: 'Extra blok bonus (€)',
    vacations: 'Dovolenka a lekár',
    accruedWeekendsLabel: 'Nahromadené víkendy (1.67/mes)',
    usedWeekends: 'Použité víkendy',
    personalDoctor: 'Lekár (osobné)',
    usedPersonalDoctor: 'Použité osobné',
    accompanyDoctor: 'Lekár (sprievod)',
    usedAccompanyDoctor: 'Použité sprievod',
    export: 'Export dát',
    financeAnalytics: 'Finančná analýza',
    netIncome: 'Čistý príjem',
    taxes: 'Dane',
    savings: 'Úspory',
    financialTip: 'Finančná rada',
    selectDayType: 'Vyberte typ dňa',
    work: 'Zmena',
    nightShift: 'Nočná zmena',
    sick: 'PN',
    vacation: 'Dovolenka',
    doctor: 'Lekár',
    dayOff: 'Voľno',
    cancel: 'Zrušiť',
    saveChanges: 'Uložiť zmeny',
    goal: 'Môj finančný cieľ',
    goalName: 'Názov cieľa',
    goalAmount: 'Suma cieľa',
    goalSaved: 'Nasporené',
    goalTarget: 'Cieľ',
    goalRemaining: 'Zostáva',
    saveGoal: 'Uložiť cieľ',
    deleteGoal: 'Zmazať cieľ',
    add: 'Pridať',
    withdraw: 'Vybrať',
    history: 'História operácií',
    currentMonth: 'Aktuálny mesiac',
    importPDF: 'Import z PDF',
    uploadPDF: 'Nahrajte PDF s platom',
    processing: 'Spracúvam...',
    importSuccess: 'Údaje za {count} mesiacov boli úspešne importované',
    importError: 'Chyba pri spracovaní PDF'
  },
  en: {
    dashboard: 'Dashboard',
    calendar: 'Calendar',
    stats: 'Statistics',
    profile: 'Profile',
    finance: 'Finance',
    netSalary: 'Net Salary',
    grossSalary: 'Gross',
    hours: 'Hours',
    lunches: 'Lunches',
    overtime: 'Overtime',
    extraBlocks: 'Extra Blocks',
    saturdays: 'Saturdays',
    doctorVisits: 'Doctor',
    weekendsThisMonth: 'Weekends this month',
    accruedWeekends: 'Accrued weekends',
    doctorLeft: 'Doctor left',
    accompanyLeft: 'Accompany',
    monthlyIncome: 'Monthly Income',
    totalStats: 'Total Statistics',
    totalEarned: 'Total earned',
    totalHours: 'Total hours',
    totalLunch: 'Lunch cost',
    bestMonth: 'Best month',
    employee: 'Factory employee',
    personalData: 'Personal data',
    fullName: 'Full name',
    employeeId: 'Employee ID',
    cardId: 'Card ID',
    email: 'Email',
    salarySettings: 'Salary settings',
    hourlyRate: 'Hourly rate (€/hour)',
    lunchCost: 'Lunch cost (€/day)',
    nightBonus: 'Night bonus (%)',
    saturdayBonus: 'Saturday coeff',
    sundayBonus: 'Sunday coeff',
    extraBonus: 'Extra block bonus (€)',
    vacations: 'Vacations & doctor',
    accruedWeekendsLabel: 'Accrued weekends (1.67/month)',
    usedWeekends: 'Used weekends',
    personalDoctor: 'Doctor (personal)',
    usedPersonalDoctor: 'Used personal',
    accompanyDoctor: 'Doctor (accompany)',
    usedAccompanyDoctor: 'Used accompany',
    export: 'Export data',
    financeAnalytics: 'Finance analytics',
    netIncome: 'Net income',
    taxes: 'Taxes',
    savings: 'Savings',
    financialTip: 'Financial tip',
    selectDayType: 'Select day type',
    work: 'Shift',
    nightShift: 'Night shift',
    sick: 'Sick',
    vacation: 'Vacation',
    doctor: 'Doctor',
    dayOff: 'Day off',
    cancel: 'Cancel',
    saveChanges: 'Save changes',
    goal: 'My financial goal',
    goalName: 'Goal name',
    goalAmount: 'Goal amount',
    goalSaved: 'Saved',
    goalTarget: 'Target',
    goalRemaining: 'Remaining',
    saveGoal: 'Save goal',
    deleteGoal: 'Delete goal',
    add: 'Add',
    withdraw: 'Withdraw',
    history: 'Transaction history',
    currentMonth: 'Current month',
    importPDF: 'Import from PDF',
    uploadPDF: 'Upload PDF with salary data',
    processing: 'Processing...',
    importSuccess: 'Data for {count} months successfully imported',
    importError: 'Error processing PDF'
  },
  uk: {
    dashboard: 'Панель',
    calendar: 'Календар',
    stats: 'Статистика',
    profile: 'Профіль',
    finance: 'Фінанси',
    netSalary: 'Чиста зарплата',
    grossSalary: 'Брутто',
    hours: 'Годин',
    lunches: 'Обіди',
    overtime: 'Понаднормові',
    extraBlocks: 'Екстра блоки',
    saturdays: 'Суботи',
    doctorVisits: 'Перепустки',
    weekendsThisMonth: 'Вихідні цього місяця',
    accruedWeekends: 'Накопичено вихідних',
    doctorLeft: 'Перепустки залишилось',
    accompanyLeft: 'Супровід',
    monthlyIncome: 'Дохід по місяцях',
    totalStats: 'Загальна статистика',
    totalEarned: 'Всього зароблено',
    totalHours: 'Всього годин',
    totalLunch: 'Витрати на обіди',
    bestMonth: 'Найкращий місяць',
    employee: 'Працівник заводу',
    personalData: 'Особисті дані',
    fullName: "Повне ім'я",
    employeeId: 'Табельний номер',
    cardId: 'Номер картки',
    email: 'Email',
    salarySettings: 'Налаштування зарплати',
    hourlyRate: 'Базова ставка (€/год)',
    lunchCost: 'Вартість обіду (€/день)',
    nightBonus: 'Нічна доплата (%)',
    saturdayBonus: 'Коеф. суботи',
    sundayBonus: 'Коеф. неділі',
    extraBonus: 'Бонус за екстра блок (€)',
    vacations: 'Відпустки та перепустки',
    accruedWeekendsLabel: 'Накопичено вихідних (1.67/міс)',
    usedWeekends: 'Використано вихідних',
    personalDoctor: 'Перепустки (особисті)',
    usedPersonalDoctor: 'Використано особистих',
    accompanyDoctor: 'Перепустки (супровід)',
    usedAccompanyDoctor: 'Використано супроводу',
    export: 'Експорт даних',
    financeAnalytics: 'Фінансова аналітика',
    netIncome: 'Чистий дохід',
    taxes: 'Податки',
    savings: 'Заощадження',
    financialTip: 'Фінансова порада',
    selectDayType: 'Виберіть тип дня',
    work: 'Зміна',
    nightShift: 'Нічна зміна',
    sick: 'Лікарняний',
    vacation: 'Відпустка',
    doctor: 'Перепустка',
    dayOff: 'Вихідний',
    cancel: 'Скасувати',
    saveChanges: 'Зберегти зміни',
    goal: 'Моя фінансова ціль',
    goalName: 'Назва цілі',
    goalAmount: 'Сума цілі',
    goalSaved: 'Накопичено',
    goalTarget: 'Ціль',
    goalRemaining: 'Залишилось',
    saveGoal: 'Зберегти ціль',
    deleteGoal: 'Видалити ціль',
    add: 'Додати',
    withdraw: 'Зняти',
    history: 'Історія операцій',
    currentMonth: 'Поточний місяць',
    importPDF: 'Імпорт з PDF',
    uploadPDF: 'Завантажте PDF із зарплатою',
    processing: 'Обробка...',
    importSuccess: 'Дані за {count} місяців успішно імпортовано',
    importError: 'Помилка при обробці PDF'
  }
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
    if (translations[lang] && translations[lang][key]) {
      el.textContent = translations[lang][key];
    }
  });
};

function getAvatarUrl(email) { 
  let name = email.split('@')[0];
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=00b060&color=fff&size=128`; 
}

function getDisplayName(user) {
  if (!user) return 'Guest';
  if (user.fullName && user.fullName.trim() !== '') return user.fullName;
  if (user.email) return user.email.split('@')[0];
  return 'User';
}

function updateUserDisplay() {
  if (!currentUser) return;
  const displayName = getDisplayName(currentUser);
  document.getElementById('userName').textContent = displayName;
  document.getElementById('profileName').textContent = displayName;
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

window.register = async function() {
  const email = document.getElementById('regEmail')?.value.trim();
  const pass = document.getElementById('regPass')?.value.trim();
  const confirm = document.getElementById('regConfirm')?.value.trim();
  
  if (!email || !pass || !confirm) return showMessage('Fill all fields!', true);
  if (!email.includes('@')) return showMessage('Enter valid email!', true);
  if (pass !== confirm) return showMessage('Passwords do not match!', true);
  if (pass.length < 6) return showMessage('Password must be at least 6 characters!', true);
  
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
    const user = userCredential.user;
    
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
    showMessage('Registration successful! Now login.');
    
    document.getElementById('regEmail').value = '';
    document.getElementById('regPass').value = '';
    document.getElementById('regConfirm').value = '';
    
    window.showLoginForm();
    
  } catch (error) {
    console.error("Registration error:", error);
    if (error.code === 'auth/email-already-in-use') {
      showMessage('Email already registered!', true);
    } else {
      showMessage('Error: ' + error.message, true);
    }
  }
};

window.login = async function() {
  const email = document.getElementById('loginEmail')?.value.trim();
  const pass = document.getElementById('loginPass')?.value.trim();
  const remember = document.getElementById('rememberMe')?.checked;
  
  if (!email || !pass) return showMessage('Enter email and password!', true);
  if (!email.includes('@')) return showMessage('Enter valid email!', true);
  
  if (remember) {
    localStorage.setItem('rememberedEmail', email);
    localStorage.setItem('rememberedPass', pass);
  } else {
    localStorage.removeItem('rememberedEmail');
    localStorage.removeItem('rememberedPass');
  }
  
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
      
      let avatarUrl = currentUser.avatar || getAvatarUrl(email);
      document.getElementById('avatarPreview').src = avatarUrl;
      document.getElementById('profileAvatar').src = avatarUrl;
      
      updateUserDisplay();
      
      updateMonthDisplay();
      buildCalendar();
      calculateAllStats();
      loadFinancialGoal();
      
      showMessage('Welcome!');
    } else {
      showMessage('User data not found!', true);
    }
    
  } catch (error) {
    console.error("Login error:", error);
    if (error.code === 'auth/invalid-credential') {
      showMessage('Invalid email or password!', true);
    } else {
      showMessage('Login error: ' + error.message, true);
    }
  }
};

window.logout = async function() {
  if (confirm('Logout?')) { 
    await signOut(auth); 
    currentUser = null; 
    document.getElementById('app').classList.add('hidden'); 
    showModal('authModal'); 
    window.showLoginForm(); 
  }
};

window.setView = function(view) {
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  document.getElementById(view)?.classList.add('active');
  document.querySelector(`.nav-btn[data-view="${view}"]`)?.classList.add('active');
  
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
      
      let avatarUrl = currentUser.avatar || getAvatarUrl(currentUser.email);
      document.getElementById('avatarPreview').src = avatarUrl;
      document.getElementById('profileAvatar').src = avatarUrl;
      
      updateUserDisplay();
      
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
  const rememberedEmail = localStorage.getItem('rememberedEmail');
  const rememberedPass = localStorage.getItem('rememberedPass');
  if (rememberedEmail) {
    document.getElementById('loginEmail').value = rememberedEmail;
    document.getElementById('loginPass').value = rememberedPass;
    document.getElementById('rememberMe').checked = true;
  }
  
  hideModal('dayModal');
  setLanguage(currentLanguage);
  setTimeout(() => {
    let profileActions = document.querySelector('.profile-actions');
    if (profileActions && !document.getElementById('clearAllDataBtn')) {
      let clearBtn = document.createElement('button');
      clearBtn.id = 'clearAllDataBtn';
      clearBtn.className = 'btn-danger';
      clearBtn.innerHTML = '<i class="fas fa-trash"></i> ' + (translations[currentLanguage]?.clearAllData || 'Clear all data');
      clearBtn.onclick = window.clearAllData;
      profileActions.appendChild(clearBtn);
    }
  }, 500);
  showModal('authModal');
  window.showLoginForm();
};

function updateMonthDisplay() {
  const monthNames = [
    translations[currentLanguage]?.january || 'January',
    translations[currentLanguage]?.february || 'February',
    translations[currentLanguage]?.march || 'March',
    translations[currentLanguage]?.april || 'April',
    translations[currentLanguage]?.may || 'May',
    translations[currentLanguage]?.june || 'June',
    translations[currentLanguage]?.july || 'July',
    translations[currentLanguage]?.august || 'August',
    translations[currentLanguage]?.september || 'September',
    translations[currentLanguage]?.october || 'October',
    translations[currentLanguage]?.november || 'November',
    translations[currentLanguage]?.december || 'December'
  ];
  document.getElementById('currentMonth').innerText = monthNames[currentMonth] + ' ' + currentYear;
  document.getElementById('calendarMonth').innerText = monthNames[currentMonth] + ' ' + currentYear;
  document.getElementById('monthSelect').value = currentMonth;
  document.getElementById('yearSelect').value = currentYear;
  document.getElementById('financeMonth').innerText = monthNames[currentMonth] + ' ' + currentYear;
}

window.changeMonth = function(delta) {
  if (typeof delta === 'number') {
    currentMonth += delta;
  } else {
    currentMonth = parseInt(document.getElementById('monthSelect').value);
    currentYear = parseInt(document.getElementById('yearSelect').value);
  }
  
  if (currentMonth < 0) {
    currentMonth = 11;
    currentYear--;
  } else if (currentMonth > 11) {
    currentMonth = 0;
    currentYear++;
  }
  
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
  
  const today = new Date();
  today.setHours(0,0,0,0);
  
  for (let i = 0; i < firstDay; i++) {
    let empty = document.createElement('div');
    empty.className = 'day empty';
    grid.appendChild(empty);
  }
  
  for (let d = 1; d <= daysInMonth; d++) {
    let cell = document.createElement('div');
    let date = new Date(currentYear, currentMonth, d);
    date.setHours(0,0,0,0);
    let isPast = date <= today;
    
    cell.className = 'day';
    if (!isPast) cell.classList.add('future');
    
    cell.innerHTML = `<span class="day-number">${d}</span><span class="day-icon">📅</span>`;
    
    if (currentUser && currentUser.records) {
      let dateStr = `${currentYear}-${String(currentMonth+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
      let record = currentUser.records.find(r => r.date === dateStr);
      if (record) {
        cell.classList.add(record.type);
        let iconSpan = cell.querySelector('.day-icon');
        if (iconSpan) {
          const icons = {
            work:'💼', night:'🌙', overtime:'⏰', sat:'📆', sun:'☀️',
            extra:'➕', sick:'🤒', vacation:'🏖️', doctor:'🩺', off:'❌'
          };
          iconSpan.textContent = icons[record.type] || '📅';
        }
      }
    }
    
    if (isPast) {
      cell.onclick = () => {
        selectedDay = d;
        showModal('dayModal');
      };
    }
    
    grid.appendChild(cell);
  }
}

window.addRecord = async function(type) {
  if (!currentUser || !selectedDay) return;
  
  let dateStr = `${currentYear}-${String(currentMonth+1).padStart(2,'0')}-${String(selectedDay).padStart(2,'0')}`;
  let oldRecord = currentUser.records?.find(r => r.date === dateStr);
  
  if (oldRecord) {
    if (oldRecord.type === 'doctor') currentUser.settings.usedPersonalDoctor = Math.max(0, (currentUser.settings.usedPersonalDoctor || 0) - 1);
    if (oldRecord.type === 'sat' || oldRecord.type === 'sun') currentUser.settings.usedWeekends = Math.max(0, (currentUser.settings.usedWeekends || 0) - 1);
  }
  
  currentUser.records = currentUser.records?.filter(r => r.date !== dateStr) || [];
  
  if (type !== 'off') {
    currentUser.records.push({
      date: dateStr,
      type: type,
      hours: 7.5
    });
    
    if (type === 'doctor') currentUser.settings.usedPersonalDoctor = (currentUser.settings.usedPersonalDoctor || 0) + 1;
    if (type === 'sat' || type === 'sun') currentUser.settings.usedWeekends = (currentUser.settings.usedWeekends || 0) + 1;
  }
  
  await updateDoc(doc(db, "users", currentUser.uid), {
    records: currentUser.records,
    settings: currentUser.settings
  });
  
  hideModal('dayModal');
  buildCalendar();
  calculateAllStats();
};

window.closeModal = function() { hideModal('dayModal'); };

function calculateDayEarnings(record, rate, settings) {
  let hours = record.hours || 7.5;
  switch(record.type) {
    case 'night':
      return hours * rate * (1 + (settings?.nightBonus || NIGHT_BONUS_PERCENT)/100);
    case 'overtime':
      return hours * rate * 1.5;
    case 'sat':
      return hours * rate * 1.5 + SATURDAY_BONUS;
    case 'sun':
      return hours * rate * 2.0;
    case 'extra':
      return (hours/2) * rate * 1.36;
    case 'sick':
      return hours * rate * 0.6;
    default:
      return hours * rate;
  }
}

function calculateDashboardStats() {
  if (!currentUser) return;
  
  let today = new Date();
  today.setHours(0,0,0,0);
  
  let monthly = currentUser.records?.filter(r => {
    let d = new Date(r.date);
    d.setHours(0,0,0,0);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear && d <= today;
  }) || [];
  
  let workDays = monthly.filter(r => {
    let d = new Date(r.date);
    let dayOfWeek = d.getDay();
    return dayOfWeek !== 0 && dayOfWeek !== 6 && r.type !== 'off' && r.type !== 'sick' && r.type !== 'vacation';
  }).length;
  
  let rate = currentUser.settings?.hourlyRate || BASE_RATE;
  let lunchCost = (currentUser.settings?.lunchCost || LUNCH_COST_REAL) * workDays;
  
  let stats = { gross: 0, hours: 0, overtimeHours: 0, saturdays: 0, sundays: 0, extraBlocks: 0, doctorDays: 0 };
  
  monthly.forEach(r => {
    if (r.type === 'off') return;
    let hours = r.hours || 7.5;
    stats.hours += hours;
    let amount = calculateDayEarnings(r, rate, currentUser.settings);
    stats.gross += amount;
    
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
  
  buildPieChart(
    Math.max(dashboardNet, 0.01),
    Math.max(taxes, 0.01),
    Math.max(dashboardLunch, 0.01),
    Math.max(savings, 0.01)
  );
  
  let tips = [
    'Save at least 10% of your salary',
    'Use extra blocks for additional income',
    'Saturday shifts give +€25 bonus',
    'Night shifts pay 20% more',
    'Track your doctor visits'
  ];
  document.getElementById('financeTip').innerText = tips[Math.floor(Math.random() * tips.length)];
}

function buildPieChart(net, tax, lunch, savings) {
  let canvas = document.getElementById('pieChart');
  if (!canvas) return;
  if (pieChart) pieChart.destroy();
  let ctx = canvas.getContext('2d');
  pieChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Net income', 'Taxes', 'Lunches', 'Savings'],
      datasets: [{
        data: [net, tax, lunch, savings],
        backgroundColor: ['#00b060', '#f59e0b', '#ef4444', '#8b5cf6'],
        borderWidth: 0
      }]
    },
    options: {
      responsive: true,
      cutout: '70%',
      plugins: {
        legend: {
          position: 'bottom',
          labels: { color: '#fff' }
        }
      }
    }
  });
}

function loadYearStats() {
  if (!currentUser) return;
  
  let year = parseInt(document.getElementById('yearSelectStats').value);
  let today = new Date();
  today.setHours(0,0,0,0);
  let rate = currentUser.settings?.hourlyRate || BASE_RATE;
  
  let yearRecords = currentUser.records?.filter(r => {
    let d = new Date(r.date);
    d.setHours(0,0,0,0);
    return d.getFullYear() === year && d <= today && r.type !== 'off';
  }) || [];
  
  let totalGross = 0, totalHours = 0, totalLunch = 0;
  let monthTotals = new Array(12).fill(0);
  
  yearRecords.forEach(r => {
    let d = new Date(r.date);
    let hours = r.hours || 7.5;
    totalHours += hours;
    let amount = calculateDayEarnings(r, rate, currentUser.settings);
    totalGross += amount;
    monthTotals[d.getMonth()] += amount;
    
    let dayOfWeek = d.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6 && r.type !== 'sick' && r.type !== 'vacation') {
      totalLunch += currentUser.settings?.lunchCost || LUNCH_COST_REAL;
    }
  });
  
  totalGross += Math.floor(yearRecords.filter(r => r.type === 'extra').length / 2) * (currentUser.settings?.extraBonus || 25);
  totalGross -= totalLunch;
  
  const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  let bestMonth = { value: 0, name: '' };
  
  monthTotals.forEach((total, index) => {
    if (total > bestMonth.value) {
      bestMonth.value = total;
      bestMonth.name = monthNames[index];
    }
  });
  
  document.getElementById('totalEarned').innerText = totalGross.toFixed(2) + ' €';
  document.getElementById('totalHours').innerText = totalHours;
  document.getElementById('totalLunch').innerText = totalLunch.toFixed(2) + ' €';
  document.getElementById('bestMonth').innerText = bestMonth.name + ' ' + bestMonth.value.toFixed(0) + '€';
  
  buildStatsChart(monthTotals);
}

function buildStatsChart(monthTotals) {
  let canvas = document.getElementById('statsChart');
  if (!canvas) return;
  if (statsChart) statsChart.destroy();
  statsChart = new Chart(canvas, {
    type: 'bar',
    data: {
      labels: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
      datasets: [{
        label: 'Income €',
        data: monthTotals,
        backgroundColor: 'rgba(0,176,96,0.7)',
        borderColor: '#00b060',
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          labels: { color: '#fff' }
        }
      },
      scales: {
        y: {
          grid: { color: '#334155' },
          ticks: { color: '#94a3b8' }
        },
        x: {
          ticks: { color: '#94a3b8' }
        }
      }
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
    fullName: currentUser.fullName,
    employeeId: currentUser.employeeId,
    cardId: currentUser.cardId,
    email: currentUser.email,
    settings: currentUser.settings
  });
  
  updateUserDisplay();
  showMessage('Profile saved!');
  calculateAllStats();
};

window.clearAllData = async function() {
  if (!currentUser) return;
  if (confirm('Delete ALL data?')) {
    currentUser.records = [];
    currentUser.quickSalaries = [];
    currentUser.financialGoal = null;
    currentUser.settings.usedPersonalDoctor = 0;
    currentUser.settings.usedAccompanyDoctor = 0;
    currentUser.settings.usedWeekends = 0;
    
    await updateDoc(doc(db, "users", currentUser.uid), {
      records: currentUser.records,
      quickSalaries: currentUser.quickSalaries,
      financialGoal: currentUser.financialGoal,
      settings: currentUser.settings
    });
    
    buildCalendar();
    calculateAllStats();
    showMessage('All data cleared');
  }
};

window.exportData = function() {
  if (!currentUser) return;
  
  let data = {
    user: currentUser.name,
    records: currentUser.records,
    quickSalaries: currentUser.quickSalaries,
    financialGoal: currentUser.financialGoal,
    settings: currentUser.settings
  };
  
  let blob = new Blob([JSON.stringify(data, null, 2)], {type: 'application/json'});
  let url = URL.createObjectURL(blob);
  let a = document.createElement('a');
  a.href = url;
  a.download = `vaillant_${currentUser.name}_${new Date().toISOString().split('T')[0]}.json`;
  a.click();
};

window.previewAvatar = function(input) {
  if (input.files && input.files[0]) {
    let reader = new FileReader();
    reader.onload = async function(e) {
      document.getElementById('avatarPreview').src = e.target.result;
      document.getElementById('profileAvatar').src = e.target.result;
      if (currentUser) {
        currentUser.avatar = e.target.result;
        await updateDoc(doc(db, "users", currentUser.uid), { avatar: currentUser.avatar });
      }
    };
    reader.readAsDataURL(input.files[0]);
  }
};

function calculateAllStats() {
  calculateDashboardStats();
  updateWeekendStats();
  buildYearChart();
  updateFinanceStats();
}

function updateWeekendStats() {
  if (!currentUser) return;
  
  let today = new Date();
  today.setHours(0,0,0,0);
  let daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  let weekendsThisMonth = 0;
  
  for (let d = 1; d <= daysInMonth; d++) {
    let date = new Date(currentYear, currentMonth, d);
    date.setHours(0,0,0,0);
    if ((date.getDay() === 0 || date.getDay() === 6) && date <= today) weekendsThisMonth++;
  }
  
  document.getElementById('weekendsThisMonth').innerText = weekendsThisMonth;
  
  let joinDate = new Date(currentUser.joinDate || Date.now());
  joinDate.setHours(0,0,0,0);
  let monthsWorked = 0;
  let currentDate = new Date();
  
  for (let y = joinDate.getFullYear(); y <= currentDate.getFullYear(); y++) {
    for (let m = (y === joinDate.getFullYear() ? joinDate.getMonth() : 0);
         m <= (y === currentDate.getFullYear() ? currentDate.getMonth() : 11); m++) {
      monthsWorked++;
    }
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
  let canvas = document.getElementById('yearChart');
  if (!canvas || !currentUser) return;
  
  let months = new Array(12).fill(0);
  let today = new Date();
  today.setHours(0,0,0,0);
  let rate = currentUser.settings?.hourlyRate || BASE_RATE;
  
  currentUser.records?.forEach(r => {
    if (r.type === 'off') return;
    let d = new Date(r.date);
    d.setHours(0,0,0,0);
    if (d > today) return;
    months[d.getMonth()] += calculateDayEarnings(r, rate, currentUser.settings);
  });
  
  if (yearChart) yearChart.destroy();
  yearChart = new Chart(canvas, {
    type: 'line',
    data: {
      labels: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
      datasets: [{
        label: 'Income €',
        data: months,
        borderColor: '#00b060',
        backgroundColor: 'rgba(0,176,96,0.15)',
        fill: true,
        tension: 0.4
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          labels: { color: '#fff' }
        }
      },
      scales: {
        y: {
          grid: { color: '#334155' },
          ticks: { color: '#94a3b8' }
        },
        x: {
          ticks: { color: '#94a3b8' }
        }
      }
    }
  });
}

function loadFinancialGoal() {
  if (!currentUser?.financialGoal) {
    document.querySelector('.goal-inputs').style.display = 'flex';
    document.getElementById('goalProgress').style.display = 'none';
    return;
  }
  
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
  
  history.slice().reverse().slice(0, 10).forEach(item => {
    let icon = item.type === 'add' ? '➕' : '➖';
    let color = item.type === 'add' ? '#00b060' : '#ef4444';
    html += `<div class="history-item">
      <span>${icon} ${item.date}</span>
      <span style="color:${color}">${item.type === 'add' ? '+' : '-'}${item.amount.toFixed(2)} €</span>
      <span style="color:#94a3b8;">(balance: ${item.balance.toFixed(2)} €)</span>
    </div>`;
  });
  
  document.getElementById('goalHistory').innerHTML = html || '<div style="color:#94a3b8;">No history</div>';
}

window.saveGoal = async function() {
  let name = document.getElementById('goalName').value.trim();
  let amount = parseFloat(document.getElementById('goalAmount').value);
  
  if (!name || isNaN(amount) || amount <= 0) {
    return showMessage('Enter goal name and amount', true);
  }
  
  currentUser.financialGoal = {
    name,
    amount,
    saved: 0,
    history: [],
    date: new Date().toISOString()
  };
  
  await updateDoc(doc(db, "users", currentUser.uid), {
    financialGoal: currentUser.financialGoal
  });
  
  showMessage('Goal saved');
  loadFinancialGoal();
};

window.clearGoal = async function() {
  if (!currentUser?.financialGoal) return;
  if (confirm('Delete goal?')) {
    currentUser.financialGoal = null;
    await updateDoc(doc(db, "users", currentUser.uid), {
      financialGoal: null
    });
    showMessage('Goal deleted');
    loadFinancialGoal();
  }
};

window.addToGoal = async function() {
  if (!currentUser?.financialGoal) return;
  
  let amount = parseFloat(prompt('Amount to add?', '100'));
  if (isNaN(amount) || amount <= 0) return showMessage('Enter valid amount', true);
  
  currentUser.financialGoal.saved = (currentUser.financialGoal.saved || 0) + amount;
  currentUser.financialGoal.history = currentUser.financialGoal.history || [];
  currentUser.financialGoal.history.push({
    type: 'add',
    amount,
    date: new Date().toLocaleString(),
    balance: currentUser.financialGoal.saved
  });
  
  await updateDoc(doc(db, "users", currentUser.uid), {
    financialGoal: currentUser.financialGoal
  });
  
  loadFinancialGoal();
  showMessage(`Added ${amount} €`);
};

window.withdrawFromGoal = async function() {
  if (!currentUser?.financialGoal) return;
  
  let amount = parseFloat(prompt('Amount to withdraw?', '50'));
  if (isNaN(amount) || amount <= 0) return showMessage('Enter valid amount', true);
  if (amount > (currentUser.financialGoal.saved || 0)) return showMessage('Insufficient funds', true);
  
  currentUser.financialGoal.saved -= amount;
  currentUser.financialGoal.history = currentUser.financialGoal.history || [];
  currentUser.financialGoal.history.push({
    type: 'withdraw',
    amount,
    date: new Date().toLocaleString(),
    balance: currentUser.financialGoal.saved
  });
  
  await updateDoc(doc(db, "users", currentUser.uid), {
    financialGoal: currentUser.financialGoal
  });
  
  loadFinancialGoal();
  showMessage(`Withdrawn ${amount} €`);
};

window.importFromPDF = function(input) {
  if (!input.files || !input.files[0]) return;
  
  const file = input.files[0];
  const statusEl = document.getElementById('pdfStatus');
  statusEl.textContent = translations[currentLanguage]?.processing || 'Processing...';
  
  // Simulate PDF processing (in real app, you'd use a PDF parsing library)
  setTimeout(() => {
    // Mock data for last 4 months
    const months = [
      { month: currentMonth - 3, year: currentYear, gross: 2150, net: 1750 },
      { month: currentMonth - 2, year: currentYear, gross: 2200, net: 1790 },
      { month: currentMonth - 1, year: currentYear, gross: 2100, net: 1710 },
      { month: currentMonth, year: currentYear, gross: 2250, net: 1830 }
    ];
    
    months.forEach(data => {
      if (data.month >= 0 && data.month <= 11) {
        if (!currentUser.quickSalaries) currentUser.quickSalaries = [];
        const existingIndex = currentUser.quickSalaries.findIndex(
          s => s.month === data.month && s.year === data.year
        );
        
        const salaryData = {
          month: data.month,
          year: data.year,
          gross: data.gross,
          net: data.net,
          date: new Date().toISOString()
        };
        
        if (existingIndex !== -1) {
          currentUser.quickSalaries[existingIndex] = salaryData;
        } else {
          currentUser.quickSalaries.push(salaryData);
        }
      }
    });
    
    updateDoc(doc(db, "users", currentUser.uid), {
      quickSalaries: currentUser.quickSalaries
    }).then(() => {
      const msg = translations[currentLanguage]?.importSuccess || 'Data for {count} months successfully imported';
      statusEl.textContent = msg.replace('{count}', months.length);
      setTimeout(() => { statusEl.textContent = ''; }, 3000);
      calculateAllStats();
    }).catch(() => {
      statusEl.textContent = translations[currentLanguage]?.importError || 'Error processing PDF';
    });
  }, 1500);
};
