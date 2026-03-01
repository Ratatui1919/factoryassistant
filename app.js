import { auth, db } from './firebase-config.js';
import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

console.log('✅ Загрузка интерфейса...');

// Простой интерфейс
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
          <span>⏰ 12:34</span>
          <span>📅 1 марта 2026</span>
          <span>☀️ 8°C Trenčín</span>
        </div>
      </div>
    </header>

    <!-- Навигация -->
    <nav style="display: flex; gap: 10px; background: #121620; padding: 15px; border-radius: 50px; margin-bottom: 30px;">
      <button style="padding: 10px 20px; background: #00b060; color: white; border: none; border-radius: 30px;">Дашборд</button>
      <button style="padding: 10px 20px; background: transparent; color: #a0a8b8; border: none; border-radius: 30px;">Календарь</button>
      <button style="padding: 10px 20px; background: transparent; color: #a0a8b8; border: none; border-radius: 30px;">Статистика</button>
      <button style="padding: 10px 20px; background: transparent; color: #a0a8b8; border: none; border-radius: 30px;">Профиль</button>
      <button style="padding: 10px 20px; background: transparent; color: #a0a8b8; border: none; border-radius: 30px;">Финансы</button>
    </nav>

    <!-- Контент -->
    <main style="background: #121620; padding: 30px; border-radius: 30px;">
      <h2 style="color: #00b060;">✅ Интерфейс работает!</h2>
      <p style="color: #a0a8b8;">Можно добавлять остальные функции.</p>
    </main>
  </div>
`;

// Добавим немного стилей
const style = document.createElement('style');
style.textContent = `
  body {
    margin: 0;
    padding: 20px;
    background: #0a0c14;
    color: white;
    font-family: 'Inter', sans-serif;
  }
  button {
    cursor: pointer;
    transition: all 0.3s;
  }
  button:hover {
    transform: translateY(-2px);
  }
`;
document.head.appendChild(style);
