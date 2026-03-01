// modules/stats.js - СТАТИСТИКА

import { getCurrentUser } from './auth.js';
import { calculateYearlyStats } from './salary.js';
import { t, showNotification } from './utils.js';

// Загрузка статистики за год
window.loadYearStats = function() {
    const user = getCurrentUser();
    if (!user) return;
    
    const year = parseInt(document.getElementById('yearSelectStats')?.value || 2026);
    const stats = calculateYearlyStats(user.records || [], year, user.settings);
    
    const totalEarned = document.getElementById('totalEarned');
    const totalHours = document.getElementById('totalHours');
    const totalLunch = document.getElementById('totalLunch');
    const bestMonth = document.getElementById('bestMonth');
    
    if (totalEarned) totalEarned.innerText = stats.totalGross.toFixed(2) + ' €';
    if (totalHours) totalHours.innerText = stats.totalHours;
    if (totalLunch) totalLunch.innerText = stats.totalLunch.toFixed(2) + ' €';
    
    // Находим лучший месяц
    const monthNames = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'];
    let bestMonthValue = { value: 0, name: '' };
    let bestMonthIndex = -1;
    
    stats.monthTotals.forEach((total, index) => {
        if (total > bestMonthValue.value) {
            bestMonthValue.value = total;
            bestMonthValue.name = monthNames[index];
            bestMonthIndex = index;
        }
    });
    
    if (bestMonthIndex !== -1 && bestMonth) {
        bestMonth.innerText = bestMonthValue.name + ' ' + bestMonthValue.value.toFixed(0) + '€';
    } else if (bestMonth) {
        bestMonth.innerText = '-';
    }
    
    buildStatsChart(stats.monthTotals);
};

// Построение графика статистики
function buildStatsChart(monthTotals) {
    const canvas = document.getElementById('statsChart');
    if (!canvas) return;
    
    const container = canvas.parentElement;
    if (container) {
        canvas.style.width = '100%';
        canvas.style.height = '300px';
        canvas.width = container.clientWidth;
        canvas.height = 300;
    }
    
    // Проверяем существование графика перед уничтожением
    if (window.statsChart) {
        try {
            if (typeof window.statsChart.destroy === 'function') {
                window.statsChart.destroy();
            }
        } catch (e) {
            console.warn('Ошибка при уничтожении графика:', e);
        }
        window.statsChart = null;
    }
    
    const ctx = canvas.getContext('2d');
    const textColor = getComputedStyle(document.documentElement).getPropertyValue('--text').trim() || '#ffffff';
    const gridColor = getComputedStyle(document.documentElement).getPropertyValue('--border').trim() || '#334155';
    
    try {
        window.statsChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'],
                datasets: [{
                    label: t('monthlyIncome') || 'Доход €',
                    data: monthTotals,
                    backgroundColor: 'rgba(0,176,96,0.7)',
                    borderColor: '#00b060',
                    borderWidth: 1,
                    borderRadius: 8
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: { labels: { color: textColor } },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return context.dataset.label + ': ' + context.raw.toFixed(2) + ' €';
                            }
                        }
                    }
                },
                scales: {
                    y: { 
                        grid: { color: gridColor }, 
                        ticks: { color: textColor },
                        beginAtZero: true
                    },
                    x: { ticks: { color: textColor } }
                }
            }
        });
    } catch (error) {
        console.error('Ошибка создания графика:', error);
    }
}

// Расчет статистики по кнопке
window.calculateYearStats = function() {
    window.loadYearStats();
    showNotification('Рассчитано за ' + (document.getElementById('yearSelectStats')?.value || '2026'), 2000);
};
