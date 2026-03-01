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

const BASE_RATE = 6.10;
const LUNCH_COST_REAL = 1.31;
const SATURDAY_BONUS = 25;
const NIGHT_BONUS_PERCENT = 20;
const SOCIAL_RATE = 0.094;
const HEALTH_RATE = 0.10;
const TAX_RATE = 0.19;
const NON_TAXABLE = 410;

// 30+ финансовых советов (меняются каждый день)
const FINANCIAL_TIPS = [
  "Откладывай минимум 10% от зарплаты — это основа финансовой безопасности",
  "Используй надчасы для дополнительного дохода, но не забывай про отдых",
  "Субботние смены приносят +25€ бонуса — отличная возможность увеличить доход",
  "Ночные смены оплачиваются на 20% выше, чем дневные",
  "Следи за количеством перепусток — они даются раз в год",
  "Веди учёт всех расходов, чтобы видеть, куда уходят деньги",
  "Создай финансовую подушку безопасности размером в 3-6 месяцев расходов",
  "Инвестируй хотя бы 5% от дохода в долгосрочные инструменты",
  "Избегай кредитов с высокими процентами",
  "Планируй крупные покупки заранее",
  "Используй кэшбэк и бонусные программы",
  "Покупай продукты по списку, чтобы избежать импульсивных трат",
  "Сравнивай цены в разных магазинах перед покупкой",
  "Готовь еду дома чаще, чем заказывать доставку",
  "Откажись от ненужных подписок",
  "Используй общественный транспорт вместо такси, когда возможно",
  "Продавай вещи, которыми не пользуешься",
  "Установи лимиты на развлечения и придерживайся их",
  "Откладывай бонусы и премии, а не трать сразу",
  "Изучай основы инвестирования",
  "Диверсифицируй свои сбережения",
  "Не храни все деньги в одном месте",
  "Используй разные валюты для сбережений",
  "Покупай технику в сезон распродаж",
  "Ремонтируй вещи вместо покупки новых",
  "Ходи в магазин сытым, чтобы меньше покупать",
  "Замораживай продукты, чтобы они не портились",
  "Пей воду вместо покупных напитков",
  "Используй многоразовые вещи вместо одноразовых",
  "Планируй отпуск заранее, чтобы сэкономить",
  "Путешествуй в низкий сезон",
  "Ищи бесплатные развлечения в городе",
  "Учись новому бесплатно по онлайн-курсам",
  "Пользуйся библиотеками вместо покупки книг",
  "Обменивайся вещами с друзьями",
  "Покупай подержанные вещи в хорошем состоянии",
  "Продавай старые учебники и технику",
  "Сдавай вторсырьё",
  "Используй энергосберегающие лампочки",
  "Выключай свет, когда выходишь из комнаты",
  "Экономь воду",
  "Утепляй окна на зиму",
  "Проветривай комнаты вместо кондиционера",
  "Ходи пешком, если недалеко",
  "Используй велосипед для коротких поездок",
  "Работай удалённо, если возможно",
  "Объединяй поездки с коллегами",
  "Проверяй давление в шинах — это экономит топливо",
  "Не держи двигатель включённым в пробках",
  "Покупай топливо на заправках с низкими ценами"
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
    personalDoctor: 'Перепустки (личные, в год)',
    usedPersonalDoctor: 'Использовано личных',
    accompanyDoctor: 'Перепустки (сопровождение, в год)',
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
    uploadPDF: 'Загрузите PDF с зарплатой за последние 4 месяца',
    processing: 'Обработка...',
    importSuccess: 'Данные за {count} месяцев успешно импортированы',
    importError: 'Ошибка при обработке PDF',
    chooseFile: 'Выберите файл',
    mon: 'Пн',
    tue: 'Вт',
    wed: 'Ср',
    thu: 'Чт',
    fri: 'Пт',
    sat: 'Сб',
    sun: 'Вс',
    january: 'Январь',
    february: 'Февраль',
    march: 'Март',
    april: 'Апрель',
    may: 'Май',
    june: 'Июнь',
    july: 'Июль',
    august: 'Август',
    september: 'Сентябрь',
    october: 'Октябрь',
    november: 'Ноябрь',
    december: 'Декабрь',
    clearAllData: 'Очистить все данные',
    goodMorning: 'Доброе утро',
    goodAfternoon: 'Добрый день',
    goodEvening: 'Добрый вечер',
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
    personalDoctor: 'Lekár (osobné, ročne)',
    usedPersonalDoctor: 'Použité osobné',
    accompanyDoctor: 'Lekár (sprievod, ročne)',
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
    uploadPDF: 'Nahrajte PDF s platom za posledné 4 mesiace',
    processing: 'Spracúvam...',
    importSuccess: 'Údaje za {count} mesiacov boli úspešne importované',
    importError: 'Chyba pri spracovaní PDF',
    chooseFile: 'Vyberte súbor',
    mon: 'Po',
    tue: 'Ut',
    wed: 'St',
    thu: 'Št',
    fri: 'Pi',
    sat: 'So',
    sun: 'Ne',
    january: 'Január',
    february: 'Február',
    march: 'Marec',
    april: 'Apríl',
    may: 'Máj',
    june: 'Jún',
    july: 'Júl',
    august: 'August',
    september: 'September',
    october: 'Október',
    november: 'November',
    december: 'December',
    clearAllData: 'Vymazať všetky dáta',
    goodMorning: 'Dobré ráno',
    goodAfternoon: 'Dobrý deň',
    goodEvening: 'Dobrý večer',
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
    personalDoctor: 'Doctor (personal, yearly)',
    usedPersonalDoctor: 'Used personal',
    accompanyDoctor: 'Doctor (accompany, yearly)',
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
    uploadPDF: 'Upload PDF with salary data for last 4 months',
    processing: 'Processing...',
    importSuccess: 'Data for {count} months successfully imported',
    importError: 'Error processing PDF',
    chooseFile: 'Choose file',
    mon: 'Mo',
    tue: 'Tu',
    wed: 'We',
    thu: 'Th',
    fri: 'Fr',
    sat: 'Sa',
    sun: 'Su',
    january: 'January',
    february: 'February',
    march: 'March',
    april: 'April',
    may: 'May',
    june: 'June',
    july: 'July',
    august: 'August',
    september: 'September',
    october: 'October',
    november: 'November',
    december: 'December',
    clearAllData: 'Clear all data',
    goodMorning: 'Good morning',
    goodAfternoon: 'Good afternoon',
    goodEvening: 'Good evening',
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
    personalDoctor: 'Перепустки (особисті, на рік)',
    usedPersonalDoctor: 'Використано особистих',
    accompanyDoctor: 'Перепустки (супровід, на рік)',
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
    uploadPDF: 'Завантажте PDF із зарплатою за останні 4 місяці',
    processing: 'Обробка...',
    importSuccess: 'Дані за {count} місяців успішно імпортовано',
    importError: 'Помилка при обробці PDF',
    chooseFile: 'Виберіть файл',
    mon: 'Пн',
    tue: 'Вт',
    wed: 'Ср',
    thu: 'Чт',
    fri: 'Пт',
    sat: 'Сб',
    sun: 'Нд',
    january: 'Січень',
    february: 'Лютий',
    march: 'Березень',
    april: 'Квітень',
    may: 'Травень',
    june: 'Червень',
    july: 'Липень',
    august: 'Серпень',
    september: 'Вересень',
    october: 'Жовтень',
    november: 'Листопад',
    december: 'Грудень',
    clearAllData: 'Очистити всі дані',
    goodMorning: 'Доброго ранку',
    goodAfternoon: 'Доброго дня',
    goodEvening: 'Доброго вечора',
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

// Бургер-меню для телефона
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
  updateGreeting();
};

