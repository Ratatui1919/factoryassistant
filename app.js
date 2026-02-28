// ======================
// Vaillant Assistant PRO v16.0
// С Firebase БД - аккаунты сохраняются в облаке
// ======================

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
let selectedDay = null;
let currentLanguage = localStorage.getItem('vaillant_language') || 'ru';

// Константы
const BASE_RATE = 6.10;
const LUNCH_COST_REAL = 1.31;
const SATURDAY_BONUS = 25;
const NIGHT_BONUS_PERCENT = 20;
const SOCIAL_RATE = 0.094;
const HEALTH_RATE = 0.10;
const TAX_RATE = 0.19;
const NON_TAXABLE = 410;

let yearChart = null;
let statsChart = null;
let pieChart = null;

// ===== ПЕРЕВОДЫ =====
const translations = {
    ru: {
        dashboard: 'Дашборд', calendar: 'Календарь', stats: 'Статистика',
        profile: 'Профиль', finance: 'Финансы', netSalary: 'Чистая зарплата',
        grossSalary: 'Грязная', hours: 'Часов', lunches: 'Обеды',
        overtime: 'Переработки', extraBlocks: 'Надчасы', saturdays: 'Субботы',
        doctorVisits: 'Перепустки', quickSalary: 'Быстрый ввод зарплаты',
        gross: 'Брутто', net: 'Нетто', save: 'Сохранить', clear: 'Очистить',
        weekendsThisMonth: 'Выходные в этом месяце', accruedWeekends: 'Накоплено выходных',
        doctorLeft: 'Перепустки осталось', accompanyLeft: 'Сопровождение',
        monthlyIncome: 'Доход по месяцам', night: 'Ночь', saturday: 'Суббота',
        sunday: 'Воскресенье', doctor: 'Перепустка', dayOff: 'Выходной',
        totalStats: 'Общая статистика', totalEarned: 'Всего заработано',
        totalHours: 'Всего часов', totalLunch: 'Потрачено на обеды',
        bestMonth: 'Лучший месяц', employee: 'Сотрудник завода',
        personalData: 'Личные данные', fullName: 'Полное имя',
        employeeId: 'Табельный номер', cardId: 'Номер карты', email: 'Email',
        salarySettings: 'Настройки зарплаты', hourlyRate: 'Базовая ставка (€/час)',
        lunchCost: 'Стоимость обеда (€/день)', nightBonus: 'Ночная доплата (%)',
        saturdayBonus: 'Коэф. субботы', sundayBonus: 'Коэф. воскресенья',
        extraBonus: 'Бонус за надчас (€)', vacations: 'Отпуска и перепустки',
        accruedWeekendsLabel: 'Накоплено выходных (1.67/мес)', usedWeekends: 'Использовано выходных',
        personalDoctor: 'Перепустки (личные)', usedPersonalDoctor: 'Использовано личных',
        accompanyDoctor: 'Перепустки (сопровождение)', usedAccompanyDoctor: 'Использовано сопровождения',
        export: 'Экспорт данных', financeAnalytics: 'Финансовая аналитика',
        netIncome: 'Чистый доход', taxes: 'Налоги', savings: 'Сбережения',
        financialTip: 'Финансовый совет', selectDayType: 'Выберите тип дня',
        work: 'Смена', nightShift: 'Ночная смена', extraBlock: 'Надчас',
        sick: 'Больничный', vacation: 'Отпуск', cancel: 'Отмена',
        saveChanges: 'Сохранить изменения', clearAllData: 'Очистить все данные',
        goal: 'Моя финансовая цель', goalName: 'Название цели', goalAmount: 'Сумма цели',
        goalSaved: 'Накоплено', goalTarget: 'Цель', goalRemaining: 'Осталось',
        saveGoal: 'Сохранить цель', deleteGoal: 'Удалить цель', add: 'Добавить',
        withdraw: 'Снять', history: 'История операций'
    },
    sk: {
        dashboard: 'Nástenka', calendar: 'Kalendár', stats: 'Štatistika',
        profile: 'Profil', finance: 'Financie', netSalary: 'Čistá mzda',
        grossSalary: 'Hrubá', hours: 'Hodiny', lunches: 'Obed',
        overtime: 'Nadčasy', extraBlocks: 'Nadčasy', saturdays: 'Soboty',
        doctorVisits: 'Lekár', quickSalary: 'Rýchly vstup mzdy',
        gross: 'Hrubá', net: 'Čistá', save: 'Uložiť', clear: 'Vymazať',
        weekendsThisMonth: 'Víkendy tento mesiac', accruedWeekends: 'Nahromadené víkendy',
        doctorLeft: 'Lekár zostáva', accompanyLeft: 'Sprievod',
        monthlyIncome: 'Príjem podľa mesiacov', night: 'Nočná',
        saturday: 'Sobota', sunday: 'Nedeľa', doctor: 'Lekár',
        dayOff: 'Voľno', totalStats: 'Celková štatistika',
        totalEarned: 'Celkový zárobok', totalHours: 'Celkom hodín',
        totalLunch: 'Mínus obedy', bestMonth: 'Najlepší mesiac',
        employee: 'Zamestnanec', personalData: 'Osobné údaje',
        fullName: 'Celé meno', employeeId: 'Osobné číslo',
        cardId: 'Číslo karty', email: 'Email',
        salarySettings: 'Nastavenia mzdy', hourlyRate: 'Základná sadzba (€/hod)',
        lunchCost: 'Cena obeda (€/deň)', nightBonus: 'Nočný príplatok (%)',
        saturdayBonus: 'Sobota koeficient', sundayBonus: 'Nedeľa koeficient',
        extraBonus: 'Bonus za nadčas (€)', vacations: 'Dovolenka a lekár',
        accruedWeekendsLabel: 'Nahromadené víkendy (1.67/mes)', usedWeekends: 'Použité víkendy',
        personalDoctor: 'Lekár (osobné)', usedPersonalDoctor: 'Použité osobné',
        accompanyDoctor: 'Lekár (sprievod)', usedAccompanyDoctor: 'Použité sprievod',
        export: 'Export dát', financeAnalytics: 'Finančná analýza',
        netIncome: 'Čistý príjem', taxes: 'Dane', savings: 'Úspory',
        financialTip: 'Finančná rada', selectDayType: 'Vyberte typ dňa',
        work: 'Zmena', nightShift: 'Nočná zmena', extraBlock: 'Nadčas',
        sick: 'PN', vacation: 'Dovolenka', cancel: 'Zrušiť',
        saveChanges: 'Uložiť zmeny',
        goal: 'Môj finančný cieľ', goalName: 'Názov cieľa', goalAmount: 'Suma cieľa',
        goalSaved: 'Nasporené', goalTarget: 'Cieľ', goalRemaining: 'Zostáva',
        saveGoal: 'Uložiť cieľ', deleteGoal: 'Zmazať cieľ', add: 'Pridať',
        withdraw: 'Vybrať', history: 'História operácií'
    },
    en: {
        dashboard: 'Dashboard', calendar: 'Calendar', stats: 'Statistics',
        profile: 'Profile', finance: 'Finance', netSalary: 'Net Salary',
        grossSalary: 'Gross', hours: 'Hours', lunches: 'Lunches',
        overtime: 'Overtime', extraBlocks: 'Extra Blocks', saturdays: 'Saturdays',
        doctorVisits: 'Doctor', quickSalary: 'Quick Salary Input',
        gross: 'Gross', net: 'Net', save: 'Save', clear: 'Clear',
        weekendsThisMonth: 'Weekends this month', accruedWeekends: 'Accrued weekends',
        doctorLeft: 'Doctor left', accompanyLeft: 'Accompany',
        monthlyIncome: 'Monthly Income', night: 'Night',
        saturday: 'Saturday', sunday: 'Sunday', doctor: 'Doctor',
        dayOff: 'Day off', totalStats: 'Total Statistics',
        totalEarned: 'Total earned', totalHours: 'Total hours',
        totalLunch: 'Lunch cost', bestMonth: 'Best month',
        employee: 'Factory employee', personalData: 'Personal data',
        fullName: 'Full name', employeeId: 'Employee ID',
        cardId: 'Card ID', email: 'Email',
        salarySettings: 'Salary settings', hourlyRate: 'Hourly rate (€/hour)',
        lunchCost: 'Lunch cost (€/day)', nightBonus: 'Night bonus (%)',
        saturdayBonus: 'Saturday coeff', sundayBonus: 'Sunday coeff',
        extraBonus: 'Extra block bonus (€)', vacations: 'Vacations & doctor',
        accruedWeekendsLabel: 'Accrued weekends (1.67/month)', usedWeekends: 'Used weekends',
        personalDoctor: 'Doctor (personal)', usedPersonalDoctor: 'Used personal',
        accompanyDoctor: 'Doctor (accompany)', usedAccompanyDoctor: 'Used accompany',
        export: 'Export data', financeAnalytics: 'Finance analytics',
        netIncome: 'Net income', taxes: 'Taxes', savings: 'Savings',
        financialTip: 'Financial tip', selectDayType: 'Select day type',
        work: 'Shift', nightShift: 'Night shift', extraBlock: 'Overtime block',
        sick: 'Sick', vacation: 'Vacation', cancel: 'Cancel',
        saveChanges: 'Save changes',
        goal: 'My financial goal', goalName: 'Goal name', goalAmount: 'Goal amount',
        goalSaved: 'Saved', goalTarget: 'Target', goalRemaining: 'Remaining',
        saveGoal: 'Save goal', deleteGoal: 'Delete goal', add: 'Add',
        withdraw: 'Withdraw', history: 'Transaction history'
    },
    uk: {
        dashboard: 'Панель', calendar: 'Календар', stats: 'Статистика',
        profile: 'Профіль', finance: 'Фінанси', netSalary: 'Чиста зарплата',
        grossSalary: 'Брутто', hours: 'Годин', lunches: 'Обіди',
        overtime: 'Понаднормові', extraBlocks: 'Надгодини', saturdays: 'Суботи',
        doctorVisits: 'Перепустки', quickSalary: 'Швидке введення зарплати',
        gross: 'Брутто', net: 'Нетто', save: 'Зберегти', clear: 'Очистити',
        weekendsThisMonth: 'Вихідні цього місяця', accruedWeekends: 'Накопичено вихідних',
        doctorLeft: 'Перепустки залишилось', accompanyLeft: 'Супровід',
        monthlyIncome: 'Дохід по місяцях', night: 'Нічна',
        saturday: 'Субота', sunday: 'Неділя', doctor: 'Перепустка',
        dayOff: 'Вихідний', totalStats: 'Загальна статистика',
        totalEarned: 'Всього зароблено', totalHours: 'Всього годин',
        totalLunch: 'Витрати на обіди', bestMonth: 'Найкращий місяць',
        employee: 'Працівник заводу', personalData: 'Особисті дані',
        fullName: "Повне ім'я", employeeId: 'Табельний номер',
        cardId: 'Номер картки', email: 'Email',
        salarySettings: 'Налаштування зарплати', hourlyRate: 'Базова ставка (€/год)',
        lunchCost: 'Вартість обіду (€/день)', nightBonus: 'Нічна доплата (%)',
        saturdayBonus: 'Коеф. суботи', sundayBonus: 'Коеф. неділі',
        extraBonus: 'Бонус за надгодини (€)', vacations: 'Відпустки та перепустки',
        accruedWeekendsLabel: 'Накопичено вихідних (1.67/міс)', usedWeekends: 'Використано вихідних',
        personalDoctor: 'Перепустки (особисті)', usedPersonalDoctor: 'Використано особистих',
        accompanyDoctor: 'Перепустки (супровід)', usedAccompanyDoctor: 'Використано супроводу',
        export: 'Експорт даних', financeAnalytics: 'Фінансова аналітика',
        netIncome: 'Чистий дохід', taxes: 'Податки', savings: 'Заощадження',
        financialTip: 'Фінансова порада', selectDayType: 'Виберіть тип дня',
        work: 'Зміна', nightShift: 'Нічна зміна', extraBlock: 'Надгодини',
        sick: 'Лікарняний', vacation: 'Відпустка', cancel: 'Скасувати',
        saveChanges: 'Зберегти зміни',
        goal: 'Моя фінансова ціль', goalName: 'Назва цілі', goalAmount: 'Сума цілі',
        goalSaved: 'Накопичено', goalTarget: 'Ціль', goalRemaining: 'Залишилось',
        saveGoal: 'Зберегти ціль', deleteGoal: 'Видалити ціль', add: 'Додати',
        withdraw: 'Зняти', history: 'Історія операцій'
    }
};

