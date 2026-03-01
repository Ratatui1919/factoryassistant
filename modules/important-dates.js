// modules/important-dates.js - Модуль важных дат

(function() {
    console.log('🔥 Модуль важных дат загружается...');

    // ГОСУДАРСТВЕННЫЕ ПРАЗДНИКИ СЛОВАКИИ 2026
    const SLOVAK_HOLIDAYS_2026 = [
        { day: 1, month: 0, type: 'holiday', name: '🇸🇰 День образования Словацкой Республики', shortName: '🇸🇰' },
        { day: 6, month: 0, type: 'holiday', name: '👑 Богоявление (Три короля)', shortName: '👑' },
        { day: 3, month: 3, type: 'holiday', name: '✝️ Страстная пятница', shortName: '✝️' },
        { day: 6, month: 3, type: 'holiday', name: '🐣 Пасхальный понедельник', shortName: '🐣' },
        { day: 1, month: 4, type: 'holiday', name: '⚒️ День труда', shortName: '⚒️' },
        { day: 5, month: 6, type: 'holiday', name: '📜 День святых Кирилла и Мефодия', shortName: '📜' },
        { day: 29, month: 7, type: 'holiday', name: '⚔️ День Словацкого национального восстания', shortName: '⚔️' },
        { day: 1, month: 10, type: 'holiday', name: '🕯️ День всех святых', shortName: '🕯️' },
        { day: 24, month: 11, type: 'holiday', name: '🎄 Сочельник', shortName: '🎄' },
        { day: 25, month: 11, type: 'holiday', name: '🎅 Рождество', shortName: '🎅' },
        { day: 26, month: 11, type: 'holiday', name: '🎁 Второй день Рождества', shortName: '🎁' }
    ];

    // Проверяем, является ли день праздником
    function isHoliday(year, month, day) {
        if (year !== 2026) return false;
        return SLOVAK_HOLIDAYS_2026.some(h => h.day === day && h.month === month);
    }

    // Получаем 3-й рабочий день месяца (УЧИТЫВАЕМ ПРАЗДНИКИ!)
    function getSalaryDay(year, month) {
        let workingDays = 0;
        let day = 1;
        const maxDays = new Date(year, month + 1, 0).getDate();
        
        while (workingDays < 3 && day <= maxDays) {
            const date = new Date(year, month, day);
            const dayOfWeek = date.getDay(); // 0 = вс, 6 = сб
            
            // Рабочий день: пн-пт И НЕ праздник
            if (dayOfWeek !== 0 && dayOfWeek !== 6 && !isHoliday(year, month, day)) {
                workingDays++;
                if (workingDays === 3) {
                    console.log(`💰 День зарплаты в ${month+1} месяце: ${day} число`);
                    return day;
                }
            }
            day++;
        }
        console.log(`💰 День зарплаты в ${month+1} месяце: ${day} число (по умолчанию)`);
        return day;
    }

    // Получаем все важные даты для месяца
    function getImportantDates(year, month) {
        const dates = [];
        
        // День зарплаты
        dates.push({
            day: getSalaryDay(year, month),
            type: 'salary',
            name: '💰 Зарплата',
            shortName: '💰',
            icon: '💰'
        });
        
        // Праздники
        SLOVAK_HOLIDAYS_2026.forEach(h => {
            if (h.month === month) {
                dates.push({
                    day: h.day,
                    type: 'holiday',
                    name: h.name,
                    shortName: h.shortName,
                    icon: h.shortName
                });
            }
        });
        
        return dates;
    }

    // Добавляем иконки в календарь (СОХРАНЯЕМ ОБЕ ИКОНКИ!)
    function addIconsToCalendar() {
        const year = window.currentYear || new Date().getFullYear();
        const month = window.currentMonth || new Date().getMonth();
        
        const importantDates = getImportantDates(year, month);
        console.log('📅 Важные даты на этот месяц:', importantDates);
        
        const calendarGrid = document.getElementById('calendarGrid');
        if (!calendarGrid) {
            console.log('❌ Календарь не найден');
            return;
        }
        
        const dayCells = calendarGrid.querySelectorAll('.day:not(.empty)');
        console.log(`📆 Найдено ячеек: ${dayCells.length}`);
        
        dayCells.forEach(cell => {
            const dayNum = cell.querySelector('.day-number')?.textContent;
            if (!dayNum) return;
            
            // Находим все важные даты для этого дня (МОЖЕТ БЫТЬ НЕСКОЛЬКО!)
            const datesForDay = importantDates.filter(d => d.day == dayNum);
            
            if (datesForDay.length > 0) {
                console.log(`📌 День ${dayNum}: важных дат - ${datesForDay.length}`);
                
                // Добавляем классы для каждой даты
                datesForDay.forEach(date => {
                    cell.classList.add(`has-${date.type}`);
                });
                
                // СОЗДАЕМ КОНТЕЙНЕР ДЛЯ ИКОНОК, если его нет
                let iconContainer = cell.querySelector('.day-icons-container');
                if (!iconContainer) {
                    iconContainer = document.createElement('div');
                    iconContainer.className = 'day-icons-container';
                    
                    // Перемещаем существующую иконку в контейнер
                    const oldIcon = cell.querySelector('.day-icon');
                    if (oldIcon) {
                        iconContainer.appendChild(oldIcon.cloneNode(true));
                        oldIcon.remove();
                    }
                    
                    cell.appendChild(iconContainer);
                }
                
                // Добавляем иконки для всех важных дат (НО НЕ УДАЛЯЕМ СТАРЫЕ!)
                datesForDay.forEach(date => {
                    // Проверяем, нет ли уже такой иконки
                    const existingIcons = iconContainer.querySelectorAll('.day-icon-important');
                    let alreadyExists = false;
                    existingIcons.forEach(icon => {
                        if (icon.textContent === date.shortName) alreadyExists = true;
                    });
                    
                    if (!alreadyExists) {
                        const iconSpan = document.createElement('span');
                        iconSpan.className = `day-icon-important ${date.type}-icon`;
                        iconSpan.textContent = date.shortName;
                        iconSpan.setAttribute('title', date.name);
                        iconContainer.appendChild(iconSpan);
                    }
                });
                
                // Обновляем title ячейки
                const titles = datesForDay.map(d => d.name).join(', ');
                cell.setAttribute('title', titles);
            }
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
            /* Контейнер для иконок */
            .day-icons-container {
                display: flex;
                gap: 2px;
                justify-content: center;
                margin-top: 2px;
            }
            
            /* Иконки важных дат */
            .day-icon-important {
                font-size: 0.9rem;
                line-height: 1;
            }
            
            /* Старая иконка (тип дня) */
            .day-icon {
                font-size: 1.2rem;
            }
            
            /* Фон для дней с зарплатой */
            .day.has-salary {
                background: linear-gradient(145deg, rgba(0,176,96,0.15), rgba(0,176,96,0.05)) !important;
                border: 2px solid #00b060 !important;
            }
            
            /* Фон для дней с праздником */
            .day.has-holiday {
                background: linear-gradient(145deg, rgba(245,158,11,0.15), rgba(245,158,11,0.05)) !important;
                border: 2px solid #f59e0b !important;
            }
            
            /* Если день и зарплата и праздник */
            .day.has-salary.has-holiday {
                background: linear-gradient(145deg, rgba(0,176,96,0.1), rgba(245,158,11,0.1)) !important;
                border: 2px solid linear-gradient(90deg, #00b060, #f59e0b) !important;
            }
            
            /* Виджет */
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
