// modules/important-dates.js - Модуль важных дат

(function() {
    console.log('🔥 Модуль важных дат загружается...');

    // ГОСУДАРСТВЕННЫЕ ПРАЗДНИКИ СЛОВАКИИ 2026
    const SLOVAK_HOLIDAYS_2026 = [
        { day: 1, month: 0, name: '🇸🇰 День образования Словацкой Республики', icon: '🇸🇰' },
        { day: 6, month: 0, name: '👑 Богоявление (Три короля)', icon: '👑' },
        { day: 3, month: 3, name: '✝️ Страстная пятница', icon: '✝️' },
        { day: 6, month: 3, name: '🐣 Пасхальный понедельник', icon: '🐣' },
        { day: 1, month: 4, name: '⚒️ День труда', icon: '⚒️' },
        { day: 5, month: 6, name: '📜 День святых Кирилла и Мефодия', icon: '📜' },
        { day: 29, month: 7, name: '⚔️ День Словацкого национального восстания', icon: '⚔️' },
        { day: 1, month: 10, name: '🕯️ День всех святых', icon: '🕯️' },
        { day: 24, month: 11, name: '🎄 Сочельник', icon: '🎄' },
        { day: 25, month: 11, name: '🎅 Рождество', icon: '🎅' },
        { day: 26, month: 11, name: '🎁 Второй день Рождества', icon: '🎁' }
    ];

    // Проверяем, является ли день праздником
    function isHoliday(year, month, day) {
        if (year !== 2026) return false;
        return SLOVAK_HOLIDAYS_2026.some(h => h.day === day && h.month === month);
    }

    // ПОЛУЧАЕМ 3-Й РАБОЧИЙ ДЕНЬ МЕСЯЦА
    function getSalaryDay(year, month) {
        let workingDays = 0;
        let day = 1;
        const maxDays = new Date(year, month + 1, 0).getDate();
        
        while (workingDays < 3 && day <= maxDays) {
            const date = new Date(year, month, day);
            const dayOfWeek = date.getDay(); // 0 = вс, 6 = сб
            const isWeekend = (dayOfWeek === 0 || dayOfWeek === 6);
            const isHolidayDay = isHoliday(year, month, day);
            
            if (!isWeekend && !isHolidayDay) {
                workingDays++;
                if (workingDays === 3) {
                    return day;
                }
            }
            day++;
        }
        return day;
    }

    // Получаем текущий месяц и год из глобальных переменных ИЛИ из заголовка календаря
    function getCurrentMonthYear() {
        // Сначала пробуем получить из глобальных переменных
        if (typeof window.currentMonth !== 'undefined' && typeof window.currentYear !== 'undefined') {
            return {
                month: window.currentMonth,
                year: window.currentYear
            };
        }
        
        // Если нет - пробуем получить из заголовка календаря
        const calendarTitle = document.getElementById('calendarMonth') || document.getElementById('currentMonth');
        if (calendarTitle) {
            const titleText = calendarTitle.textContent;
            const months = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 
                           'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];
            
            for (let i = 0; i < months.length; i++) {
                if (titleText.toLowerCase().includes(months[i])) {
                    const yearMatch = titleText.match(/\d{4}/);
                    if (yearMatch) {
                        return {
                            month: i,
                            year: parseInt(yearMatch[0])
                        };
                    }
                }
            }
        }
        
        // Если ничего не нашли - используем текущую дату
        const now = new Date();
        return {
            month: now.getMonth(),
            year: now.getFullYear()
        };
    }

    // Получаем все важные даты для указанного месяца
    function getImportantDates(year, month) {
        const dates = [];
        
        // День зарплаты
        const salaryDay = getSalaryDay(year, month);
        dates.push({
            day: salaryDay,
            type: 'salary',
            name: '💰 Зарплата',
            icon: '💰'
        });
        
        // Праздники
        SLOVAK_HOLIDAYS_2026.forEach(h => {
            if (h.month === month) {
                dates.push({
                    day: h.day,
                    type: 'holiday',
                    name: h.name,
                    icon: h.icon
                });
            }
        });
        
        return dates;
    }

    // Обновляем иконки в календаре
    function updateCalendarIcons() {
        const { year, month } = getCurrentMonthYear();
        
        const importantDates = getImportantDates(year, month);
        
        const calendarGrid = document.getElementById('calendarGrid');
        if (!calendarGrid) return;
        
        const dayCells = calendarGrid.querySelectorAll('.day:not(.empty)');
        
        dayCells.forEach(cell => {
            const dayNum = cell.querySelector('.day-number')?.textContent;
            if (!dayNum) return;
            
            const day = parseInt(dayNum);
            
            // Находим все важные даты для этого дня
            const datesForDay = importantDates.filter(d => d.day === day);
            
            // Удаляем старые классы
            cell.classList.remove('has-salary', 'has-holiday');
            
            // Удаляем старый контейнер иконок
            const oldContainer = cell.querySelector('.day-icons-container');
            if (oldContainer) {
                oldContainer.remove();
            }
            
            if (datesForDay.length > 0) {
                // Добавляем классы
                datesForDay.forEach(date => {
                    cell.classList.add(`has-${date.type}`);
                });
                
                // Создаем контейнер для иконок
                const iconContainer = document.createElement('div');
                iconContainer.className = 'day-icons-container';
                
                // Добавляем иконки
                datesForDay.forEach(date => {
                    const iconSpan = document.createElement('span');
                    iconSpan.className = `day-icon-important ${date.type}-icon`;
                    iconSpan.textContent = date.icon;
                    iconSpan.setAttribute('title', date.name);
                    iconContainer.appendChild(iconSpan);
                });
                
                cell.appendChild(iconContainer);
            }
        });
    }

    // Обновляем виджет в дашборде
    function updateDashboardWidget() {
        const { year, month } = getCurrentMonthYear();
        const now = new Date();
        const currentDay = now.getDate();
        
        const importantDates = getImportantDates(year, month);
        
        // Фильтруем даты в этом месяце
        const upcoming = importantDates
            .map(d => ({
                ...d,
                date: new Date(year, month, d.day),
                diff: d.day - currentDay
            }))
            .filter(d => d.diff >= 0) // Только будущие или сегодня
            .sort((a, b) => a.diff - b.diff)
            .slice(0, 5);
        
        // Удаляем старый виджет
        const oldWidget = document.getElementById('importantDatesWidget');
        if (oldWidget) {
            oldWidget.remove();
        }
        
        if (upcoming.length === 0) return;
        
        // Создаем новый виджет
        const widget = document.createElement('div');
        widget.className = 'important-dates-widget glass-effect';
        widget.id = 'importantDatesWidget';
        
        let widgetHTML = `
            <div class="widget-header">
                <i class="fas fa-calendar-star"></i>
                <h3>📅 Ближайшие даты</h3>
            </div>
            <div class="dates-list">
        `;
        
        upcoming.forEach(d => {
            let countdownText = '';
            if (d.diff === 0) countdownText = 'сегодня';
            else if (d.diff === 1) countdownText = 'завтра';
            else countdownText = `через ${d.diff} дн.`;
            
            const monthName = d.date.toLocaleDateString('ru-RU', { month: 'long' });
            
            widgetHTML += `
                <div class="date-item ${d.type}" title="${d.name}">
                    <div class="date-icon">${d.icon}</div>
                    <div class="date-info">
                        <div class="date-title">${d.name}</div>
                        <div class="date-day">${d.day} ${monthName}</div>
                    </div>
                    <div class="date-countdown">${countdownText}</div>
                </div>
            `;
        });
        
        widgetHTML += `</div>`;
        widget.innerHTML = widgetHTML;
        
        // Добавляем виджет на страницу
        const insertPoint = document.querySelector('.stats-row') || document.querySelector('.kpi-grid');
        if (insertPoint) {
            insertPoint.parentNode.insertBefore(widget, insertPoint.nextSibling);
        }
    }

    // Добавляем стили
    function addStyles() {
        if (document.getElementById('important-dates-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'important-dates-styles';
        style.textContent = `
            .day {
                position: relative;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                padding: 8px 4px !important;
            }
            
            .day-icons-container {
                display: flex;
                gap: 2px;
                justify-content: center;
                margin-top: 2px;
                flex-wrap: wrap;
                min-height: 20px;
            }
            
            .day-icon-important {
                font-size: 1rem;
                line-height: 1;
            }
            
            .day-icon {
                font-size: 1.2rem;
                margin-top: 2px;
            }
            
            .day.has-salary {
                background: linear-gradient(145deg, rgba(0,176,96,0.2), rgba(0,176,96,0.05)) !important;
                border: 2px solid #00b060 !important;
            }
            
            .day.has-holiday {
                background: linear-gradient(145deg, rgba(245,158,11,0.2), rgba(245,158,11,0.05)) !important;
                border: 2px solid #f59e0b !important;
            }
            
            .day.has-salary.has-holiday {
                background: linear-gradient(145deg, rgba(0,176,96,0.15), rgba(245,158,11,0.1)) !important;
                border: 2px solid;
                border-color: #00b060 #f59e0b #00b060 #f59e0b !important;
            }
            
            .important-dates-widget {
                margin: 20px 0;
                padding: 20px;
                border-radius: 20px;
                background: var(--glass-bg);
                backdrop-filter: blur(10px);
                border: 1px solid var(--border);
                animation: fadeIn 0.5s ease;
            }
            
            .widget-header {
                display: flex;
                align-items: center;
                gap: 8px;
                margin-bottom: 15px;
            }
            
            .widget-header h3 {
                color: var(--primary);
                font-size: 1.2rem;
                margin: 0;
            }
            
            .dates-list {
                display: flex;
                flex-direction: column;
                gap: 10px;
            }
            
            .date-item {
                display: flex;
                align-items: center;
                gap: 12px;
                padding: 12px;
                background: var(--dark-light);
                border-radius: 12px;
                border-left: 4px solid;
                transition: transform 0.2s;
                cursor: help;
            }
            
            .date-item:hover {
                transform: translateX(5px);
            }
            
            .date-item.salary {
                border-left-color: #00b060;
                background: linear-gradient(90deg, rgba(0,176,96,0.1), transparent);
            }
            
            .date-item.holiday {
                border-left-color: #f59e0b;
                background: linear-gradient(90deg, rgba(245,158,11,0.1), transparent);
            }
            
            .date-icon {
                font-size: 1.5rem;
                min-width: 40px;
                text-align: center;
            }
            
            .date-info {
                flex: 1;
                min-width: 0;
            }
            
            .date-title {
                font-weight: 600;
                color: var(--text);
                font-size: 0.95rem;
            }
            
            .date-day {
                font-size: 0.8rem;
                color: var(--text-muted);
            }
            
            .date-countdown {
                font-size: 0.85rem;
                font-weight: 500;
                color: var(--primary);
                white-space: nowrap;
                padding: 4px 8px;
                background: var(--dark);
                border-radius: 20px;
            }
            
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
        `;
        document.head.appendChild(style);
    }

    // Инициализация
    function init() {
        addStyles();
        
        // Перехватываем функцию changeMonth
        const originalChangeMonth = window.changeMonth;
        if (originalChangeMonth) {
            window.changeMonth = function(delta) {
                originalChangeMonth(delta);
                // Обновляем всё после смены месяца
                setTimeout(() => {
                    updateCalendarIcons();
                    updateDashboardWidget();
                }, 300);
            };
        }
        
        // Перехватываем функцию setView
        const originalSetView = window.setView;
        if (originalSetView) {
            window.setView = function(view) {
                originalSetView(view);
                if (view === 'calendar') {
                    setTimeout(updateCalendarIcons, 200);
                }
                if (view === 'dashboard') {
                    setTimeout(updateDashboardWidget, 200);
                }
            };
        }
        
        // Перехватываем функцию addRecord
        const originalAddRecord = window.addRecord;
        if (originalAddRecord) {
            window.addRecord = function(type) {
                originalAddRecord(type);
                setTimeout(updateCalendarIcons, 200);
            };
        }
        
        // Ждем появления календаря
        const waitForCalendar = setInterval(() => {
            if (document.getElementById('calendarGrid')) {
                clearInterval(waitForCalendar);
                setTimeout(updateCalendarIcons, 500);
            }
        }, 100);
        
        // Добавляем виджет
        setTimeout(updateDashboardWidget, 1000);
    }

    // Запускаем
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        setTimeout(init, 500);
    }
})();