// ===== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ =====
function showModal(id) {
    document.getElementById(id).style.display = 'flex';
}

function hideModal(id) {
    document.getElementById(id).style.display = 'none';
}

function showMessage(msg, isError = false) {
    alert(isError ? '❌ ' + msg : '✅ ' + msg);
}

function setLanguage(lang) {
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
}

function getAvatarUrl(name) {
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=00b060&color=fff&size=128`;
}

// ===== АВТОРИЗАЦИЯ ЧЕРЕЗ FIREBASE =====
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

async function register() {
    let name = document.getElementById('regName').value.trim();
    let pass = document.getElementById('regPass').value.trim();
    let confirm = document.getElementById('regConfirm').value.trim();
    
    if (!name || !pass || !confirm) return showMessage('Заполни все поля!', true);
    if (pass !== confirm) return showMessage('Пароли не совпадают!', true);
    if (pass.length < 3) return showMessage('Пароль должен быть минимум 3 символа!', true);
    
    try {
        // Создаем пользователя в Firebase Authentication
        const userCredential = await createUserWithEmailAndPassword(auth, `${name}@vaillant.app`, pass);
        const user = userCredential.user;
        
        // Создаем запись в Firestore
        const userData = {
            uid: user.uid,
            name: name,
            fullName: '',
            employeeId: '',
            cardId: '',
            email: `${name}@vaillant.app`,
            avatar: getAvatarUrl(name),
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
        
        document.getElementById('regName').value = '';
        document.getElementById('regPass').value = '';
        document.getElementById('regConfirm').value = '';
        
        showLoginForm();
        
    } catch (error) {
        console.error("Registration error:", error);
        if (error.code === 'auth/email-already-in-use') {
            showMessage('Пользователь с таким именем уже существует!', true);
        } else {
            showMessage('Ошибка регистрации: ' + error.message, true);
        }
    }
}

async function login() {
    let name = document.getElementById('loginName').value.trim();
    let pass = document.getElementById('loginPass').value.trim();
    
    if (!name || !pass) return showMessage('Введи имя и пароль!', true);
    
    try {
        const userCredential = await signInWithEmailAndPassword(auth, `${name}@vaillant.app`, pass);
        const user = userCredential.user;
        
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
            currentUserData = userDoc.data();
            currentUser = {
                uid: user.uid,
                ...currentUserData
            };
            
            hideModal('authModal');
            document.getElementById('app').classList.remove('hidden');
            
            updateUserInfo();
            updateMonthDisplay();
            buildCalendar();
            calculateAllStats();
            loadFinancialGoal();
        } else {
            showMessage('Данные пользователя не найдены!', true);
        }
    } catch (error) {
        console.error("Login error:", error);
        if (error.code === 'auth/invalid-credential') {
            showMessage('Неверное имя пользователя или пароль!', true);
        } else {
            showMessage('Ошибка входа: ' + error.message, true);
        }
    }
}

async function logout() {
    if (confirm('Вы уверены, что хотите выйти?')) {
        try {
            await signOut(auth);
            currentUser = null;
            currentUserData = null;
            document.getElementById('app').classList.add('hidden');
            showModal('authModal');
            showLoginForm();
        } catch (error) {
            console.error("Logout error:", error);
            showMessage('Ошибка при выходе', true);
        }
    }
}

// Следим за состоянием авторизации
onAuthStateChanged(auth, async (user) => {
    if (user) {
        // Пользователь уже вошел
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
            currentUserData = userDoc.data();
            currentUser = {
                uid: user.uid,
                ...currentUserData
            };
            
            hideModal('authModal');
            document.getElementById('app').classList.remove('hidden');
            
            updateUserInfo();
            updateMonthDisplay();
            buildCalendar();
            calculateAllStats();
            loadFinancialGoal();
        }
    } else {
        // Пользователь вышел
        currentUser = null;
        currentUserData = null;
        document.getElementById('app').classList.add('hidden');
        showModal('authModal');
        showLoginForm();
    }
});

// ===== СОХРАНЕНИЕ ДАННЫХ В FIRESTORE =====
async function saveUserData() {
    if (!currentUser || !currentUser.uid) return;
    try {
        const userRef = doc(db, "users", currentUser.uid);
        await updateDoc(userRef, {
            fullName: currentUser.fullName || '',
            employeeId: currentUser.employeeId || '',
            cardId: currentUser.cardId || '',
            email: currentUser.email || '',
            avatar: currentUser.avatar || '',
            records: currentUser.records || [],
            quickSalaries: currentUser.quickSalaries || [],
            financialGoal: currentUser.financialGoal || null,
            settings: currentUser.settings || {},
            lastUpdated: new Date().toISOString()
        });
        console.log("Data saved to Firebase");
    } catch (error) {
        console.error("Error saving user data:", error);
    }
}

function updateUserInfo() {
    if (!currentUser) return;
    
    document.getElementById('userName').textContent = currentUser.name || 'Пользователь';
    document.getElementById('profileName').textContent = currentUser.name || 'Пользователь';
    
    let avatarUrl = currentUser.avatar || getAvatarUrl(currentUser.name || 'User');
    document.getElementById('avatarPreview').src = avatarUrl;
    document.getElementById('profileAvatar').src = avatarUrl;
    
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
}

function updateMonthDisplay() {
    const monthNames = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
                        'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];
    
    let currentMonthEl = document.getElementById('currentMonth');
    if (currentMonthEl) currentMonthEl.innerText = monthNames[currentMonth] + ' ' + currentYear;
    
    let calendarMonthEl = document.getElementById('calendarMonth');
    if (calendarMonthEl) calendarMonthEl.innerText = monthNames[currentMonth] + ' ' + currentYear;
    
    let monthSelect = document.getElementById('monthSelect');
    let yearSelect = document.getElementById('yearSelect');
    if (monthSelect) monthSelect.value = currentMonth;
    if (yearSelect) yearSelect.value = currentYear;
    
    let calendarMonthSelect = document.getElementById('calendarMonthSelect');
    let calendarYearSelect = document.getElementById('calendarYearSelect');
    if (calendarMonthSelect) calendarMonthSelect.value = currentMonth;
    if (calendarYearSelect) calendarYearSelect.value = currentYear;
    
    let financeMonthEl = document.getElementById('financeMonth');
    if (financeMonthEl) financeMonthEl.innerText = monthNames[currentMonth] + ' ' + currentYear;
}

// ===== НАВИГАЦИЯ =====
function setView(id) {
    document.querySelectorAll(".view").forEach(v => v.classList.remove("active"));
    document.querySelectorAll(".nav-btn").forEach(b => b.classList.remove("active"));
    document.getElementById(id).classList.add("active");
    if (event) event.currentTarget.classList.add("active");
    if (id === 'calendar') buildCalendar();
    if (id === 'stats') loadYearStats();
    if (id === 'finance') {
        updateFinanceStats();
        loadFinancialGoal();
    }
}

// ===== ФУНКЦИИ КАЛЕНДАРЯ =====
function changeMonth(delta) {
    if (typeof delta === 'number') {
        currentMonth += delta;
    } else {
        let monthSelect = document.getElementById('monthSelect');
        let yearSelect = document.getElementById('yearSelect');
        if (monthSelect && yearSelect) {
            currentMonth = parseInt(monthSelect.value);
            currentYear = parseInt(yearSelect.value);
        }
    }
    
    if (currentMonth < 0) { currentMonth = 11; currentYear--; }
    if (currentMonth > 11) { currentMonth = 0; currentYear++; }
    
    updateMonthDisplay();
    buildCalendar();
    calculateAllStats();
}

function changeMonthFromSelect() {
    let monthSelect = document.getElementById('calendarMonthSelect');
    let yearSelect = document.getElementById('calendarYearSelect');
    
    if (monthSelect && yearSelect) {
        currentMonth = parseInt(monthSelect.value);
        currentYear = parseInt(yearSelect.value);
        updateMonthDisplay();
        buildCalendar();
        calculateAllStats();
    }
}

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
        const empty = document.createElement('div');
        empty.className = 'day empty';
        grid.appendChild(empty);
    }

    for (let d = 1; d <= daysInMonth; d++) {
        const cell = document.createElement('div');
        const date = new Date(currentYear, currentMonth, d);
        date.setHours(0,0,0,0);
        const isPast = date <= today;

        cell.className = 'day';
        if (!isPast) cell.classList.add('future');
        
        cell.innerHTML = `<span class="day-number">${d}</span><span class="day-icon">📅</span>`;

        if (currentUser && currentUser.records) {
            const dateStr = `${currentYear}-${String(currentMonth+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
            const record = currentUser.records.find(r => r.date === dateStr);
            if (record) {
                cell.classList.add(record.type);
                const iconSpan = cell.querySelector('.day-icon');
                if (iconSpan) {
                    const icons = {
                        work: '💼', night: '🌙', overtime: '⏰', sat: '📆',
                        sun: '☀️', extra: '➕', sick: '🤒', vacation: '🏖️',
                        doctor: '🩺', off: '❌'
                    };
                    iconSpan.textContent = icons[record.type] || '📅';
                }
            }
        }

        if (isPast) {
            cell.onclick = () => openDayModal(d);
        }

        grid.appendChild(cell);
    }
}

