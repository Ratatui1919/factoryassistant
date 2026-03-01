// modules/auth.js - АВТОРИЗАЦИЯ

import { auth, db, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, doc, setDoc, getDoc, updateDoc } from './firebase-config.js';
import { t, showModal, hideModal, showNotification, getAvatarUrl, getDisplayName } from './utils.js';
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
    const firstTab = document.querySelectorAll('.auth-tab')[0];
    const loginForm = document.getElementById('loginForm');
    if (firstTab) firstTab.classList.add('active');
    if (loginForm) loginForm.classList.add('active');
};

// Показать форму регистрации
window.showRegisterForm = function() {
    document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.auth-form').forEach(f => f.classList.remove('active'));
    const secondTab = document.querySelectorAll('.auth-tab')[1];
    const registerForm = document.getElementById('registerForm');
    if (secondTab) secondTab.classList.add('active');
    if (registerForm) registerForm.classList.add('active');
};

// Регистрация
window.register = async function() {
    const email = document.getElementById('regEmail')?.value.trim();
    const pass = document.getElementById('regPass')?.value.trim();
    const confirm = document.getElementById('regConfirm')?.value.trim();
    
    if (!email || !pass || !confirm) return alert('Заполните все поля!');
    if (!email.includes('@')) return alert('Введите корректный email!');
    if (pass !== confirm) return alert('Пароли не совпадают!');
    if (pass.length < 6) return alert('Пароль должен быть минимум 6 символов!');
    
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
        alert('Регистрация успешна!');
        
        const regEmail = document.getElementById('regEmail');
        const regPass = document.getElementById('regPass');
        const regConfirm = document.getElementById('regConfirm');
        if (regEmail) regEmail.value = '';
        if (regPass) regPass.value = '';
        if (regConfirm) regConfirm.value = '';
        
        window.showLoginForm();
        
    } catch (error) {
        alert('Ошибка: ' + error.message);
    }
};

// Вход
window.login = async function() {
    const email = document.getElementById('loginEmail')?.value.trim();
    const pass = document.getElementById('loginPass')?.value.trim();
    const remember = document.getElementById('rememberMe')?.checked;
    
    if (!email || !pass) return alert('Введите email и пароль!');
    if (!email.includes('@')) return alert('Введите корректный email!');
    
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
        if (!userDoc.exists()) return alert('Данные пользователя не найдены!');
        
        currentUserData = userDoc.data();
        currentUser = { uid: user.uid, ...currentUserData };
        
        hideModal('authModal');
        document.getElementById('app').classList.remove('hidden');
        
        // Устанавливаем тему
        if (window.setTheme) window.setTheme(currentUser.theme || 'dark');
        
        // Запускаем приложение
        initApp(currentUser, currentUserData);
        
        showNotification('Добро пожаловать!');
    } catch (error) {
        alert('Ошибка входа: ' + error.message);
    }
};

// Выход
window.logout = async function() {
    if (confirm('Выйти?')) { 
        await signOut(auth); 
        currentUser = null; 
        currentUserData = null;
        document.getElementById('app').classList.add('hidden'); 
        showModal('authModal'); 
        window.showLoginForm();
    }
};
