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
let currentTheme = localStorage.getItem('vaillant_theme') || 'dark';
let yearChart = null, statsChart = null, pieChart = null;
let notificationTimeout = null;
let updateInterval = null;
let weatherParticles = null;
let weatherAnimation = null;

const BASE_RATE = 6.10;
const LUNCH_COST_REAL = 1.31;
const SATURDAY_BONUS = 25;
const NIGHT_BONUS_PERCENT = 20;
const SOCIAL_RATE = 0.094;
const HEALTH_RATE = 0.10;
const TAX_RATE = 0.19;
const NON_TAXABLE = 410;

// Финансовые советы
const FINANCIAL_TIPS = [
  "Откладывай минимум 10% от зарплаты",
  "Используй надчасы для дополнительного дохода",
  "Субботние смены приносят +25€ бонуса",
  "Ночные смены оплачиваются на 20% выше",
  "Следи за количеством перепусток",
  "Создай финансовую подушку безопасности",
  "Инвестируй хотя бы 5% от дохода",
  "Избегай кредитов с высокими процентами",
  "Планируй крупные покупки заранее",
  "Используй кэшбэк и бонусные программы"
];

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
    extraBlocks: 'Надчасы',
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
    extraBonus: 'Бонус за надчас (€)',
    vacations: 'Отпуска и перепустки',
    accruedWeekendsLabel: 'Накоплено выходных',
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
    uploadPDF: 'Загрузите PDF с зарплатой',
    processing: 'Обработка...',
    importSuccess: 'Данные за {count} месяцев импортированы',
    importError: 'Ошибка при обработке PDF',
    chooseFile: 'Выберите файл',
    mon: 'Пн', tue: 'Вт', wed: 'Ср', thu: 'Чт', fri: 'Пт', sat: 'Сб', sun: 'Вс',
    january: 'Январь', february: 'Февраль', march: 'Март', april: 'Апрель',
    may: 'Май', june: 'Июнь', july: 'Июль', august: 'Август',
    september: 'Сентябрь', october: 'Октябрь', november: 'Ноябрь', december: 'Декабрь',
    clearAllData: 'Очистить все данные',
    exportToExcel: 'Экспорт в Excel',
    exportToPDF: 'Экспорт в PDF'
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
    extraBlocks: 'Nadčasy',
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
    accruedWeekendsLabel: 'Nahromadené víkendy',
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
    importSuccess: 'Údaje za {count} mesiacov importované',
    importError: 'Chyba pri spracovaní PDF',
    chooseFile: 'Vyberte súbor',
    mon: 'Po', tue: 'Ut', wed: 'St', thu: 'Št', fri: 'Pi', sat: 'So', sun: 'Ne',
    january: 'Január', february: 'Február', march: 'Marec', april: 'Apríl',
    may: 'Máj', june: 'Jún', july: 'Júl', august: 'August',
    september: 'September', october: 'Október', november: 'November', december: 'December',
    clearAllData: 'Vymazať všetky dáta',
    exportToExcel: 'Export do Excel',
    exportToPDF: 'Export do PDF'
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
    accruedWeekendsLabel: 'Accrued weekends',
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
    uploadPDF: 'Upload PDF with salary',
    processing: 'Processing...',
    importSuccess: 'Data for {count} months imported',
    importError: 'Error processing PDF',
    chooseFile: 'Choose file',
    mon: 'Mo', tue: 'Tu', wed: 'We', thu: 'Th', fri: 'Fr', sat: 'Sa', sun: 'Su',
    january: 'January', february: 'February', march: 'March', april: 'April',
    may: 'May', june: 'June', july: 'July', august: 'August',
    september: 'September', october: 'October', november: 'November', december: 'December',
    clearAllData: 'Clear all data',
    exportToExcel: 'Export to Excel',
    exportToPDF: 'Export to PDF'
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
    extraBlocks: 'Надгодини',
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
    extraBonus: 'Бонус за надгодини (€)',
    vacations: 'Відпустки та перепустки',
    accruedWeekendsLabel: 'Накопичено вихідних',
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
    importSuccess: 'Дані за {count} місяців імпортовано',
    importError: 'Помилка при обробці PDF',
    chooseFile: 'Виберіть файл',
    mon: 'Пн', tue: 'Вт', wed: 'Ср', thu: 'Чт', fri: 'Пт', sat: 'Сб', sun: 'Нд',
    january: 'Січень', february: 'Лютий', march: 'Березень', april: 'Квітень',
    may: 'Травень', june: 'Червень', july: 'Липень', august: 'Серпень',
    september: 'Вересень', october: 'Жовтень', november: 'Листопад', december: 'Грудень',
    clearAllData: 'Очистити всі дані',
    exportToExcel: 'Експорт в Excel',
    exportToPDF: 'Експорт в PDF'
  }
};

function showModal(id) { document.getElementById(id).style.display = 'flex'; }
function hideModal(id) { document.getElementById(id).style.display = 'none'; }
function showMessage(msg, isError = false) { alert(isError ? '❌ ' + msg : '✅ ' + msg); }

// Уведомления
function showNotification(msg, duration = 3000) {
  const notification = document.getElementById('notification');
  const messageEl = document.getElementById('notificationMessage');
  if (!notification || !messageEl) return;
  
  messageEl.textContent = msg;
  notification.classList.remove('hidden');
  
  if (notificationTimeout) clearTimeout(notificationTimeout);
  notificationTimeout = setTimeout(() => {
    notification.classList.add('hidden');
  }, duration);
}

window.hideNotification = function() {
  const notification = document.getElementById('notification');
  if (notification) notification.classList.add('hidden');
};

// Бургер-меню
window.toggleMobileMenu = function() {
  const nav = document.getElementById('mainNav');
  nav.classList.toggle('active');
};

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
  
  updateMonthDisplay();
  buildCalendar();
};

