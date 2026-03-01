// modules/financial-tip.js - ФИНАНСОВЫЕ СОВЕТЫ

import { t } from './utils.js';

// Финансовые советы
const FINANCIAL_TIPS = [
    'tip1', 'tip2', 'tip3', 'tip4', 'tip5',
    'tip6', 'tip7', 'tip8', 'tip9', 'tip10'
];

// Обновление финансового совета
window.updateFinancialTip = function() {
    const tipEl = document.getElementById('financeTip');
    const tipDateEl = document.getElementById('tipDate');
    
    if (!tipEl) return;
    
    const today = new Date();
    const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));
    const tipKey = FINANCIAL_TIPS[dayOfYear % FINANCIAL_TIPS.length];
    
    tipEl.textContent = t(tipKey) || 'Откладывай минимум 10% от зарплаты';
    
    if (tipDateEl) {
        const lang = document.documentElement.lang || 'ru';
        tipDateEl.textContent = today.toLocaleDateString(
            lang === 'ru' ? 'ru-RU' : 
            lang === 'sk' ? 'sk-SK' : 
            lang === 'uk' ? 'uk-UA' : 'en-US'
        );
    }
};
