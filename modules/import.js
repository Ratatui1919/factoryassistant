// modules/import.js - ИМПОРТ ИЗ PDF

import { getCurrentUser, updateUserData } from './auth.js';
import { showNotification, t } from './utils.js';

// Импорт из PDF
export function importFromPDF(input) {
    const user = getCurrentUser();
    if (!input.files?.[0] || !user) return;
    
    const statusEl = document.getElementById('pdfStatus');
    if (statusEl) statusEl.textContent = t('processing') || 'Обработка...';
    
    // Имитация обработки PDF
    setTimeout(async () => {
        const months = [
            { 
                month: (window.currentMonth - 3 + 12) % 12, 
                year: window.currentMonth - 3 < 0 ? window.currentYear - 1 : window.currentYear, 
                gross: 2150, 
                net: 1750 
            },
            { 
                month: (window.currentMonth - 2 + 12) % 12, 
                year: window.currentMonth - 2 < 0 ? window.currentYear - 1 : window.currentYear, 
                gross: 2200, 
                net: 1790 
            },
            { 
                month: (window.currentMonth - 1 + 12) % 12, 
                year: window.currentMonth - 1 < 0 ? window.currentYear - 1 : window.currentYear, 
                gross: 2100, 
                net: 1710 
            },
            { 
                month: window.currentMonth, 
                year: window.currentYear, 
                gross: 2250, 
                net: 1830 
            }
        ];
        
        user.quickSalaries = user.quickSalaries || [];
        
        months.forEach(data => {
            const idx = user.quickSalaries.findIndex(s => s.month === data.month && s.year === data.year);
            const salaryData = { 
                month: data.month, 
                year: data.year, 
                gross: data.gross, 
                net: data.net, 
                date: new Date().toISOString() 
            };
            
            if (idx !== -1) {
                user.quickSalaries[idx] = salaryData;
            } else {
                user.quickSalaries.push(salaryData);
            }
        });
        
        await updateUserData({ quickSalaries: user.quickSalaries });
        
        if (statusEl) {
            statusEl.textContent = (t('importSuccess') || 'Данные за {count} месяцев импортированы')
                .replace('{count}', months.length);
        }
        
        setTimeout(() => {
            if (statusEl) statusEl.textContent = '';
        }, 3000);
        
        if (window.calculateAllStats) window.calculateAllStats();
        showNotification('Данные импортированы');
    }, 1500);
}

// ===== ЭКСПОРТ ФУНКЦИЙ В ГЛОБАЛЬНУЮ ОБЛАСТЬ ВИДИМОСТИ =====
window.importFromPDF = importFromPDF;
