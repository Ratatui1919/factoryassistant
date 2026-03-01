import { auth, db } from './firebase-config.js';
import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { 
  doc, 
  setDoc, 
  getDoc,
  collection,
  query,
  where,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

let currentUser = null;

// Функция показа сообщений
function showMessage(msg, isError = false) {
  alert(isError ? '❌ ' + msg : '✅ ' + msg);
}

// Простой интерфейс дашборда
function showDashboard() {
  document.getElementById('main').innerHTML = `
    <div style="background: #121620; padding: 30px; border-radius: 30px;">
      <h2 style="color: #00b060;">Дашборд</h2>
      <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin: 20px 0;">
        <div style="background: linear-gradient(135deg, #00b060, #009048); padding: 20px; border-radius: 20px;">
          <span style="color: rgba(255,255,255,0.7);">Чистая зарплата</span>
          <h3>0 €</h3>
        </div>
        <div style="background: #1a1e2a; padding: 20px; border-radius: 20px;">
          <span style="color: #a0a8b8;">Грязная</span>
          <h3>0 €</h3>
        </div>
        <div style="background: #1a1e2a; padding: 20px; border-radius: 20px;">
          <span style="color: #a0a8b8;">Часов</span>
          <h3>0</h3>
        </div>
        <div style="background: #1a1e2a; padding: 20px; border-radius: 20px;">
          <span style="color: #a0a8b8;">Обеды</span>
          <h3>0 €</h3>
        </div>
      </div>
      <p style="color: #a0a8b8;">✅ Все системы работают</p>
    </div>
  `;
}

// Простой календарь
function showCalendar() {
  const days = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
  const monthDays = 31;
  let daysHtml = '';
  
  for (let i = 1; i <= monthDays; i++) {
    daysHtml += `<div style="background: #1a1e2a; padding: 15px; text-align: center; border-radius: 12px;">${i}</div>`;
  }
  
  document.getElementById('main').innerHTML = `
    <div style="background: #121620; padding: 30px; border-radius: 30px;">
      <h2 style="color: #00b060;">Март 2026</h2>
      <div style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 10px; margin: 20px 0;">
        ${days.map(d => `<div style="text-align: center; font-weight: bold; color: #00b060;">${d}</div>`).join('')}
        ${daysHtml}
      </div>
    </div>
  `;
}

// Профиль
function showProfile() {
  document.getElementById('main').innerHTML = `
    <div style="background: #121620; padding: 30px; border-radius: 30px;">
      <h2 style="color: #00b060;">Профиль</h2>
      <p style="color: #a0a8b8;">Настройки профиля будут здесь</p>
      <button onclick="showDashboard()" style="background: #00b060; color: white; border: none; padding: 10px 20px; border-radius: 10px; margin: 10px;">Назад</button>
    </div>
  `;
}

// Навигация
window.showDashboard = showDashboard;
window.showCalendar = showCalendar;
window.showProfile = showProfile;

// Рисуем интерфейс
document.body.innerHTML = `
  <div style="font-family: 'Inter', sans-serif; max-width: 1200px; margin: 0 auto; padding: 20px;">
    <!-- Шапка -->
    <header style="display: flex; justify-content: space-between; align-items: center; background: #121620; padding: 20px; border-radius: 20px; margin-bottom: 30px;">
      <div style="display: flex; align-items: center; gap: 20px;">
        <img src="assets/vaillant-logo.png" style="height: 40px;" onerror="this.style.display='none'">
        <h1 style="color: #00b060;">Assistant</h1>
        <span style="background: #00b060; padding: 4px 12px; border-radius: 30px; font-size: 12px;">FACTORY PRO</span>
      </div>
      <div style="display: flex; align-items: center; gap: 15px;">
        <div style="background: #1a1e2a; padding: 10px 20px; border-radius: 40px; display: flex; gap: 20px;">
          <span>⏰ ${new Date().toLocaleTimeString().slice(0,5)}</span>
          <span>📅 ${new Date().toLocaleDateString('ru-RU')}</span>
          <span>☀️ 8°C</span>
        </div>
      </div>
    </header>

    <!-- Навигация -->
    <nav style="display: flex; gap: 10px; background: #121620; padding: 15px; border-radius: 50px; margin-bottom: 30px;">
      <button onclick="showDashboard()" style="flex:1; padding: 10px; background: #00b060; color: white; border: none; border-radius: 30px;">Дашборд</button>
      <button onclick="showCalendar()" style="flex:1; padding: 10px; background: transparent; color: #a0a8b8; border: none; border-radius: 30px;">Календарь</button>
      <button onclick="showDashboard()" style="flex:1; padding: 10px; background: transparent; color: #a0a8b8; border: none; border-radius: 30px;">Статистика</button>
      <button onclick="showProfile()" style="flex:1; padding: 10px; background: transparent; color: #a0a8b8; border: none; border-radius: 30px;">Профиль</button>
      <button onclick="showDashboard()" style="flex:1; padding: 10px; background: transparent; color: #a0a8b8; border: none; border-radius: 30px;">Финансы</button>
    </nav>

    <!-- Контент -->
    <main id="main">
      ${showDashboard()}
    </main>
  </div>
`;

// Добавляем стили
const style = document.createElement('style');
style.textContent = `
  body {
    margin: 0;
    padding: 0;
    background: #0a0c14;
    font-family: 'Inter', sans-serif;
  }
  button {
    cursor: pointer;
    transition: all 0.3s;
  }
  button:hover {
    transform: translateY(-2px);
  }
  .active {
    background: #00b060 !important;
    color: white !important;
  }
`;
document.head.appendChild(style);

console.log('✅ Полная версия загружена');
