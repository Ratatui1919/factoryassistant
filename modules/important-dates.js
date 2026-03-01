// modules/important-dates.js - ВАЖНЫЕ ДАТЫ

import { getCurrentUser } from './auth.js';
import { t } from './utils.js';

// ПРАЗДНИКИ 2026
const holidays = {
    0: [ // Январь
        { day: 1, name: 'holiday1', icon: '🇸🇰' },
        { day: 6, name: 'holiday2', icon: '👑' }
    ],
    3: [ // Апрель
        { day: 3, name: 'holiday3', icon: '✝️' },
        { day: 6, name: 'holiday4', icon: '🐣' }
    ],
    4: [ // Май
        { day: 1, name: 'holiday5', icon: '⚒️' }
    ],
    6: [ // Июль
        { day: 5, name: 'holiday6', icon: '📜' }
    ],
    7: [ // Август
        { day: 29, name: 'holiday7', icon: '⚔️' }
    ],
    10: [ // Ноябрь
        { day: 1, name: 'holiday8', icon: '🕯️' }
    ],
    11: [ // Декабрь
        { day: 24, name: 'holiday9', icon: '🎄' },
        { day: 25, name: 'holiday10', icon: '🎅' },
        { day: 26, name: 'holiday10', icon: '🎁' }
    ]
};

// ТИПЫ ДНЕЙ ДЛЯ ЛЕГЕНДЫ
const dayTypes = [
    { color: '#f39c12', icon: '💼', name: 'work' },
    { color: '#2c3e50', icon: '🌙', name: 'nightShift' },
    { color: '#e74c3c', icon: '⏰', name: 'overtime' },
    { color: '#8e44ad', icon: '📆', name: 'saturday' },
    { color: '#f39c12', icon: '☀️', name: 'sunday' },
    { color: '#27ae60', icon: '➕', name: 'extraBlocks' },
    { color: '#7f8c8d', icon: '🤒', name: 'sick' },
    { color: '#f1c40f', icon: '🏖️', name: 'vacation' },
    { color: '#9b59b6', icon: '🩺', name: 'doctor' },
    { color: '#2c3e50', icon: '❌', name: 'dayOff' }
];

// ПОЛУЧАЕМ 3-Й РАБОЧИЙ ДЕНЬ
function getSalaryDay(month) {
    let workDays = 0;
    let day = 1;
    const maxDays = new Date(2026, month + 1, 0).getDate();
    
    while (workDays < 3 && day <= maxDays) {
        const date = new Date(2026, month, day);
        const dayOfWeek = date.getDay();
        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
        const monthHolidays = holidays[month] || [];
        const isHoliday = monthHolidays.some(h => h.day === day);
        
        if (!isWeekend && !isHoliday) {
            workDays++;
            if (workDays === 3) return day;
        }
        day++;
    }
    return day;
}

// ОБНОВЛЕНИЕ ИКОНОК В КАЛЕНДАРЕ
export function updateCalendarIcons() {
    const month = window.currentMonth;
    const salaryDay = getSalaryDay(month);
    const monthHolidays = holidays[month] || [];
    
    // Удаляем старые иконки
    document.querySelectorAll('.day-icons-container').forEach(el => el.remove());
    document.querySelectorAll('.has-salary, .has-holiday').forEach(el => {
        el.classList.remove('has-salary', 'has-holiday');
    });
    
    const cells = document.querySelectorAll('#calendarGrid .day:not(.empty)');
    
    cells.forEach(cell => {
        const dayNum = cell.querySelector('.day-number')?.textContent;
        if (!dayNum) return;
        
        const day = parseInt(dayNum);
        const hasSalary = (day === salaryDay);
        const holiday = monthHolidays.find(h => h.day === day);
        
        if (hasSalary || holiday) {
            let container = cell.querySelector('.day-icons-container');
            if (!container) {
                container = document.createElement('div');
                container.className = 'day-icons-container';
                cell.appendChild(container);
            }
            
            if (hasSalary) {
                cell.classList.add('has-salary');
                const icon = document.createElement('span');
                icon.className = 'day-icon-important';
                icon.textContent = '💰';
                icon.title = t('salary');
                container.appendChild(icon);
            }
            
            if (holiday) {
                cell.classList.add('has-holiday');
                const icon = document.createElement('span');
                icon.className = 'day-icon-important';
                icon.textContent = holiday.icon;
                icon.title = t(holiday.name);
                container.appendChild(icon);
            }
        }
    });
}

