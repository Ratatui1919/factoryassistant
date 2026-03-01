import { auth, db } from './firebase-config.js';
import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
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
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { 
  getFirestore 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// ===== ДАННЫЕ =====
let currentUser = null;
let currentUserData = null;
let currentMonth = new Date().getMonth();
let currentYear = new Date().getFullYear();
let selectedDay = null;
let currentLanguage = localStorage.getItem('vaillant_language') || 'ru';
let currentTheme = localStorage.getItem('vaillant_theme') || 'dark';

// Константы зарплаты
const BASE_RATE = 6.10;
const LUNCH_COST_REAL = 1.31;
const SATURDAY_BONUS = 25;
const NIGHT_BONUS_PERCENT = 20;

// Налоги
const SOCIAL_RATE = 0.094;
const HEALTH_RATE = 0.10;
const TAX_RATE = 0.19;
const NON_TAXABLE = 410;

// ===== ПЕРЕВОДЫ =====
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
    importSuccess: 'Данные успешно импортированы',
    importError: 'Ошибка при обработке PDF',
    chooseFile: 'Выберите файл',
    mon: 'Пн', tue: 'Вт', wed: 'Ср', thu: 'Чт', fri: 'Пт', sat: 'Сб', sun: 'Вс',
    january: 'Январь', february: 'Февраль', march: 'Март', april: 'Апрель',
    may: 'Май', june: 'Июнь', july: 'Июль', august: 'Август',
    september: 'Сентябрь', october: 'Октябрь', november: 'Ноябрь', december: 'Декабрь',
    clearAllData: 'Очистить все данные'
  }
};

// ===== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ =====
function showMessage(msg, isError = false) {
  alert(isError ? '❌ ' + msg : '✅ ' + msg);
}

