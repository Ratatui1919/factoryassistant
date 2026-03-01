// modules/important-dates.js - КРАСИВАЯ ВЕРСИЯ

(function() {
    console.log('🔥 Модуль важных дат запущен');

    // ВСЕ ПРАЗДНИКИ 2026 ПО МЕСЯЦАМ
    const holidays = {
        0: [ // Январь
            { day: 1, name: 'День образования Словацкой Республики', icon: '🇸🇰', shortName: 'День Республики' },
            { day: 6, name: 'Богоявление (Три короля)', icon: '👑', shortName: 'Богоявление' }
        ],
        1: [ // Февраль
            // нет праздников
        ],
        2: [ // Март
            // нет праздников
        ],
        3: [ // Апрель
            { day: 3, name: 'Страстная пятница', icon: '✝️', shortName: 'Страстная пятница' },
            { day: 6, name: 'Пасхальный понедельник', icon: '🐣', shortName: 'Пасхальный понедельник' }
        ],
        4: [ // Май
            { day: 1, name: 'День труда', icon: '⚒️', shortName: 'День труда' }
        ],
        5: [ // Июнь
            // нет праздников
        ],
        6: [ // Июль
            { day: 5, name: 'День святых Кирилла и Мефодия', icon: '📜', shortName: 'Кирилл и Мефодий' }
        ],
        7: [ // Август
            { day: 29, name: 'День Словацкого национального восстания', icon: '⚔️', shortName: 'День восстания' }
        ],
        8: [ // Сентябрь
            // нет праздников
        ],
        9: [ // Октябрь
            // нет праздников
        ],
        10: [ // Ноябрь
            { day: 1, name: 'День всех святых', icon: '🕯️', shortName: 'День всех святых' }
        ],
        11: [ // Декабрь
            { day: 24, name: 'Сочельник', icon: '🎄', shortName: 'Сочельник' },
            { day: 25, name: 'Рождество', icon: '🎅', shortName: 'Рождество' },
            { day: 26, name: 'Второй день Рождества', icon: '🎁', shortName: 'Рождество' }
        ]
    };

    // ПОЛУЧАЕМ 3-Й РАБОЧИЙ ДЕНЬ
    function getSalaryDay(month, year = 2026) {
        let workDays = 0;
        let day = 1;
        const maxDays = new Date(year, month + 1, 0).getDate();
        
        while (workDays < 3 && day <= maxDays) {
            const date = new Date(year, month, day);
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

    // ПОЛУЧАЕМ ТЕКУЩИЙ МЕСЯЦ
    function getCurrentMonth() {
        const title = document.getElementById('calendarMonth')?.textContent || '';
        
        if (title.includes('январь') || title.includes('Январь')) return 0;
        if (title.includes('февраль') || title.includes('Февраль')) return 1;
        if (title.includes('март') || title.includes('Март')) return 2;
        if (title.includes('апрель') || title.includes('Апрель')) return 3;
        if (title.includes('май') || title.includes('Май')) return 4;
        if (title.includes('июнь') || title.includes('Июнь')) return 5;
        if (title.includes('июль') || title.includes('Июль')) return 6;
        if (title.includes('август') || title.includes('Август')) return 7;
        if (title.includes('сентябрь') || title.includes('Сентябрь')) return 8;
        if (title.includes('октябрь') || title.includes('Октябрь')) return 9;
        if (title.includes('ноябрь') || title.includes('Ноябрь')) return 10;
        if (title.includes('декабрь') || title.includes('Декабрь')) return 11;
        
        return new Date().getMonth();
    }

    // ПОЛУЧАЕМ ТЕКУЩИЙ ДЕНЬ
    function getCurrentDay(selectedMonth) {
        const today = new Date();
        const currentMonth = today.getMonth();
        
        if (selectedMonth === currentMonth) {
            return today.getDate();
        }
        if (selectedMonth > currentMonth) {
            return 0;
        }
        return 999;
    }

    // ФОРМАТИРУЕМ ДАТУ
    function formatDate(day, month) {
        const months = [
            'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
            'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'
        ];
        return `${day} ${months[month]}`;
    }

    // ПОЛУЧАЕМ ЦВЕТ ДЛЯ ТИПА ДАТЫ
    function getDateColor(type) {
        return type === 'salary' ? '#00b060' : '#f59e0b';
    }

    // СОЗДАЕМ КРАСИВУЮ ЛЕГЕНДУ
    function createBeautifulLegend() {
        const legendContainer = document.querySelector('.calendar-legend');
        if (!legendContainer || document.getElementById('beautiful-legend')) return;

        // Собираем все уникальные праздники
        const allHolidays = [];
        const seen = new Set();
        
        Object.values(holidays).flat().forEach(h => {
            if (!seen.has(h.icon)) {
                seen.add(h.icon);
                allHolidays.push(h);
            }
        });

        // Сортируем праздники по дню в году
        allHolidays.sort((a, b) => {
            const aDay = a.day + (a.month * 100);
            const bDay = b.day + (b.month * 100);
            return aDay - bDay;
        });

        const legendHTML = `
            <div id="beautiful-legend" class="beautiful-legend">
                <div class="legend-section">
                    <div class="legend-title">
                        <i class="fas fa-star" style="color: var(--primary);"></i>
                        <span>Важные даты</span>
                    </div>
                    <div class="legend-items">
                        <div class="legend-item">
                            <div class="legend-color" style="background: #00b060;"></div>
                            <div class="legend-icon">💰</div>
                            <div class="legend-text">День зарплаты</div>
                        </div>
                        ${allHolidays.map(h => `
                            <div class="legend-item">
                                <div class="legend-color" style="background: #f59e0b;"></div>
                                <div class="legend-icon">${h.icon}</div>
                                <div class="legend-text">${h.shortName}</div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;

        legendContainer.insertAdjacentHTML('beforeend', legendHTML);
    }

    // ОБНОВЛЕНИЕ КАЛЕНДАРЯ
    function updateCalendar() {
        const month = getCurrentMonth();
        const year = 2026;
        
        document.querySelectorAll('.day-icons-container').forEach(el => el.remove());
        document.querySelectorAll('.has-salary, .has-holiday').forEach(el => {
            el.classList.remove('has-salary', 'has-holiday');
        });
        
        const salaryDay = getSalaryDay(month, year);
        const monthHolidays = holidays[month] || [];
        
        setTimeout(() => {
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
                        icon.title = 'Зарплата';
                        container.appendChild(icon);
                    }
                    
                    if (holiday) {
                        cell.classList.add('has-holiday');
                        const icon = document.createElement('span');
                        icon.className = 'day-icon-important';
                        icon.textContent = holiday.icon;
                        icon.title = holiday.name;
                        container.appendChild(icon);
                    }
                }
            });
        }, 100);
    }

    // СОЗДАЕМ КРАСИВЫЙ ВИДЖЕТ
    function createBeautifulWidget() {
        const month = getCurrentMonth();
        const year = 2026;
        const currentDay = getCurrentDay(month);
        
        const oldWidget = document.getElementById('importantDatesWidget');
        if (oldWidget) oldWidget.remove();
        
        const allDates = [];
        
        // Добавляем зарплату
        const salaryDay = getSalaryDay(month, year);
        allDates.push({
            day: salaryDay,
            type: 'salary',
            name: 'Зарплата',
            icon: '💰',
            date: new Date(year, month, salaryDay)
        });
        
        // Добавляем праздники
        (holidays[month] || []).forEach(h => {
            allDates.push({
                day: h.day,
                type: 'holiday',
                name: h.shortName,
                fullName: h.name,
                icon: h.icon,
                date: new Date(year, month, h.day)
            });
        });
        
        // Сортируем по дню
        allDates.sort((a, b) => a.day - b.day);
        
        const insertPoint = document.querySelector('.stats-row');
        if (!insertPoint) return;
        
        const widget = document.createElement('div');
        widget.className = 'beautiful-widget';
        widget.id = 'importantDatesWidget';
        
        let itemsHTML = '';
        
        allDates.forEach(d => {
            const diff = d.day - currentDay;
            let badge = '';
            let badgeClass = '';
            
            if (diff < 0) {
                badge = 'прошло';
                badgeClass = 'past';
            } else if (diff === 0) {
                badge = 'сегодня';
                badgeClass = 'today';
            } else if (diff === 1) {
                badge = 'завтра';
                badgeClass = 'tomorrow';
            } else {
                badge = `через ${diff} дн.`;
                badgeClass = 'future';
            }
            
            const dateStr = formatDate(d.day, month);
            const color = getDateColor(d.type);
            
            itemsHTML += `
                <div class="widget-item ${d.type}" title="${d.fullName || d.name}">
                    <div class="item-icon" style="background: ${color}20; color: ${color};">${d.icon}</div>
                    <div class="item-content">
                        <div class="item-title">${d.name}</div>
                        <div class="item-date">${dateStr}</div>
                    </div>
                    <div class="item-badge ${badgeClass}">${badge}</div>
                </div>
            `;
        });
        
        widget.innerHTML = `
            <div class="widget-header">
                <i class="fas fa-calendar-alt" style="color: var(--primary);"></i>
                <h3>Ближайшие даты</h3>
            </div>
            <div class="widget-items">
                ${itemsHTML}
            </div>
        `;
        
        insertPoint.parentNode.insertBefore(widget, insertPoint.nextSibling);
    }

    // ДОБАВЛЯЕМ КРАСИВЫЕ СТИЛИ
    const style = document.createElement('style');
    style.textContent = `
        /* Стили для иконок в календаре */
        .day-icons-container {
            display: flex;
            gap: 2px;
            justify-content: center;
            margin-top: 2px;
            min-height: 20px;
        }
        
        .day-icon-important {
            font-size: 1rem;
            line-height: 1;
            filter: drop-shadow(0 2px 2px rgba(0,0,0,0.2));
        }
        
        .day.has-salary {
            border: 2px solid #00b060 !important;
            background: rgba(0,176,96,0.1) !important;
        }
        
        .day.has-holiday {
            border: 2px solid #f59e0b !important;
            background: rgba(245,158,11,0.1) !important;
        }
        
        .day.has-salary.has-holiday {
            border: 2px solid !important;
            border-color: #00b060 #f59e0b #00b060 #f59e0b !important;
        }

        /* Красивая легенда */
        .beautiful-legend {
            width: 100%;
            margin-top: 15px;
            padding-top: 15px;
            border-top: 1px solid var(--border);
        }
        
        .legend-section {
            background: var(--dark-light);
            border-radius: 16px;
            padding: 15px;
        }
        
        .legend-title {
            display: flex;
            align-items: center;
            gap: 8px;
            margin-bottom: 12px;
            font-weight: 600;
            color: var(--primary);
        }
        
        .legend-items {
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
        }
        
        .legend-item {
            display: flex;
            align-items: center;
            gap: 6px;
            padding: 6px 12px;
            background: var(--dark);
            border-radius: 30px;
            font-size: 0.85rem;
            border: 1px solid var(--border);
        }
        
        .legend-color {
            width: 8px;
            height: 8px;
            border-radius: 2px;
        }
        
        .legend-icon {
            font-size: 1rem;
            margin-right: 2px;
        }
        
        .legend-text {
            color: var(--text);
        }

        /* Красивый виджет */
        .beautiful-widget {
            margin: 20px 0;
            padding: 20px;
            border-radius: 24px;
            background: linear-gradient(135deg, var(--dark-card), var(--dark-light));
            border: 1px solid var(--border);
            box-shadow: var(--shadow);
        }
        
        .beautiful-widget .widget-header {
            display: flex;
            align-items: center;
            gap: 10px;
            margin-bottom: 20px;
            padding-bottom: 15px;
            border-bottom: 1px solid var(--border);
        }
        
        .beautiful-widget .widget-header i {
            font-size: 1.3rem;
        }
        
        .beautiful-widget .widget-header h3 {
            font-size: 1.2rem;
            font-weight: 600;
            color: var(--text);
            margin: 0;
        }
        
        .widget-items {
            display: flex;
            flex-direction: column;
            gap: 10px;
        }
        
        .widget-item {
            display: flex;
            align-items: center;
            gap: 15px;
            padding: 12px 15px;
            background: var(--dark);
            border-radius: 16px;
            border: 1px solid var(--border);
            transition: all 0.3s ease;
        }
        
        .widget-item:hover {
            transform: translateX(5px);
            border-color: var(--primary);
            box-shadow: 0 4px 12px rgba(0,176,96,0.2);
        }
        
        .item-icon {
            width: 40px;
            height: 40px;
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.4rem;
        }
        
        .item-content {
            flex: 1;
        }
        
        .item-title {
            font-weight: 600;
            color: var(--text);
            font-size: 0.95rem;
            margin-bottom: 2px;
        }
        
        .item-date {
            font-size: 0.8rem;
            color: var(--text-muted);
        }
        
        .item-badge {
            padding: 4px 12px;
            border-radius: 30px;
            font-size: 0.8rem;
            font-weight: 500;
            white-space: nowrap;
        }
        
        .item-badge.past {
            background: rgba(239, 68, 68, 0.1);
            color: #ef4444;
        }
        
        .item-badge.today {
            background: rgba(0, 176, 96, 0.15);
            color: #00b060;
            font-weight: 600;
        }
        
        .item-badge.tomorrow {
            background: rgba(245, 158, 11, 0.15);
            color: #f59e0b;
        }
        
        .item-badge.future {
            background: rgba(100, 116, 139, 0.15);
            color: var(--text-muted);
        }

        /* Адаптивность */
        @media (max-width: 768px) {
            .widget-item {
                flex-wrap: wrap;
            }
            
            .item-badge {
                width: 100%;
                text-align: center;
                margin-top: 5px;
            }
            
            .legend-items {
                gap: 5px;
            }
            
            .legend-item {
                padding: 4px 8px;
                font-size: 0.8rem;
            }
        }
    `;
    document.head.appendChild(style);

    // ЗАПУСК
    setTimeout(() => {
        updateCalendar();
        createBeautifulWidget();
        createBeautifulLegend();
    }, 1000);

    // ПЕРЕХВАТ СМЕНЫ МЕСЯЦА
    const originalChangeMonth = window.changeMonth;
    if (originalChangeMonth) {
        window.changeMonth = function(delta) {
            originalChangeMonth(delta);
            setTimeout(() => {
                updateCalendar();
                createBeautifulWidget();
            }, 300);
        };
    }

    // ПЕРЕХВАТ ОТКРЫТИЯ КАЛЕНДАРЯ
    const originalSetView = window.setView;
    if (originalSetView) {
        window.setView = function(view) {
            originalSetView(view);
            if (view === 'calendar') {
                setTimeout(() => {
                    updateCalendar();
                    createBeautifulLegend();
                }, 300);
            }
            if (view === 'dashboard') {
                setTimeout(createBeautifulWidget, 300);
            }
        };
    }
})();
