// modules/important-dates.js - Модуль важных дат

(function() {
    // Конфигурация
    const CONFIG = {
        SALARY_DAY_OFFSET: 3, // 3-й рабочий день месяца
        STORAGE_KEY: 'important_dates_settings'
    };

    // ГОСУДАРСТВЕННЫЕ ПРАЗДНИКИ СЛОВАКИИ 2026 (точный список)
    const SLOVAK_HOLIDAYS_2026 = [
        // Январь
        { day: 1, month: 0, type: 'holiday', name_ru: 'День образования Словацкой Республики', name_sk: 'Deň vzniku Slovenskej republiky', name_en: 'Day of the Establishment of the Slovak Republic', icon: '🇸🇰', shortName: '🇸🇰' },
        { day: 6, month: 0, type: 'holiday', name_ru: 'Богоявление (Три короля)', name_sk: 'Zjavenie Pána (Traja králi)', name_en: 'Epiphany', icon: '👑', shortName: '👑' },
        
        // Апрель
        { day: 3, month: 3, type: 'holiday', name_ru: 'Страстная пятница', name_sk: 'Veľký piatok', name_en: 'Good Friday', icon: '✝️', shortName: '✝️' },
        { day: 6, month: 3, type: 'holiday', name_ru: 'Пасхальный понедельник', name_sk: 'Veľkonočný pondelok', name_en: 'Easter Monday', icon: '🐣', shortName: '🐣' },
        
        // Май
        { day: 1, month: 4, type: 'holiday', name_ru: 'День труда', name_sk: 'Sviatok práce', name_en: 'Labour Day', icon: '⚒️', shortName: '⚒️' },
        
        // Июль
        { day: 5, month: 6, type: 'holiday', name_ru: 'День святых Кирилла и Мефодия', name_sk: 'Sviatok svätých Cyrila a Metoda', name_en: 'Saints Cyril and Methodius Day', icon: '📜', shortName: '📜' },
        
        // Август
        { day: 29, month: 7, type: 'holiday', name_ru: 'День Словацкого национального восстания', name_sk: 'Výročie SNP', name_en: 'Slovak National Uprising Day', icon: '⚔️', shortName: '⚔️' },
        
        // Ноябрь
        { day: 1, month: 10, type: 'holiday', name_ru: 'День всех святых', name_sk: 'Sviatok všetkých svätých', name_en: 'All Saints\' Day', icon: '🕯️', shortName: '🕯️' },
        
        // Декабрь
        { day: 24, month: 11, type: 'holiday', name_ru: 'Сочельник', name_sk: 'Štedrý deň', name_en: 'Christmas Eve', icon: '🎄', shortName: '🎄' },
        { day: 25, month: 11, type: 'holiday', name_ru: 'Рождество', name_sk: 'Prvý sviatok vianočný', name_en: 'Christmas Day', icon: '🎅', shortName: '🎅' },
        { day: 26, month: 11, type: 'holiday', name_ru: 'Второй день Рождества', name_sk: 'Druhý sviatok vianočný', name_en: 'St. Stephen\'s Day', icon: '🎁', shortName: '🎁' }
    ];

    let settings = {
        language: 'ru'
    };

    // Загружаем настройки
    function loadSettings() {
        const saved = localStorage.getItem(CONFIG.STORAGE_KEY);
        if (saved) {
            settings = { ...settings, ...JSON.parse(saved) };
        }
    }

    // Получаем текущий язык
    function getCurrentLanguage() {
        return document.documentElement.lang || 'ru';
    }

    /**
     * Рассчитываем 3-й рабочий день месяца (день зарплаты)
     */
    function getSalaryDay(year, month) {
        let workingDays = 0;
        let day = 1;
        const maxDays = new Date(year, month + 1, 0).getDate();
        
        while (workingDays < 3 && day <= maxDays) {
            const date = new Date(year, month, day);
            const dayOfWeek = date.getDay(); // 0 = вс, 6 = сб
            
            // Проверяем, рабочий ли день (пн-пт и не праздник)
            if (dayOfWeek !== 0 && dayOfWeek !== 6 && !isHoliday(year, month, day)) {
                workingDays++;
                if (workingDays === 3) {
                    return day;
                }
            }
            day++;
        }
        
        return Math.min(day, maxDays);
    }

    /**
     * Проверка, является ли дата государственным праздником
     */
    function isHoliday(year, month, day) {
        if (year !== 2026) return false;
        return SLOVAK_HOLIDAYS_2026.some(h => h.day === day && h.month === month);
    }

    /**
     * Получаем информацию о празднике для конкретной даты
     */
    function getHolidayInfo(year, month, day) {
        if (year !== 2026) return null;
        return SLOVAK_HOLIDAYS_2026.find(h => h.day === day && h.month === month) || null;
    }

    /**
     * Получаем день зарплаты для конкретного месяца
     */
    function getSalaryInfo(year, month) {
        const salaryDay = getSalaryDay(year, month);
        return {
            day: salaryDay,
            month: month,
            year: year,
            type: 'salary',
            name_ru: 'Зарплата',
            name_sk: 'Výplata',
            name_en: 'Salary',
            icon: '💰',
            shortName: '💰'
        };
    }

    /**
     * Получаем все важные даты для конкретного месяца
     */
    function getImportantDatesForMonth(year, month) {
        const dates = [];
        
        // Добавляем день зарплаты
        const salaryInfo = getSalaryInfo(year, month);
        dates.push(salaryInfo);
        
        // Добавляем все праздники в этом месяце
        SLOVAK_HOLIDAYS_2026.forEach(holiday => {
            if (holiday.month === month) {
                dates.push(holiday);
            }
        });
        
        return dates;
    }

    /**
     * Сохраняем оригинальную функцию buildCalendar
     */
    let originalBuildCalendar = null;

    /**
     * Новая функция buildCalendar, которая вызывает оригинальную и добавляет важные даты
     */
    function enhancedBuildCalendar() {
        // Вызываем оригинальную функцию, если она существует
        if (originalBuildCalendar) {
            originalBuildCalendar();
        } else if (window.buildCalendar) {
            originalBuildCalendar = window.buildCalendar;
            originalBuildCalendar();
        }
        
        // Добавляем важные даты в календарь
        setTimeout(() => {
            addImportantDatesToCalendar();
        }, 50);
    }

    /**
     * Добавляем важные даты в календарь
     */
    function addImportantDatesToCalendar() {
        const year = window.currentYear || new Date().getFullYear();
        const month = window.currentMonth || new Date().getMonth();
        
        const importantDates = getImportantDatesForMonth(year, month);
        
        const calendarGrid = document.getElementById('calendarGrid');
        if (!calendarGrid) return;
        
        const dayCells = calendarGrid.querySelectorAll('.day:not(.empty)');
        
        dayCells.forEach(cell => {
            const dayNumberSpan = cell.querySelector('.day-number');
            if (!dayNumberSpan) return;
            
            const dayNumber = parseInt(dayNumberSpan.textContent);
            if (!dayNumber) return;
            
            // Проверяем, есть ли важная дата в этот день
            const importantDate = importantDates.find(d => d.day === dayNumber);
            
            if (importantDate) {
                // Добавляем класс для стилизации
                cell.classList.add(`has-${importantDate.type}`);
                
                // Получаем короткое название для отображения
                let displayText = importantDate.shortName || importantDate.icon || '📌';
                
                // Обновляем иконку
                const iconSpan = cell.querySelector('.day-icon');
                if (iconSpan) {
                    iconSpan.textContent = displayText;
                }
                
                // Добавляем полное название в title для подсказки
                const fullName = importantDate[`name_${settings.language}`] || importantDate.name_ru;
                cell.setAttribute('title', `${fullName} (${importantDate.type === 'salary' ? 'день зарплаты' : 'праздник'})`);
            }
        });
    }

    /**
     * Создаем виджет списка важных дат (для дашборда)
     */
    function createUpcomingDatesWidget() {
        const widget = document.createElement('div');
        widget.className = 'important-dates-widget glass-effect';
        widget.id = 'importantDatesWidget';
        
        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth();
        const currentDay = now.getDate();
        
        // Собираем все предстоящие важные даты (текущий и следующий месяц)
        const upcomingDates = [];
        
        // Текущий месяц
        const thisMonthDates = getImportantDatesForMonth(currentYear, currentMonth);
        thisMonthDates.forEach(d => {
            if (d.day >= currentDay) {
                const date = new Date(currentYear, currentMonth, d.day);
                const diffDays = Math.ceil((date - now) / (1000 * 60 * 60 * 24));
                upcomingDates.push({ ...d, date, diffDays });
            }
        });
        
        // Следующий месяц
        const nextMonth = currentMonth === 11 ? 0 : currentMonth + 1;
        const nextYear = currentMonth === 11 ? currentYear + 1 : currentYear;
        const nextMonthDates = getImportantDatesForMonth(nextYear, nextMonth);
        nextMonthDates.forEach(d => {
            const date = new Date(nextYear, nextMonth, d.day);
            const diffDays = Math.ceil((date - now) / (1000 * 60 * 60 * 24));
            upcomingDates.push({ ...d, date, diffDays });
        });
        
        // Сортируем по дате
        upcomingDates.sort((a, b) => a.diffDays - b.diffDays);
        
        // Берем только первые 5
        const displayDates = upcomingDates.slice(0, 5);
        
        widget.innerHTML = `
            <div class="widget-header">
                <i class="fas fa-calendar-star"></i>
                <h3 data-lang="importantDates">📅 Важные даты</h3>
            </div>
            <div class="dates-list">
                ${displayDates.map(d => {
                    const title = d[`name_${settings.language}`] || d.name_ru;
                    
                    let countdownText = '';
                    if (d.diffDays === 0) {
                        countdownText = settings.language === 'ru' ? 'сегодня' : 
                                       (settings.language === 'sk' ? 'dnes' : 'today');
                    } else if (d.diffDays === 1) {
                        countdownText = settings.language === 'ru' ? 'завтра' : 
                                       (settings.language === 'sk' ? 'zajtra' : 'tomorrow');
                    } else {
                        countdownText = settings.language === 'ru' ? `через ${d.diffDays} дн.` : 
                                       (settings.language === 'sk' ? `o ${d.diffDays} dní` : `in ${d.diffDays} days`);
                    }
                    
                    const monthName = d.date.toLocaleDateString(settings.language === 'sk' ? 'sk-SK' : 'ru-RU', { month: 'long' });
                    
                    return `
                        <div class="date-item ${d.type}" data-date="${d.date.toISOString()}">
                            <div class="date-icon">${d.icon || (d.type === 'salary' ? '💰' : '🎉')}</div>
                            <div class="date-info">
                                <div class="date-title">${title}</div>
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

    /**
     * Добавляем стили
     */
    function addStyles() {
        // Проверяем, не добавлены ли уже стили
        if (document.getElementById('important-dates-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'important-dates-styles';
        style.textContent = `
            /* Стили для ячеек календаря с важными датами */
            .day.has-salary {
                position: relative;
                background: linear-gradient(145deg, rgba(0,176,96,0.15), rgba(0,176,96,0.05)) !important;
                border: 2px solid #00b060 !important;
            }
            
            .day.has-holiday {
                position: relative;
                background: linear-gradient(145deg, rgba(245,158,11,0.15), rgba(245,158,11,0.05)) !important;
                border: 2px solid #f59e0b !important;
            }
            
            .day .day-icon {
                font-size: 1.2rem;
                margin-top: 2px;
            }
            
            /* Стили для виджета важных дат */
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
            }
            
            .date-item.holiday {
                border-left-color: #f59e0b;
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
            
            @media (max-width: 768px) {
                .date-item {
                    flex-wrap: wrap;
                }
                .date-countdown {
                    width: 100%;
                    text-align: right;
                }
            }
        `;
        document.head.appendChild(style);
    }

    /**
     * Инициализация модуля
     */
    function init() {
        console.log('📅 Модуль важных дат загружен');
        
        loadSettings();
        settings.language = getCurrentLanguage();
        
        addStyles();
        
        // Сохраняем оригинальную функцию и заменяем своей
        if (window.buildCalendar && !originalBuildCalendar) {
            originalBuildCalendar = window.buildCalendar;
            window.buildCalendar = enhancedBuildCalendar;
        }
        
        // Добавляем виджет на дашборд
        const insertTarget = document.querySelector('.stats-row') || document.querySelector('.kpi-grid');
        if (insertTarget && !document.getElementById('importantDatesWidget')) {
            insertTarget.parentNode.insertBefore(createUpcomingDatesWidget(), insertTarget.nextSibling);
        }
        
        // Обновляем важные даты при смене месяца
        const originalChangeMonth = window.changeMonth;
        if (originalChangeMonth) {
            window.changeMonth = function(delta) {
                originalChangeMonth(delta);
                setTimeout(() => {
                    addImportantDatesToCalendar();
                }, 100);
            };
        }
        
        // Следим за сменой языка
        const observer = new MutationObserver(() => {
            settings.language = getCurrentLanguage();
            // Обновляем виджет
            const oldWidget = document.getElementById('importantDatesWidget');
            if (oldWidget) {
                const newWidget = createUpcomingDatesWidget();
                oldWidget.parentNode.replaceChild(newWidget, oldWidget);
            }
            // Обновляем календарь
            addImportantDatesToCalendar();
        });
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
    }

    // Ждем загрузки основного приложения
    const checkInterval = setInterval(() => {
        if (document.getElementById('app') && !document.getElementById('app').classList.contains('hidden')) {
            clearInterval(checkInterval);
            // Ждем, пока основной код полностью загрузится
            setTimeout(init, 1500);
        }
    }, 100);
})();
