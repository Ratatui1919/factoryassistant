// modules/important-dates.js - ИСПРАВЛЕННАЯ ВЕРСИЯ

(function() {
    console.log('🔥 Модуль важных дат запущен');

    // ПЕРЕВОДЫ
    const translations = {
        ru: {
            salary: 'День зарплаты',
            holidays: {
                'День образования Словацкой Республики': 'День образования Словацкой Республики',
                'Богоявление': 'Богоявление',
                'Страстная пятница': 'Страстная пятница',
                'Пасхальный понедельник': 'Пасхальный понедельник',
                'День труда': 'День труда',
                'День Кирилла и Мефодия': 'День Кирилла и Мефодия',
                'День Словацкого восстания': 'День Словацкого восстания',
                'День всех святых': 'День всех святых',
                'Сочельник': 'Сочельник',
                'Рождество': 'Рождество'
            },
            dayTypes: {
                'Смена': 'Смена',
                'Ночная': 'Ночная',
                'Переработки': 'Переработки',
                'Суббота': 'Суббота',
                'Воскресенье': 'Воскресенье',
                'Надчасы': 'Надчасы',
                'Больничный': 'Больничный',
                'Отпуск': 'Отпуск',
                'Перепустка': 'Перепустка',
                'Выходной': 'Выходной'
            },
            legend: 'Важные даты',
            past: 'прошло',
            today: 'сегодня',
            tomorrow: 'завтра',
            days: 'дн.',
            upcoming: 'Ближайшие даты',
            dayTypesTitle: 'Типы дней'
        },
        sk: {
            salary: 'Deň výplaty',
            holidays: {
                'День образования Словацкой Республики': 'Deň vzniku Slovenskej republiky',
                'Богоявление': 'Zjavenie Pána',
                'Страстная пятница': 'Veľký piatok',
                'Пасхальный понедельник': 'Veľkonočný pondelok',
                'День труда': 'Sviatok práce',
                'День Кирилла и Мефодия': 'Sviatok svätých Cyrila a Metoda',
                'День Словацкого восстания': 'Výročie SNP',
                'День всех святых': 'Sviatok všetkých svätých',
                'Сочельник': 'Štedrý deň',
                'Рождество': 'Vianoce'
            },
            dayTypes: {
                'Смена': 'Zmena',
                'Ночная': 'Nočná',
                'Переработки': 'Nadčasy',
                'Суббота': 'Sobota',
                'Воскресенье': 'Nedeľa',
                'Надчасы': 'Nadčasy',
                'Больничный': 'PN',
                'Отпуск': 'Dovolenka',
                'Перепустка': 'Lekár',
                'Выходной': 'Voľno'
            },
            legend: 'Dôležité dátumy',
            past: 'prešlo',
            today: 'dnes',
            tomorrow: 'zajtra',
            days: 'dní',
            upcoming: 'Najbližšie dátumy',
            dayTypesTitle: 'Typy dní'
        },
        en: {
            salary: 'Payday',
            holidays: {
                'День образования Словацкой Республики': 'Day of the Establishment of the Slovak Republic',
                'Богоявление': 'Epiphany',
                'Страстная пятница': 'Good Friday',
                'Пасхальный понедельник': 'Easter Monday',
                'День труда': 'Labour Day',
                'День Кирилла и Мефодия': 'Saints Cyril and Methodius Day',
                'День Словацкого восстания': 'Slovak National Uprising Day',
                'День всех святых': 'All Saints\' Day',
                'Сочельник': 'Christmas Eve',
                'Рождество': 'Christmas'
            },
            dayTypes: {
                'Смена': 'Shift',
                'Ночная': 'Night',
                'Переработки': 'Overtime',
                'Суббота': 'Saturday',
                'Воскресенье': 'Sunday',
                'Надчасы': 'Extra',
                'Больничный': 'Sick',
                'Отпуск': 'Vacation',
                'Перепустка': 'Doctor',
                'Выходной': 'Day off'
            },
            legend: 'Important Dates',
            past: 'past',
            today: 'today',
            tomorrow: 'tomorrow',
            days: 'days',
            upcoming: 'Upcoming Dates',
            dayTypesTitle: 'Day Types'
        },
        uk: {
            salary: 'День зарплати',
            holidays: {
                'День образования Словацкой Республики': 'День утворення Словацької Республіки',
                'Богоявление': 'Богоявлення',
                'Страстная пятница': 'Страсна п\'ятниця',
                'Пасхальный понедельник': 'Великодній понеділок',
                'День труда': 'День праці',
                'День Кирилла и Мефодия': 'День Кирила і Мефодія',
                'День Словацкого восстания': 'День Словацького повстання',
                'День всех святых': 'День усіх святих',
                'Сочельник': 'Святвечір',
                'Рождество': 'Різдво'
            },
            dayTypes: {
                'Смена': 'Зміна',
                'Ночная': 'Нічна',
                'Переработки': 'Понаднормові',
                'Суббота': 'Субота',
                'Воскресенье': 'Неділя',
                'Надчасы': 'Надгодини',
                'Больничный': 'Лікарняний',
                'Отпуск': 'Відпустка',
                'Перепустка': 'Перепустка',
                'Выходной': 'Вихідний'
            },
            legend: 'Важливі дати',
            past: 'минуло',
            today: 'сьогодні',
            tomorrow: 'завтра',
            days: 'дн.',
            upcoming: 'Найближчі дати',
            dayTypesTitle: 'Типи днів'
        }
    };

    // ПОЛУЧАЕМ ТЕКУЩИЙ ЯЗЫК
    function getCurrentLanguage() {
        return document.documentElement.lang || 'ru';
    }

    // ФУНКЦИЯ ПЕРЕВОДА
    function translate(key, category = null) {
        const lang = getCurrentLanguage();
        
        if (category && translations[lang]?.[category]?.[key]) {
            return translations[lang][category][key];
        }
        if (translations[lang]?.[key]) {
            return translations[lang][key];
        }
        // Fallback to Russian
        if (category && translations.ru?.[category]?.[key]) {
            return translations.ru[category][key];
        }
        return translations.ru?.[key] || key;
    }

    // ПРАЗДНИКИ
    const holidays = {
        0: [ // Январь
            { day: 1, name: 'День образования Словацкой Республики', icon: '🇸🇰' },
            { day: 6, name: 'Богоявление', icon: '👑' }
        ],
        3: [ // Апрель
            { day: 3, name: 'Страстная пятница', icon: '✝️' },
            { day: 6, name: 'Пасхальный понедельник', icon: '🐣' }
        ],
        4: [ // Май
            { day: 1, name: 'День труда', icon: '⚒️' }
        ],
        6: [ // Июль
            { day: 5, name: 'День Кирилла и Мефодия', icon: '📜' }
        ],
        7: [ // Август
            { day: 29, name: 'День Словацкого восстания', icon: '⚔️' }
        ],
        10: [ // Ноябрь
            { day: 1, name: 'День всех святых', icon: '🕯️' }
        ],
        11: [ // Декабрь
            { day: 24, name: 'Сочельник', icon: '🎄' },
            { day: 25, name: 'Рождество', icon: '🎅' },
            { day: 26, name: 'Рождество', icon: '🎁' }
        ]
    };

    // ТИПЫ ДНЕЙ
    const dayTypes = [
        { color: '#f39c12', icon: '💼', name: 'Смена' },
        { color: '#2c3e50', icon: '🌙', name: 'Ночная' },
        { color: '#e74c3c', icon: '⏰', name: 'Переработки' },
        { color: '#8e44ad', icon: '📆', name: 'Суббота' },
        { color: '#f39c12', icon: '☀️', name: 'Воскресенье' },
        { color: '#27ae60', icon: '➕', name: 'Надчасы' },
        { color: '#7f8c8d', icon: '🤒', name: 'Больничный' },
        { color: '#f1c40f', icon: '🏖️', name: 'Отпуск' },
        { color: '#9b59b6', icon: '🩺', name: 'Перепустка' },
        { color: '#2c3e50', icon: '❌', name: 'Выходной' }
    ];

    // ПОЛУЧАЕМ ДЕНЬ ЗАРПЛАТЫ
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

    // ПОЛУЧАЕМ ТЕКУЩУЮ ДАТУ
    function getCurrentDate() {
        const today = new Date();
        return {
            day: today.getDate(),
            month: today.getMonth(),
            year: today.getFullYear()
        };
    }

    // РАЗНИЦА В ДНЯХ
    function daysBetween(date1, date2) {
        const d1 = new Date(date1.year, date1.month, date1.day);
        const d2 = new Date(date2.year, date2.month, date2.day);
        const diffTime = d2 - d1;
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }

    // ФОРМАТ ДАТЫ
    function formatDate(day, month) {
        const months = [
            'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
            'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'
        ];
        return `${day} ${months[month]}`;
    }

    // ЦВЕТ ДЛЯ ТИПА
    function getDateColor(type) {
        return type === 'salary' ? '#00b060' : '#f59e0b';
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
                    icon.title = translate('salary');
                    container.appendChild(icon);
                }
                
                if (holiday) {
                    cell.classList.add('has-holiday');
                    const icon = document.createElement('span');
                    icon.className = 'day-icon-important';
                    icon.textContent = holiday.icon;
                    icon.title = translate(holiday.name, 'holidays');
                    container.appendChild(icon);
                }
            }
        });
    }

    // СОЗДАНИЕ ЛЕГЕНДЫ
    function createLegend() {
        const legendContainer = document.querySelector('.calendar-legend');
        if (!legendContainer) return;

        // Собираем уникальные праздники
        const uniqueHolidays = [];
        const seen = new Set();
        
        Object.values(holidays).flat().forEach(h => {
            if (!seen.has(h.icon)) {
                seen.add(h.icon);
                uniqueHolidays.push(h);
            }
        });

        uniqueHolidays.sort((a, b) => {
            const aDay = a.day + (a.month * 100);
            const bDay = b.day + (b.month * 100);
            return aDay - bDay;
        });

        const lang = getCurrentLanguage();

        legendContainer.innerHTML = `
            <div class="legend-grid">
                <div class="legend-section">
                    <div class="legend-title">${translate('dayTypesTitle')}</div>
                    <div class="legend-items">
                        ${dayTypes.map(d => `
                            <div class="legend-item" title="${translate(d.name, 'dayTypes')}">
                                <span class="legend-color" style="background: ${d.color};"></span>
                                <span class="legend-icon">${d.icon}</span>
                                <span class="legend-text">${translate(d.name, 'dayTypes')}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
                <div class="legend-section">
                    <div class="legend-title">${translate('legend')}</div>
                    <div class="legend-items">
                        <div class="legend-item" title="${translate('salary')}">
                            <span class="legend-color" style="background: #00b060;"></span>
                            <span class="legend-icon">💰</span>
                            <span class="legend-text">${translate('salary')}</span>
                        </div>
                        ${uniqueHolidays.map(h => `
                            <div class="legend-item" title="${translate(h.name, 'holidays')}">
                                <span class="legend-color" style="background: #f59e0b;"></span>
                                <span class="legend-icon">${h.icon}</span>
                                <span class="legend-text">${translate(h.name, 'holidays')}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
    }

    // СОЗДАНИЕ ВИДЖЕТА
    function createWidget() {
        const currentDate = getCurrentDate();
        const selectedMonth = getCurrentMonth();
        const year = 2026;
        
        const oldWidget = document.getElementById('importantDatesWidget');
        if (oldWidget) oldWidget.remove();
        
        const allDates = [];
        
        const salaryDay = getSalaryDay(selectedMonth, year);
        allDates.push({
            day: salaryDay,
            month: selectedMonth,
            type: 'salary',
            name: translate('salary'),
            icon: '💰'
        });
        
        (holidays[selectedMonth] || []).forEach(h => {
            allDates.push({
                day: h.day,
                month: selectedMonth,
                type: 'holiday',
                name: translate(h.name, 'holidays'),
                icon: h.icon
            });
        });
        
        allDates.sort((a, b) => a.day - b.day);
        
        const insertPoint = document.querySelector('.stats-row');
        if (!insertPoint) return;
        
        const widget = document.createElement('div');
        widget.className = 'important-widget';
        widget.id = 'importantDatesWidget';
        
        let itemsHTML = '';
        
        allDates.forEach(d => {
            const eventDate = { day: d.day, month: d.month, year: year };
            const diff = daysBetween(currentDate, eventDate);
            
            let badge = '';
            let badgeClass = '';
            
            if (diff < 0) {
                badge = translate('past');
                badgeClass = 'past';
            } else if (diff === 0) {
                badge = translate('today');
                badgeClass = 'today';
            } else if (diff === 1) {
                badge = translate('tomorrow');
                badgeClass = 'tomorrow';
            } else {
                badge = `${diff} ${translate('days')}`;
                badgeClass = 'future';
            }
            
            const dateStr = formatDate(d.day, d.month);
            const color = getDateColor(d.type);
            
            itemsHTML += `
                <div class="widget-item ${d.type}">
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
                <i class="fas fa-calendar-alt"></i>
                <h3>${translate('upcoming')}</h3>
            </div>
            <div class="widget-items">
                ${itemsHTML}
            </div>
        `;
        
        insertPoint.parentNode.insertBefore(widget, insertPoint.nextSibling);
    }

    // ДОБАВЛЯЕМ СТИЛИ
    const style = document.createElement('style');
    style.textContent = `
        /* Иконки в календаре */
        .day-icons-container {
            display: flex;
            gap: 2px;
            justify-content: center;
            margin-top: 2px;
            min-height: 20px;
            flex-wrap: wrap;
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

        /* Легенда */
        .legend-grid {
            display: flex;
            flex-direction: column;
            gap: 20px;
            width: 100%;
            padding: 15px;
            background: var(--dark-light);
            border-radius: 16px;
            border: 1px solid var(--border);
        }
        
        .legend-title {
            font-weight: 600;
            color: var(--primary);
            margin-bottom: 10px;
            font-size: 1rem;
        }
        
        .legend-items {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
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
            cursor: help;
            transition: all 0.2s;
        }
        
        .legend-item:hover {
            border-color: var(--primary);
            transform: translateY(-2px);
        }
        
        .legend-color {
            width: 8px;
            height: 8px;
            border-radius: 2px;
        }
        
        .legend-icon {
            font-size: 1rem;
        }
        
        .legend-text {
            color: var(--text);
            white-space: nowrap;
        }

        /* Виджет */
        .important-widget {
            margin: 20px 0;
            padding: 20px;
            border-radius: 24px;
            background: linear-gradient(135deg, var(--dark-card), var(--dark-light));
            border: 1px solid var(--border);
        }
        
        .important-widget .widget-header {
            display: flex;
            align-items: center;
            gap: 10px;
            margin-bottom: 20px;
            padding-bottom: 15px;
            border-bottom: 1px solid var(--border);
        }
        
        .important-widget .widget-header i {
            font-size: 1.3rem;
            color: var(--primary);
        }
        
        .important-widget .widget-header h3 {
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
            transition: all 0.3s;
        }
        
        .widget-item:hover {
            transform: translateX(5px);
            border-color: var(--primary);
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
            min-width: 0;
        }
        
        .item-title {
            font-weight: 600;
            color: var(--text);
            font-size: 0.95rem;
            margin-bottom: 2px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
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

        /* Мобильные стили */
        @media (max-width: 768px) {
            .legend-items {
                gap: 5px;
            }
            
            .legend-item {
                padding: 4px 8px;
                font-size: 0.75rem;
            }
            
            .legend-item .legend-text {
                max-width: 80px;
                overflow: hidden;
                text-overflow: ellipsis;
            }
            
            .widget-item {
                flex-wrap: wrap;
                gap: 10px;
            }
            
            .item-badge {
                width: 100%;
                text-align: center;
                margin-left: 55px;
            }
            
            .day-icons-container {
                min-height: 18px;
            }
            
            .day-icon-important {
                font-size: 0.9rem;
            }
        }

        @media (max-width: 480px) {
            .legend-item {
                padding: 3px 6px;
                font-size: 0.7rem;
            }
            
            .legend-item .legend-text {
                max-width: 60px;
            }
            
            .item-icon {
                width: 35px;
                height: 35px;
                font-size: 1.2rem;
            }
            
            .item-title {
                font-size: 0.9rem;
            }
            
            .item-date {
                font-size: 0.75rem;
            }
        }
    `;
    document.head.appendChild(style);

    // СВАЙП ДЛЯ ОБНОВЛЕНИЯ
    function setupPullToRefresh() {
        let startY = 0;
        let currentY = 0;
        let pulling = false;
        const threshold = 100;
        
        const refreshIndicator = document.createElement('div');
        refreshIndicator.className = 'refresh-indicator';
        refreshIndicator.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Обновление...';
        refreshIndicator.style.cssText = `
            position: fixed;
            top: -50px;
            left: 0;
            right: 0;
            background: var(--primary);
            color: white;
            text-align: center;
            padding: 15px;
            z-index: 10000;
            transition: top 0.3s;
            font-weight: 500;
        `;
        document.body.appendChild(refreshIndicator);
        
        document.addEventListener('touchstart', (e) => {
            if (window.scrollY === 0) {
                startY = e.touches[0].clientY;
                pulling = true;
            }
        }, { passive: true });
        
        document.addEventListener('touchmove', (e) => {
            if (!pulling) return;
            currentY = e.touches[0].clientY;
            const diff = currentY - startY;
            
            if (diff > 0 && diff < threshold) {
                refreshIndicator.style.top = `${diff - 50}px`;
            } else if (diff >= threshold) {
                refreshIndicator.style.top = '0';
                refreshIndicator.innerHTML = '<i class="fas fa-arrow-down"></i> Отпустите для обновления';
            }
        }, { passive: true });
        
        document.addEventListener('touchend', () => {
            if (!pulling) return;
            
            const diff = currentY - startY;
            
            if (diff >= threshold) {
                refreshIndicator.style.top = '0';
                refreshIndicator.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Обновление...';
                
                setTimeout(() => {
                    location.reload();
                }, 500);
            } else {
                refreshIndicator.style.top = '-50px';
            }
            
            pulling = false;
        }, { passive: true });
    }

    // СЛЕДИМ ЗА СМЕНОЙ ЯЗЫКА
    function watchLanguage() {
        const observer = new MutationObserver(() => {
            console.log('Язык изменен, обновляем...');
            createLegend();
            if (document.getElementById('dashboard').classList.contains('active')) {
                createWidget();
            }
            if (document.getElementById('calendar').classList.contains('active')) {
                updateCalendar();
            }
        });
        
        observer.observe(document.documentElement, { 
            attributes: true, 
            attributeFilter: ['lang'] 
        });
    }

    // ЗАПУСК
    setTimeout(() => {
        updateCalendar();
        createWidget();
        createLegend();
        watchLanguage();
        setupPullToRefresh();
    }, 1000);

    // ПЕРЕХВАТ СМЕНЫ МЕСЯЦА
    const originalChangeMonth = window.changeMonth;
    if (originalChangeMonth) {
        window.changeMonth = function(delta) {
            originalChangeMonth(delta);
            setTimeout(() => {
                updateCalendar();
                createWidget();
            }, 300);
        };
    }

    // ПЕРЕХВАТ ОТКРЫТИЯ ВКЛАДОК
    const originalSetView = window.setView;
    if (originalSetView) {
        window.setView = function(view) {
            originalSetView(view);
            if (view === 'calendar') {
                setTimeout(() => {
                    updateCalendar();
                    createLegend();
                }, 300);
            }
            if (view === 'dashboard') {
                setTimeout(createWidget, 300);
            }
        };
    }
})();