function openDayModal(day) {
    selectedDay = day;
    showModal('dayModal');
}

function closeModal() {
    hideModal('dayModal');
    selectedDay = null;
}

async function addRecord(type) {
    if (!currentUser || !selectedDay) return;
    
    const dateStr = `${currentYear}-${String(currentMonth+1).padStart(2,'0')}-${String(selectedDay).padStart(2,'0')}`;
    
    if (!currentUser.records) currentUser.records = [];
    
    // Проверяем, была ли запись раньше
    const oldRecord = currentUser.records.find(r => r.date === dateStr);
    
    // Обновляем счетчики использованных дней
    if (oldRecord) {
        if (oldRecord.type === 'doctor') {
            currentUser.settings.usedPersonalDoctor = (currentUser.settings.usedPersonalDoctor || 0) - 1;
        }
        if (oldRecord.type === 'sat' || oldRecord.type === 'sun') {
            currentUser.settings.usedWeekends = (currentUser.settings.usedWeekends || 0) - 1;
        }
    }
    
    // Удаляем старую запись
    currentUser.records = currentUser.records.filter(r => r.date !== dateStr);
    
    // Добавляем новую, если не выходной
    if (type !== 'off') {
        currentUser.records.push({
            date: dateStr,
            type: type,
            hours: 7.5
        });
        
        if (type === 'doctor') {
            currentUser.settings.usedPersonalDoctor = (currentUser.settings.usedPersonalDoctor || 0) + 1;
        }
        if (type === 'sat' || type === 'sun') {
            currentUser.settings.usedWeekends = (currentUser.settings.usedWeekends || 0) + 1;
        }
    }
    
    // Сохраняем в Firebase
    await saveUserData();
    
    closeModal();
    buildCalendar();
    calculateAllStats();
}

