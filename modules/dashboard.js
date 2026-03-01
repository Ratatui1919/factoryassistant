// js/dashboard.js - ДАШБОРД

import { getCurrentUser } from './auth.js';
import { calculateMonthlySalary } from './salary.js';
import { t } from './utils.js';

// Расчет статистики дашборда
window.calculateDashboardStats = function() {
    const user = getCurrentUser();
    if (!user) return;
    
    const stats = calculateMonthlySalary(
        user.records || [], 
        window.currentMonth, 
        window.currentYear, 
        user.settings
    );
    
    document.getElementById('gross').innerText = stats.gross.toFixed(2) + ' €';
    document.getElementById('net').innerText = stats.net.toFixed(2) + ' €';
    document.getElementById('hoursWorked').innerText = stats.hours;
    document.getElementById('overtimeHours').innerText = stats.overtimeHours;
    document.getElementById('extraCount').innerText = stats.extraBlocks;
    document.getElementById('satCount').innerText = stats.saturdays + stats.sundays;
    document.getElementById('doctorCount').innerText = stats.doctorDays;
    document.getElementById('lunchCost').innerText = stats.lunchCost.toFixed(2) + ' €';
    
    updateWeekendStats();
};

// Обновление статистики выходных
function updateWeekendStats() {
    const user = getCurrentUser();
    if (!user) return;
    
    const daysInMonth = new Date(window.currentYear, window.currentMonth + 1, 0).getDate();
    let weekendsThisMonth = 0;
    
    for (let d = 1; d <= daysInMonth; d++) {
        const date = new Date(window.currentYear, window.currentMonth, d);
        if (date.getDay() === 0 || date.getDay() === 6) {
            weekendsThisMonth++;
        }
    }
    
    document.getElementById('weekendsThisMonth').innerText = weekendsThisMonth;
    
    const accruedWeekends = user.settings?.accruedWeekends || 0;
    document.getElementById('accruedWeekends').innerText = accruedWeekends;
    document.getElementById('accruedWeekendsInput').value = accruedWeekends;
    
    const personalTotal = user.settings?.personalDoctorDays || 7;
    const usedPersonal = user.settings?.usedPersonalDoctor || 0;
    const accompanyTotal = user.settings?.accompanyDoctorDays || 6;
    const usedAccompany = user.settings?.usedAccompanyDoctor || 0;
    
    document.getElementById('doctorLeft').innerHTML = `${personalTotal - usedPersonal}/${personalTotal}`;
    document.getElementById('accompanyLeft').innerHTML = `${accompanyTotal - usedAccompany}/${accompanyTotal}`;
}

// Построение графика за год
window.buildYearChart = function() {
    const canvas = document.getElementById('yearChart');
    if (!canvas || !getCurrentUser()) return;
    
    const user = getCurrentUser();
    
    // Устанавливаем размеры
    const container = canvas.parentElement;
    if (container) {
        canvas.style.width = '100%';
        canvas.style.height = '300px';
        canvas.width = container.clientWidth;
        canvas.height = 300;
    }
    
    // Собираем данные по месяцам
    const months = new Array(12).fill(0);
    const today = new Date();
    today.setHours(0,0,0,0);
    const rate = user.settings?.hourlyRate || 6.10;
    
    (user.records || []).forEach(r => {
        if (r.type === 'off') return;
        const d = new Date(r.date);
        d.setHours(0,0,0,0);
        if (d.getFullYear() === window.currentYear && d <= today) {
            const hours = r.hours || 7.5;
            let amount = hours * rate;
            if (r.type === 'night') amount = hours * rate * 1.2;
            if (r.type === 'overtime') amount = hours * rate * 1.5;
            if (r.type === 'sat') amount = hours * rate * 1.5 + 25;
            if (r.type === 'sun') amount = hours * rate * 2.0;
            if (r.type === 'extra') amount = (hours/2) * rate * 1.36;
            if (r.type === 'sick') amount = hours * rate * 0.6;
            months[d.getMonth()] += amount;
        }
    });
    
    // Уничтожаем старый график
    if (window.yearChart) window.yearChart.destroy();
    
    const ctx = canvas.getContext('2d');
    const textColor = getComputedStyle(document.documentElement).getPropertyValue('--text').trim() || '#ffffff';
    const gridColor = getComputedStyle(document.documentElement).getPropertyValue('--border').trim() || '#334155';
    
    window.yearChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'],
            datasets: [{
                label: t('monthlyIncome') || 'Доход €',
                data: months,
                borderColor: '#00b060',
                backgroundColor: 'rgba(0,176,96,0.15)',
                fill: true,
                tension: 0.4,
                pointBackgroundColor: '#00b060',
                pointBorderColor: '#fff',
                pointRadius: 4,
                pointHoverRadius: 6
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
};

// Расчет всей статистики
window.calculateAllStats = function() {
    window.calculateDashboardStats();
    setTimeout(() => {
        window.buildYearChart();
        if (window.updateFinanceStats) window.updateFinanceStats();
    }, 50);
};