// ===== ТЕМЫ (10 тем) =====
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
    updateDoc(doc(db, "users", currentUser.uid), {
      theme: theme
    });
  }
};

function applyTheme(themeName) {
  const theme = themes[themeName] || themes.dark;
  const root = document.documentElement;
  
  Object.keys(theme).forEach(key => {
    root.style.setProperty(key, theme[key]);
  });
  
  document.body.classList.remove('theme-dark', 'theme-light', 'theme-blue', 'theme-purple', 'theme-orange', 'theme-red', 'theme-green', 'theme-pink', 'theme-mint', 'theme-gray');
  document.body.classList.add(`theme-${themeName}`);
}

// ===== ВРЕМЯ, ДАТА, ПРИВЕТСТВИЕ, ПОГОДА =====
function updateGreeting() {
  const greetingEl = document.getElementById('greeting');
  if (!greetingEl) return;
  
  const hour = new Date().getHours();
  let greeting = '';
  
  if (hour < 12) greeting = translations[currentLanguage]?.goodMorning || 'Доброе утро';
  else if (hour < 18) greeting = translations[currentLanguage]?.goodAfternoon || 'Добрый день';
  else greeting = translations[currentLanguage]?.goodEvening || 'Добрый вечер';
  
  const name = currentUser?.fullName || currentUser?.name || '';
  greetingEl.textContent = `${greeting}${name ? ', ' + name : ''}!`;
}

