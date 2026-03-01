// modules/important-dates.js - Модуль важных дат

(function() {
    console.log('🔥 Модуль важных дат загружается...');

    // ГОСУДАРСТВЕННЫЕ ПРАЗДНИКИ СЛОВАКИИ 2026
    const SLOVAK_HOLIDAYS_2026 = [
        { day: 1, month: 0, type: 'holiday', name: 'День образования Словацкой Республики', icon: '🇸🇰' },
        { day: 6, month: 0, type: 'holiday', name: 'Богоявление (Три короля)', icon: '👑' },
        { day: 3, month: 3, type: 'holiday', name: 'Страстная пятница', icon: '✝️' },
        { day: 6, month: 3, type: 'holiday', name: 'Пасхальный понедельник', icon: '🐣' },
        { day: 1, month: 4, type: 'holiday', name: 'День труда', icon: '⚒️' },
        { day: 5, month: 6, type: 'holiday', name: 'День святых Кирилла и Мефодия', icon: '📜' },
        { day: 29, month: 7, type: 'holiday', name: 'День Словацкого национального восстания', icon: '⚔️' },
        { day: 1, month: 10, type: 'holiday', name: 'День всех святых', icon: '🕯️' },
        { day: 24, month: 11, type: 'holiday', name: 'Сочельник', icon: '🎄' },
        { day: 25, month: 11, type: 'holiday', name: 'Рождество', icon: '🎅' },
        { day: 26, month: 11, type: 'holiday', name: 'Второй день Рождества', icon: '🎁' }
    ];

    // Получаем 3-й рабочий день месяца
    function getSalaryDay(year, month) {
        let workingDays = 0;
        let day = 1;
        const maxDays = new Date(year, month + 1, 0).getDate();
        
        while (workingDays < 3 && day <= maxDays) {
            const date = new Date(year, month, day);
            const dayOfWeek = date.getDay();
            
            if (dayOfWeek !== 0 && dayOfWeek !== 6) {
                workingDays++;
                if (workingDays === 3) return day;
            }
            day++;
        }
        return day;
    }

    // Получаем все важные даты для месяца
    function getImportantDates(year, month) {
        const dates = [];
        
        // День зарплаты
        dates.push({
            day: getSalaryDay(year, month),
            type: 'salary',
            name: 'Зарплата',
            icon: '💰'
        });
        
        // Праздники
        SLOVAK_HOLIDAYS_2026.forEach(h => {
            if (h.month === month) {
                dates.push({...h});
            }
        });
        
        return dates;
    }

    // Добавляем иконки в календарь
    function addIconsToCalendar() {
        const year = window.currentYear || new Date().getFullYear();
        const month = window.currentMonth || new Date().getMonth();
        
        const importantDates = getImportantDates(year, month);
        
        const calendarGrid = document.getElementById('calendarGrid');
        if (!calendarGrid) return;
        
        const dayCells = calendarGrid.querySelectorAll('.day:not(.empty)');
        
        dayCells.forEach(cell => {
            const dayNum = cell.querySelector('.day-number')?.textContent;
            if (!dayNum) return;
            
            const date = importantDates.find(d => d.day == dayNum);
            if (!date) return;
            
            cell.classList.add(`has-${date.type}`);
            
            const iconSpan = cell.querySelector('.day-icon');
            if (iconSpan) {
                iconSpan.textContent = date.icon;
            }
            
            cell.setAttribute('title', date.name);
        });
    }

    // Создаем виджет для дашборда
    function createWidget() {
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth();
        const day = now.getDate();
        
        const importantDates = getImportantDates(year, month);
        
        // Фильтруем только будущие даты
        const upcoming = importantDates
            .filter(d => d.day >= day)
            .map(d => ({
                ...d,
                date: new Date(year, month, d.day),
                diff: d.day - day
            }))
            .sort((a, b) => a.diff - b.diff)
            .slice(0, 5);
        
        const widget = document.createElement('div');
        widget.className = 'important-dates-widget glass-effect';
        widget.id = 'importantDatesWidget';
        widget.innerHTML = `
            <div class="widget-header">
                <i class="fas fa-calendar-star"></i>
                <h3>📅 Важные даты</h3>
            </div>
            <div class="dates-list">
                ${upcoming.map(d => `
                    <div class="date-item ${d.type}">
                        <div class="date-icon">${d.icon}</div>
                        <div class="date-info">
                            <div class="date-title">${d.name}</div>
                            <div class="date-day">${d.day} ${d.date.toLocaleDateString('ru-RU', { month: 'long' })}</div>
                        </div>
                        <div class="date-countdown">
                            ${d.diff === 0 ? 'сегодня' : d.diff === 1 ? 'завтра' : `через ${d.diff} дн.`}
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
        
        return widget;
    }

    // Добавляем стили
    function addStyles() {
        if (document.getElementById('important-dates-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'important-dates-styles';
        style.textContent = `
            .day.has-salary {
                background: linear-gradient(145deg, rgba(0,176,96,0.2), rgba(0,176,96,0.05)) !important;
                border: 2px solid #00b060 !important;
            }
            .day.has-holiday {
                background: linear-gradient(145deg, rgba(245,158,11,0.2), rgba(245,158,11,0.05)) !important;
                border: 2px solid #f59e0b !important;
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

    // Ждем загрузки страницы и добавляем все
    function init() {
        console.log('✅ Модуль важных дат инициализирован');
        
        addStyles();
        
        // Ждем появления календаря
        const waitForCalendar = setInterval(() => {
            if (document.getElementById('calendarGrid') && document.getElementById('calendarGrid').children.length > 7) {
                clearInterval(waitForCalendar);
                addIconsToCalendar();
            }
        }, 100);
        
        // Добавляем виджет в дашборд
        const waitForDashboard = setInterval(() => {
            const insertPoint = document.querySelector('.stats-row') || document.querySelector('.kpi-grid');
            if (insertPoint && !document.getElementById('importantDatesWidget')) {
                clearInterval(waitForDashboard);
                insertPoint.parentNode.insertBefore(createWidget(), insertPoint.nextSibling);
            }
        }, 100);
        
        // Отслеживаем смену месяца
        const originalChangeMonth = window.changeMonth;
        if (originalChangeMonth) {
            window.changeMonth = function(delta) {
                originalChangeMonth(delta);
                setTimeout(addIconsToCalendar, 200);
            };
        }
        
        // Отслеживаем открытие календаря
        const originalSetView = window.setView;
        if (originalSetView) {
            window.setView = function(view) {
                originalSetView(view);
                if (view === 'calendar') {
                    setTimeout(addIconsToCalendar, 200);
                }
            };
        }
    }

    // Запускаем после загрузки DOM
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
