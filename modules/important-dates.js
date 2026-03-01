// modules/important-dates.js - ИСПРАВЛЕННАЯ ВЕРСИЯ

(function() {
    console.log('🔥 Модуль важных дат запущен');

    // ВСЕ ПРАЗДНИКИ 2026 ПО МЕСЯЦАМ
    const holidays = {
        0: [ // Январь
            { day: 1, name: '🇸🇰 День образования Словацкой Республики', icon: '🇸🇰' },
            { day: 6, name: '👑 Богоявление', icon: '👑' }
        ],
        1: [ // Февраль
            // нет праздников
        ],
        2: [ // Март
            // нет праздников
        ],
        3: [ // Апрель
            { day: 3, name: '✝️ Страстная пятница', icon: '✝️' },
            { day: 6, name: '🐣 Пасхальный понедельник', icon: '🐣' }
        ],
        4: [ // Май
            { day: 1, name: '⚒️ День труда', icon: '⚒️' }
        ],
        5: [ // Июнь
            // нет праздников
        ],
        6: [ // Июль
            { day: 5, name: '📜 День Кирилла и Мефодия', icon: '📜' }
        ],
        7: [ // Август
            { day: 29, name: '⚔️ День Словацкого восстания', icon: '⚔️' }
        ],
        8: [ // Сентябрь
            // нет праздников
        ],
        9: [ // Октябрь
            // нет праздников
        ],
        10: [ // Ноябрь
            { day: 1, name: '🕯️ День всех святых', icon: '🕯️' }
        ],
        11: [ // Декабрь
            { day: 24, name: '🎄 Сочельник', icon: '🎄' },
            { day: 25, name: '🎅 Рождество', icon: '🎅' },
            { day: 26, name: '🎁 Второй день Рождества', icon: '🎁' }
        ]
    };

    // ПОЛУЧАЕМ 3-Й РАБОЧИЙ ДЕНЬ
    function getSalaryDay(month, year = 2026) {
        let workDays = 0;
        let day = 1;
        const maxDays = new Date(year, month + 1, 0).getDate();
        
        while (workDays < 3 && day <= maxDays) {
            const date = new Date(year, month, day);
            const dayOfWeek = date.getDay(); // 0 = вс, 6 = сб
            
            // Проверяем выходной
            const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
            
            // Проверяем праздник
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

    // ПОЛУЧАЕМ ТЕКУЩИЙ МЕСЯЦ ИЗ ЗАГОЛОВКА
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

    // ПОЛУЧАЕМ ТЕКУЩИЙ ДЕНЬ (С УЧЕТОМ ВЫБРАННОГО МЕСЯЦА!)
    function getCurrentDay(selectedMonth) {
        const today = new Date();
        const currentMonth = today.getMonth();
        
        // Если выбран текущий месяц - возвращаем сегодняшнее число
        if (selectedMonth === currentMonth) {
            return today.getDate();
        }
        
        // Если выбран будущий месяц - возвращаем 1 число (все дни впереди)
        if (selectedMonth > currentMonth) {
            return 0; // 0 значит что все дни в будущем
        }
        
        // Если выбран прошлый месяц - возвращаем последний день месяца
        // (все дни уже прошли)
        const lastDay = new Date(2026, selectedMonth + 1, 0).getDate();
        return lastDay + 1; // +1 значит что все дни прошли
    }

    // ОБНОВЛЕНИЕ КАЛЕНДАРЯ
    function updateCalendar() {
        const month = getCurrentMonth();
        const year = 2026;
        
        console.log('Обновляем календарь для месяца:', month + 1);
        
        // Удаляем старые иконки
        document.querySelectorAll('.day-icons-container').forEach(el => el.remove());
        document.querySelectorAll('.has-salary, .has-holiday').forEach(el => {
            el.classList.remove('has-salary', 'has-holiday');
        });
        
        // Получаем день зарплаты
        const salaryDay = getSalaryDay(month, year);
        console.log('День зарплаты:', salaryDay);
        
        // Получаем праздники месяца
        const monthHolidays = holidays[month] || [];
        
        // Добавляем иконки в календарь
        setTimeout(() => {
            const cells = document.querySelectorAll('#calendarGrid .day:not(.empty)');
            
            cells.forEach(cell => {
                const dayNum = cell.querySelector('.day-number')?.textContent;
                if (!dayNum) return;
                
                const day = parseInt(dayNum);
                const hasSalary = (day === salaryDay);
                const holiday = monthHolidays.find(h => h.day === day);
                
                if (hasSalary || holiday) {
                    // Создаем контейнер для иконок
                    let container = cell.querySelector('.day-icons-container');
                    if (!container) {
                        container = document.createElement('div');
                        container.className = 'day-icons-container';
                        cell.appendChild(container);
                    }
                    
                    // Добавляем иконку зарплаты
                    if (hasSalary) {
                        cell.classList.add('has-salary');
                        const icon = document.createElement('span');
                        icon.className = 'day-icon-important salary-icon';
                        icon.textContent = '💰';
                        icon.title = 'Зарплата';
                        container.appendChild(icon);
                    }
                    
                    // Добавляем иконку праздника
                    if (holiday) {
                        cell.classList.add('has-holiday');
                        const icon = document.createElement('span');
                        icon.className = 'day-icon-important holiday-icon';
                        icon.textContent = holiday.icon;
                        icon.title = holiday.name;
                        container.appendChild(icon);
                    }
                }
            });
        }, 100);
    }

    // ОБНОВЛЕНИЕ ВИДЖЕТА
    function updateWidget() {
        const month = getCurrentMonth();
        const year = 2026;
        const currentDay = getCurrentDay(month);
        
        console.log('Обновляем виджет для месяца:', month + 1, 'текущий день:', currentDay);
        
        // Удаляем старый виджет
        const oldWidget = document.getElementById('importantDatesWidget');
        if (oldWidget) oldWidget.remove();
        
        // Собираем все даты месяца
        const allDates = [];
        
        // Добавляем зарплату
        const salaryDay = getSalaryDay(month, year);
        allDates.push({
            day: salaryDay,
            type: 'salary',
            name: '💰 Зарплата',
            icon: '💰',
            date: new Date(year, month, salaryDay)
        });
        
        // Добавляем праздники
        (holidays[month] || []).forEach(h => {
            allDates.push({
                day: h.day,
                type: 'holiday',
                name: h.name,
                icon: h.icon,
                date: new Date(year, month, h.day)
            });
        });
        
        // Сортируем по дню
        allDates.sort((a, b) => a.day - b.day);
        
        // Создаем виджет
        const insertPoint = document.querySelector('.stats-row');
        if (!insertPoint) return;
        
        const widget = document.createElement('div');
        widget.className = 'important-dates-widget glass-effect';
        widget.id = 'importantDatesWidget';
        
        let html = `
            <div class="widget-header">
                <i class="fas fa-calendar-star"></i>
                <h3>📅 Ближайшие даты</h3>
            </div>
            <div class="dates-list">
        `;
        
        allDates.forEach(d => {
            // Вычисляем разницу дней с учетом выбранного месяца
            let diff = d.day - currentDay;
            let countdown = '';
            
            if (diff < 0) {
                countdown = 'прошло';
            } else if (diff === 0) {
                countdown = 'сегодня';
            } else if (diff === 1) {
                countdown = 'завтра';
            } else {
                countdown = `через ${diff} дн.`;
            }
            
            const monthName = d.date.toLocaleDateString('ru-RU', { month: 'long' });
            
            html += `
                <div class="date-item ${d.type}">
                    <div class="date-icon">${d.icon}</div>
                    <div class="date-info">
                        <div class="date-title">${d.name}</div>
                        <div class="date-day">${d.day} ${monthName}</div>
                    </div>
                    <div class="date-countdown">${countdown}</div>
                </div>
            `;
        });
        
        html += `</div>`;
        widget.innerHTML = html;
        
        insertPoint.parentNode.insertBefore(widget, insertPoint.nextSibling);
    }

    // ДОБАВЛЯЕМ ЛЕГЕНДУ В КАЛЕНДАРЬ
    function addLegendToCalendar() {
        const legendContainer = document.querySelector('.calendar-legend');
        if (!legendContainer) return;
        
        // Проверяем, не добавлена ли уже наша легенда
        if (document.getElementById('important-dates-legend')) return;
        
        // Создаем разделитель
        const divider = document.createElement('div');
        divider.style.width = '100%';
        divider.style.height = '1px';
        divider.style.background = 'var(--border)';
        divider.style.margin = '10px 0';
        legendContainer.appendChild(divider);
        
        // Создаем заголовок
        const title = document.createElement('div');
        title.style.width = '100%';
        title.style.fontWeight = '600';
        title.style.color = 'var(--primary)';
        title.style.marginBottom = '10px';
        title.style.paddingLeft = '5px';
        title.innerHTML = '📅 Важные даты:';
        legendContainer.appendChild(title);
        
        // Создаем контейнер для иконок важных дат
        const importantLegend = document.createElement('div');
        importantLegend.id = 'important-dates-legend';
        importantLegend.style.display = 'flex';
        importantLegend.style.flexWrap = 'wrap';
        importantLegend.style.gap = '10px';
        importantLegend.style.justifyContent = 'center';
        
        // Добавляем зарплату
        const salaryItem = document.createElement('div');
        salaryItem.className = 'legend-item';
        salaryItem.innerHTML = `
            <span class="legend-color" style="background:#00b060;"></span>
            <span class="legend-icon">💰</span>
            <span class="legend-text">День зарплаты</span>
        `;
        importantLegend.appendChild(salaryItem);
        
        // Добавляем все праздники (уникальные)
        const uniqueHolidays = [];
        const holidayIcons = new Set();
        
        Object.values(holidays).flat().forEach(h => {
            if (!holidayIcons.has(h.icon)) {
                holidayIcons.add(h.icon);
                uniqueHolidays.push(h);
            }
        });
        
        uniqueHolidays.forEach(h => {
            const item = document.createElement('div');
            item.className = 'legend-item';
            item.innerHTML = `
                <span class="legend-color" style="background:#f59e0b;"></span>
                <span class="legend-icon">${h.icon}</span>
                <span class="legend-text">${h.name.split(' ').slice(1).join(' ')}</span>
            `;
            importantLegend.appendChild(item);
        });
        
        legendContainer.appendChild(importantLegend);
    }

    // ДОБАВЛЯЕМ СТИЛИ
    const style = document.createElement('style');
    style.textContent = `
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
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
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

    // ЗАПУСК
    setTimeout(() => {
        updateCalendar();
        updateWidget();
        addLegendToCalendar();
    }, 1000);

    // ПЕРЕХВАТ СМЕНЫ МЕСЯЦА
    const originalChangeMonth = window.changeMonth;
    if (originalChangeMonth) {
        window.changeMonth = function(delta) {
            originalChangeMonth(delta);
            setTimeout(() => {
                updateCalendar();
                updateWidget();
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
                    addLegendToCalendar();
                }, 300);
            }
            if (view === 'dashboard') {
                setTimeout(updateWidget, 300);
            }
        };
    }
})();