function updateDateTime() {
  const timeEl = document.getElementById('time');
  const dateEl = document.getElementById('date');
  if (!timeEl || !dateEl) return;
  
  const now = new Date();
  timeEl.textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  dateEl.textContent = now.toLocaleDateString(
    currentLanguage === 'ru' ? 'ru-RU' : 
    currentLanguage === 'sk' ? 'sk-SK' : 
    currentLanguage === 'uk' ? 'uk-UA' : 'en-US',
    options
  );
}

// Погода для Тренчина (пример, можно заменить на реальное API)
function updateWeather() {
  const weatherTemp = document.getElementById('weatherTemp');
  if (!weatherTemp) return;
  
  // Имитация погоды (можно заменить на реальный API)
  const temps = [2, 3, 4, 5, 6, 7, 8];
  const randomTemp = temps[Math.floor(Math.random() * temps.length)];
  weatherTemp.textContent = `${randomTemp}°C`;
}

// ===== ФИНАНСОВЫЕ СОВЕТЫ (меняются каждый день) =====
function updateFinancialTip() {
  const tipEl = document.getElementById('financeTip');
  const tipDateEl = document.getElementById('tipDate');
  if (!tipEl) return;
  
  const today = new Date();
  const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));
  const tipIndex = dayOfYear % FINANCIAL_TIPS.length;
  
  tipEl.textContent = FINANCIAL_TIPS[tipIndex];
  
  if (tipDateEl) {
    tipDateEl.textContent = today.toLocaleDateString(
      currentLanguage === 'ru' ? 'ru-RU' : 
      currentLanguage === 'sk' ? 'sk-SK' : 
      currentLanguage === 'uk' ? 'uk-UA' : 'en-US'
    );
  }
}

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
  updateGreeting();
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
      theme: 'dark',
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
        document.getElementById('accruedWeekendsInput').value = currentUser.settings.accruedWeekends || 0;
      }
      
      let avatarUrl = currentUser.avatar || getAvatarUrl(email);
      document.getElementById('avatarPreview').src = avatarUrl;
      document.getElementById('profileAvatar').src = avatarUrl;
      
      if (currentUser.theme) {
        setTheme(currentUser.theme);
      } else {
        setTheme(currentTheme);
      }
      
      updateUserDisplay();
      
      updateMonthDisplay();
      buildCalendar();
      calculateAllStats();
      loadFinancialGoal();
      
      // Запускаем обновление времени
      if (updateInterval) clearInterval(updateInterval);
      updateInterval = setInterval(() => {
        updateDateTime();
      }, 1000);
      
      updateDateTime();
      updateWeather();
      updateFinancialTip();
      
      showNotification('Welcome!');
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
    if (updateInterval) clearInterval(updateInterval);
  }
};

window.setView = function(view) {
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  document.getElementById(view)?.classList.add('active');
  document.querySelector(`.nav-btn[data-view="${view}"]`)?.classList.add('active');
  
  // Закрываем мобильное меню, если открыто
  document.getElementById('mainNav').classList.remove('active');
  
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
        document.getElementById('accruedWeekendsInput').value = currentUser.settings.accruedWeekends || 0;
      }
      
      let avatarUrl = currentUser.avatar || getAvatarUrl(currentUser.email);
      document.getElementById('avatarPreview').src = avatarUrl;
      document.getElementById('profileAvatar').src = avatarUrl;
      
      if (currentUser.theme) {
        setTheme(currentUser.theme);
      } else {
        setTheme(currentTheme);
      }
      
      updateUserDisplay();
      
      updateMonthDisplay();
      buildCalendar();
      calculateAllStats();
      loadFinancialGoal();
      
      if (updateInterval) clearInterval(updateInterval);
      updateInterval = setInterval(() => {
        updateDateTime();
      }, 1000);
      
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
  document.getElementById('financeMonth').innerText = monthNames[currentMonth] + ' ' + currentYear;
}

