// modules/utils.js - ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ (ИСПРАВЛЕННЫЙ)

import { translations } from './translations.js';

// Текущий язык
export let currentLanguage = localStorage.getItem('vaillant_language') || 'ru';

// Функция перевода
export function t(key) {
    return translations[currentLanguage]?.[key] || translations.ru[key] || key;
}

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
    
    // Обновляем погодные эффекты при смене языка
    setTimeout(() => {
        if (window.toggleWeatherEffect) {
            window.toggleWeatherEffect();
        }
    }, 100);
}

// Перевод всей страницы
export function translatePage() {
    // Переводим все элементы с data-lang (кроме кнопок языков)
    document.querySelectorAll('[data-lang]').forEach(el => {
        // Пропускаем кнопки языков
        if (el.classList.contains('lang-btn')) {
            return;
        }
        
        const key = el.dataset.lang;
        
        // Для select переводим options
        if (el.tagName === 'SELECT') {
            Array.from(el.options).forEach(option => {
                const optionKey = option.getAttribute('data-lang');
                if (optionKey) {
                    option.textContent = t(optionKey);
                }
            });
        } else {
            el.textContent = t(key);
        }
    });
    
    // Переводим placeholder'ы
    document.querySelectorAll('[data-lang-placeholder]').forEach(el => {
        const key = el.dataset.langPlaceholder;
        el.placeholder = t(key);
    });
    
    // Кнопки языков всегда показываем как RU, SK, EN, UA
    document.querySelectorAll('.lang-btn').forEach(btn => {
        const lang = btn.dataset.lang;
        if (lang === 'ru') btn.textContent = 'RU';
        if (lang === 'sk') btn.textContent = 'SK';
        if (lang === 'en') btn.textContent = 'EN';
        if (lang === 'uk') btn.textContent = 'UA';
    });
}

// Показать модальное окно
export function showModal(id) {
    const modal = document.getElementById(id);
    if (modal) modal.style.display = 'flex';
}

// Скрыть модальное окно
export function hideModal(id) {
    const modal = document.getElementById(id);
    if (modal) modal.style.display = 'none';
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
    if (!user) return 'Гость';
    if (user.fullName?.trim()) return user.fullName;
    return user.email?.split('@')[0] || 'User';
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

// Делаем функции глобальными
window.setLanguage = setLanguage;
window.showNotification = showNotification;
