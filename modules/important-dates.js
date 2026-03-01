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

    // ПОЛУЧАЕМ 3-Й РАБОЧИЙ ДЕНЬ МЕСЯЦА (ИСПРАВЛЕНО!)
    function getSalaryDay(year, month) {
        let workingDays = 0;
        let day = 1;
        const maxDays = new Date(year, month + 1, 0).getDate();
        
        console.log(`💰 Расчет дня зарплаты для ${month+1}.${year}:`);
        
        while (workingDays < 3 && day <= maxDays) {
            const date = new Date(year, month, day);
            const dayOfWeek = date.getDay(); // 0 = вс, 6 = сб
            const isWeekend = (dayOfWeek === 0 || dayOfWeek === 6);
            const isHolidayDay = isHoliday(year, month, day);
            
            const isWorkingDay = !isWeekend && !isHolidayDay;
            
            console.log(`   День ${day}: ${isWeekend ? 'выходной' : 'рабочий'}, ${isHolidayDay ? 'праздник' : 'будень'}, ${isWorkingDay ? '✅ РАБОЧИЙ' : '❌ НЕ РАБОЧИЙ'}`);
            
            if (isWorkingDay) {
                workingDays++;
                console.log(`   ✅ Рабочий день #${workingDays}`);
                if (workingDays === 3) {
                    console.log(`🎯 ДЕНЬ ЗАРПЛАТЫ: ${day}.${month+1}.${year}`);
                    return day;
                }
            }
            day++;
        }
        console.log(`⚠️ День зарплаты (последний день): ${day}.${month+1}.${year}`);
        return day;
    }

    // Получаем все важные даты для месяца
    function getImportantDates(year, month) {
        const dates = [];
        
        // День зарплаты
        const salaryDay = getSalaryDay(year, month);
        dates.push({
            day: salaryDay,
            type: 'salary',
            name: 'Зарплата',
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
        
        // Сортируем по дню
        return dates.sort((a, b) => a.day - b.day);
    }

    // Добавляем иконки в календарь
    function addIconsToCalendar() {
        const year = window.currentYear || new Date().getFullYear();
        const month = window.currentMonth || new Date().getMonth();
        
        console.log(`📅 Обновление иконок для ${month+1}.${year}`);
        
        const importantDates = getImportantDates(year, month);
        console.log('📅 Важные даты:', importantDates);
        
        const calendarGrid = document.getElementById('calendarGrid');
        if (!calendarGrid) {
            console.log('❌ Календарь не найден');
            return;
        }
        
        const dayCells = calendarGrid.querySelectorAll('.day:not(.empty)');
        
        dayCells.forEach(cell => {
            const dayNum = cell.querySelector('.day-number')?.textContent;
            if (!dayNum) return;
            
            const day = parseInt(dayNum);
            
            // Находим все важные даты для этого дня
            const datesForDay = importantDates.filter(d => d.day === day);
            
            // Удаляем старые классы важных дат
            cell.classList.remove('has-salary', 'has-holiday');
            
            // Удаляем старый контейнер иконок если есть
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
                
                // Обновляем title
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
        
        if (upcoming.length === 0) return null;
        
        const widget = document.createElement('div');
        widget.className = 'important-dates-widget glass-effect';
        widget.id = 'importantDatesWidget';
        widget.innerHTML = `
            <div class="widget-header">
                <i class="fas fa-calendar-star"></i>
                <h3>📅 Ближайшие даты</h3>
            </div>
            <div class="dates-list">
                ${upcoming.map(d => {
                    let countdownText = '';
                    if (d.diff === 0) countdownText = 'сегодня';
                    else if (d.diff === 1) countdownText = 'завтра';
                    else countdownText = `через ${d.diff} дн.`;
                    
                    const monthName = d.date.toLocaleDateString('ru-RU', { month: 'long' });
                    
                    return `
                        <div class="date-item ${d.type}" title="${d.name}">
                            <div class="date-icon">${d.icon}</div>
                            <div class="date-info">
                                <div class="date-title">${d.name}</div>
                                <div class="date-day">${d.day} ${monthName}</div>
                            </div>
                            <div class="date-countdown">${countdownText}</div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
        
        return widget;
    }

    // Обновляем виджет
    function updateWidget() {
        const oldWidget = document.getElementById('importantDatesWidget');
        if (oldWidget) {
            oldWidget.remove();
        }
        
        const insertPoint = document.querySelector('.stats-row') || document.querySelector('.kpi-grid');
        if (insertPoint) {
            const newWidget = createWidget();
            if (newWidget) {
                insertPoint.parentNode.insertBefore(newWidget, insertPoint.nextSibling);
                console.log('📊 Виджет обновлен');
            }
        }
    }

    // Добавляем стили
    function addStyles() {
        if (document.getElementById('important-dates-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'important-dates-styles';
        style.textContent = `
            /* Контейнер для иконок */
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
            
            /* Фон для дней с зарплатой */
            .day.has-salary {
                background: linear-gradient(145deg, rgba(0,176,96,0.2), rgba(0,176,96,0.05)) !important;
                border: 2px solid #00b060 !important;
            }
            
            /* Фон для дней с праздником */
            .day.has-holiday {
                background: linear-gradient(145deg, rgba(245,158,11,0.2), rgba(245,158,11,0.05)) !important;
                border: 2px solid #f59e0b !important;
            }
            
            /* Двойные даты - градиентная граница */
            .day.has-salary.has-holiday {
                background: linear-gradient(145deg, rgba(0,176,96,0.15), rgba(245,158,11,0.1)) !important;
                border: 2px solid transparent !important;
                border-image: linear-gradient(45deg, #00b060, #f59e0b) !important;
                border-image-slice: 1 !important;
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
                cursor: help;
            }
            
            .date-item:hover {
                transform: translateX(5px);
                box-shadow: 0 4px 10px rgba(0,0,0,0.2);
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
    }

    // Инициализация
    function init() {
        console.log('✅ Модуль важных дат инициализирован');
        
        addStyles();
        
        // Ждем календарь
        const waitForCalendar = setInterval(() => {
            if (document.getElementById('calendarGrid')) {
                clearInterval(waitForCalendar);
                setTimeout(() => {
                    addIconsToCalendar();
                }, 500);
            }
        }, 100);
        
        // Добавляем виджет
        setTimeout(() => {
            updateWidget();
        }, 1000);
        
        // Отслеживаем смену месяца
        const originalChangeMonth = window.changeMonth;
        if (originalChangeMonth) {
            window.changeMonth = function(delta) {
                console.log('📅 Смена месяца');
                originalChangeMonth(delta);
                setTimeout(() => {
                    addIconsToCalendar();
                    updateWidget();
                }, 300);
            };
        }
        
        // Отслеживаем добавление записи
        const originalAddRecord = window.addRecord;
        if (originalAddRecord) {
            window.addRecord = function(type) {
                originalAddRecord(type);
                setTimeout(() => {
                    addIconsToCalendar();
                }, 300);
            };
        }
        
        // Отслеживаем переключение вкладок
        const originalSetView = window.setView;
        if (originalSetView) {
            window.setView = function(view) {
                originalSetView(view);
                if (view === 'calendar') {
                    setTimeout(addIconsToCalendar, 300);
                }
                if (view === 'dashboard') {
                    setTimeout(updateWidget, 300);
                }
            };
        }
    }

    // Запускаем
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        setTimeout(init, 500);
    }
})();
