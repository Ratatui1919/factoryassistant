// modules/important-dates.js - Модуль важных дат

(function() {
    // Конфигурация
    const CONFIG = {
        SALARY_DAY_OFFSET: 3, // 3-й рабочий день месяца
        STORAGE_KEY: 'important_dates_settings',
        NOTIFICATION_DAYS_BEFORE: [3, 1, 0] // За сколько дней напоминать
    };

    // Государственные праздники Словакии (фиксированные)
    const SLOVAK_HOLIDAYS = [
        { day: 1, month: 0, name: 'Новый год', name_ru: 'Новый год', name_sk: 'Nový rok', name_en: 'New Year' },
        { day: 6, month: 0, name: 'Богоявление', name_ru: 'Богоявление', name_sk: 'Zjavenie Pána', name_en: 'Epiphany' },
        { day: 1, month: 4, name: 'День труда', name_ru: 'День труда', name_sk: 'Sviatok práce', name_en: 'Labor Day' },
        { day: 8, month: 4, name: 'День победы', name_ru: 'День победы', name_sk: 'Deň víťazstva nad fašizmom', name_en: 'Victory Day' },
        { day: 5, month: 6, name: 'День Кирилла и Мефодия', name_ru: 'День Кирилла и Мефодия', name_sk: 'Sviatok svätého Cyrila a Metoda', name_en: 'Saints Cyril and Methodius Day' },
        { day: 29, month: 7, name: 'День Словацкого восстания', name_ru: 'День Словацкого восстания', name_sk: 'Výročie SNP', name_en: 'Slovak National Uprising Day' },
        { day: 1, month: 8, name: 'День Конституции', name_ru: 'День Конституции', name_sk: 'Deň Ústavy Slovenskej republiky', name_en: 'Constitution Day' },
        { day: 15, month: 8, name: 'День Девы Марии', name_ru: 'День Девы Марии', name_sk: 'Sedembolestná Panna Mária', name_en: 'Our Lady of Sorrows Day' },
        { day: 1, month: 10, name: 'День всех святых', name_ru: 'День всех святых', name_sk: 'Sviatok všetkých svätých', name_en: 'All Saints Day' },
        { day: 17, month: 10, name: 'День борьбы за свободу', name_ru: 'День борьбы за свободу', name_sk: 'Deň boja za slobodu a demokraciu', name_en: 'Struggle for Freedom Day' },
        { day: 24, month: 11, name: 'Сочельник', name_ru: 'Сочельник', name_sk: 'Štedrý deň', name_en: 'Christmas Eve' },
        { day: 25, month: 11, name: 'Рождество', name_ru: 'Рождество', name_sk: 'Prvý sviatok vianočný', name_en: 'Christmas Day' },
        { day: 26, month: 11, name: 'День подарков', name_ru: 'День подарков', name_sk: 'Druhý sviatok vianočný', name_en: 'St. Stephens Day' }
    ];

    // Пасха (переменная дата)
    const EASTER_DATES = {
        2024: { month: 2, day: 31 }, // Март 31
        2025: { month: 3, day: 20 }, // Апрель 20
        2026: { month: 3, day: 5 },  // Апрель 5
        2027: { month: 2, day: 28 }, // Март 28
        2028: { month: 3, day: 16 }  // Апрель 16
    };

    let settings = {
        notifySalary: true,
        notifyHolidays: true,
        notifyDaysBefore: 3,
        salaryTime: '10:00', // Время начисления зарплаты
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

    // Получаем текущий язык из основного приложения
    function getCurrentLanguage() {
        return document.documentElement.lang || 'ru';
    }

    // Рассчитываем 3-й рабочий день месяца
    function getThirdWorkingDay(year, month) {
        let workingDays = 0;
        let day = 1;
        
        while (workingDays < 3) {
            const date = new Date(year, month, day);
            const dayOfWeek = date.getDay();
            
            // 0 = воскресенье, 6 = суббота (выходные)
            if (dayOfWeek !== 0 && dayOfWeek !== 6) {
                // Проверяем, не праздник ли это
                if (!isHoliday(date)) {
                    workingDays++;
                }
            }
            day++;
        }
        
        return new Date(year, month, day - 1);
    }

    // Проверка, является ли дата праздником
    function isHoliday(date) {
        const year = date.getFullYear();
        const month = date.getMonth();
        const day = date.getDate();
        
        // Проверяем фиксированные праздники
        const isFixedHoliday = SLOVAK_HOLIDAYS.some(h => h.day === day && h.month === month);
        if (isFixedHoliday) return true;
        
        // Проверяем Пасху
        if (EASTER_DATES[year] && 
            EASTER_DATES[year].month === month && 
            EASTER_DATES[year].day === day) {
            return true;
        }
        
        return false;
    }

    // Получаем название праздника
    function getHolidayName(date, lang = 'ru') {
        const year = date.getFullYear();
        const month = date.getMonth();
        const day = date.getDate();
        
        // Проверяем фиксированные праздники
        const holiday = SLOVAK_HOLIDAYS.find(h => h.day === day && h.month === month);
        if (holiday) {
            return holiday[`name_${lang}`] || holiday.name;
        }
        
        // Проверяем Пасху
        if (EASTER_DATES[year] && 
            EASTER_DATES[year].month === month && 
            EASTER_DATES[year].day === day) {
            return lang === 'ru' ? 'Пасха' : (lang === 'sk' ? 'Veľká noc' : 'Easter');
        }
        
        return null;
    }

    // Получаем все важные даты на месяц
    function getImportantDates(year, month) {
        const dates = [];
        
        // Дата зарплаты
        const salaryDate = getThirdWorkingDay(year, month);
        dates.push({
            date: salaryDate,
            type: 'salary',
            title: {
                ru: '💰 Зарплата',
                sk: '💰 Výplata',
                en: '💰 Salary'
            },
            description: {
                ru: 'Ожидайте поступление зарплаты',
                sk: 'Očakávajte výplatu',
                en: 'Salary expected'
            }
        });
        
        // Все праздники в месяце
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        for (let d = 1; d <= daysInMonth; d++) {
            const date = new Date(year, month, d);
            const holidayName = getHolidayName(date);
            if (holidayName) {
                dates.push({
                    date: date,
                    type: 'holiday',
                    title: {
                        ru: `🎉 ${holidayName}`,
                        sk: `🎉 ${holidayName}`,
                        en: `🎉 ${holidayName}`
                    },
                    description: {
                        ru: 'Государственный праздник',
                        sk: 'Štátny sviatok',
                        en: 'Public holiday'
                    }
                });
            }
        }
        
        return dates.sort((a, b) => a.date - b.date);
    }

    // Создаем виджет важных дат
    function createDatesWidget() {
        const widget = document.createElement('div');
        widget.className = 'important-dates-widget glass-effect';
        widget.id = 'importantDatesWidget';
        
        const now = new Date();
        const dates = getImportantDates(now.getFullYear(), now.getMonth());
        
        widget.innerHTML = `
            <div class="widget-header">
                <i class="fas fa-calendar-star"></i>
                <h3 data-lang="importantDates">📅 Важные даты</h3>
                <button class="widget-settings-btn" onclick="window.showDatesSettings()">
                    <i class="fas fa-cog"></i>
                </button>
            </div>
            <div class="dates-list">
                ${dates.map(d => `
                    <div class="date-item ${d.type}" data-date="${d.date.toISOString()}">
                        <div class="date-icon">${d.type === 'salary' ? '💰' : '🎉'}</div>
                        <div class="date-info">
                            <div class="date-title">${d.title[settings.language]}</div>
                            <div class="date-day">${d.date.toLocaleDateString(settings.language === 'sk' ? 'sk-SK' : 'ru-RU', { day: 'numeric', month: 'long' })}</div>
                            <div class="date-description">${d.description[settings.language]}</div>
                        </div>
                        <div class="date-countdown" data-date="${d.date.toISOString()}"></div>
                    </div>
                `).join('')}
            </div>
        `;
        
        return widget;
    }

    // Обновляем обратный отсчет
    function updateCountdowns() {
        document.querySelectorAll('[data-date]').forEach(el => {
            const dateStr = el.getAttribute('data-date');
            if (!dateStr) return;
            
            const targetDate = new Date(dateStr);
            const now = new Date();
            const diffTime = targetDate - now;
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            
            let countdownText = '';
            if (diffDays > 0) {
                countdownText = `через ${diffDays} ${getDaysWord(diffDays, settings.language)}`;
            } else if (diffDays === 0) {
                countdownText = settings.language === 'ru' ? 'сегодня' : 
                               (settings.language === 'sk' ? 'dnes' : 'today');
            } else {
                countdownText = settings.language === 'ru' ? 'прошло' : 
                               (settings.language === 'sk' ? 'prešlo' : 'passed');
            }
            
            el.textContent = countdownText;
        });
    }

    // Склонение слова "день"
    function getDaysWord(days, lang) {
        if (lang === 'ru') {
            if (days % 10 === 1 && days % 100 !== 11) return 'день';
            if ([2,3,4].includes(days % 10) && ![12,13,14].includes(days % 100)) return 'дня';
            return 'дней';
        } else if (lang === 'sk') {
            if (days === 1) return 'deň';
            if (days >= 2 && days <= 4) return 'dni';
            return 'dní';
        } else {
            return days === 1 ? 'day' : 'days';
        }
    }

    // Проверяем нужно ли отправить уведомление
    function checkNotifications() {
        if (!settings.notifySalary && !settings.notifyHolidays) return;
        
        const now = new Date();
        const dates = getImportantDates(now.getFullYear(), now.getMonth());
        
        dates.forEach(d => {
            const diffTime = d.date - now;
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            
            if (diffDays <= settings.notifyDaysBefore && diffDays >= 0) {
                const notificationKey = `notified_${d.date.toISOString()}_${diffDays}`;
                if (!localStorage.getItem(notificationKey)) {
                    showDateNotification(d);
                    localStorage.setItem(notificationKey, 'true');
                    
                    // Очищаем через день
                    setTimeout(() => {
                        localStorage.removeItem(notificationKey);
                    }, 24 * 60 * 60 * 1000);
                }
            }
        });
    }

    // Показываем уведомление о дате
    function showDateNotification(dateInfo) {
        const diffDays = Math.ceil((dateInfo.date - new Date()) / (1000 * 60 * 60 * 24));
        
        let message = '';
        if (diffDays === 0) {
            message = `${dateInfo.title[settings.language]} ${settings.language === 'ru' ? 'сегодня!' : 
                      (settings.language === 'sk' ? 'dnes!' : 'today!')}`;
        } else {
            message = `${dateInfo.title[settings.language]} ${settings.language === 'ru' ? 'через' : 
                      (settings.language === 'sk' ? 'o' : 'in')} ${diffDays} ${getDaysWord(diffDays, settings.language)}`;
        }
        
        // Используем основную систему уведомлений если есть
        if (window.showNotification) {
            window.showNotification(message);
        } else {
            // Своя система уведомлений
            const notification = document.createElement('div');
            notification.className = 'dates-notification';
            notification.innerHTML = `
                <div class="notification-content">
                    <span>${message}</span>
                    <button onclick="this.parentElement.parentElement.remove()">✕</button>
                </div>
            `;
            document.body.appendChild(notification);
            
            setTimeout(() => notification.remove(), 5000);
        }
    }

    // Создаем панель настроек
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
                        <span>Напоминать о зарплате</span>
                    </label>
                    <label class="checkbox-label">
                        <input type="checkbox" id="notifyHolidays" ${settings.notifyHolidays ? 'checked' : ''}>
                        <span>Напоминать о праздниках</span>
                    </label>
                </div>
                <div class="settings-group">
                    <label>Напоминать за:</label>
                    <select id="notifyDaysBefore">
                        <option value="1" ${settings.notifyDaysBefore === 1 ? 'selected' : ''}>1 день</option>
                        <option value="2" ${settings.notifyDaysBefore === 2 ? 'selected' : ''}>2 дня</option>
                        <option value="3" ${settings.notifyDaysBefore === 3 ? 'selected' : ''}>3 дня</option>
                        <option value="5" ${settings.notifyDaysBefore === 5 ? 'selected' : ''}>5 дней</option>
                        <option value="7" ${settings.notifyDaysBefore === 7 ? 'selected' : ''}>7 дней</option>
                    </select>
                </div>
                <div class="settings-group">
                    <label>Время начисления зарплаты:</label>
                    <input type="time" id="salaryTime" value="${settings.salaryTime}">
                </div>
                <div class="modal-actions">
                    <button class="btn-primary" onclick="window.saveDatesSettings()">Сохранить</button>
                    <button class="btn-secondary" onclick="window.closeDatesSettings()">Отмена</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    // Показываем настройки
    window.showDatesSettings = function() {
        const modal = document.getElementById('datesSettingsModal');
        if (modal) {
            modal.style.display = 'flex';
        }
    };

    // Сохраняем настройки
    window.saveDatesSettings = function() {
        settings.notifySalary = document.getElementById('notifySalary').checked;
        settings.notifyHolidays = document.getElementById('notifyHolidays').checked;
        settings.notifyDaysBefore = parseInt(document.getElementById('notifyDaysBefore').value);
        settings.salaryTime = document.getElementById('salaryTime').value;
        
        saveSettings();
        window.closeDatesSettings();
        updateWidget();
    };

    // Закрываем настройки
    window.closeDatesSettings = function() {
        document.getElementById('datesSettingsModal').style.display = 'none';
    };

    // Обновляем виджет
    function updateWidget() {
        const oldWidget = document.getElementById('importantDatesWidget');
        if (oldWidget) {
            const newWidget = createDatesWidget();
            oldWidget.parentNode.replaceChild(newWidget, oldWidget);
        }
        updateCountdowns();
    }

    // Инициализация модуля
    function init() {
        console.log('📅 Модуль важных дат загружен');
        
        loadSettings();
        settings.language = getCurrentLanguage();
        
        // Добавляем стили
        const style = document.createElement('style');
        style.textContent = `
            .important-dates-widget {
                margin: 20px 0;
                padding: 20px;
                border-radius: 20px;
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
            }
            
            .widget-settings-btn {
                background: transparent;
                border: none;
                color: var(--text-muted);
                cursor: pointer;
                font-size: 1.2rem;
                transition: transform 0.3s;
            }
            
            .widget-settings-btn:hover {
                transform: rotate(90deg);
                color: var(--primary);
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
            }
            
            .date-info {
                flex: 1;
            }
            
            .date-title {
                font-weight: 600;
                margin-bottom: 4px;
            }
            
            .date-day {
                font-size: 0.9rem;
                color: var(--primary);
            }
            
            .date-description {
                font-size: 0.8rem;
                color: var(--text-muted);
            }
            
            .date-countdown {
                font-size: 0.9rem;
                font-weight: 500;
                color: var(--primary);
                white-space: nowrap;
            }
            
            .dates-notification {
                position: fixed;
                top: 20px;
                right: 20px;
                background: var(--dark-card);
                border-left: 4px solid var(--primary);
                border-radius: 12px;
                padding: 15px 20px;
                box-shadow: var(--shadow);
                animation: slideIn 0.3s ease;
                z-index: 1000;
            }
            
            .settings-group {
                margin: 20px 0;
            }
            
            .checkbox-label {
                display: flex;
                align-items: center;
                gap: 10px;
                margin: 10px 0;
                cursor: pointer;
            }
            
            .checkbox-label input[type="checkbox"] {
                width: 18px;
                height: 18px;
                accent-color: var(--primary);
            }
            
            .modal-actions {
                display: flex;
                gap: 10px;
                justify-content: flex-end;
                margin-top: 20px;
            }
            
            @keyframes slideIn {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
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
        
        // Добавляем виджет на дашборд
        const insertTarget = document.querySelector('.stats-row') || 
                            document.querySelector('.kpi-grid');
        if (insertTarget) {
            insertTarget.parentNode.insertBefore(createDatesWidget(), insertTarget.nextSibling);
        }
        
        // Создаем модалку настроек
        createSettingsModal();
        
        // Запускаем обновление счетчиков
        updateCountdowns();
        setInterval(updateCountdowns, 60000); // Каждую минуту
        
        // Проверяем уведомления каждый час
        checkNotifications();
        setInterval(checkNotifications, 60 * 60 * 1000);
        
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
            setTimeout(init, 1000); // Даем основному приложению прогрузиться
        }
    }, 100);
})();
