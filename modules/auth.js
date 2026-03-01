// modules/auth.js - АВТОРИЗАЦИЯ (ИСПРАВЛЕННАЯ)

import { auth, db, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, doc, setDoc, getDoc, updateDoc } from './firebase-config.js';
import { showModal, hideModal, showNotification } from './utils.js';

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

// Установить текущего пользователя
export function setCurrentUser(user, userData) {
    console.log('setCurrentUser вызван:', user);
    currentUser = user;
    currentUserData = userData;
    window.currentUser = user;
    window.currentUserData = userData;
}

// Показать форму входа
export function showLoginForm() {
    document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.auth-form').forEach(f => f.classList.remove('active'));
    const firstTab = document.querySelectorAll('.auth-tab')[0];
    const loginForm = document.getElementById('loginForm');
    if (firstTab) firstTab.classList.add('active');
    if (loginForm) loginForm.classList.add('active');
}

// Показать форму регистрации
export function showRegisterForm() {
    document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.auth-form').forEach(f => f.classList.remove('active'));
    const secondTab = document.querySelectorAll('.auth-tab')[1];
    const registerForm = document.getElementById('registerForm');
    if (secondTab) secondTab.classList.add('active');
    if (registerForm) registerForm.classList.add('active');
}

// Регистрация
export async function register() {
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
                hourlyRate: 6.10, 
                lunchCost: 1.31, 
                nightBonus: 20,
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
        
        document.getElementById('regEmail').value = '';
        document.getElementById('regPass').value = '';
        document.getElementById('regConfirm').value = '';
        
        showLoginForm();
        
    } catch (error) {
        alert('Ошибка: ' + error.message);
    }
}

// Вход
export async function login() {
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
        
        const userData = userDoc.data();
        setCurrentUser({ uid: user.uid, ...userData }, userData);
        
        hideModal('authModal');
        document.getElementById('app').classList.remove('hidden');
        
        // Обновляем страницу без перезагрузки
        if (window.location.reload) {
            window.location.reload();
        }
        
    } catch (error) {
        alert('Ошибка входа: ' + error.message);
    }
}

// Выход
export async function logout() {
    if (confirm('Выйти?')) { 
        await signOut(auth); 
        currentUser = null; 
        currentUserData = null;
        window.currentUser = null;
        window.currentUserData = null;
        document.getElementById('app').classList.add('hidden'); 
        showModal('authModal'); 
        showLoginForm();
    }
}

// Сохранение профиля
export async function saveProfile() {
    if (!currentUser) return;
    
    const updates = {
        fullName: document.getElementById('fullName')?.value || '',
        employeeId: document.getElementById('employeeId')?.value || '',
        cardId: document.getElementById('cardId')?.value || '',
        email: document.getElementById('email')?.value || '',
        weatherEffectsEnabled: document.getElementById('weatherEffectsEnabled')?.checked || false,
        weatherEffectMode: document.getElementById('weatherEffectMode')?.value || 'auto',
        settings: {
            hourlyRate: parseFloat(document.getElementById('hourlyRate')?.value) || 6.10,
            lunchCost: parseFloat(document.getElementById('lunchCost')?.value) || 1.31,
            nightBonus: parseFloat(document.getElementById('nightBonus')?.value) || 20,
            saturdayBonus: parseFloat(document.getElementById('saturdayBonus')?.value) || 1.5,
            sundayBonus: parseFloat(document.getElementById('sundayBonus')?.value) || 2.0,
            extraBonus: parseFloat(document.getElementById('extraBonus')?.value) || 25,
            personalDoctorDays: parseInt(document.getElementById('personalDoctorDays')?.value) || 7,
            accompanyDoctorDays: parseInt(document.getElementById('accompanyDoctorDays')?.value) || 6,
            usedPersonalDoctor: parseInt(document.getElementById('usedPersonalDoctor')?.value) || 0,
            usedAccompanyDoctor: parseInt(document.getElementById('usedAccompanyDoctor')?.value) || 0,
            usedWeekends: parseInt(document.getElementById('usedWeekends')?.value) || 0,
            accruedWeekends: parseInt(document.getElementById('accruedWeekendsInput')?.value) || 0
        }
    };
    
    currentUser = { ...currentUser, ...updates };
    currentUserData = { ...currentUserData, ...updates };
    window.currentUser = currentUser;
    window.currentUserData = currentUserData;
    
    await updateDoc(doc(db, "users", currentUser.uid), updates);
    
    showNotification('Профиль сохранён!');
    
    // Обновляем отображение без перезагрузки
    const userName = document.getElementById('userName');
    const profileName = document.getElementById('profileName');
    const displayName = updates.fullName || currentUser.email?.split('@')[0] || 'User';
    
    if (userName) userName.textContent = displayName;
    if (profileName) profileName.textContent = displayName;
}

// Предпросмотр аватара
export function previewAvatar(input) {
    if (input.files?.[0]) {
        const reader = new FileReader();
        reader.onload = async (e) => {
            const avatarPreview = document.getElementById('avatarPreview');
            const profileAvatar = document.getElementById('profileAvatar');
            if (avatarPreview) avatarPreview.src = e.target.result;
            if (profileAvatar) profileAvatar.src = e.target.result;
            if (currentUser) {
                await updateDoc(doc(db, "users", currentUser.uid), { avatar: e.target.result });
                showNotification('Аватар обновлён');
            }
        };
        reader.readAsDataURL(input.files[0]);
    }
}

// Экспорт данных
export function exportData() {
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
    showNotification('Данные экспортированы');
}

// Очистка всех данных
export async function clearAllData() {
    if (!currentUser) return;
    if (confirm('Удалить ВСЕ данные?')) {
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
        
        showNotification('Все данные очищены');
        
        // Обновляем отображение
        if (window.buildCalendar) window.buildCalendar();
        if (window.calculateAllStats) window.calculateAllStats();
        if (window.loadFinancialGoal) window.loadFinancialGoal();
    }
}

// ===== ЭКСПОРТ В ГЛОБАЛЬНУЮ ОБЛАСТЬ ВИДИМОСТИ =====
window.showLoginForm = showLoginForm;
window.showRegisterForm = showRegisterForm;
window.register = register;
window.login = login;
window.logout = logout;
window.saveProfile = saveProfile;
window.previewAvatar = previewAvatar;
window.exportData = exportData;
window.clearAllData = clearAllData;