// ===== РАСЧЁТ ЗАРАБОТКА ЗА ДЕНЬ =====
function calculateDayEarnings(record, rate, settings) {
    let hours = record.hours || 7.5;
    switch(record.type) {
        case 'night':
            return hours * rate * (1 + (settings?.nightBonus || NIGHT_BONUS_PERCENT) / 100);
        case 'overtime':
            return hours * rate * 1.5;
        case 'sat':
            return hours * rate * 1.5 + SATURDAY_BONUS;
        case 'sun':
            return hours * rate * 2.0;
        case 'extra':
            return (hours / 2) * rate * 1.36;
        case 'sick':
            return hours * rate * 0.6;
        case 'vacation':
        case 'doctor':
        case 'work':
        default:
            return hours * rate;
    }
}

// ===== РАСЧЁТ НАЛОГОВ =====
function calculateTaxes(gross) {
    let social = gross * SOCIAL_RATE;
    let health = gross * HEALTH_RATE;
    let taxable = Math.max(gross - social - health - NON_TAXABLE, 0);
    let tax = taxable * TAX_RATE;
    return { social, health, tax, total: social + health + tax };
}

// ===== РАСЧЁТ ДЛЯ ДАШБОРДА =====
function calculateDashboardStats() {
    if (!currentUser) return;
    
    let today = new Date(); today.setHours(0,0,0,0);
    let monthly = currentUser.records?.filter(r => {
        let d = new Date(r.date); d.setHours(0,0,0,0);
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
    
    let taxes = calculateTaxes(stats.gross);
    let net = stats.gross - taxes.total;
    
    document.getElementById("gross").innerText = stats.gross.toFixed(2) + ' €';
    document.getElementById("net").innerText = net.toFixed(2) + ' €';
    document.getElementById("hoursWorked").innerText = stats.hours;
    document.getElementById("overtimeHours").innerText = stats.overtimeHours;
    document.getElementById("extraCount").innerText = stats.extraBlocks;
    document.getElementById("satCount").innerText = stats.saturdays + stats.sundays;
    document.getElementById("doctorCount").innerText = stats.doctorDays;
    document.getElementById("lunchCost").innerText = lunchCost.toFixed(2) + ' €';
    
    return { gross: stats.gross, net, lunchCost, taxes: taxes.total };
}

// ===== СТАТИСТИКА ВЫХОДНЫХ =====
function updateWeekendStats() {
    if (!currentUser) return;
    
    let today = new Date(); today.setHours(0,0,0,0);
    let daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    let weekendsThisMonth = 0;
    for (let d = 1; d <= daysInMonth; d++) {
        let date = new Date(currentYear, currentMonth, d); date.setHours(0,0,0,0);
        let dayOfWeek = date.getDay();
        if ((dayOfWeek === 0 || dayOfWeek === 6) && date <= today) weekendsThisMonth++;
    }
    document.getElementById('weekendsThisMonth').innerText = weekendsThisMonth;
    
    let joinDate = new Date(currentUser.joinDate || Date.now()); joinDate.setHours(0,0,0,0);
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

// ===== БЫСТРЫЙ ВВОД ЗАРПЛАТЫ =====
async function quickAddSalary() {
    if (!currentUser) return;
    let gross = parseFloat(document.getElementById('quickGross').value);
    let net = parseFloat(document.getElementById('quickNet').value);
    if (isNaN(gross) || isNaN(net)) return showMessage('Введите оба значения!', true);
    if (!currentUser.quickSalaries) currentUser.quickSalaries = [];
    let existingIndex = currentUser.quickSalaries.findIndex(s => s.month === currentMonth && s.year === currentYear);
    if (existingIndex !== -1) {
        currentUser.quickSalaries[existingIndex] = { month: currentMonth, year: currentYear, gross, net, date: new Date().toISOString() };
        showMessage('Зарплата обновлена!');
    } else {
        currentUser.quickSalaries.push({ month: currentMonth, year: currentYear, gross, net, date: new Date().toISOString() });
        showMessage('Зарплата сохранена!');
    }
    await saveUserData();
    document.getElementById('quickGross').value = '';
    document.getElementById('quickNet').value = '';
    calculateAllStats();
}

async function clearQuickSalary() {
    if (!currentUser) return;
    if (!currentUser.quickSalaries) currentUser.quickSalaries = [];
    currentUser.quickSalaries = currentUser.quickSalaries.filter(s => !(s.month === currentMonth && s.year === currentYear));
    await saveUserData();
    showMessage('Зарплата за этот месяц удалена!');
    calculateAllStats();
}

// ===== ФИНАНСЫ =====
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
        'Откладывай минимум 10% от зарплаты',
        'Используй надчасы для дополнительного дохода',
        'Субботние смены приносят +25€ бонуса',
        'Ночные смены оплачиваются на 20% выше',
        'Следи за количеством перепусток',
        'Поставь финансовую цель и следи за прогрессом',
        'Даже 10% от зарплаты — это большой шаг к цели'
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
            labels: ['Чистый доход', 'Налоги', 'Обеды', 'Сбережения'],
            datasets: [{
                data: [net, tax, lunch, savings],
                backgroundColor: ['#00b060', '#f59e0b', '#ef4444', '#8b5cf6'],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true, maintainAspectRatio: true, cutout: '70%',
            plugins: { legend: { position: 'bottom', labels: { color: '#fff' } } }
        }
    });
}

// ===== ФИНАНСОВЫЕ ЦЕЛИ =====
function loadFinancialGoal() {
    if (!currentUser) return;
    
    let goal = currentUser.financialGoal;
    let goalProgress = document.getElementById('goalProgress');
    let goalInputs = document.querySelector('.goal-inputs');
    let goalActions = document.getElementById('goalActions');
    
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
    
    let goal = currentUser.financialGoal;
    
    document.getElementById('goalSaved').innerText = goal.saved.toFixed(2) + ' €';
    document.getElementById('goalTarget').innerText = goal.amount.toFixed(2) + ' €';
    
    let remaining = Math.max(goal.amount - goal.saved, 0);
    document.getElementById('goalRemaining').innerText = remaining.toFixed(2) + ' €';
    
    let percent = Math.min((goal.saved / goal.amount) * 100, 100);
    document.getElementById('goalPercent').innerText = percent.toFixed(1) + '%';
    document.getElementById('goalProgressBar').style.width = percent + '%';
    
    updateHistoryList();
}

async function addToGoal() {
    if (!currentUser || !currentUser.financialGoal) return;
    
    let amount = parseFloat(prompt('Сколько добавить к цели? (€)', '100'));
    if (isNaN(amount) || amount <= 0) return showMessage('Введи корректную сумму!', true);
    
    currentUser.financialGoal.saved += amount;
    
    if (!currentUser.financialGoal.history) currentUser.financialGoal.history = [];
    currentUser.financialGoal.history.push({
        type: 'add',
        amount: amount,
        date: new Date().toLocaleString(),
        balance: currentUser.financialGoal.saved
    });
    
    await saveUserData();
    updateGoalDisplay();
    showMessage(`✅ Добавлено ${amount.toFixed(2)} € к цели`);
}

async function withdrawFromGoal() {
    if (!currentUser || !currentUser.financialGoal) return;
    
    let amount = parseFloat(prompt('Сколько снять с цели? (€)', '50'));
    if (isNaN(amount) || amount <= 0) return showMessage('Введи корректную сумму!', true);
    
    if (amount > currentUser.financialGoal.saved) {
        return showMessage('Недостаточно средств!', true);
    }
    
    currentUser.financialGoal.saved -= amount;
    
    if (!currentUser.financialGoal.history) currentUser.financialGoal.history = [];
    currentUser.financialGoal.history.push({
        type: 'withdraw',
        amount: amount,
        date: new Date().toLocaleString(),
        balance: currentUser.financialGoal.saved
    });
    
    await saveUserData();
    updateGoalDisplay();
    showMessage(`💰 Снято ${amount.toFixed(2)} € с цели`);
}

function updateHistoryList() {
    let historyList = document.getElementById('goalHistory');
    if (!historyList || !currentUser?.financialGoal?.history) return;
    
    let history = currentUser.financialGoal.history;
    let html = '';
    
    history.slice().reverse().slice(0, 10).forEach(item => {
        let icon = item.type === 'add' ? '➕' : '➖';
        let color = item.type === 'add' ? '#00b060' : '#ef4444';
        html += `
            <div class="history-item">
                <span>${icon} ${item.date}</span>
                <span style="color: ${color}; font-weight: 700;">${item.type === 'add' ? '+' : '-'}${item.amount.toFixed(2)} €</span>
                <span style="color: #94a3b8;">(баланс: ${item.balance.toFixed(2)} €)</span>
            </div>
        `;
    });
    
    if (html === '') {
        html = '<div class="history-item" style="color: #94a3b8; text-align: center;">История пуста</div>';
    }
    
    historyList.innerHTML = html;
}

async function saveGoal() {
    if (!currentUser) return;
    
    let name = document.getElementById('goalName').value.trim();
    let amount = parseFloat(document.getElementById('goalAmount').value);
    
    if (!name) return showMessage('Введи название цели!', true);
    if (isNaN(amount) || amount <= 0) return showMessage('Введи корректную сумму цели!', true);
    
    currentUser.financialGoal = {
        name: name,
        amount: amount,
        saved: 0,
        history: [],
        date: new Date().toISOString()
    };
    
    await saveUserData();
    showMessage('Цель сохранена! 🎯');
    loadFinancialGoal();
}

async function clearGoal() {
    if (!currentUser) return;
    
    if (confirm('Удалить финансовую цель?')) {
        currentUser.financialGoal = null;
        await saveUserData();
        showMessage('Цель удалена');
        loadFinancialGoal();
    }
}

// ===== ГОДОВАЯ СТАТИСТИКА =====
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
    let bestMonth = { value: 0, name: '' };
    
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
    
    const monthNames = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
                        'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];
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
    let canvas = document.getElementById("statsChart");
    if (!canvas) return;
    if (statsChart) statsChart.destroy();
    statsChart = new Chart(canvas, {
        type: "bar",
        data: {
            labels: ["Янв","Фев","Мар","Апр","Май","Июн","Июл","Авг","Сен","Окт","Ноя","Дек"],
            datasets: [{
                label: "Доход €",
                data: monthTotals,
                backgroundColor: "rgba(0, 176, 96, 0.7)",
                borderColor: "#00b060",
                borderWidth: 1,
                borderRadius: 8
            }]
        },
        options: {
            responsive: true, maintainAspectRatio: true,
            plugins: { legend: { labels: { color: '#fff' } } },
            scales: {
                y: { grid: { color: '#334155' }, ticks: { color: '#94a3b8' } },
                x: { grid: { display: false }, ticks: { color: '#94a3b8' } }
            }
        }
    });
}

