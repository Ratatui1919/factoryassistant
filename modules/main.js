// modules/main.js - ГЛАВНЫЙ ФАЙЛ

import { auth, onAuthStateChanged, doc, getDoc } from './firebase-config.js';
import { setLanguage, showModal, hideModal, showNotification } from './utils.js';
import { loadUserDataToUI } from './auth.js';
import { loadFinancialGoal } from './finance.js';

// Глобальные переменные
window.currentUser = null;
window.currentUserData = null;
window.currentMonth = new Date().getMonth();
window.currentYear = new Date().getFullYear();

// Инициализация приложения
export function initApp(user, userData) {
    console.log('initApp вызван с данными:', user, userData);
    
    window.currentUser = user;
    window.currentUserData = userData;
    
    // Загружаем данные пользователя в UI
    if (loadUserDataToUI) {
        loadUserDataToUI();
    }
    
    // Загружаем финансовую цель
    if (loadFinancialGoal) {
        setTimeout(() => loadFinancialGoal(), 100);
    }
    
    // Обновляем отображение
    if (window.updateMonthDisplay) window.updateMonthDisplay();
    if (window.buildCalendar) window.buildCalendar();
    if (window.calculateAllStats) window.calculateAllStats();
    
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
    console.log('onAuthStateChanged:', user);
    
    if (user) {
        window.updateLoadingStatus('Загрузка данных...');
        try {
            const userDoc = await getDoc(doc(db, "users", user.uid));
            if (userDoc.exists()) {
                const userData = userDoc.data();
                console.log('Данные пользователя из Firebase:', userData);
                
                window.currentUser = { uid: user.uid, ...userData };
                window.currentUserData = userData;
                
                hidePreloader();
                document.getElementById('app').classList.remove('hidden');
                
                // Загружаем данные в UI
                if (loadUserDataToUI) {
                    loadUserDataToUI();
                }
                
                // Загружаем финансовую цель
                if (loadFinancialGoal) {
                    setTimeout(() => loadFinancialGoal(), 200);
                }
                
                // Устанавливаем тему
                if (window.setTheme) window.setTheme(userData.theme || 'dark');
                
                // Инициализируем
                initApp(window.currentUser, userData);
            } else {
                console.log('Документ пользователя не найден');
                hidePreloader();
                showModal('authModal');
                window.showLoginForm();
            }
        } catch (error) {
            console.error('Ошибка загрузки данных:', error);
            hidePreloader();
            showModal('authModal');
            window.showLoginForm();
        }
    } else {
        console.log('Пользователь не авторизован');
        hidePreloader();
        document.getElementById('app').classList.add('hidden');
        showModal('authModal');
        window.showLoginForm();
    }
});

// Загрузка страницы
window.addEventListener('load', function() {
    console.log('Страница загружена');
    
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
        const loginEmail = document.getElementById('loginEmail');
        const loginPass = document.getElementById('loginPass');
        const rememberMe = document.getElementById('rememberMe');
        if (loginEmail) loginEmail.value = rememberedEmail;
        if (loginPass) loginPass.value = rememberedPass;
        if (rememberMe) rememberMe.checked = true;
    }
});

// Переключение вкладок
window.setView = function(view) {
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    const viewElement = document.getElementById(view);
    if (viewElement) viewElement.classList.add('active');
    
    const navBtn = document.querySelector(`.nav-btn[data-view="${view}"]`);
    if (navBtn) navBtn.classList.add('active');
    
    const mainNav = document.getElementById('mainNav');
    if (mainNav) mainNav.classList.remove('active');
    
    // Обновляем контент вкладки
    if (view === 'calendar' && window.buildCalendar) {
        setTimeout(() => window.buildCalendar(), 50);
    }
    if (view === 'stats' && window.loadYearStats) {
        setTimeout(() => window.loadYearStats(), 50);
    }
    if (view === 'finance' && window.updateFinanceStats) {
        setTimeout(() => window.updateFinanceStats(), 50);
        setTimeout(() => {
            if (loadFinancialGoal) loadFinancialGoal();
        }, 100);
    }
    if (view === 'dashboard' && window.buildYearChart) {
        setTimeout(() => window.buildYearChart(), 100);
    }
};

// Бургер-меню
window.toggleMobileMenu = function() {
    const nav = document.getElementById('mainNav');
    if (nav) nav.classList.toggle('active');
};

// Скрыть уведомление
window.hideNotification = function() {
    const notification = document.getElementById('notification');
    if (notification) notification.classList.add('hidden');
};