// ===== ТЕМЫ =====
const themes = {
  dark: {
    '--primary': '#00b060',
    '--primary-dark': '#009048',
    '--primary-light': '#00d070',
    '--dark': '#0a0c14',
    '--dark-light': '#1a1e2a',
    '--dark-card': '#121620',
    '--text': '#ffffff',
    '--text-muted': '#a0a8b8',
    '--border': '#2a303c'
  },
  light: {
    '--primary': '#00b060',
    '--primary-dark': '#009048',
    '--primary-light': '#00d070',
    '--dark': '#f5f7fa',
    '--dark-light': '#ffffff',
    '--dark-card': '#ffffff',
    '--text': '#1a1e2a',
    '--text-muted': '#6b7280',
    '--border': '#e2e8f0'
  },
  blue: {
    '--primary': '#3b82f6',
    '--primary-dark': '#2563eb',
    '--primary-light': '#60a5fa',
    '--dark': '#0f172a',
    '--dark-light': '#1e293b',
    '--dark-card': '#1a2639',
    '--text': '#f8fafc',
    '--text-muted': '#94a3b8',
    '--border': '#334155'
  },
  purple: {
    '--primary': '#8b5cf6',
    '--primary-dark': '#7c3aed',
    '--primary-light': '#a78bfa',
    '--dark': '#1e1b4b',
    '--dark-light': '#2e1a5e',
    '--dark-card': '#271d54',
    '--text': '#faf5ff',
    '--text-muted': '#c4b5fd',
    '--border': '#4c1d95'
  },
  orange: {
    '--primary': '#f97316',
    '--primary-dark': '#ea580c',
    '--primary-light': '#fb923c',
    '--dark': '#1c1917',
    '--dark-light': '#292524',
    '--dark-card': '#231f1e',
    '--text': '#fff7ed',
    '--text-muted': '#fdba74',
    '--border': '#7c2d12'
  },
  red: {
    '--primary': '#ef4444',
    '--primary-dark': '#dc2626',
    '--primary-light': '#f87171',
    '--dark': '#1f1a1a',
    '--dark-light': '#2d2424',
    '--dark-card': '#271f1f',
    '--text': '#fef2f2',
    '--text-muted': '#fca5a5',
    '--border': '#991b1b'
  },
  green: {
    '--primary': '#10b981',
    '--primary-dark': '#059669',
    '--primary-light': '#34d399',
    '--dark': '#0c1a14',
    '--dark-light': '#1a2e22',
    '--dark-card': '#15271d',
    '--text': '#ecfdf5',
    '--text-muted': '#6ee7b7',
    '--border': '#065f46'
  },
  pink: {
    '--primary': '#ec4899',
    '--primary-dark': '#db2777',
    '--primary-light': '#f472b6',
    '--dark': '#24141e',
    '--dark-light': '#382130',
    '--dark-card': '#2f1b28',
    '--text': '#fdf2f8',
    '--text-muted': '#f9a8d4',
    '--border': '#9d174d'
  },
  mint: {
    '--primary': '#14b8a6',
    '--primary-dark': '#0d9488',
    '--primary-light': '#2dd4bf',
    '--dark': '#0f1a18',
    '--dark-light': '#1e2e2a',
    '--dark-card': '#182622',
    '--text': '#f0fdfa',
    '--text-muted': '#5eead4',
    '--border': '#115e59'
  },
  gray: {
    '--primary': '#6b7280',
    '--primary-dark': '#4b5563',
    '--primary-light': '#9ca3af',
    '--dark': '#111827',
    '--dark-light': '#1f2937',
    '--dark-card': '#1a232e',
    '--text': '#f9fafb',
    '--text-muted': '#d1d5db',
    '--border': '#374151'
  }
};

window.setTheme = function(theme) {
  currentTheme = theme;
  localStorage.setItem('vaillant_theme', theme);
  
  if (theme === 'auto') {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      applyTheme('dark');
    } else {
      applyTheme('light');
    }
  } else {
    applyTheme(theme);
  }
  
  document.querySelectorAll('.theme-btn').forEach(btn => {
    btn.classList.remove('active');
    if (btn.dataset.theme === theme) {
      btn.classList.add('active');
    }
  });
  
  if (currentUser) {
    updateDoc(doc(db, "users", currentUser.uid), { theme: theme }).catch(() => {});
  }
};

function applyTheme(themeName) {
  const theme = themes[themeName] || themes.dark;
  const root = document.documentElement;
  Object.keys(theme).forEach(key => root.style.setProperty(key, theme[key]));
  document.body.classList.remove('theme-dark', 'theme-light', 'theme-blue', 'theme-purple', 'theme-orange', 'theme-red', 'theme-green', 'theme-pink', 'theme-mint', 'theme-gray');
  document.body.classList.add(`theme-${themeName}`);
}