// СОЗДАНИЕ ЛЕГЕНДЫ
export function createLegend() {
    const legendContainer = document.querySelector('.calendar-legend');
    if (!legendContainer) return;

    let html = `
        <div class="legend-grid">
            <div class="legend-section">
                <div class="legend-title">${t('dayTypes') || 'Типы дней'}</div>
                <div class="legend-items">
    `;
    
    dayTypes.forEach(d => {
        html += `
            <div class="legend-item" title="${t(d.name)}">
                <span class="legend-color" style="background: ${d.color};"></span>
                <span class="legend-icon">${d.icon}</span>
                <span class="legend-text">${t(d.name)}</span>
            </div>
        `;
    });
    
    html += `
            </div>
        </div>
        <div class="legend-section">
            <div class="legend-title">${t('importantDates') || 'Важные даты'}</div>
            <div class="legend-items">
                <div class="legend-item" title="${t('salary')}">
                    <span class="legend-color" style="background: #00b060;"></span>
                    <span class="legend-icon">💰</span>
                    <span class="legend-text">${t('salary')}</span>
                </div>
    `;
    
    // Уникальные праздники
    const seen = new Set();
    Object.values(holidays).flat().forEach(h => {
        if (!seen.has(h.icon)) {
            seen.add(h.icon);
            html += `
                <div class="legend-item" title="${t(h.name)}">
                    <span class="legend-color" style="background: #f59e0b;"></span>
                    <span class="legend-icon">${h.icon}</span>
                    <span class="legend-text">${t(h.name)}</span>
                </div>
            `;
        }
    });
    
    html += `
            </div>
        </div>
    </div>
    `;
    
    legendContainer.innerHTML = html;
}

// СОЗДАНИЕ ВИДЖЕТА
export function createWidget() {
    const oldWidget = document.getElementById('importantDatesWidget');
    if (oldWidget) oldWidget.remove();
    
    const month = window.currentMonth;
    const today = new Date();
    const currentDate = { 
        day: today.getDate(), 
        month: today.getMonth(), 
        year: today.getFullYear() 
    };
    
    const dates = [];
    
    // Зарплата
    dates.push({
        day: getSalaryDay(month),
        month: month,
        type: 'salary',
        name: t('salary'),
        icon: '💰'
    });
    
    // Праздники
    (holidays[month] || []).forEach(h => {
        dates.push({
            day: h.day,
            month: month,
            type: 'holiday',
            name: t(h.name),
            icon: h.icon
        });
    });
    
    dates.sort((a, b) => a.day - b.day);
    
    const insertPoint = document.querySelector('.stats-row');
    if (!insertPoint) {
        console.log('stats-row не найден');
        return;
    }
    
    let itemsHtml = '';
    
    dates.forEach(d => {
        const eventDate = new Date(2026, d.month, d.day);
        const currentDateTime = new Date(currentDate.year, currentDate.month, currentDate.day);
        const diffTime = eventDate - currentDateTime;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        let badge = '';
        if (diffDays < 0) badge = t('past') || 'прошло';
        else if (diffDays === 0) badge = t('today') || 'сегодня';
        else if (diffDays === 1) badge = t('tomorrow') || 'завтра';
        else badge = `${diffDays} ${t('days') || 'дн.'}`;
        
        const months = ['january', 'february', 'march', 'april', 'may', 'june', 
                       'july', 'august', 'september', 'october', 'november', 'december'];
        const monthName = t(months[d.month]) || months[d.month];
        const dateStr = `${d.day} ${monthName}`;
        
        itemsHtml += `
            <div class="widget-item ${d.type}">
                <div class="item-icon" style="background: ${d.type === 'salary' ? '#00b06020' : '#f59e0b20'}; color: ${d.type === 'salary' ? '#00b060' : '#f59e0b'};">${d.icon}</div>
                <div class="item-content">
                    <div class="item-title">${d.name}</div>
                    <div class="item-date">${dateStr}</div>
                </div>
                <div class="item-badge ${diffDays < 0 ? 'past' : diffDays === 0 ? 'today' : diffDays === 1 ? 'tomorrow' : 'future'}">${badge}</div>
            </div>
        `;
    });
    
    const widget = document.createElement('div');
    widget.id = 'importantDatesWidget';
    widget.className = 'important-widget';
    widget.innerHTML = `
        <div class="widget-header">
            <i class="fas fa-calendar-alt"></i>
            <h3>${t('upcomingDates') || 'Ближайшие даты'}</h3>
        </div>
        <div class="widget-items">
            ${itemsHtml}
        </div>
    `;
    
    insertPoint.parentNode.insertBefore(widget, insertPoint.nextSibling);
    console.log('Виджет создан');
}

// ИНИЦИАЛИЗАЦИЯ
export function initImportantDates() {
    console.log('Инициализация важных дат');
    setTimeout(() => {
        createLegend();
        createWidget();
        updateCalendarIcons();
    }, 500);
}

// ПЕРЕХВАТ ФУНКЦИЙ
document.addEventListener('DOMContentLoaded', function() {
    // Ждем, когда все функции будут доступны
    setTimeout(() => {
        initImportantDates();
    }, 1000);
});

// Перехватываем changeMonth
const originalChangeMonth = window.changeMonth;
if (originalChangeMonth) {
    window.changeMonth = function(delta) {
        originalChangeMonth(delta);
        setTimeout(() => {
            updateCalendarIcons();
            createWidget();
        }, 300);
    };
}

// Перехватываем setView
const originalSetView = window.setView;
if (originalSetView) {
    window.setView = function(view) {
        originalSetView(view);
        setTimeout(() => {
            if (view === 'calendar') {
                createLegend();
                updateCalendarIcons();
            }
            if (view === 'dashboard') {
                createWidget();
            }
        }, 300);
    };
}
