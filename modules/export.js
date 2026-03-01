// js/export.js - ЭКСПОРТ ДАННЫХ

import { getCurrentUser } from './auth.js';
import { showNotification, t } from './utils.js';
import { getExchangeRate } from './exchange.js';

// Экспорт в Excel
window.exportToExcel = function() {
    const user = getCurrentUser();
    if (!user) return;
    
    const data = [
        [t('totalStats') || 'Показатель', t('value') || 'Значение'],
        [t('totalEarned') || 'Всего заработано', document.getElementById('totalEarned').textContent],
        [t('totalHours') || 'Всего часов', document.getElementById('totalHours').textContent],
        [t('totalLunch') || 'Потрачено на обеды', document.getElementById('totalLunch').textContent],
        [t('bestMonth') || 'Лучший месяц', document.getElementById('bestMonth').textContent],
    ];
    
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(data);
    XLSX.utils.book_append_sheet(wb, ws, t('stats') || 'Статистика');
    XLSX.writeFile(wb, `vaillant_stats_${new Date().toISOString().split('T')[0]}.xlsx`);
    
    showNotification(t('exported') || 'Excel файл сохранён');
};

// Экспорт в PDF
window.exportToPDF = function() {
    const user = getCurrentUser();
    if (!user) return;
    
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    doc.setFontSize(18);
    doc.setTextColor(0, 176, 96);
    doc.text('Vaillant Assistant', 20, 20);
    
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(`${t('date') || 'Дата'}: ${new Date().toLocaleDateString()}`, 20, 30);
    
    const rate = getExchangeRate();
    if (rate) {
        doc.text(`${t('exchangeRate') || 'Курс EUR/UAH'}: ${rate.toFixed(2)}`, 20, 40);
    }
    
    const data = [
        [t('totalStats') || 'Показатель', t('value') || 'Значение'],
        [t('totalEarned') || 'Всего заработано', document.getElementById('totalEarned').textContent],
        [t('totalHours') || 'Всего часов', document.getElementById('totalHours').textContent],
        [t('totalLunch') || 'Потрачено на обеды', document.getElementById('totalLunch').textContent],
        [t('bestMonth') || 'Лучший месяц', document.getElementById('bestMonth').textContent],
    ];
    
    doc.autoTable({ 
        startY: 50, 
        head: [data[0]], 
        body: data.slice(1), 
        theme: 'grid', 
        headStyles: { fillColor: [0, 176, 96] } 
    });
    
    doc.save(`vaillant_stats_${new Date().toISOString().split('T')[0]}.pdf`);
    showNotification(t('exportedPDF') || 'PDF файл сохранён');
};
