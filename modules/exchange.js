// js/exchange.js - КУРС ВАЛЮТ

import { showNotification, t } from './utils.js';

let exchangeRate = 42.5;
let lastRateUpdate = null;

// Обновление курса валют
window.updateExchangeRate = async function() {
    const rateSpan = document.getElementById('currentRate');
    const updateBtn = document.getElementById('updateRateBtn');
    const originalText = updateBtn?.innerHTML;
    
    try {
        if (updateBtn) {
            updateBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> ' + (t('updating') || 'Обновление...');
            updateBtn.disabled = true;
        }
        
        const response = await fetch('https://api.exchangerate-api.com/v4/latest/EUR');
        const data = await response.json();
        exchangeRate = data.rates.UAH;
        lastRateUpdate = new Date();
        
        if (rateSpan) {
            rateSpan.textContent = exchangeRate.toFixed(2);
        }
        
        updateConverter();
        
        const lastUpdateSpan = document.getElementById('lastUpdateTime');
        if (lastUpdateSpan) {
            lastUpdateSpan.textContent = lastRateUpdate.toLocaleTimeString();
        }
        
        showNotification(t('rateUpdated') || 'Курс обновлен', 2000);
    } catch (error) {
        console.error('Ошибка получения курса:', error);
        showNotification(t('rateError') || 'Ошибка обновления курса', 2000);
    } finally {
        if (updateBtn) {
            updateBtn.innerHTML = originalText;
            updateBtn.disabled = false;
        }
    }
};

// Обновление конвертера
function updateConverter() {
    const euroInput = document.getElementById('euroInput');
    const uahResult = document.getElementById('uahResult');
    
    if (euroInput && uahResult && exchangeRate) {
        const euro = parseFloat(euroInput.value) || 0;
        uahResult.textContent = Math.round(euro * exchangeRate);
    }
}

// Инициализация конвертера
document.addEventListener('DOMContentLoaded', function() {
    const euroInput = document.getElementById('euroInput');
    if (euroInput) {
        euroInput.addEventListener('input', updateConverter);
    }
});

// Обновление отображения курса
export function updateExchangeRateDisplay() {
    const rateSpan = document.getElementById('currentRate');
    const lastUpdateSpan = document.getElementById('lastUpdateTime');
    
    if (rateSpan) {
        rateSpan.textContent = exchangeRate.toFixed(2);
    }
    
    if (lastUpdateSpan && lastRateUpdate) {
        lastUpdateSpan.textContent = lastRateUpdate.toLocaleTimeString();
    } else if (lastUpdateSpan) {
        lastUpdateSpan.textContent = '--:--';
    }
    
    updateConverter();
}

// Получение текущего курса
export function getExchangeRate() {
    return exchangeRate;
}