// ===== ПРОФИЛЬ =====
function previewAvatar(input) {
    if (input.files && input.files[0]) {
        let reader = new FileReader();
        reader.onload = function(e) {
            document.getElementById('avatarPreview').src = e.target.result;
            document.getElementById('profileAvatar').src = e.target.result;
            if (currentUser) currentUser.avatar = e.target.result;
            saveUserData();
        };
        reader.readAsDataURL(input.files[0]);
    }
}

async function saveProfile() {
    if (!currentUser) return;
    
    currentUser.fullName = document.getElementById("fullName").value;
    currentUser.employeeId = document.getElementById("employeeId").value;
    currentUser.cardId = document.getElementById("cardId").value;
    currentUser.email = document.getElementById("email").value;
    
    if (!currentUser.settings) currentUser.settings = {};
    currentUser.settings.hourlyRate = parseFloat(document.getElementById("hourlyRate").value) || BASE_RATE;
    currentUser.settings.lunchCost = parseFloat(document.getElementById("lunchCost").value) || LUNCH_COST_REAL;
    currentUser.settings.nightBonus = parseFloat(document.getElementById("nightBonus").value) || NIGHT_BONUS_PERCENT;
    currentUser.settings.saturdayBonus = parseFloat(document.getElementById("saturdayBonus").value) || 1.5;
    currentUser.settings.sundayBonus = parseFloat(document.getElementById("sundayBonus").value) || 2.0;
    currentUser.settings.extraBonus = parseFloat(document.getElementById("extraBonus").value) || 25;
    currentUser.settings.personalDoctorDays = parseInt(document.getElementById("personalDoctorDays").value) || 7;
    currentUser.settings.accompanyDoctorDays = parseInt(document.getElementById("accompanyDoctorDays").value) || 6;
    currentUser.settings.usedPersonalDoctor = parseInt(document.getElementById("usedPersonalDoctor").value) || 0;
    currentUser.settings.usedAccompanyDoctor = parseInt(document.getElementById("usedAccompanyDoctor").value) || 0;
    currentUser.settings.usedWeekends = parseInt(document.getElementById("usedWeekends").value) || 0;
    
    await saveUserData();
    showMessage('Профиль сохранен!');
    calculateAllStats();
}

