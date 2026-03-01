// js/calendar.js - КАЛЕНДАРЬ

import { getCurrentUser, updateUserData } from './auth.js';
import { showModal, hideModal, showNotification, t } from './utils.js';

// Построение календаря
window.buildCalendar = function() {
    const grid = document.getElementById('calendarGrid');
    if (!grid) return;
    
    const year = window.currentYear;
    const month = window.currentMonth;
    
    grid.innerHTML = '';
    
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    let firstDay = new Date(year, month, 1).getDay();
    firstDay = firstDay === 0 ? 6 : firstDay - 1;
    
    const today = new Date();
    today.setHours(0,0,0,0);
    const todayYear = today.getFullYear();
    const todayMonth = today.getMonth();
    const todayDate = today.getDate();
    
    // Пустые ячейки перед первым днем
    for (let i = 0; i < firstDay; i++) {
        let empty = document.createElement('div');
        empty.className = 'day empty';
        grid.appendChild(empty);
    }
    
    // Ячейки дней
    for (let d = 1; d <= daysInMonth; d++) {
        let cell = document.createElement('div');
        cell.className = 'day';
        
        let isPast = false;
        if (year < todayYear) isPast = true;
        else if (year === todayYear && month < todayMonth) isPast = true;
        else if (year === todayYear && month === todayMonth && d < todayDate) isPast = true;
        
        if (!isPast && !(year === todayYear && month === todayMonth && d === todayDate)) {
            cell.classList.add('future');
        }
        
        cell.innerHTML = `<span class="day-number">${d}</span><span class="day-icon">📅</span>`;
        
        // Отмечаем существующие записи
        const user = getCurrentUser();
        if (user?.records) {
            let dateStr = `${year}-${String(month+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
            let record = user.records.find(r => r.date === dateStr);
            if (record) {
                cell.classList.add(record.type);
                let iconSpan = cell.querySelector('.day-icon');
                if (iconSpan) {
                    const icons = { 
                        work:'💼', night:'🌙', overtime:'⏰', sat:'📆', 
                        sun:'☀️', extra:'➕', sick:'🤒', vacation:'🏖️', 
                        doctor:'🩺', off:'❌' 
                    };
                    iconSpan.textContent = icons[record.type] || '📅';
                }
            }
        }
        
        // Клик по дню
        if (isPast || (year === todayYear && month === todayMonth && d === todayDate)) {
            cell.onclick = () => { 
                window.selectedDay = d; 
                showModal('dayModal'); 
            };
        }
        
        grid.appendChild(cell);
    }
};

// Добавление записи
window.addRecord = async function(type) {
    const user = getCurrentUser();
    if (!user || window.selectedDay === undefined) return;
    
    const year = window.currentYear;
    const month = window.currentMonth;
    
    let dateStr = `${year}-${String(month+1).padStart(2,'0')}-${String(window.selectedDay).padStart(2,'0')}`;
    let oldRecord = user.records?.find(r => r.date === dateStr);
    
    // Обновляем счетчики
    if (oldRecord) {
        if (oldRecord.type === 'doctor') user.settings.usedPersonalDoctor = Math.max(0, (user.settings.usedPersonalDoctor || 0) - 1);
        if (oldRecord.type === 'sat' || oldRecord.type === 'sun') user.settings.usedWeekends = Math.max(0, (user.settings.usedWeekends || 0) - 1);
    }
    
    user.records = user.records?.filter(r => r.date !== dateStr) || [];
    
    if (type !== 'off') {
        user.records.push({ date: dateStr, type: type, hours: 7.5 });
        if (type === 'doctor') user.settings.usedPersonalDoctor = (user.settings.usedPersonalDoctor || 0) + 1;
        if (type === 'sat' || type === 'sun') user.settings.usedWeekends = (user.settings.usedWeekends || 0) + 1;
    }
    
    await updateUserData({ records: user.records, settings: user.settings });
    
    hideModal('dayModal');
    window.buildCalendar();
    if (window.calculateAllStats) window.calculateAllStats();
    
    showNotification(t('recordAdded') || 'Запись добавлена');
};

// Закрытие модалки
window.closeModal = function() { 
    hideModal('dayModal'); 
};

// Смена месяца
window.changeMonth = function(delta) {
    if (typeof delta === 'number') {
        window.currentMonth += delta;
    } else return;
    
    if (window.currentMonth < 0) { 
        window.currentMonth = 11; 
        window.currentYear--; 
    }
    else if (window.currentMonth > 11) { 
        window.currentMonth = 0; 
        window.currentYear++; 
    }
    
    if (window.updateMonthDisplay) window.updateMonthDisplay();
    window.buildCalendar();
    if (window.calculateAllStats) window.calculateAllStats();
};

// Обновление отображения месяца
window.updateMonthDisplay = function() {
    const monthNames = [
        t('january'), t('february'), t('march'), t('april'),
        t('may'), t('june'), t('july'), t('august'),
        t('september'), t('october'), t('november'), t('december')
    ];
    
    document.getElementById('currentMonth').innerText = monthNames[window.currentMonth] + ' ' + window.currentYear;
    document.getElementById('calendarMonth').innerText = monthNames[window.currentMonth] + ' ' + window.currentYear;
    document.getElementById('financeMonth').innerText = monthNames[window.currentMonth] + ' ' + window.currentYear;
};
