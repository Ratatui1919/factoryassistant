// js/time.js - ВРЕМЯ И ДАТА

import { currentLanguage } from './utils.js';

let updateInterval = null;

// Обновление времени и даты
window.updateDateTime = function() {
    const timeEl = document.getElementById('time');
    const dateEl = document.getElementById('date');
    
    if (timeEl) {
        timeEl.textContent = new Date().toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
    }
    
    if (dateEl) {
        const options = { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        };
        
        dateEl.textContent = new Date().toLocaleDateString(
            currentLanguage === 'ru' ? 'ru-RU' : 
            currentLanguage === 'sk' ? 'sk-SK' : 
            currentLanguage === 'uk' ? 'uk-UA' : 'en-US',
            options
        );
    }
};

// Запуск обновления времени
export function startTimeUpdates() {
    if (updateInterval) clearInterval(updateInterval);
    updateInterval = setInterval(window.updateDateTime, 1000);
    window.updateDateTime();
}

// Остановка обновления времени
export function stopTimeUpdates() {
    if (updateInterval) {
        clearInterval(updateInterval);
        updateInterval = null;
    }
}