// ===== ЭКСПОРТ =====
function exportData() {
    if (!currentUser) return;
    let data = {
        user: currentUser.name,
        records: currentUser.records,
        quickSalaries: currentUser.quickSalaries,
        financialGoal: currentUser.financialGoal,
        settings: currentUser.settings,
        exported: new Date().toISOString()
    };
    let blob = new Blob([JSON.stringify(data, null, 2)], {type: 'application/json'});
    let url = URL.createObjectURL(blob);
    let a = document.createElement('a');
    a.href = url;
    a.download = `vaillant_${currentUser.name}_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
}

// ===== ГРАФИК НА ДАШБОРДЕ =====
function buildYearChart() {
    let canvas = document.getElementById("yearChart");
    if (!canvas || !currentUser) return;
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
    yearChart = new Chart(document.getElementById("yearChart"), {
        type: "line",
        data: {
            labels: ["Янв","Фев","Мар","Апр","Май","Июн","Июл","Авг","Сен","Окт","Ноя","Дек"],
            datasets: [{
                label: "Доход €",
                data: months,
                borderColor: "#00b060",
                backgroundColor: "rgba(0,176,96,0.15)",
                fill: true,
                tension: 0.4,
                pointBackgroundColor: "#00b060",
                pointBorderColor: "#fff",
                pointRadius: 4,
                pointHoverRadius: 6
            }]
        },
        options: {
            responsive: true, maintainAspectRatio: true,
            plugins: { legend: { labels: { color: '#fff' } } },
            scales: {
                y: { grid: { color: '#334155' }, ticks: { color: '#94a3b8' } },
                x: { grid: { display: false }, ticks: { color: '#94a3b8' } }
            }
        }
    });
}

// ===== ОЧИСТКА ВСЕХ ДАННЫХ =====
async function clearAllData() {
    if (!currentUser) return;
    if (confirm('⚠️ Это удалит ВСЕ записи о работе и зарплате! Продолжить?')) {
        currentUser.records = [];
        currentUser.quickSalaries = [];
        currentUser.financialGoal = null;
        currentUser.settings.usedPersonalDoctor = 0;
        currentUser.settings.usedAccompanyDoctor = 0;
        currentUser.settings.usedWeekends = 0;
        await saveUserData();
        buildCalendar();
        calculateAllStats();
        loadFinancialGoal();
        showMessage('Все данные очищены! Можно начинать заново.');
    }
}

// ===== ОБЩИЙ РАСЧЁТ =====
function calculateAllStats() {
    calculateDashboardStats();
    updateWeekendStats();
    buildYearChart();
    updateFinanceStats();
}

// ===== ИНИЦИАЛИЗАЦИЯ =====
window.onload = function() {
    hideModal('dayModal');
    hideModal('authModal');
    setLanguage(currentLanguage);
    
    setTimeout(() => {
        let profileActions = document.querySelector('.profile-actions');
        if (profileActions && !document.getElementById('clearAllDataBtn')) {
            let clearBtn = document.createElement('button');
            clearBtn.id = 'clearAllDataBtn';
            clearBtn.className = 'btn-danger';
            clearBtn.innerHTML = '<i class="fas fa-trash"></i> Очистить все данные';
            clearBtn.onclick = clearAllData;
            profileActions.appendChild(clearBtn);
        }
    }, 500);
    
    // Не проверяем localStorage, Firebase сам восстановит сессию
    showModal('authModal');
    showLoginForm();
};

// Делаем функции доступными глобально
window.showLoginForm = showLoginForm;
window.showRegisterForm = showRegisterForm;
window.login = login;
window.register = register;
window.logout = logout;
window.setView = setView;
window.changeMonth = changeMonth;
window.changeMonthFromSelect = changeMonthFromSelect;
window.addRecord = addRecord;
window.closeModal = closeModal;
window.quickAddSalary = quickAddSalary;
window.clearQuickSalary = clearQuickSalary;
window.saveProfile = saveProfile;
window.previewAvatar = previewAvatar;
window.exportData = exportData;
window.setLanguage = setLanguage;
window.addToGoal = addToGoal;
window.withdrawFromGoal = withdrawFromGoal;
window.saveGoal = saveGoal;
window.clearGoal = clearGoal;
window.loadYearStats = loadYearStats;
window.clearAllData = clearAllData;