// ===== ВРЕМЯ, ДАТА, ПОГОДА =====
function updateDateTime() {
  const timeEl = document.getElementById('time');
  const dateEl = document.getElementById('date');
  if (timeEl) {
    timeEl.textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  if (dateEl) {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    dateEl.textContent = new Date().toLocaleDateString(
      currentLanguage === 'ru' ? 'ru-RU' : 
      currentLanguage === 'sk' ? 'sk-SK' : 
      currentLanguage === 'uk' ? 'uk-UA' : 'en-US',
      options
    );
  }
}

// Реальная погода для Тренчина
async function updateWeather() {
  const weatherTemp = document.getElementById('weatherTemp');
  if (!weatherTemp) return;
  
  try {
    const response = await fetch('https://api.open-meteo.com/v1/forecast?latitude=48.89&longitude=17.99&current_weather=true&timezone=auto');
    const data = await response.json();
    const temp = Math.round(data.current_weather.temperature);
    const weatherCode = data.current_weather.weathercode;
    
    let icon = '☀️';
    if (weatherCode >= 51 && weatherCode <= 67) icon = '🌧️';
    else if (weatherCode >= 71 && weatherCode <= 77) icon = '❄️';
    else if (weatherCode >= 80 && weatherCode <= 99) icon = '⛈️';
    else if (weatherCode >= 41 && weatherCode <= 49) icon = '☁️';
    else if (weatherCode >= 31 && weatherCode <= 35) icon = '🌫️';
    
    weatherTemp.innerHTML = `${icon} ${temp}°C`;
  } catch (error) {
    console.error('Ошибка получения погоды:', error);
    const temps = [2, 3, 4, 5, 6, 7, 8];
    const randomTemp = temps[Math.floor(Math.random() * temps.length)];
    weatherTemp.innerHTML = `☀️ ${randomTemp}°C`;
  }
  
  toggleWeatherEffect();
}

// ===== ПОГОДНЫЕ ЭФФЕКТЫ =====
window.toggleWeatherEffect = function() {
  const enabled = document.getElementById('weatherEffectsEnabled')?.checked;
  const mode = document.getElementById('weatherEffectMode')?.value;
  
  if (currentUser) {
    updateDoc(doc(db, "users", currentUser.uid), {
      weatherEffectsEnabled: enabled,
      weatherEffectMode: mode
    }).catch(() => {});
  }
  
  if (weatherParticles) {
    document.body.removeChild(weatherParticles);
    weatherParticles = null;
    if (weatherAnimation) {
      cancelAnimationFrame(weatherAnimation);
      weatherAnimation = null;
    }
  }
  
  if (!enabled || mode === 'off') return;
  
  let effectType = mode;
  if (mode === 'auto') {
    const tempText = document.getElementById('weatherTemp')?.textContent || '0°C';
    const temp = parseInt(tempText) || 0;
    if (temp < 0) effectType = 'snow';
    else if (temp > 0 && temp < 10) effectType = 'rain';
    else return;
  }
  
  createWeatherEffect(effectType);
};

function createWeatherEffect(type) {
  const canvas = document.createElement('canvas');
  canvas.id = 'weather-particles';
  canvas.style.position = 'fixed';
  canvas.style.top = '0';
  canvas.style.left = '0';
  canvas.style.width = '100%';
  canvas.style.height = '100%';
  canvas.style.pointerEvents = 'none';
  canvas.style.zIndex = '9999';
  document.body.appendChild(canvas);
  weatherParticles = canvas;
  
  const ctx = canvas.getContext('2d');
  let width = window.innerWidth;
  let height = window.innerHeight;
  
  window.addEventListener('resize', () => {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;
  });
  
  canvas.width = width;
  canvas.height = height;
  
  const particles = [];
  const particleCount = type === 'snow' ? 150 : 200;
  
  for (let i = 0; i < particleCount; i++) {
    particles.push({
      x: Math.random() * width,
      y: Math.random() * height,
      size: type === 'snow' ? Math.random() * 5 + 2 : Math.random() * 3 + 1,
      speedY: type === 'snow' ? Math.random() * 2 + 1 : Math.random() * 5 + 3,
      speedX: type === 'snow' ? Math.random() * 0.5 - 0.25 : Math.random() * 2 - 1,
      opacity: Math.random() * 0.7 + 0.3
    });
  }
  
  function animate() {
    if (!weatherParticles) return;
    ctx.clearRect(0, 0, width, height);
    
    particles.forEach(p => {
      if (type === 'snow') {
        ctx.fillStyle = `rgba(255, 255, 255, ${p.opacity})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.fillStyle = `rgba(174, 194, 224, ${p.opacity * 0.6})`;
        ctx.fillRect(p.x, p.y, 1, p.size * 2);
      }
      
      p.y += p.speedY;
      p.x += p.speedX;
      
      if (p.y > height) { p.y = -10; p.x = Math.random() * width; }
      if (p.x > width) p.x = 0;
      if (p.x < 0) p.x = width;
    });
    
    weatherAnimation = requestAnimationFrame(animate);
  }
  
  animate();
}

// ===== ФИНАНСОВЫЕ СОВЕТЫ =====
function updateFinancialTip() {
  const tipEl = document.getElementById('financeTip');
  const tipDateEl = document.getElementById('tipDate');
  if (!tipEl) return;
  
  const today = new Date();
  const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));
  tipEl.textContent = FINANCIAL_TIPS[dayOfYear % FINANCIAL_TIPS.length];
  
  if (tipDateEl) {
    tipDateEl.textContent = today.toLocaleDateString(
      currentLanguage === 'ru' ? 'ru-RU' : 
      currentLanguage === 'sk' ? 'sk-SK' : 
      currentLanguage === 'uk' ? 'uk-UA' : 'en-US'
    );
  }
}

function getAvatarUrl(email) { 
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(email.split('@')[0])}&background=00b060&color=fff&size=128`; 
}

function getDisplayName(user) {
  if (!user) return 'Гость';
  if (user.fullName?.trim()) return user.fullName;
  return user.email?.split('@')[0] || 'User';
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
  
  if (!email || !pass || !confirm) return showMessage('Заполните все поля!', true);
  if (!email.includes('@')) return showMessage('Введите корректный email!', true);
  if (pass !== confirm) return showMessage('Пароли не совпадают!', true);
  if (pass.length < 6) return showMessage('Пароль должен быть минимум 6 символов!', true);
  
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
    const user = userCredential.user;
    
    const userData = {
      uid: user.uid,
      name: email.split('@')[0],
      email: email,
      fullName: '',
      employeeId: '',
      cardId: '',
      records: [],
      quickSalaries: [],
      financialGoal: null,
      theme: 'dark',
      weatherEffectsEnabled: true,
      weatherEffectMode: 'auto',
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
        usedWeekends: 0,
        accruedWeekends: 0
      },
      joinDate: new Date().toISOString(),
      createdAt: new Date().toISOString()
    };
    
    await setDoc(doc(db, "users", user.uid), userData);
    showMessage('Регистрация успешна!');
    
    document.getElementById('regEmail').value = '';
    document.getElementById('regPass').value = '';
    document.getElementById('regConfirm').value = '';
    window.showLoginForm();
    
  } catch (error) {
    showMessage('Ошибка: ' + error.message, true);
  }
};

window.login = async function() {
  const email = document.getElementById('loginEmail')?.value.trim();
  const pass = document.getElementById('loginPass')?.value.trim();
  const remember = document.getElementById('rememberMe')?.checked;
  
  if (!email || !pass) return showMessage('Введите email и пароль!', true);
  if (!email.includes('@')) return showMessage('Введите корректный email!', true);
  
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
    if (!userDoc.exists()) return showMessage('Данные пользователя не найдены!', true);
    
    currentUserData = userDoc.data();
    currentUser = { uid: user.uid, ...currentUserData };
    
    hideModal('authModal');
    document.getElementById('app').classList.remove('hidden');
    
    document.getElementById('fullName').value = currentUser.fullName || '';
    document.getElementById('employeeId').value = currentUser.employeeId || '';
    document.getElementById('cardId').value = currentUser.cardId || '';
    document.getElementById('email').value = currentUser.email || '';
    
    document.getElementById('weatherEffectsEnabled').checked = currentUser.weatherEffectsEnabled !== false;
    document.getElementById('weatherEffectMode').value = currentUser.weatherEffectMode || 'auto';
    
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
      document.getElementById('accruedWeekendsInput').value = currentUser.settings.accruedWeekends || 0;
    }
    
    let avatarUrl = currentUser.avatar || getAvatarUrl(email);
    document.getElementById('avatarPreview').src = avatarUrl;
    document.getElementById('profileAvatar').src = avatarUrl;
    
    setTheme(currentUser.theme || currentTheme);
    updateUserDisplay();
    updateMonthDisplay();
    buildCalendar();
    calculateAllStats();
    loadFinancialGoal();
    
    if (updateInterval) clearInterval(updateInterval);
    updateInterval = setInterval(updateDateTime, 1000);
    updateDateTime();
    updateWeather();
    updateFinancialTip();
    
    showNotification('Добро пожаловать!');
  } catch (error) {
    showMessage('Ошибка входа: ' + error.message, true);
  }
};

window.logout = async function() {
  if (confirm('Выйти?')) { 
    await signOut(auth); 
    currentUser = null; 
    document.getElementById('app').classList.add('hidden'); 
    showModal('authModal'); 
    window.showLoginForm();
    if (updateInterval) clearInterval(updateInterval);
    if (weatherParticles) {
      document.body.removeChild(weatherParticles);
      weatherParticles = null;
    }
  }
};

window.setView = function(view) {
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  document.getElementById(view)?.classList.add('active');
  document.querySelector(`.nav-btn[data-view="${view}"]`)?.classList.add('active');
  
  document.getElementById('mainNav')?.classList.remove('active');
  
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
      
      document.getElementById('weatherEffectsEnabled').checked = currentUser.weatherEffectsEnabled !== false;
      document.getElementById('weatherEffectMode').value = currentUser.weatherEffectMode || 'auto';
      
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
        document.getElementById('accruedWeekendsInput').value = currentUser.settings.accruedWeekends || 0;
      }
      
      let avatarUrl = currentUser.avatar || getAvatarUrl(currentUser.email);
      document.getElementById('avatarPreview').src = avatarUrl;
      document.getElementById('profileAvatar').src = avatarUrl;
      
      setTheme(currentUser.theme || currentTheme);
      updateUserDisplay();
      updateMonthDisplay();
      buildCalendar();
      calculateAllStats();
      loadFinancialGoal();
      
      if (updateInterval) clearInterval(updateInterval);
      updateInterval = setInterval(updateDateTime, 1000);
      updateDateTime();
      updateWeather();
      updateFinancialTip();
    }
  } else {
    currentUser = null;
    document.getElementById('app').classList.add('hidden');
    showModal('authModal');
    window.showLoginForm();
    if (updateInterval) clearInterval(updateInterval);
    if (weatherParticles) {
      document.body.removeChild(weatherParticles);
      weatherParticles = null;
    }
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
  setTheme(currentTheme);
  
  setTimeout(() => {
    let profileActions = document.querySelector('.profile-actions');
    if (profileActions && !document.getElementById('clearAllDataBtn')) {
      let clearBtn = document.createElement('button');
      clearBtn.id = 'clearAllDataBtn';
      clearBtn.className = 'btn-danger';
      clearBtn.innerHTML = '<i class="fas fa-trash"></i> ' + (translations[currentLanguage]?.clearAllData || 'Очистить все данные');
      clearBtn.onclick = window.clearAllData;
      profileActions.appendChild(clearBtn);
    }
  }, 500);
  
  showModal('authModal');
  window.showLoginForm();
};