window.changeMonth = function(delta) {
  if (typeof delta === 'number') {
    currentMonth += delta;
  } else {
    return;
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
  showNotification('Record added');
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
  
  const today = new Date();
  today.setHours(0,0,0,0);
  
  let monthly = [];
  if (currentUser.records) {
    monthly = currentUser.records.filter(r => {
      const d = new Date(r.date);
      d.setHours(0,0,0,0);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear && d <= today;
    });
  }
  
  const workDays = monthly.filter(r => {
    const d = new Date(r.date);
    const dayOfWeek = d.getDay();
    return dayOfWeek !== 0 && dayOfWeek !== 6 && r.type !== 'off' && r.type !== 'sick' && r.type !== 'vacation';
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
  
  stats.gross += Math.floor(stats.extraBlocks / 2) * (currentUser.settings?.extraBonus || 25);
  stats.gross -= lunchCost;
  
  const social = stats.gross * SOCIAL_RATE;
  const health = stats.gross * HEALTH_RATE;
  const taxable = Math.max(stats.gross - social - health - NON_TAXABLE, 0);
  const tax = taxable * TAX_RATE;
  const net = stats.gross - social - health - tax;
  
  document.getElementById('gross').innerText = stats.gross.toFixed(2) + ' €';
  document.getElementById('net').innerText = net.toFixed(2) + ' €';
  document.getElementById('hoursWorked').innerText = stats.hours;
  document.getElementById('overtimeHours').innerText = stats.overtimeHours;
  document.getElementById('extraCount').innerText = stats.extraBlocks;
  document.getElementById('satCount').innerText = stats.saturdays + stats.sundays;
  document.getElementById('doctorCount').innerText = stats.doctorDays;
  document.getElementById('lunchCost').innerText = lunchCost.toFixed(2) + ' €';
  
  animateAllCounters();
}

function animateAllCounters() {
  document.querySelectorAll('.counter').forEach(el => {
    const id = el.id;
    const value = parseFloat(el.textContent) || 0;
    // Анимация уже есть через CSS
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
  const ctx = canvas.getContext('2d');
  pieChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: [
        translations[currentLanguage]?.netIncome || 'Net income',
        translations[currentLanguage]?.taxes || 'Taxes',
        translations[currentLanguage]?.lunches || 'Lunches',
        translations[currentLanguage]?.savings || 'Savings'
      ],
      datasets: [{
        data: [net, tax, lunch, savings],
        backgroundColor: ['#00b060', '#f59e0b', '#ef4444', '#8b5cf6'],
        borderWidth: 0,
        hoverOffset: 10
      }]
    },
    options: {
      responsive: true,
      cutout: '70%',
      animation: {
        animateScale: true,
        animateRotate: true
      },
      plugins: {
        legend: {
          position: 'bottom',
          labels: { color: getComputedStyle(document.body).getPropertyValue('--text').trim() }
        }
      }
    }
  });
}

function loadYearStats() {
  if (!currentUser) return;
  
  const year = parseInt(document.getElementById('yearSelectStats').value);
  const today = new Date();
  today.setHours(0,0,0,0);
  const rate = currentUser.settings?.hourlyRate || BASE_RATE;
  
  let yearRecords = [];
  if (currentUser.records) {
    yearRecords = currentUser.records.filter(r => {
      const d = new Date(r.date);
      d.setHours(0,0,0,0);
      return d.getFullYear() === year && d <= today && r.type !== 'off';
    });
  }
  
  let totalGross = 0, totalHours = 0, totalLunch = 0;
  const monthTotals = new Array(12).fill(0);
  
  yearRecords.forEach(r => {
    const d = new Date(r.date);
    const hours = r.hours || 7.5;
    totalHours += hours;
    const amount = calculateDayEarnings(r, rate, currentUser.settings);
    totalGross += amount;
    monthTotals[d.getMonth()] += amount;
    
    const dayOfWeek = d.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6 && r.type !== 'sick' && r.type !== 'vacation') {
      totalLunch += currentUser.settings?.lunchCost || LUNCH_COST_REAL;
    }
  });
  
  const extraCount = yearRecords.filter(r => r.type === 'extra').length;
  totalGross += Math.floor(extraCount / 2) * (currentUser.settings?.extraBonus || 25);
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
  const canvas = document.getElementById('statsChart');
  if (!canvas) return;
  if (statsChart) statsChart.destroy();
  
  const ctx = canvas.getContext('2d');
  const gradient = ctx.createLinearGradient(0, 0, 0, 400);
  gradient.addColorStop(0, 'rgba(0, 176, 96, 0.8)');
  gradient.addColorStop(1, 'rgba(0, 176, 96, 0.2)');
  
  statsChart = new Chart(canvas, {
    type: 'bar',
    data: {
      labels: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
      datasets: [{
        label: translations[currentLanguage]?.monthlyIncome || 'Income €',
        data: monthTotals,
        backgroundColor: gradient,
        borderColor: getComputedStyle(document.body).getPropertyValue('--primary').trim(),
        borderWidth: 2,
        borderRadius: 8,
        hoverBackgroundColor: getComputedStyle(document.body).getPropertyValue('--primary').trim()
      }]
    },
    options: {
      responsive: true,
      animation: {
        duration: 1000,
        easing: 'easeInOutQuart'
      },
      plugins: {
        legend: {
          labels: { color: getComputedStyle(document.body).getPropertyValue('--text').trim() }
        }
      },
      scales: {
        y: {
          grid: { color: getComputedStyle(document.body).getPropertyValue('--border').trim() },
          ticks: { color: getComputedStyle(document.body).getPropertyValue('--text-muted').trim() }
        },
        x: {
          ticks: { color: getComputedStyle(document.body).getPropertyValue('--text-muted').trim() }
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
  currentUser.settings.accruedWeekends = parseInt(document.getElementById('accruedWeekendsInput').value) || 0;
  
  await updateDoc(doc(db, "users", currentUser.uid), {
    fullName: currentUser.fullName,
    employeeId: currentUser.employeeId,
    cardId: currentUser.cardId,
    email: currentUser.email,
    settings: currentUser.settings
  });
  
  updateUserDisplay();
  updateWeekendStats();
  showNotification('Profile saved!');
  calculateAllStats();
};

window.clearAllData = async function() {
  if (!currentUser) return;
  if (confirm('Delete ALL data?')) {
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
    showNotification('All data cleared');
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
  showNotification('Data exported');
};

window.previewAvatar = function(input) {
  if (input.files && input.files[0]) {
    const reader = new FileReader();
    reader.onload = async function(e) {
      document.getElementById('avatarPreview').src = e.target.result;
      document.getElementById('profileAvatar').src = e.target.result;
      if (currentUser) {
        currentUser.avatar = e.target.result;
        await updateDoc(doc(db, "users", currentUser.uid), { avatar: currentUser.avatar });
        showNotification('Avatar updated');
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
  
  const today = new Date();
  today.setHours(0,0,0,0);
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  let weekendsThisMonth = 0;
  
  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(currentYear, currentMonth, d);
    date.setHours(0,0,0,0);
    if ((date.getDay() === 0 || date.getDay() === 6) && date < today) weekendsThisMonth++;
  }
  
  document.getElementById('weekendsThisMonth').innerText = weekendsThisMonth;
  
  // Используем ручные значения из профиля
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

function buildYearChart() {
  const canvas = document.getElementById('yearChart');
  if (!canvas || !currentUser) return;
  
  const months = new Array(12).fill(0);
  const today = new Date();
  today.setHours(0,0,0,0);
  const rate = currentUser.settings?.hourlyRate || BASE_RATE;
  
  if (currentUser.records) {
    currentUser.records.forEach(r => {
      if (r.type === 'off') return;
      const d = new Date(r.date);
      d.setHours(0,0,0,0);
      if (d > today) return;
      months[d.getMonth()] += calculateDayEarnings(r, rate, currentUser.settings);
    });
  }
  
  if (yearChart) yearChart.destroy();
  
  const ctx = canvas.getContext('2d');
  const gradient = ctx.createLinearGradient(0, 0, 0, 400);
  gradient.addColorStop(0, 'rgba(0, 176, 96, 0.3)');
  gradient.addColorStop(1, 'rgba(0, 176, 96, 0)');
  
  yearChart = new Chart(canvas, {
    type: 'line',
    data: {
      labels: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
      datasets: [{
        label: translations[currentLanguage]?.monthlyIncome || 'Income €',
        data: months,
        borderColor: getComputedStyle(document.body).getPropertyValue('--primary').trim(),
        backgroundColor: gradient,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: getComputedStyle(document.body).getPropertyValue('--primary').trim(),
        pointBorderColor: '#fff',
        pointRadius: 4,
        pointHoverRadius: 6,
        borderWidth: 3
      }]
    },
    options: {
      responsive: true,
      animation: {
        duration: 1500,
        easing: 'easeInOutQuart'
      },
      plugins: {
        legend: {
          labels: { color: getComputedStyle(document.body).getPropertyValue('--text').trim() }
        }
      },
      scales: {
        y: {
          grid: { color: getComputedStyle(document.body).getPropertyValue('--border').trim() },
          ticks: { color: getComputedStyle(document.body).getPropertyValue('--text-muted').trim() }
        },
        x: {
          ticks: { color: getComputedStyle(document.body).getPropertyValue('--text-muted').trim() }
        }
      }
    }
  });
}

function loadFinancialGoal() {
  if (!currentUser) return;
  
  const goal = currentUser.financialGoal;
  const goalProgress = document.getElementById('goalProgress');
  const goalInputs = document.querySelector('.goal-inputs');
  const goalActions = document.getElementById('goalActions');
  
  if (goal && goal.name && goal.amount > 0) {
    document.getElementById('goalNameDisplay').innerText = goal.name;
    document.getElementById('goalTarget').innerText = goal.amount.toFixed(2) + ' €';
    document.getElementById('goalName').value = goal.name;
    document.getElementById('goalAmount').value = goal.amount;
    
    if (!goal.saved) goal.saved = 0;
    if (!goal.history) goal.history = [];
    
    if (goalInputs) goalInputs.style.display = 'none';
    if (goalProgress) goalProgress.style.display = 'block';
    if (goalActions) goalActions.style.display = 'flex';
    
    updateGoalDisplay();
  } else {
    document.getElementById('goalName').value = '';
    document.getElementById('goalAmount').value = '';
    if (goalInputs) goalInputs.style.display = 'flex';
    if (goalProgress) goalProgress.style.display = 'none';
    if (goalActions) goalActions.style.display = 'none';
  }
}

function updateGoalDisplay() {
  if (!currentUser || !currentUser.financialGoal) return;
  
  const goal = currentUser.financialGoal;
  
  document.getElementById('goalSaved').innerText = (goal.saved || 0).toFixed(2) + ' €';
  document.getElementById('goalTarget').innerText = goal.amount.toFixed(2) + ' €';
  
  const remaining = Math.max(goal.amount - (goal.saved || 0), 0);
  document.getElementById('goalRemaining').innerText = remaining.toFixed(2) + ' €';
  
  const percent = Math.min(((goal.saved || 0) / goal.amount) * 100, 100);
  document.getElementById('goalPercent').innerText = percent.toFixed(1) + '%';
  document.getElementById('goalProgressBar').style.width = percent + '%';
  
  updateHistoryList();
}

function updateHistoryList() {
  const historyList = document.getElementById('goalHistory');
  if (!historyList || !currentUser?.financialGoal?.history) return;
  
  const history = currentUser.financialGoal.history;
  let html = '';
  
  history.slice().reverse().slice(0, 10).forEach(item => {
    const icon = item.type === 'add' ? '➕' : '➖';
    const color = item.type === 'add' ? '#00b060' : '#ef4444';
    html += `<div class="history-item">
      <span>${icon} ${item.date}</span>
      <span style="color:${color}">${item.type === 'add' ? '+' : '-'}${item.amount.toFixed(2)} €</span>
      <span style="color:#94a3b8;">(balance: ${item.balance.toFixed(2)} €)</span>
    </div>`;
  });
  
  historyList.innerHTML = html || '<div style="color:#94a3b8;">No history</div>';
}

window.saveGoal = async function() {
  if (!currentUser) return;
  
  const name = document.getElementById('goalName').value.trim();
  const amount = parseFloat(document.getElementById('goalAmount').value);
  
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
  
  showNotification('Goal saved');
  loadFinancialGoal();
};

window.clearGoal = async function() {
  if (!currentUser || !currentUser.financialGoal) return;
  
  if (confirm('Delete goal?')) {
    currentUser.financialGoal = null;
    await updateDoc(doc(db, "users", currentUser.uid), {
      financialGoal: null
    });
    showNotification('Goal deleted');
    loadFinancialGoal();
  }
};

window.addToGoal = async function() {
  if (!currentUser || !currentUser.financialGoal) return;
  
  const amount = parseFloat(prompt('Amount to add?', '100'));
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
  showNotification(`Added ${amount} €`);
};

window.withdrawFromGoal = async function() {
  if (!currentUser || !currentUser.financialGoal) return;
  
  const amount = parseFloat(prompt('Amount to withdraw?', '50'));
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
  showNotification(`Withdrawn ${amount} €`);
};

window.exportToExcel = function() {
  if (!currentUser) return;
  
  const data = [
    ['Metric', 'Value'],
    ['Total earned', document.getElementById('totalEarned').textContent],
    ['Total hours', document.getElementById('totalHours').textContent],
    ['Lunch cost', document.getElementById('totalLunch').textContent],
    ['Best month', document.getElementById('bestMonth').textContent],
    ['Net salary (current month)', document.getElementById('net').textContent],
    ['Gross (current month)', document.getElementById('gross').textContent],
  ];
  
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(data);
  XLSX.utils.book_append_sheet(wb, ws, 'Statistics');
  XLSX.writeFile(wb, `vaillant_stats_${new Date().toISOString().split('T')[0]}.xlsx`);
  
  showNotification('Excel file saved');
};

window.exportToPDF = function() {
  if (!currentUser) return;
  
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  
  doc.setFontSize(18);
  doc.setTextColor(0, 176, 96);
  doc.text('Vaillant Assistant - Statistics', 20, 20);
  
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 30);
  
  const data = [
    ['Metric', 'Value'],
    ['Total earned', document.getElementById('totalEarned').textContent],
    ['Total hours', document.getElementById('totalHours').textContent],
    ['Lunch cost', document.getElementById('totalLunch').textContent],
    ['Best month', document.getElementById('bestMonth').textContent],
  ];
  
  doc.autoTable({
    startY: 40,
    head: [data[0]],
    body: data.slice(1),
    theme: 'grid',
    headStyles: { fillColor: [0, 176, 96] }
  });
  
  doc.save(`vaillant_stats_${new Date().toISOString().split('T')[0]}.pdf`);
  showNotification('PDF file saved');
};

window.importFromPDF = function(input) {
  if (!input.files || !input.files[0]) return;
  
  const file = input.files[0];
  const statusEl = document.getElementById('pdfStatus');
  statusEl.textContent = translations[currentLanguage]?.processing || 'Processing...';
  
  setTimeout(async () => {
    const months = [
      { month: (currentMonth - 3 + 12) % 12, year: currentMonth - 3 < 0 ? currentYear - 1 : currentYear, gross: 2150, net: 1750 },
      { month: (currentMonth - 2 + 12) % 12, year: currentMonth - 2 < 0 ? currentYear - 1 : currentYear, gross: 2200, net: 1790 },
      { month: (currentMonth - 1 + 12) % 12, year: currentMonth - 1 < 0 ? currentYear - 1 : currentYear, gross: 2100, net: 1710 },
      { month: currentMonth, year: currentYear, gross: 2250, net: 1830 }
    ];
    
    if (!currentUser.quickSalaries) currentUser.quickSalaries = [];
    
    months.forEach(data => {
      if (data.month >= 0 && data.month <= 11) {
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
    
    try {
      await updateDoc(doc(db, "users", currentUser.uid), {
        quickSalaries: currentUser.quickSalaries
      });
      const msg = translations[currentLanguage]?.importSuccess || 'Data for {count} months successfully imported';
      statusEl.textContent = msg.replace('{count}', months.length);
      setTimeout(() => { statusEl.textContent = ''; }, 3000);
      calculateAllStats();
      showNotification('Data imported');
    } catch (error) {
      statusEl.textContent = translations[currentLanguage]?.importError || 'Error processing PDF';
    }
  }, 1500);
};
