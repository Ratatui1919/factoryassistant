// js/main.js - ГЛАВНЫЙ ФАЙЛ

import { auth, onAuthStateChanged, doc, getDoc } from './firebase-config.js';
import { setLanguage, currentLanguage, showModal, hideModal, translatePage, showNotification } from './utils.js';
import { getCurrentUser, getUserData } from './auth.js';

// Глобальные переменные
window.currentUser = null;
window.currentUserData = null;
window.currentMonth = new Date().getMonth();
window.currentYear = new Date().getFullYear();

// Инициализация приложения
export function initApp(user, userData) {
    window.currentUser = user;
    window.currentUserData = userData;
    
    // Обновляем отображение
    if (window.updateMonthDisplay) window.updateMonthDisplay();
    if (window.buildCalendar) window.buildCalendar();
    if (window.calculateAllStats) window.calculateAllStats();
    if (window.loadFinancialGoal) window.loadFinancialGoal();
    
    // Запускаем время
    if (window.updateDateTime) window.updateDateTime();
    if (window.updateWeather) window.updateWeather();
    if (window.updateFinancialTip) window.updateFinancialTip();
    if (window.updateExchangeRate) window.updateExchangeRate();
}

// Скрыть прелоадер
function hidePreloader() {
    const preloader = document.getElementById('preloader');
    if (preloader) {
        preloader.style.opacity = '0';
        setTimeout(() => {
            preloader.style.display = 'none';
        }, 300);
    }
}

// Обновить статус загрузки
window.updateLoadingStatus = function(text) {
    const statusEl = document.getElementById('loadingStatus');
    if (statusEl) statusEl.textContent = text;
};

// Проверка авторизации
onAuthStateChanged(auth, async (user) => {
    if (user) {
        window.updateLoadingStatus('Загрузка данных...');
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
            const userData = userDoc.data();
            window.currentUser = { uid: user.uid, ...userData };
            window.currentUserData = userData;
            
            hidePreloader();
            document.getElementById('app').classList.remove('hidden');
            
            // Загружаем данные в UI
            if (window.loadUserDataToUI) window.loadUserDataToUI();
            
            // Устанавливаем тему
            if (window.setTheme) window.setTheme(userData.theme || 'dark');
            
            // Инициализируем
            initApp(window.currentUser, userData);
        }
    } else {
        hidePreloader();
        document.getElementById('app').classList.add('hidden');
        showModal('authModal');
        window.showLoginForm();
    }
});

// Загрузка страницы
window.addEventListener('load', function() {
    // Восстанавливаем язык
    const savedLang = localStorage.getItem('vaillant_language') || 'ru';
    setLanguage(savedLang);
    
    // Восстанавливаем тему
    const savedTheme = localStorage.getItem('vaillant_theme') || 'dark';
    if (window.setTheme) window.setTheme(savedTheme);
    
    // Заполняем сохраненные данные входа
    const rememberedEmail = localStorage.getItem('rememberedEmail');
    const rememberedPass = localStorage.getItem('rememberedPass');
    if (rememberedEmail) {
        document.getElementById('loginEmail').value = rememberedEmail;
        document.getElementById('loginPass').value = rememberedPass;
        document.getElementById('rememberMe').checked = true;
    }
    
    // Добавляем кнопку очистки данных в профиль
    setTimeout(() => {
        const profileActions = document.querySelector('.profile-actions');
        if (profileActions && !document.getElementById('clearAllDataBtn')) {
            const clearBtn = document.createElement('button');
            clearBtn.id = 'clearAllDataBtn';
            clearBtn.className = 'btn-danger';
            clearBtn.innerHTML = '<i class="fas fa-trash"></i> ' + (translations?.ru?.clearAllData || 'Очистить все данные');
            clearBtn.onclick = window.clearAllData;
            profileActions.appendChild(clearBtn);
        }
    }, 1000);
});

// Переключение вкладок
window.setView = function(view) {
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(view)?.classList.add('active');
    document.querySelector(`.nav-btn[data-view="${view}"]`)?.classList.add('active');
    
    document.getElementById('mainNav')?.classList.remove('active');
    
    // Обновляем контент вкладки
    if (view === 'calendar' && window.buildCalendar) window.buildCalendar();
    if (view === 'stats' && window.loadYearStats) window.loadYearStats();
    if (view === 'finance' && window.updateFinanceStats) window.updateFinanceStats();
    if (view === 'dashboard' && window.buildYearChart) setTimeout(() => window.buildYearChart(), 100);
};

// Бургер-меню
window.toggleMobileMenu = function() {
    document.getElementById('mainNav').classList.toggle('active');
};

// Скрыть уведомление
window.hideNotification = function() {
    document.getElementById('notification')?.classList.add('hidden');
};