function updateMonthDisplay() {
  const monthNames = [
    translations[currentLanguage]?.january || 'Январь',
    translations[currentLanguage]?.february || 'Февраль',
    translations[currentLanguage]?.march || 'Март',
    translations[currentLanguage]?.april || 'Апрель',
    translations[currentLanguage]?.may || 'Май',
    translations[currentLanguage]?.june || 'Июнь',
    translations[currentLanguage]?.july || 'Июль',
    translations[currentLanguage]?.august || 'Август',
    translations[currentLanguage]?.september || 'Сентябрь',
    translations[currentLanguage]?.october || 'Октябрь',
    translations[currentLanguage]?.november || 'Ноябрь',
    translations[currentLanguage]?.december || 'Декабрь'
  ];
  document.getElementById('currentMonth').innerText = monthNames[currentMonth] + ' ' + currentYear;
  document.getElementById('calendarMonth').innerText = monthNames[currentMonth] + ' ' + currentYear;
  document.getElementById('financeMonth').innerText = monthNames[currentMonth] + ' ' + currentYear;
}

window.changeMonth = function(delta) {
  if (typeof delta === 'number') {
    currentMonth += delta;
  } else return;
  
  if (currentMonth < 0) { currentMonth = 11; currentYear--; }
  else if (currentMonth > 11) { currentMonth = 0; currentYear++; }
  
  updateMonthDisplay();
  buildCalendar();
  calculateAllStats();
};

