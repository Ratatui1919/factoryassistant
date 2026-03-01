// modules/main.js - ГЛАВНЫЙ ФАЙЛ (ИСПРАВЛЕННЫЙ)

import { auth, onAuthStateChanged, doc, getDoc } from './firebase-config.js';
import { setLanguage, showModal, hideModal } from './utils.js';
import { setCurrentUser } from './auth.js'; // ИМПОРТИРУЕМ setCurrentUser

// Глобальные переменные
window.currentUser = null;
window.currentUserData = null;
window.currentMonth = new Date().getMonth();
window.currentYear = new Date().getFullYear();

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

// Загрузка всех данных после авторизации
async function loadAllUserData(user) {
    console.log('Загрузка данных для пользователя:', user.uid);
    
    try {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (!userDoc.exists()) {
            console.log('Документ пользователя не найден');
            return false;
        }
        
        const userData = userDoc.data();
        console.log('Данные пользователя загружены:', userData);
        
        // Устанавливаем пользователя через функцию из auth.js
        setCurrentUser({ uid: user.uid, ...userData }, userData);
        
        // Загружаем данные в UI
        setTimeout(() => {
            // Заполняем поля профиля
            const fullNameEl = document.getElementById('fullName');
            const employeeIdEl = document.getElementById('employeeId');
            const cardIdEl = document.getElementById('cardId');
            const emailEl = document.getElementById('email');
            
            if (fullNameEl) fullNameEl.value = userData.fullName || '';
            if (employeeIdEl) employeeIdEl.value = userData.employeeId || '';
            if (cardIdEl) cardIdEl.value = userData.cardId || '';
            if (emailEl) emailEl.value = userData.email || '';
            
            // Настройки зарплаты
            if (userData.settings) {
                const hourlyRate = document.getElementById('hourlyRate');
                const lunchCost = document.getElementById('lunchCost');
                const nightBonus = document.getElementById('nightBonus');
                const saturdayBonus = document.getElementById('saturdayBonus');
                const sundayBonus = document.getElementById('sundayBonus');
                const extraBonus = document.getElementById('extraBonus');
                const personalDoctorDays = document.getElementById('personalDoctorDays');
                const accompanyDoctorDays = document.getElementById('accompanyDoctorDays');
                const usedPersonalDoctor = document.getElementById('usedPersonalDoctor');
                const usedAccompanyDoctor = document.getElementById('usedAccompanyDoctor');
                const usedWeekends = document.getElementById('usedWeekends');
                const accruedWeekendsInput = document.getElementById('accruedWeekendsInput');
                
                if (hourlyRate) hourlyRate.value = userData.settings.hourlyRate || 6.10;
                if (lunchCost) lunchCost.value = userData.settings.lunchCost || 1.31;
                if (nightBonus) nightBonus.value = userData.settings.nightBonus || 20;
                if (saturdayBonus) saturdayBonus.value = userData.settings.saturdayBonus || 1.5;
                if (sundayBonus) sundayBonus.value = userData.settings.sundayBonus || 2.0;
                if (extraBonus) extraBonus.value = userData.settings.extraBonus || 25;
                if (personalDoctorDays) personalDoctorDays.value = userData.settings.personalDoctorDays || 7;
                if (accompanyDoctorDays) accompanyDoctorDays.value = userData.settings.accompanyDoctorDays || 6;
                if (usedPersonalDoctor) usedPersonalDoctor.value = userData.settings.usedPersonalDoctor || 0;
                if (usedAccompanyDoctor) usedAccompanyDoctor.value = userData.settings.usedAccompanyDoctor || 0;
                if (usedWeekends) usedWeekends.value = userData.settings.usedWeekends || 0;
                if (accruedWeekendsInput) accruedWeekendsInput.value = userData.settings.accruedWeekends || 0;
            }
            
            // Аватар
            const avatarPreview = document.getElementById('avatarPreview');
            const profileAvatar = document.getElementById('profileAvatar');
            const avatarUrl = userData.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.email?.split('@')[0] || 'User')}&background=00b060&color=fff&size=128`;
            
            if (avatarPreview) avatarPreview.src = avatarUrl;
            if (profileAvatar) profileAvatar.src = avatarUrl;
            
            // Имя пользователя
            const userName = document.getElementById('userName');
            const profileName = document.getElementById('profileName');
            const displayName = userData.fullName || userData.email?.split('@')[0] || 'User';
            
            if (userName) userName.textContent = displayName;
            if (profileName) profileName.textContent = displayName;
            
            // Обновляем отображение
            if (window.updateMonthDisplay) window.updateMonthDisplay();
            if (window.buildCalendar) window.buildCalendar();
            if (window.calculateAllStats) window.calculateAllStats();
            
            // Запускаем время
            if (window.updateDateTime) window.updateDateTime();
            if (window.updateWeather) window.updateWeather();
            if (window.updateFinancialTip) window.updateFinancialTip();
            if (window.updateExchangeRate) window.updateExchangeRate();
            
            // Загружаем финансовую цель ПОСЛЕ всего
            setTimeout(() => {
                if (window.loadFinancialGoal) {
                    console.log('Вызов loadFinancialGoal из main');
                    window.loadFinancialGoal();
                }
            }, 500);
            
        }, 200);
        
        return true;
    } catch (error) {
        console.error('Ошибка загрузки данных:', error);
        return false;
    }
}

// Проверка авторизации
onAuthStateChanged(auth, async (user) => {
    console.log('onAuthStateChanged:', user ? 'пользователь есть' : 'пользователя нет');
    
    if (user) {
        window.updateLoadingStatus('Загрузка данных...');
        const success = await loadAllUserData(user);
        
        if (success) {
            hidePreloader();
            document.getElementById('app').classList.remove('hidden');
            
            // Устанавливаем тему
            if (window.setTheme && window.currentUser?.theme) {
                window.setTheme(window.currentUser.theme);
            }
        } else {
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
        // Перезагружаем финансовую цель при переходе на вкладку
        setTimeout(() => {
            if (window.loadFinancialGoal) {
                console.log('Вызов loadFinancialGoal из setView');
                window.loadFinancialGoal();
            }
        }, 200);
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
