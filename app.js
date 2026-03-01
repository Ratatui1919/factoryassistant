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
let currentView = 'dashboard';

// Функция показа сообщений
function showMessage(msg, isError = false) {
  alert(isError ? '❌ ' + msg : '✅ ' + msg);
}

// Данные для теста (можно заменить на реальные из Firebase)
const testData = {
  net: 1250.50,
  gross: 1540.30,
  hours: 168,
  lunchCost: 45.50,
  overtimeHours: 12,
  extraCount: 4,
  satCount: 2,
  doctorCount: 1
};

// Демонстрация всех функций
function showFullVersion() {
  const now = new Date();
  const timeStr = now.toLocaleTimeString().slice(0,5);
  const dateStr = now.toLocaleDateString('ru-RU', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  
  document.getElementById('main').innerHTML = `
    <div style="background: #121620; padding: 30px; border-radius: 30px;">
      <!-- Приветствие и дата -->
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px;">
        <div>
          <h2 style="color: #00b060; margin: 0;">Добрый вечер, Тестовый!</h2>
          <p style="color: #a0a8b8;">${dateStr}</p>
        </div>
        <div style="display: flex; gap: 20px;">
          <div style="background: #1a1e2a; padding: 10px 20px; border-radius: 40px;">
            <span>⏰ ${timeStr}</span>
          </div>
          <div style="background: #1a1e2a; padding: 10px 20px; border-radius: 40px;">
            <span>🌧️ 6°C</span>
          </div>
          <div style="background: #1a1e2a; padding: 10px 20px; border-radius: 40px;">
            <span>💰 42.5 UAH/€</span>
          </div>
        </div>
      </div>

      <!-- KPI Карточки -->
      <h3 style="color: #00b060; margin: 20px 0;">Дашборд</h3>
      <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px;">
        <div style="background: linear-gradient(135deg, #00b060, #009048); padding: 20px; border-radius: 20px;">
          <span style="color: rgba(255,255,255,0.7);">Чистая зарплата</span>
          <h2>€${testData.net}</h2>
        </div>
        <div style="background: #1a1e2a; padding: 20px; border-radius: 20px;">
          <span style="color: #a0a8b8;">Грязная</span>
          <h2>€${testData.gross}</h2>
        </div>
        <div style="background: #1a1e2a; padding: 20px; border-radius: 20px;">
          <span style="color: #a0a8b8;">Часов</span>
          <h2>${testData.hours}</h2>
        </div>
        <div style="background: #1a1e2a; padding: 20px; border-radius: 20px;">
          <span style="color: #a0a8b8;">Обеды</span>
          <h2>€${testData.lunchCost}</h2>
        </div>
      </div>

      <!-- Дополнительные карточки -->
      <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-top: 20px;">
        <div style="background: #f59e0b; padding: 20px; border-radius: 20px;">
          <span style="color: white;">Переработки</span>
          <h2>${testData.overtimeHours}ч</h2>
        </div>
        <div style="background: #10b981; padding: 20px; border-radius: 20px;">
          <span style="color: white;">Надчасы</span>
          <h2>${testData.extraCount}</h2>
        </div>
        <div style="background: #1a1e2a; padding: 20px; border-radius: 20px;">
          <span style="color: #a0a8b8;">Субботы</span>
          <h2>${testData.satCount}</h2>
        </div>
        <div style="background: #1a1e2a; padding: 20px; border-radius: 20px;">
          <span style="color: #a0a8b8;">Перепустки</span>
          <h2>${testData.doctorCount}</h2>
        </div>
      </div>

      <!-- Прогноз усталости -->
      <div style="background: #1a1e2a; padding: 20px; border-radius: 20px; margin: 20px 0;">
        <h4 style="color: #00b060;">Прогноз усталости</h4>
        <div style="display: flex; align-items: center; gap: 20px;">
          <span>5 дней подряд</span>
          <div style="flex: 1; height: 10px; background: #2a303c; border-radius: 5px;">
            <div style="width: 75%; height: 100%; background: #f59e0b; border-radius: 5px;"></div>
          </div>
          <span style="color: #f59e0b;">Высокая</span>
        </div>
      </div>

      <!-- Календарь (упрощённый) -->
      <h3 style="color: #00b060; margin: 20px 0;">Март 2026</h3>
      <div style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 10px; background: #1a1e2a; padding: 20px; border-radius: 20px;">
        ${['Пн','Вт','Ср','Чт','Пт','Сб','Вс'].map(d => 
          `<div style="text-align: center; font-weight: bold; color: #00b060;">${d}</div>`
        ).join('')}
        ${[...Array(31)].map((_, i) => 
          `<div style="background: #2a303c; padding: 15px; text-align: center; border-radius: 12px;">${i+1}</div>`
        ).join('')}
      </div>

      <!-- Финансовый совет -->
      <div style="background: linear-gradient(135deg, #00b060, #009048); padding: 20px; border-radius: 20px; margin: 20px 0;">
        <h4>💡 Финансовый совет</h4>
        <p>Откладывай минимум 10% от зарплаты — это основа финансовой безопасности</p>
      </div>

      <!-- Кнопка для демонстрации погодных эффектов -->
      <button onclick="toggleWeather()" style="background: #1a1e2a; color: white; border: 1px solid #00b060; padding: 15px; border-radius: 12px; width: 100%; margin: 10px 0; cursor: pointer;">
        🌨️ Включить погодные эффекты
      </button>
    </div>
  `;
}

// Погодные эффекты
function toggleWeather() {
  if (document.getElementById('weather-canvas')) {
    document.getElementById('weather-canvas').remove();
    return;
  }
  
  const canvas = document.createElement('canvas');
  canvas.id = 'weather-canvas';
  canvas.style.position = 'fixed';
  canvas.style.top = '0';
  canvas.style.left = '0';
  canvas.style.width = '100%';
  canvas.style.height = '100%';
  canvas.style.pointerEvents = 'none';
  canvas.style.zIndex = '9999';
  document.body.appendChild(canvas);
  
  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  
  let particles = [];
  for (let i = 0; i < 100; i++) {
    particles.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: Math.random() * 3 + 1,
      speed: Math.random() * 3 + 2
    });
  }
  
  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    
    particles.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
      
      p.y += p.speed;
      if (p.y > canvas.height) {
        p.y = 0;
        p.x = Math.random() * canvas.width;
      }
    });
    
    requestAnimationFrame(animate);
  }
  
  animate();
}