// ===== КАЛЕНДАРЬ =====
function buildCalendar() {
  const grid = document.getElementById('calendarGrid');
  if (!grid) return;
  
  grid.innerHTML = '';
  
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  let firstDay = new Date(currentYear, currentMonth, 1).getDay();
  firstDay = firstDay === 0 ? 6 : firstDay - 1;
  
  const today = new Date();
  today.setHours(0,0,0,0);
  const todayYear = today.getFullYear();
  const todayMonth = today.getMonth();
  const todayDate = today.getDate();
  
  for (let i = 0; i < firstDay; i++) {
    let empty = document.createElement('div');
    empty.className = 'day empty';
    grid.appendChild(empty);
  }
  
  for (let d = 1; d <= daysInMonth; d++) {
    let cell = document.createElement('div');
    cell.className = 'day';
    
    let isPast = false;
    if (currentYear < todayYear) isPast = true;
    else if (currentYear === todayYear && currentMonth < todayMonth) isPast = true;
    else if (currentYear === todayYear && currentMonth === todayMonth && d < todayDate) isPast = true;
    
    if (!isPast && !(currentYear === todayYear && currentMonth === todayMonth && d === todayDate)) {
      cell.classList.add('future');
    }
    
    cell.innerHTML = `<span class="day-number">${d}</span><span class="day-icon">📅</span>`;
    
    if (currentUser?.records) {
      let dateStr = `${currentYear}-${String(currentMonth+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
      let record = currentUser.records.find(r => r.date === dateStr);
      if (record) {
        cell.classList.add(record.type);
        let iconSpan = cell.querySelector('.day-icon');
        if (iconSpan) {
          const icons = { work:'💼', night:'🌙', overtime:'⏰', sat:'📆', sun:'☀️', extra:'➕', sick:'🤒', vacation:'🏖️', doctor:'🩺', off:'❌' };
          iconSpan.textContent = icons[record.type] || '📅';
        }
      }
    }
    
    if (isPast || (currentYear === todayYear && currentMonth === todayMonth && d === todayDate)) {
      cell.onclick = () => { selectedDay = d; showModal('dayModal'); };
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
    currentUser.records.push({ date: dateStr, type: type, hours: 7.5 });
    if (type === 'doctor') currentUser.settings.usedPersonalDoctor = (currentUser.settings.usedPersonalDoctor || 0) + 1;
    if (type === 'sat' || type === 'sun') currentUser.settings.usedWeekends = (currentUser.settings.usedWeekends || 0) + 1;
  }
  
  await updateDoc(doc(db, "users", currentUser.uid), { records: currentUser.records, settings: currentUser.settings });
  hideModal('dayModal');
  buildCalendar();
  calculateAllStats();
  showNotification('Запись добавлена');
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

// ===== ДАШБОРД (ИСПРАВЛЕНО) =====
function calculateDashboardStats() {
  if (!currentUser) return;
  
  const today = new Date();
  today.setHours(0,0,0,0);
  
  // Фильтруем записи ТОЛЬКО за текущий месяц
  let monthly = (currentUser.records || []).filter(r => {
    const d = new Date(r.date);
    d.setHours(0,0,0,0);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear && d <= today;
  });
  
  const workDays = monthly.filter(r => {
    const d = new Date(r.date);
    const dayOfWeek = d.getDay();
    // Учитываем, что тип 'work' - это обычная смена. Выходные и больничные не считаем за обеды.
    return dayOfWeek !== 0 && dayOfWeek !== 6 && r.type !== 'off' && r.type !== 'sick' && r.type !== 'vacation' && r.type !== 'doctor';
  }).length;
  
  const rate = currentUser.settings?.hourlyRate || BASE_RATE;
  const lunchCost = (currentUser.settings?.lunchCost || LUNCH_COST_REAL) * workDays;
  
  let stats = { gross: 0, hours: 0, overtimeHours: 0, saturdays: 0, sundays: 0, extraBlocks: 0, doctorDays: 0 };
  
  monthly.forEach(r => {
    if (r.type === 'off') return;
    const hours = r.hours || 7.5;
    stats.hours += hours;
    const amount = calculateDayEarnings(r, rate, currentUser.settings);
    stats.gross += amount;
    
    if (r.type === 'overtime') stats.overtimeHours += hours;
    if (r.type === 'sat') stats.saturdays++;
    if (r.type === 'sun') stats.sundays++;
    if (r.type === 'extra') stats.extraBlocks++;
    if (r.type === 'doctor') stats.doctorDays++;
  });
  
  // Добавляем бонус за надчасы (каждые 2 надчаса = +25 евро)
  stats.gross += Math.floor(stats.extraBlocks / 2) * (currentUser.settings?.extraBonus || 25);
  stats.gross -= lunchCost;
  
  // Считаем налоги только если есть доход
  let net = stats.gross;
  if (stats.gross > 0) {
    const social = stats.gross * SOCIAL_RATE;
    const health = stats.gross * HEALTH_RATE;
    const taxable = Math.max(stats.gross - social - health - NON_TAXABLE, 0);
    const tax = taxable * TAX_RATE;
    net = stats.gross - social - health - tax;
  }
  
  document.getElementById('gross').innerText = stats.gross.toFixed(2) + ' €';
  document.getElementById('net').innerText = net.toFixed(2) + ' €';
  document.getElementById('hoursWorked').innerText = stats.hours;
  document.getElementById('overtimeHours').innerText = stats.overtimeHours;
  document.getElementById('extraCount').innerText = stats.extraBlocks;
  document.getElementById('satCount').innerText = stats.saturdays + stats.sundays;
  document.getElementById('doctorCount').innerText = stats.doctorDays;
  document.getElementById('lunchCost').innerText = lunchCost.toFixed(2) + ' €';
}

// ===== ГРАФИК НА ДАШБОРДЕ (ИСПРАВЛЕНО) =====
function buildYearChart() {
  const canvas = document.getElementById('yearChart');
  if (!canvas || !currentUser) return;
  
  // Собираем доход ПО МЕСЯЦАМ за ТЕКУЩИЙ год (currentYear)
  const months = new Array(12).fill(0);
  const today = new Date();
  today.setHours(0,0,0,0);
  const rate = currentUser.settings?.hourlyRate || BASE_RATE;
  
  (currentUser.records || []).forEach(r => {
    if (r.type === 'off') return;
    const d = new Date(r.date);
    d.setHours(0,0,0,0);
    // Проверяем, что запись за текущий год и не в будущем
    if (d.getFullYear() === currentYear && d <= today) {
      const amount = calculateDayEarnings(r, rate, currentUser.settings);
      months[d.getMonth()] += amount;
    }
  });
  
  if (yearChart) yearChart.destroy();
  
  yearChart = new Chart(canvas.getContext('2d'), {
    type: 'line',
    data: {
      labels: ['Янв','Фев','Мар','Апр','Май','Июн','Июл','Авг','Сен','Окт','Ноя','Дек'],
      datasets: [{
        label: 'Доход €',
        data: months,
        borderColor: '#00b060',
        backgroundColor: 'rgba(0,176,96,0.15)',
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#00b060',
        pointBorderColor: '#fff',
        pointRadius: 4,
        pointHoverRadius: 6
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { labels: { color: '#fff' } }
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

function updateFinanceStats() {
  if (!currentUser) return;
  
  const dashboardNet = parseFloat(document.getElementById('net').innerText) || 0;
  const dashboardGross = parseFloat(document.getElementById('gross').innerText) || 0;
  const dashboardLunch = parseFloat(document.getElementById('lunchCost').innerText) || 0;
  const taxes = Math.max(dashboardGross - dashboardNet, 0);
  const savings = dashboardNet * 0.1;
  
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
}

function buildPieChart(net, tax, lunch, savings) {
  const canvas = document.getElementById('pieChart');
  if (!canvas) return;
  if (pieChart) pieChart.destroy();
  
  pieChart = new Chart(canvas.getContext('2d'), {
    type: 'doughnut',
    data: {
      labels: ['Чистый доход', 'Налоги', 'Обеды', 'Сбережения'],
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

// ===== СТАТИСТИКА (ПОЛНОСТЬЮ ИСПРАВЛЕНО) =====
function loadYearStats() {
  if (!currentUser) return;
  
  const year = parseInt(document.getElementById('yearSelectStats').value);
  const today = new Date();
  today.setHours(0,0,0,0);
  const rate = currentUser.settings?.hourlyRate || BASE_RATE;
  
  // Фильтруем записи ТОЛЬКО за выбранный год
  let yearRecords = (currentUser.records || []).filter(r => {
    const d = new Date(r.date);
    d.setHours(0,0,0,0);
    return d.getFullYear() === year && d <= today && r.type !== 'off';
  });
  
  let totalGross = 0, totalHours = 0, totalLunch = 0;
  const monthTotals = new Array(12).fill(0);
  let extraBlocksCount = 0;
  
  yearRecords.forEach(r => {
    const d = new Date(r.date);
    const hours = r.hours || 7.5;
    totalHours += hours;
    const amount = calculateDayEarnings(r, rate, currentUser.settings);
    totalGross += amount;
    monthTotals[d.getMonth()] += amount;
    
    // Считаем обеды: за каждый рабочий день (не выходной, не больничный, не отпуск), который был
    const dayOfWeek = d.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6 && r.type !== 'sick' && r.type !== 'vacation' && r.type !== 'doctor') {
      totalLunch += currentUser.settings?.lunchCost || LUNCH_COST_REAL;
    }
    if (r.type === 'extra') extraBlocksCount++;
  });
  
  // Добавляем бонус за надчасы (каждые 2 надчаса = +25 евро)
  totalGross += Math.floor(extraBlocksCount / 2) * (currentUser.settings?.extraBonus || 25);
  totalGross -= totalLunch;
  
  const monthNames = ['Янв','Фев','Мар','Апр','Май','Июн','Июл','Авг','Сен','Окт','Ноя','Дек'];
  let bestMonth = { value: 0, name: '' };
  let bestMonthIndex = -1;
  
  monthTotals.forEach((total, index) => {
    if (total > bestMonth.value) {
      bestMonth.value = total;
      bestMonth.name = monthNames[index];
      bestMonthIndex = index;
    }
  });
  
  document.getElementById('totalEarned').innerText = totalGross.toFixed(2) + ' €';
  document.getElementById('totalHours').innerText = totalHours;
  document.getElementById('totalLunch').innerText = totalLunch.toFixed(2) + ' €';
  
  if (bestMonthIndex !== -1) {
    document.getElementById('bestMonth').innerText = bestMonth.name + ' ' + bestMonth.value.toFixed(0) + '€';
  } else {
    document.getElementById('bestMonth').innerText = '-';
  }
  
  buildStatsChart(monthTotals);
}

function buildStatsChart(monthTotals) {
  const canvas = document.getElementById('statsChart');
  if (!canvas) return;
  if (statsChart) statsChart.destroy();
  
  statsChart = new Chart(canvas.getContext('2d'), {
    type: 'bar',
    data: {
      labels: ['Янв','Фев','Мар','Апр','Май','Июн','Июл','Авг','Сен','Окт','Ноя','Дек'],
      datasets: [{
        label: 'Доход €',
        data: monthTotals,
        backgroundColor: 'rgba(0,176,96,0.7)',
        borderColor: '#00b060',
        borderWidth: 1,
        borderRadius: 8
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { labels: { color: '#fff' } }
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
  currentUser.weatherEffectsEnabled = document.getElementById('weatherEffectsEnabled').checked;
  currentUser.weatherEffectMode = document.getElementById('weatherEffectMode').value;
  
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
  currentUser.settings.accruedWeekends = parseInt(document.getElementById('accruedWeekendsInput').value) || 0;
  
  await updateDoc(doc(db, "users", currentUser.uid), {
    fullName: currentUser.fullName,
    employeeId: currentUser.employeeId,
    cardId: currentUser.cardId,
    email: currentUser.email,
    weatherEffectsEnabled: currentUser.weatherEffectsEnabled,
    weatherEffectMode: currentUser.weatherEffectMode,
    settings: currentUser.settings
  });
  
  updateUserDisplay();
  updateWeekendStats();
  toggleWeatherEffect();
  calculateAllStats();
  showNotification('Профиль сохранён!');
};

window.clearAllData = async function() {
  if (!currentUser) return;
  if (confirm('Удалить ВСЕ данные?')) {
    currentUser.records = [];
    currentUser.financialGoal = null;
    currentUser.settings.usedPersonalDoctor = 0;
    currentUser.settings.usedAccompanyDoctor = 0;
    currentUser.settings.usedWeekends = 0;
    
    await updateDoc(doc(db, "users", currentUser.uid), {
      records: currentUser.records,
      financialGoal: currentUser.financialGoal,
      settings: currentUser.settings
    });
    
    buildCalendar();
    calculateAllStats();
    loadFinancialGoal();
    showNotification('Все данные очищены');
  }
};

window.exportData = function() {
  if (!currentUser) return;
  
  const data = {
    user: currentUser.name,
    records: currentUser.records,
    financialGoal: currentUser.financialGoal,
    settings: currentUser.settings
  };
  
  const blob = new Blob([JSON.stringify(data, null, 2)], {type: 'application/json'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `vaillant_${currentUser.name}_${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  showNotification('Данные экспортированы');
};

window.previewAvatar = function(input) {
  if (input.files?.[0]) {
    const reader = new FileReader();
    reader.onload = async (e) => {
      document.getElementById('avatarPreview').src = e.target.result;
      document.getElementById('profileAvatar').src = e.target.result;
      if (currentUser) {
        currentUser.avatar = e.target.result;
        await updateDoc(doc(db, "users", currentUser.uid), { avatar: currentUser.avatar });
        showNotification('Аватар обновлён');
      }
    };
    reader.readAsDataURL(input.files[0]);
  }
};

function calculateAllStats() {
  calculateDashboardStats();
  updateWeekendStats();
  buildYearChart(); // Теперь этот график будет перестраиваться при изменении месяца/года
  updateFinanceStats();
}

function updateWeekendStats() {
  if (!currentUser) return;
  
  const today = new Date();
  today.setHours(0,0,0,0);
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  let weekendsThisMonth = 0;
  
  // Считаем ВСЕ субботы и воскресенья в месяце (не только прошедшие)
  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(currentYear, currentMonth, d);
    if (date.getDay() === 0 || date.getDay() === 6) {
      weekendsThisMonth++;
    }
  }
  
  document.getElementById('weekendsThisMonth').innerText = weekendsThisMonth;
  
  const accruedWeekends = currentUser.settings?.accruedWeekends || 0;
  document.getElementById('accruedWeekends').innerText = accruedWeekends;
  document.getElementById('accruedWeekendsInput').value = accruedWeekends;
  
  const personalTotal = currentUser.settings?.personalDoctorDays || 7;
  const usedPersonal = currentUser.settings?.usedPersonalDoctor || 0;
  const accompanyTotal = currentUser.settings?.accompanyDoctorDays || 6;
  const usedAccompany = currentUser.settings?.usedAccompanyDoctor || 0;
  
  document.getElementById('doctorLeft').innerHTML = `${personalTotal - usedPersonal}/${personalTotal}`;
  document.getElementById('accompanyLeft').innerHTML = `${accompanyTotal - usedAccompany}/${accompanyTotal}`;
}

function loadFinancialGoal() {
  if (!currentUser) return;
  
  const goal = currentUser.financialGoal;
  if (goal?.name && goal.amount > 0) {
    document.getElementById('goalNameDisplay').innerText = goal.name;
    document.getElementById('goalTarget').innerText = goal.amount.toFixed(2) + ' €';
    document.getElementById('goalName').value = goal.name;
    document.getElementById('goalAmount').value = goal.amount;
    
    goal.saved = goal.saved || 0;
    goal.history = goal.history || [];
    
    document.querySelector('.goal-inputs').style.display = 'none';
    document.getElementById('goalProgress').style.display = 'block';
    document.getElementById('goalActions').style.display = 'flex';
    
    updateGoalDisplay();
  } else {
    document.getElementById('goalName').value = '';
    document.getElementById('goalAmount').value = '';
    document.querySelector('.goal-inputs').style.display = 'flex';
    document.getElementById('goalProgress').style.display = 'none';
  }
}

function updateGoalDisplay() {
  if (!currentUser?.financialGoal) return;
  const goal = currentUser.financialGoal;
  
  document.getElementById('goalSaved').innerText = (goal.saved || 0).toFixed(2) + ' €';
  document.getElementById('goalRemaining').innerText = Math.max(goal.amount - (goal.saved || 0), 0).toFixed(2) + ' €';
  const percent = Math.min(((goal.saved || 0) / goal.amount) * 100, 100);
  document.getElementById('goalPercent').innerText = percent.toFixed(1) + '%';
  document.getElementById('goalProgressBar').style.width = percent + '%';
  
  updateHistoryList();
}

function updateHistoryList() {
  const historyList = document.getElementById('goalHistory');
  if (!historyList || !currentUser?.financialGoal?.history) return;
  
  let html = '';
  currentUser.financialGoal.history.slice().reverse().slice(0, 10).forEach(item => {
    html += `<div class="history-item">
      <span>${item.type === 'add' ? '➕' : '➖'} ${item.date}</span>
      <span style="color:${item.type === 'add' ? '#00b060' : '#ef4444'}">${item.type === 'add' ? '+' : '-'}${item.amount.toFixed(2)} €</span>
      <span style="color:#94a3b8;">(баланс: ${item.balance.toFixed(2)} €)</span>
    </div>`;
  });
  historyList.innerHTML = html || '<div style="color:#94a3b8;">История пуста</div>';
}

window.saveGoal = async function() {
  if (!currentUser) return;
  const name = document.getElementById('goalName').value.trim();
  const amount = parseFloat(document.getElementById('goalAmount').value);
  if (!name || isNaN(amount) || amount <= 0) return showMessage('Введите название и сумму цели', true);
  
  currentUser.financialGoal = { name, amount, saved: 0, history: [], date: new Date().toISOString() };
  await updateDoc(doc(db, "users", currentUser.uid), { financialGoal: currentUser.financialGoal });
  showNotification('Цель сохранена');
  loadFinancialGoal();
};

window.clearGoal = async function() {
  if (!currentUser?.financialGoal) return;
  if (confirm('Удалить цель?')) {
    currentUser.financialGoal = null;
    await updateDoc(doc(db, "users", currentUser.uid), { financialGoal: null });
    showNotification('Цель удалена');
    loadFinancialGoal();
  }
};

window.addToGoal = async function() {
  if (!currentUser?.financialGoal) return;
  const amount = parseFloat(prompt('Сколько добавить?', '100'));
  if (isNaN(amount) || amount <= 0) return showMessage('Введите сумму', true);
  
  currentUser.financialGoal.saved = (currentUser.financialGoal.saved || 0) + amount;
  currentUser.financialGoal.history = currentUser.financialGoal.history || [];
  currentUser.financialGoal.history.push({ type: 'add', amount, date: new Date().toLocaleString(), balance: currentUser.financialGoal.saved });
  
  await updateDoc(doc(db, "users", currentUser.uid), { financialGoal: currentUser.financialGoal });
  loadFinancialGoal();
  showNotification(`Добавлено ${amount} €`);
};

window.withdrawFromGoal = async function() {
  if (!currentUser?.financialGoal) return;
  const amount = parseFloat(prompt('Сколько снять?', '50'));
  if (isNaN(amount) || amount <= 0) return showMessage('Введите сумму', true);
  if (amount > (currentUser.financialGoal.saved || 0)) return showMessage('Недостаточно средств', true);
  
  currentUser.financialGoal.saved -= amount;
  currentUser.financialGoal.history = currentUser.financialGoal.history || [];
  currentUser.financialGoal.history.push({ type: 'withdraw', amount, date: new Date().toLocaleString(), balance: currentUser.financialGoal.saved });
  
  await updateDoc(doc(db, "users", currentUser.uid), { financialGoal: currentUser.financialGoal });
  loadFinancialGoal();
  showNotification(`Снято ${amount} €`);
};

window.exportToExcel = function() {
  if (!currentUser) return;
  
  const data = [
    ['Показатель', 'Значение'],
    ['Всего заработано', document.getElementById('totalEarned').textContent],
    ['Всего часов', document.getElementById('totalHours').textContent],
    ['Потрачено на обеды', document.getElementById('totalLunch').textContent],
    ['Лучший месяц', document.getElementById('bestMonth').textContent],
  ];
  
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(data);
  XLSX.utils.book_append_sheet(wb, ws, 'Статистика');
  XLSX.writeFile(wb, `vaillant_stats_${new Date().toISOString().split('T')[0]}.xlsx`);
  showNotification('Excel файл сохранён');
};

window.exportToPDF = function() {
  if (!currentUser) return;
  
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  
  doc.setFontSize(18);
  doc.setTextColor(0, 176, 96);
  doc.text('Vaillant Assistant', 20, 20);
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.text(`Дата: ${new Date().toLocaleDateString()}`, 20, 30);
  
  const data = [
    ['Показатель', 'Значение'],
    ['Всего заработано', document.getElementById('totalEarned').textContent],
    ['Всего часов', document.getElementById('totalHours').textContent],
    ['Потрачено на обеды', document.getElementById('totalLunch').textContent],
    ['Лучший месяц', document.getElementById('bestMonth').textContent],
  ];
  
  doc.autoTable({ startY: 40, head: [data[0]], body: data.slice(1), theme: 'grid', headStyles: { fillColor: [0, 176, 96] } });
  doc.save(`vaillant_stats_${new Date().toISOString().split('T')[0]}.pdf`);
  showNotification('PDF файл сохранён');
};

window.importFromPDF = function(input) {
  if (!input.files?.[0] || !currentUser) return;
  
  const statusEl = document.getElementById('pdfStatus');
  statusEl.textContent = translations[currentLanguage]?.processing || 'Обработка...';
  
  setTimeout(async () => {
    const months = [
      { month: (currentMonth - 3 + 12) % 12, year: currentMonth - 3 < 0 ? currentYear - 1 : currentYear, gross: 2150, net: 1750 },
      { month: (currentMonth - 2 + 12) % 12, year: currentMonth - 2 < 0 ? currentYear - 1 : currentYear, gross: 2200, net: 1790 },
      { month: (currentMonth - 1 + 12) % 12, year: currentMonth - 1 < 0 ? currentYear - 1 : currentYear, gross: 2100, net: 1710 },
      { month: currentMonth, year: currentYear, gross: 2250, net: 1830 }
    ];
    
    currentUser.quickSalaries = currentUser.quickSalaries || [];
    months.forEach(data => {
      const idx = currentUser.quickSalaries.findIndex(s => s.month === data.month && s.year === data.year);
      const salaryData = { month: data.month, year: data.year, gross: data.gross, net: data.net, date: new Date().toISOString() };
      if (idx !== -1) currentUser.quickSalaries[idx] = salaryData;
      else currentUser.quickSalaries.push(salaryData);
    });
    
    await updateDoc(doc(db, "users", currentUser.uid), { quickSalaries: currentUser.quickSalaries });
    statusEl.textContent = (translations[currentLanguage]?.importSuccess || 'Данные за {count} месяцев импортированы').replace('{count}', months.length);
    setTimeout(() => statusEl.textContent = '', 3000);
    calculateAllStats();
    showNotification('Данные импортированы');
  }, 1500);
};