// ===== СОЗДАЁМ ПОЛНЫЙ ИНТЕРФЕЙС =====
function createFullInterface() {
  const app = document.getElementById('app');
  
  app.innerHTML = `
    <header style="background: #121620; padding: 20px; border-bottom: 1px solid #2a303c;">
      <div style="display: flex; justify-content: space-between; align-items: center; max-width: 1400px; margin: 0 auto;">
        <div style="display: flex; align-items: center; gap: 30px;">
          <div style="display: flex; align-items: center; gap: 10px;">
            <img src="assets/vaillant-logo.png" style="height: 30px;" onerror="this.style.display='none'">
            <h1 style="color: white; font-size: 24px;">Vaillant<span style="color: #00b060;">Assistant</span></h1>
          </div>
          <span style="background: #00b060; padding: 4px 12px; border-radius: 30px; font-size: 12px;">FACTORY PRO</span>
          <div style="display: flex; gap: 5px;">
            <button class="lang-btn" style="background: #1a1e2a; border: 1px solid #2a303c; color: #a0a8b8; padding: 5px 10px; border-radius: 6px;">RU</button>
            <button class="lang-btn" style="background: #1a1e2a; border: 1px solid #2a303c; color: #a0a8b8; padding: 5px 10px; border-radius: 6px;">SK</button>
            <button class="lang-btn" style="background: #1a1e2a; border: 1px solid #2a303c; color: #a0a8b8; padding: 5px 10px; border-radius: 6px;">EN</button>
            <button class="lang-btn" style="background: #1a1e2a; border: 1px solid #2a303c; color: #a0a8b8; padding: 5px 10px; border-radius: 6px;">UA</button>
          </div>
        </div>
        <div style="display: flex; align-items: center; gap: 20px;">
          <div style="background: #1a1e2a; padding: 8px 20px; border-radius: 40px; display: flex; gap: 20px;">
            <span style="color: white;">⏰ ${new Date().toLocaleTimeString().slice(0,5)}</span>
            <span style="color: white;">📅 ${new Date().toLocaleDateString('ru-RU')}</span>
            <span style="color: white;">🌡️ 8°C</span>
          </div>
          <div style="display: flex; align-items: center; gap: 10px; background: #1a1e2a; padding: 5px 15px 5px 5px; border-radius: 40px;">
            <img src="https://ui-avatars.com/api/?name=User&background=00b060&color=fff&size=32" style="width: 32px; height: 32px; border-radius: 50%; border: 2px solid #00b060;">
            <span style="color: white;">Гость</span>
          </div>
        </div>
      </div>
    </header>

    <nav style="background: #121620; padding: 15px; border-bottom: 1px solid #2a303c;">
      <div style="display: flex; gap: 10px; justify-content: center; max-width: 1400px; margin: 0 auto;">
        <button class="nav-btn active" style="padding: 10px 20px; background: #00b060; color: white; border: none; border-radius: 30px;">Дашборд</button>
        <button class="nav-btn" style="padding: 10px 20px; background: transparent; color: #a0a8b8; border: none; border-radius: 30px;">Календарь</button>
        <button class="nav-btn" style="padding: 10px 20px; background: transparent; color: #a0a8b8; border: none; border-radius: 30px;">Статистика</button>
        <button class="nav-btn" style="padding: 10px 20px; background: transparent; color: #a0a8b8; border: none; border-radius: 30px;">Профиль</button>
        <button class="nav-btn" style="padding: 10px 20px; background: transparent; color: #a0a8b8; border: none; border-radius: 30px;">Финансы</button>
      </div>
    </nav>

    <main style="flex: 1; padding: 20px; max-width: 1400px; margin: 0 auto; width: 100%;">
      <!-- ДАШБОРД -->
      <section id="dashboard" style="display: block;">
        <div style="display: flex; align-items: center; justify-content: center; gap: 15px; margin-bottom: 30px; background: #121620; padding: 15px; border-radius: 50px;">
          <button style="width: 40px; height: 40px; background: #1a1e2a; border: 1px solid #2a303c; color: white; border-radius: 50%;">←</button>
          <h2 style="color: #00b060;">${translations.ru.january} ${currentYear}</h2>
          <button style="width: 40px; height: 40px; background: #1a1e2a; border: 1px solid #2a303c; color: white; border-radius: 50%;">→</button>
        </div>

        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-bottom: 30px;">
          <div style="background: linear-gradient(135deg, #00b060, #009048); padding: 20px; border-radius: 20px;">
            <span style="color: rgba(255,255,255,0.7);">Чистая зарплата</span>
            <h2 style="color: white;">0 €</h2>
          </div>
          <div style="background: #121620; padding: 20px; border-radius: 20px; border: 1px solid #2a303c;">
            <span style="color: #a0a8b8;">Грязная</span>
            <h2 style="color: white;">0 €</h2>
          </div>
          <div style="background: #121620; padding: 20px; border-radius: 20px; border: 1px solid #2a303c;">
            <span style="color: #a0a8b8;">Часов</span>
            <h2 style="color: white;">0</h2>
          </div>
          <div style="background: #121620; padding: 20px; border-radius: 20px; border: 1px solid #2a303c;">
            <span style="color: #a0a8b8;">Обеды</span>
            <h2 style="color: white;">0 €</h2>
          </div>
          <div style="background: linear-gradient(135deg, #f59e0b, #d97706); padding: 20px; border-radius: 20px;">
            <span style="color: white;">Переработки</span>
            <h2 style="color: white;">0</h2>
          </div>
          <div style="background: linear-gradient(135deg, #10b981, #059669); padding: 20px; border-radius: 20px;">
            <span style="color: white;">Надчасы</span>
            <h2 style="color: white;">0</h2>
          </div>
          <div style="background: #121620; padding: 20px; border-radius: 20px; border: 1px solid #2a303c;">
            <span style="color: #a0a8b8;">Субботы</span>
            <h2 style="color: white;">0</h2>
          </div>
          <div style="background: #121620; padding: 20px; border-radius: 20px; border: 1px solid #2a303c;">
            <span style="color: #a0a8b8;">Перепустки</span>
            <h2 style="color: white;">0</h2>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin-bottom: 20px;">
          <div style="background: #121620; padding: 15px; border-radius: 16px; border: 1px solid #2a303c;">
            <span style="color: #a0a8b8;">Выходные в этом месяце</span>
            <h3 style="color: white;">0</h3>
          </div>
          <div style="background: #121620; padding: 15px; border-radius: 16px; border: 1px solid #2a303c;">
            <span style="color: #a0a8b8;">Накоплено выходных</span>
            <h3 style="color: white;">0</h3>
          </div>
          <div style="background: #121620; padding: 15px; border-radius: 16px; border: 1px solid #2a303c;">
            <span style="color: #a0a8b8;">Перепустки осталось</span>
            <h3 style="color: white;">7/7</h3>
          </div>
          <div style="background: #121620; padding: 15px; border-radius: 16px; border: 1px solid #2a303c;">
            <span style="color: #a0a8b8;">Сопровождение</span>
            <h3 style="color: white;">6/6</h3>
          </div>
        </div>
      </section>
    </main>
  `;

  // Добавляем стили
  const style = document.createElement('style');
  style.textContent = `
    body {
      margin: 0;
      padding: 0;
      font-family: 'Inter', sans-serif;
      background: #0a0c14;
      color: white;
    }
    #app {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    }
    button {
      cursor: pointer;
      transition: all 0.3s;
    }
    button:hover {
      transform: scale(1.1);
    }
    .nav-btn {
      cursor: pointer;
      transition: all 0.3s;
    }
    .nav-btn:hover {
      background: #1a1e2a;
      color: #00b060;
    }
    .nav-btn.active {
      background: #00b060;
      color: white;
    }
  `;
  document.head.appendChild(style);
}

// Инициализация
document.addEventListener('DOMContentLoaded', () => {
  createFullInterface();
});

console.log('✅ Твой полный интерфейс загружен');