// Навигация
window.showDashboard = showFullVersion;
window.toggleWeather = toggleWeather;

// Рисуем интерфейс
document.body.innerHTML = `
  <div style="font-family: 'Inter', sans-serif; max-width: 1400px; margin: 0 auto; padding: 20px;">
    <!-- Шапка -->
    <header style="display: flex; justify-content: space-between; align-items: center; background: #121620; padding: 20px; border-radius: 20px; margin-bottom: 30px;">
      <div style="display: flex; align-items: center; gap: 20px;">
        <img src="assets/vaillant-logo.png" style="height: 40px;" onerror="this.style.display='none'">
        <h1 style="color: #00b060;">Assistant</h1>
        <span style="background: #00b060; padding: 4px 12px; border-radius: 30px; font-size: 12px;">FACTORY PRO</span>
      </div>
      <div>
        <span style="background: #1a1e2a; padding: 10px 20px; border-radius: 40px;">
          Тестовый пользователь
        </span>
      </div>
    </header>

    <!-- Навигация -->
    <nav style="display: flex; gap: 10px; background: #121620; padding: 15px; border-radius: 50px; margin-bottom: 30px;">
      <button onclick="showDashboard()" style="flex:1; padding: 10px; background: #00b060; color: white; border: none; border-radius: 30px;">Дашборд</button>
      <button onclick="showDashboard()" style="flex:1; padding: 10px; background: transparent; color: #a0a8b8; border: none; border-radius: 30px;">Календарь</button>
      <button onclick="showDashboard()" style="flex:1; padding: 10px; background: transparent; color: #a0a8b8; border: none; border-radius: 30px;">Статистика</button>
      <button onclick="showDashboard()" style="flex:1; padding: 10px; background: transparent; color: #a0a8b8; border: none; border-radius: 30px;">Профиль</button>
      <button onclick="showDashboard()" style="flex:1; padding: 10px; background: transparent; color: #a0a8b8; border: none; border-radius: 30px;">Финансы</button>
    </nav>

    <!-- Контент -->
    <main id="main"></main>
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
    color: white;
  }
  button {
    cursor: pointer;
    transition: all 0.3s;
  }
  button:hover {
    transform: translateY(-2px);
  }
  h1, h2, h3, h4 {
    margin: 0;
  }
`;
document.head.appendChild(style);

// Показываем дашборд
showFullVersion();

console.log('✅ Полная версия с демонстрацией загружена');
