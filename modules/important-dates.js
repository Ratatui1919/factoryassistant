// modules/important-dates.js - Модуль важных дат

(function() {
    // Конфигурация
    const CONFIG = {
        SALARY_DAY_OFFSET: 3, // 3-й рабочий день месяца
        STORAGE_KEY: 'important_dates_settings',
        NOTIFICATION_DAYS_BEFORE: [3, 1, 0]
    };

    // ГОСУДАРСТВЕННЫЕ ПРАЗДНИКИ СЛОВАКИИ 2026 (точный список)
    const SLOVAK_HOLIDAYS_2026 = [
        // Январь
        { day: 1, month: 0, type: 'holiday', name_ru: 'День образования Словацкой Республики', name_sk: 'Deň vzniku Slovenskej republiky', name_en: 'Day of the Establishment of the Slovak Republic', icon: '🇸🇰' },
        { day: 6, month: 0, type: 'holiday', name_ru: 'Богоявление (Три короля)', name_sk: 'Zjavenie Pána (Traja králi)', name_en: 'Epiphany', icon: '👑' },
        
        // Апрель
        { day: 3, month: 3, type: 'holiday', name_ru: 'Страстная пятница', name_sk: 'Veľký piatok', name_en: 'Good Friday', icon: '✝️' },
        { day: 6, month: 3, type: 'holiday', name_ru: 'Пасхальный понедельник', name_sk: 'Veľkonočný pondelok', name_en: 'Easter Monday', icon: '🐣' },
        
        // Май
        { day: 1, month: 4, type: 'holiday', name_ru: 'День труда', name_sk: 'Sviatok práce', name_en: 'Labour Day', icon: '⚒️' },
        
        // Июль
        { day: 5, month: 6, type: 'holiday', name_ru: 'День святых Кирилла и Мефодия', name_sk: 'Sviatok svätých Cyrila a Metoda', name_en: 'Saints Cyril and Methodius Day', icon: '📜' },
        
        // Август
        { day: 29, month: 7, type: 'holiday', name_ru: 'День Словацкого национального восстания', name_sk: 'Výročie SNP', name_en: 'Slovak National Uprising Day', icon: '⚔️' },
        
        // Ноябрь
        { day: 1, month: 10, type: 'holiday', name_ru: 'День всех святых', name_sk: 'Sviatok všetkých svätých', name_en: 'All Saints\' Day', icon: '🕯️' },
        
        // Декабрь
        { day: 24, month: 11, type: 'holiday', name_ru: 'Сочельник', name_sk: 'Štedrý deň', name_en: 'Christmas Eve', icon: '🎄' },
        { day: 25, month: 11, type: 'holiday', name_ru: 'Рождество', name_sk: 'Prvý sviatok vianočný', name_en: 'Christmas Day', icon: '🎅' },
        { day: 26, month: 11, type: 'holiday', name_ru: 'Второй день Рождества', name_sk: 'Druhý sviatok vianočný', name_en: 'St. Stephen\'s Day', icon: '🎁' }
    ];

    let settings = {
        notifySalary: true,
        notifyHolidays: true,
        notifyDaysBefore: 3,
        salaryTime: '10:00',
        language: 'ru'
    };

    // Загружаем настройки
    function loadSettings() {
        const saved = localStorage.getItem(CONFIG.STORAGE_KEY);
        if (saved) {
            settings = { ...settings, ...JSON.parse(saved) };
        }
    }

    // Сохраняем настройки
    function saveSettings() {
        localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(settings));
    }

    // Получаем текущий язык
    function getCurrentLanguage() {
        return document.documentElement.lang || 'ru';
    }

    /**
     * Рассчитываем 3-й рабочий день месяца (день зарплаты)
     * Рабочие дни: понедельник-пятница, не праздники
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
        
        // Если не нашли (например, весь месяц праздники), возвращаем последний возможный день
        return Math.min(day, maxDays);
    }

    /**
     * Проверка, является ли дата государственным праздником
     */
    function isHoliday(year, month, day) {
        // Проверяем только для 2026 года (можно расширить на другие годы)
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
            name_ru: '💰 Зарплата',
            name_sk: '💰 Výplata',
            name_en: '💰 Salary',
            icon: '💰'
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
     * Обновляем ячейки календаря - добавляем иконки важных дат
     */
    function enhanceCalendarWithImportantDates() {
        // Получаем текущий год и месяц из глобальных переменных
        const year = window.currentYear || new Date().getFullYear();
        const month = window.currentMonth || new Date().getMonth();
        
        // Получаем все важные даты для этого месяца
        const importantDates = getImportantDatesForMonth(year, month);
        
        // Ждем, пока календарь отрисуется
        setTimeout(() => {
            const calendarGrid = document.getElementById('calendarGrid');
            if (!calendarGrid) return;
            
            const dayCells = calendarGrid.querySelectorAll('.day:not(.empty)');
            
            dayCells.forEach(cell => {
                const dayNumber = parseInt(cell.querySelector('.day-number')?.textContent || '0');
                if (!dayNumber) return;
                
                // Проверяем, есть ли важная дата в этот день
                const importantDate = importantDates.find(d => d.day === dayNumber);
                
                if (importantDate) {
                    // Добавляем класс для стилизации
                    cell.classList.add(`has-${importantDate.type}`);
                    
                    // Получаем название на нужном языке
                    let title = importantDate[`name_${settings.language}`] || importantDate.name_ru;
                    
                    // Обновляем иконку
                    const iconSpan = cell.querySelector('.day-icon');
                    if (iconSpan) {
                        iconSpan.textContent = importantDate.icon || '📌';
                    }
                    
                    // Добавляем tooltip
                    cell.setAttribute('title', title);
                    
                    // Добавляем маленький индикатор
                    let indicator = cell.querySelector('.day-indicator');
                    if (!indicator) {
                        indicator = document.createElement('span');
                        indicator.className = 'day-indicator';
                        cell.appendChild(indicator);
                    }
                    indicator.textContent = '●';
                    indicator.style.color = importantDate.type === 'salary' ? '#00b060' : '#f59e0b';
                }
            });
        }, 100);
    }

    /**
     * Восстанавливаем функциональность календаря
     */
    function fixCalendarClickHandler() {
        // Перехватываем оригинальную функцию buildCalendar
        const originalBuildCalendar = window.buildCalendar;
        if (originalBuildCalendar) {
            window.buildCalendar = function() {
                // Вызываем оригинальную функцию
                originalBuildCalendar();
                // Добавляем наши важные даты
                enhanceCalendarWithImportantDates();
            };
        }
    }

    /**
     * Создаем виджет предстоящих важных дат
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
                upcomingDates.push({ ...d, date: new Date(currentYear, currentMonth, d.day) });
            }
        });
        
        // Следующий месяц
        const nextMonth = currentMonth === 11 ? 0 : currentMonth + 1;
        const nextYear = currentMonth === 11 ? currentYear + 1 : currentYear;
        const nextMonthDates = getImportantDatesForMonth(nextYear, nextMonth);
        nextMonthDates.forEach(d => {
            upcomingDates.push({ ...d, date: new Date(nextYear, nextMonth, d.day) });
        });
        
        // Сортируем по дате
        upcomingDates.sort((a, b) => a.date - b.date);
        
        widget.innerHTML = `
            <div class="widget-header">
                <i class="fas fa-calendar-star"></i>
                <h3 data-lang="importantDates">📅 Важные даты</h3>
                <button class="widget-settings-btn" onclick="window.showDatesSettings()">
                    <i class="fas fa-cog"></i>
                </button>
            </div>
            <div class="dates-list">
                ${upcomingDates.slice(0, 5).map(d => {
                    const title = d[`name_${settings.language}`] || d.name_ru;
                    const diffDays = Math.ceil((d.date - now) / (1000 * 60 * 60 * 24));
                    let countdownText = '';
                    
                    if (diffDays === 0) {
                        countdownText = settings.language === 'ru' ? 'сегодня' : 
                                       (settings.language === 'sk' ? 'dnes' : 'today');
                    } else if (diffDays === 1) {
                        countdownText = settings.language === 'ru' ? 'завтра' : 
                                       (settings.language === 'sk' ? 'zajtra' : 'tomorrow');
                    } else {
                        countdownText = settings.language === 'ru' ? `через ${diffDays} дн.` : 
                                       (settings.language === 'sk' ? `o ${diffDays} dní` : `in ${diffDays} days`);
                    }
                    
                    return `
                        <div class="date-item ${d.type}" data-date="${d.date.toISOString()}">
                            <div class="date-icon">${d.icon || (d.type === 'salary' ? '💰' : '🎉')}</div>
                            <div class="date-info">
                                <div class="date-title">${title}</div>
                                <div class="date-day">${d.date.toLocaleDateString(settings.language === 'sk' ? 'sk-SK' : 'ru-RU', { day: 'numeric', month: 'long' })}</div>
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
     * Создаем панель настроек
     */
    function createSettingsModal() {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.id = 'datesSettingsModal';
        modal.innerHTML = `
            <div class="modal-content glass-effect">
                <h3>⚙️ Настройки важных дат</h3>
                <div class="settings-group">
                    <label class="checkbox-label">
                        <input type="checkbox" id="notifySalary" ${settings.notifySalary ? 'checked' : ''}>
                        <span data-lang="notifySalary">Напоминать о зарплате</span>
                    </label>
                    <label class="checkbox-label">
                        <input type="checkbox" id="notifyHolidays" ${settings.notifyHolidays ? 'checked' : ''}>
                        <span data-lang="notifyHolidays">Напоминать о праздниках</span>
                    </label>
                </div>
                <div class="settings-group">
                    <label data-lang="notifyDaysBefore">Напоминать за:</label>
                    <select id="notifyDaysBefore">
                        <option value="1" ${settings.notifyDaysBefore === 1 ? 'selected' : ''}>1 ${settings.language === 'ru' ? 'день' : (settings.language === 'sk' ? 'deň' : 'day')}</option>
                        <option value="2" ${settings.notifyDaysBefore === 2 ? 'selected' : ''}>2 ${settings.language === 'ru' ? 'дня' : (settings.language === 'sk' ? 'dni' : 'days')}</option>
                        <option value="3" ${settings.notifyDaysBefore === 3 ? 'selected' : ''}>3 ${settings.language === 'ru' ? 'дня' : (settings.language === 'sk' ? 'dni' : 'days')}</option>
                        <option value="5" ${settings.notifyDaysBefore === 5 ? 'selected' : ''}>5 ${settings.language === 'ru' ? 'дней' : (settings.language === 'sk' ? 'dní' : 'days')}</option>
                        <option value="7" ${settings.notifyDaysBefore === 7 ? 'selected' : ''}>7 ${settings.language === 'ru' ? 'дней' : (settings.language === 'sk' ? 'dní' : 'days')}</option>
                    </select>
                </div>
                <div class="settings-group">
                    <label data-lang="salaryTime">Время начисления зарплаты:</label>
                    <input type="time" id="salaryTime" value="${settings.salaryTime}">
                </div>
                <div class="modal-actions">
                    <button class="btn-primary" onclick="window.saveDatesSettings()"><span data-lang="save">Сохранить</span></button>
                    <button class="btn-secondary" onclick="window.closeDatesSettings()"><span data-lang="cancel">Отмена</span></button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    // Глобальные функции для настроек
    window.showDatesSettings = function() {
        const modal = document.getElementById('datesSettingsModal');
        if (modal) modal.style.display = 'flex';
    };

    window.saveDatesSettings = function() {
        settings.notifySalary = document.getElementById('notifySalary').checked;
        settings.notifyHolidays = document.getElementById('notifyHolidays').checked;
        settings.notifyDaysBefore = parseInt(document.getElementById('notifyDaysBefore').value);
        settings.salaryTime = document.getElementById('salaryTime').value;
        
        saveSettings();
        window.closeDatesSettings();
        updateWidget();
    };

    window.closeDatesSettings = function() {
        document.getElementById('datesSettingsModal').style.display = 'none';
    };

    /**
     * Обновляем виджет
     */
    function updateWidget() {
        const oldWidget = document.getElementById('importantDatesWidget');
        if (oldWidget) {
            const newWidget = createUpcomingDatesWidget();
            oldWidget.parentNode.replaceChild(newWidget, oldWidget);
        }
    }

    /**
     * Проверяем и отправляем уведомления
     */
    function checkNotifications() {
        if (!settings.notifySalary && !settings.notifyHolidays) return;
        
        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth();
        
        const importantDates = getImportantDatesForMonth(currentYear, currentMonth);
        
        importantDates.forEach(d => {
            const date = new Date(currentYear, currentMonth, d.day);
            const diffTime = date - now;
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            
            if (diffDays <= settings.notifyDaysBefore && diffDays >= 0) {
                const notificationKey = `notified_${date.toISOString()}_${diffDays}`;
                if (!localStorage.getItem(notificationKey)) {
                    const title = d[`name_${settings.language}`] || d.name_ru;
                    let message = '';
                    
                    if (diffDays === 0) {
                        message = settings.language === 'ru' ? `📅 Сегодня: ${title}!` :
                                 (settings.language === 'sk' ? `📅 Dnes: ${title}!` : `📅 Today: ${title}!`);
                    } else {
                        message = settings.language === 'ru' ? `📅 ${title} через ${diffDays} дн.` :
                                 (settings.language === 'sk' ? `📅 ${title} o ${diffDays} dní` : `📅 ${title} in ${diffDays} days`);
                    }
                    
                    if (window.showNotification) {
                        window.showNotification(message);
                    }
                    
                    localStorage.setItem(notificationKey, 'true');
                    setTimeout(() => localStorage.removeItem(notificationKey), 24 * 60 * 60 * 1000);
                }
            }
        });
    }

    /**
     * Добавляем стили
     */
    function addStyles() {
        const style = document.createElement('style');
        style.textContent = `
            /* Стили для ячеек календаря с важными датами */
            .day.has-salary {
                position: relative;
                background: linear-gradient(145deg, rgba(0,176,96,0.2), rgba(0,176,96,0.05)) !important;
                border: 2px solid #00b060 !important;
            }
            
            .day.has-holiday {
                position: relative;
                background: linear-gradient(145deg, rgba(245,158,11,0.2), rgba(245,158,11,0.05)) !important;
                border: 2px solid #f59e0b !important;
            }
            
            .day-indicator {
                position: absolute;
                top: 2px;
                right: 4px;
                font-size: 0.7rem;
            }
            
            /* Стили для виджета */
            .important-dates-widget {
                margin: 20px 0;
                padding: 20px;
                border-radius: 20px;
                background: var(--glass-bg);
                backdrop-filter: blur(10px);
                border: 1px solid var(--border);
            }
            
            .widget-header {
                display: flex;
                align-items: center;
                justify-content: space-between;
                margin-bottom: 15px;
            }
            
            .widget-header h3 {
                display: flex;
                align-items: center;
                gap: 8px;
                color: var(--primary);
                font-size: 1.2rem;
            }
            
            .widget-settings-btn {
                background: transparent;
                border: none;
                color: var(--text-muted);
                cursor: pointer;
                font-size: 1.2rem;
                transition: all 0.3s;
                width: 35px;
                height: 35px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            .widget-settings-btn:hover {
                transform: rotate(90deg);
                color: var(--primary);
                background: var(--dark-light);
            }
            
            .dates-list {
                display: flex;
                flex-direction: column;
                gap: 10px;
            }
            
            .date-item {
                display: flex;
                align-items: center;
                gap: 15px;
                padding: 12px;
                background: var(--dark-light);
                border-radius: 12px;
                border-left: 4px solid;
                transition: transform 0.3s;
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
                font-size: 1.8rem;
                min-width: 40px;
                text-align: center;
            }
            
            .date-info {
                flex: 1;
            }
            
            .date-title {
                font-weight: 600;
                margin-bottom: 4px;
                color: var(--text);
            }
            
            .date-day {
                font-size: 0.9rem;
                color: var(--text-muted);
            }
            
            .date-countdown {
                font-size: 0.9rem;
                font-weight: 500;
                color: var(--primary);
                white-space: nowrap;
                padding: 4px 8px;
                background: var(--dark);
                border-radius: 20px;
            }
            
            /* Стили для настроек */
            #datesSettingsModal .modal-content {
                max-width: 450px;
            }
            
            #datesSettingsModal h3 {
                color: var(--primary);
                margin-bottom: 20px;
            }
            
            .settings-group {
                margin: 20px 0;
                padding: 15px;
                background: var(--dark-light);
                border-radius: 12px;
            }
            
            .checkbox-label {
                display: flex;
                align-items: center;
                gap: 10px;
                margin: 10px 0;
                cursor: pointer;
                color: var(--text);
            }
            
            .checkbox-label input[type="checkbox"] {
                width: 18px;
                height: 18px;
                accent-color: var(--primary);
                cursor: pointer;
            }
            
            #datesSettingsModal select,
            #datesSettingsModal input[type="time"] {
                width: 100%;
                padding: 10px;
                background: var(--dark);
                border: 1px solid var(--border);
                border-radius: 8px;
                color: var(--text);
                margin-top: 5px;
            }
            
            .modal-actions {
                display: flex;
                gap: 10px;
                justify-content: flex-end;
                margin-top: 20px;
            }
            
            @media (max-width: 768px) {
                .date-item {
                    flex-wrap: wrap;
                }
                .date-countdown {
                    width: 100%;
                    text-align: right;
                }
                .modal-actions {
                    flex-direction: column;
                }
                .modal-actions button {
                    width: 100%;
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
        
        // Фиксим календарь
        fixCalendarClickHandler();
        
        // Добавляем виджет на дашборд
        const insertTarget = document.querySelector('.stats-row') || document.querySelector('.kpi-grid');
        if (insertTarget) {
            insertTarget.parentNode.insertBefore(createUpcomingDatesWidget(), insertTarget.nextSibling);
        }
        
        // Создаем модалку настроек
        createSettingsModal();
        
        // Запускаем проверку уведомлений
        checkNotifications();
        setInterval(checkNotifications, 60 * 60 * 1000); // Каждый час
        
        // Следим за сменой месяца в календаре
        const originalChangeMonth = window.changeMonth;
        if (originalChangeMonth) {
            window.changeMonth = function(delta) {
                originalChangeMonth(delta);
                setTimeout(enhanceCalendarWithImportantDates, 200);
            };
        }
        
        // Следим за сменой языка
        const observer = new MutationObserver(() => {
            settings.language = getCurrentLanguage();
            updateWidget();
        });
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
    }

    // Ждем загрузки основного приложения
    const checkInterval = setInterval(() => {
        if (document.getElementById('app') && !document.getElementById('app').classList.contains('hidden')) {
            clearInterval(checkInterval);
            setTimeout(init, 1000);
        }
    }, 100);
})();
