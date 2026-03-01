// js/utils.js - ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ

import { translations } from './translations.js';

// Текущий язык
export let currentLanguage = localStorage.getItem('vaillant_language') || 'ru';

// Установка языка
export function setLanguage(lang) {
    currentLanguage = lang;
    localStorage.setItem('vaillant_language', lang);
    document.documentElement.lang = lang;
    
    // Обновляем активные кнопки
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.lang === lang) {
            btn.classList.add('active');
        }
    });
    
    // Переводим все элементы
    translatePage();
}

// Функция перевода
export function t(key) {
    return translations[currentLanguage]?.[key] || translations.ru[key] || key;
}

// Перевод всей страницы
export function translatePage() {
    document.querySelectorAll('[data-lang]').forEach(el => {
        const key = el.dataset.lang;
        el.textContent = t(key);
    });
    
    document.querySelectorAll('[data-lang-placeholder]').forEach(el => {
        const key = el.dataset.langPlaceholder;
        el.placeholder = t(key);
    });
}

// Показать модальное окно
export function showModal(id) {
    document.getElementById(id).style.display = 'flex';
}

// Скрыть модальное окно
export function hideModal(id) {
    document.getElementById(id).style.display = 'none';
}

// Показать уведомление
export function showNotification(msg, duration = 3000) {
    const notification = document.getElementById('notification');
    const messageEl = document.getElementById('notificationMessage');
    if (!notification || !messageEl) return;
    
    messageEl.textContent = msg;
    notification.classList.remove('hidden');
    
    setTimeout(() => {
        notification.classList.add('hidden');
    }, duration);
}

// Получить аватар по email
export function getAvatarUrl(email) {
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(email.split('@')[0])}&background=00b060&color=fff&size=128`;
}

// Получить имя пользователя
export function getDisplayName(user) {
    if (!user) return t('guest') || 'Гость';
    if (user.fullName?.trim()) return user.fullName;
    return user.email?.split('@')[0] || t('user') || 'User';
}

// Форматирование даты
export function formatDate(date, format = 'full') {
    const options = {
        full: { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' },
        short: { day: 'numeric', month: 'long' },
        time: { hour: '2-digit', minute: '2-digit' }
    };
    
    return date.toLocaleDateString(
        currentLanguage === 'ru' ? 'ru-RU' : 
        currentLanguage === 'sk' ? 'sk-SK' : 
        currentLanguage === 'uk' ? 'uk-UA' : 'en-US',
        options[format]
    );
}
