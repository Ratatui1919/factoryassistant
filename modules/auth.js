// js/auth.js - АВТОРИЗАЦИЯ

import { auth, db, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, doc, setDoc, getDoc, updateDoc } from './firebase-config.js';
import { t, showModal, hideModal, showNotification, getAvatarUrl, getDisplayName, setLanguage } from './utils.js';
import { BASE_RATE, LUNCH_COST_REAL, NIGHT_BONUS_PERCENT } from './salary.js';
import { initApp } from './main.js';

let currentUser = null;
let currentUserData = null;

// Получить текущего пользователя
export function getCurrentUser() {
    return currentUser;
}

// Получить данные пользователя
export function getUserData() {
    return currentUserData;
}

// Обновить данные пользователя
export async function updateUserData(newData) {
    if (!currentUser) return;
    currentUserData = { ...currentUserData, ...newData };
    currentUser = { uid: currentUser.uid, ...currentUserData };
    await updateDoc(doc(db, "users", currentUser.uid), newData);
}

// Показать форму входа
window.showLoginForm = function() {
    document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.auth-form').forEach(f => f.classList.remove('active'));
    document.querySelectorAll('.auth-tab')[0]?.classList.add('active');
    document.getElementById('loginForm')?.classList.add('active');
};

// Показать форму регистрации
window.showRegisterForm = function() {
    document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.auth-form').forEach(f => f.classList.remove('active'));
    document.querySelectorAll('.auth-tab')[1]?.classList.add('active');
    document.getElementById('registerForm')?.classList.add('active');
};

// Регистрация
window.register = async function() {
    const email = document.getElementById('regEmail')?.value.trim();
    const pass = document.getElementById('regPass')?.value.trim();
    const confirm = document.getElementById('regConfirm')?.value.trim();
    
    if (!email || !pass || !confirm) return alert(t('fillAllFields') || 'Заполните все поля!');
    if (!email.includes('@')) return alert(t('validEmail') || 'Введите корректный email!');
    if (pass !== confirm) return alert(t('passwordsNotMatch') || 'Пароли не совпадают!');
    if (pass.length < 6) return alert(t('passwordLength') || 'Пароль должен быть минимум 6 символов!');
    
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
        alert(t('registrationSuccess') || 'Регистрация успешна!');
        
        document.getElementById('regEmail').value = '';
        document.getElementById('regPass').value = '';
        document.getElementById('regConfirm').value = '';
        window.showLoginForm();
        
    } catch (error) {
        alert(t('error') + ': ' + error.message);
    }
};

// Вход
window.login = async function() {
    const email = document.getElementById('loginEmail')?.value.trim();
    const pass = document.getElementById('loginPass')?.value.trim();
    const remember = document.getElementById('rememberMe')?.checked;
    
    if (!email || !pass) return alert(t('enterEmailPass') || 'Введите email и пароль!');
    if (!email.includes('@')) return alert(t('validEmail') || 'Введите корректный email!');
    
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
        if (!userDoc.exists()) return alert(t('userNotFound') || 'Данные пользователя не найдены!');
        
        currentUserData = userDoc.data();
        currentUser = { uid: user.uid, ...currentUserData };
        
        hideModal('authModal');
        document.getElementById('app').classList.remove('hidden');
        
        // Загружаем данные пользователя в интерфейс
        loadUserDataToUI();
        
        // Устанавливаем тему
        if (window.setTheme) window.setTheme(currentUser.theme || 'dark');
        
        // Запускаем приложение
        initApp(currentUser, currentUserData);
        
        showNotification(t('welcome') || 'Добро пожаловать!');
    } catch (error) {
        alert(t('loginError') + ': ' + error.message);
    }
};

// Загрузка данных пользователя в UI
function loadUserDataToUI() {
    if (!currentUser) return;
    
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
    
    document.getElementById('userName').textContent = getDisplayName(currentUser);
    document.getElementById('profileName').textContent = getDisplayName(currentUser);
}

// Выход
window.logout = async function() {
    if (confirm(t('confirmLogout') || 'Выйти?')) { 
        await signOut(auth); 
        currentUser = null; 
        currentUserData = null;
        document.getElementById('app').classList.add('hidden'); 
        showModal('authModal'); 
        window.showLoginForm();
    }
};

// Обновление профиля
window.saveProfile = async function() {
    if (!currentUser) return;
    
    const updates = {
        fullName: document.getElementById('fullName').value,
        employeeId: document.getElementById('employeeId').value,
        cardId: document.getElementById('cardId').value,
        email: document.getElementById('email').value,
        weatherEffectsEnabled: document.getElementById('weatherEffectsEnabled').checked,
        weatherEffectMode: document.getElementById('weatherEffectMode').value,
        settings: {
            hourlyRate: parseFloat(document.getElementById('hourlyRate').value) || BASE_RATE,
            lunchCost: parseFloat(document.getElementById('lunchCost').value) || LUNCH_COST_REAL,
            nightBonus: parseFloat(document.getElementById('nightBonus').value) || NIGHT_BONUS_PERCENT,
            saturdayBonus: parseFloat(document.getElementById('saturdayBonus').value) || 1.5,
            sundayBonus: parseFloat(document.getElementById('sundayBonus').value) || 2.0,
            extraBonus: parseFloat(document.getElementById('extraBonus').value) || 25,
            personalDoctorDays: parseInt(document.getElementById('personalDoctorDays').value) || 7,
            accompanyDoctorDays: parseInt(document.getElementById('accompanyDoctorDays').value) || 6,
            usedPersonalDoctor: parseInt(document.getElementById('usedPersonalDoctor').value) || 0,
            usedAccompanyDoctor: parseInt(document.getElementById('usedAccompanyDoctor').value) || 0,
            usedWeekends: parseInt(document.getElementById('usedWeekends').value) || 0,
            accruedWeekends: parseInt(document.getElementById('accruedWeekendsInput').value) || 0
        }
    };
    
    currentUser = { ...currentUser, ...updates };
    currentUserData = { ...currentUserData, ...updates };
    
    await updateDoc(doc(db, "users", currentUser.uid), updates);
    
    document.getElementById('userName').textContent = getDisplayName(currentUser);
    document.getElementById('profileName').textContent = getDisplayName(currentUser);
    
    if (window.toggleWeatherEffect) window.toggleWeatherEffect();
    
    showNotification(t('profileSaved') || 'Профиль сохранён!');
};

// Предпросмотр аватара
window.previewAvatar = function(input) {
    if (input.files?.[0]) {
        const reader = new FileReader();
        reader.onload = async (e) => {
            document.getElementById('avatarPreview').src = e.target.result;
            document.getElementById('profileAvatar').src = e.target.result;
            if (currentUser) {
                await updateDoc(doc(db, "users", currentUser.uid), { avatar: e.target.result });
                showNotification(t('avatarUpdated') || 'Аватар обновлён');
            }
        };
        reader.readAsDataURL(input.files[0]);
    }
};

// Экспорт данных
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
    showNotification(t('exported') || 'Данные экспортированы');
};

// Очистка всех данных
window.clearAllData = async function() {
    if (!currentUser) return;
    if (confirm(t('confirmClearAll') || 'Удалить ВСЕ данные?')) {
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
        
        if (window.buildCalendar) window.buildCalendar();
        if (window.calculateAllStats) window.calculateAllStats();
        if (window.loadFinancialGoal) window.loadFinancialGoal();
        
        showNotification(t('dataCleared') || 'Все данные очищены');
    }
};
