// modules/important-dates.js - С РАБОЧИМ ПЕРЕВОДОМ

(function() {
    console.log('🔥 Модуль важных дат запущен');

    // ПЕРЕВОДЫ ДЛЯ ВАЖНЫХ ДАТ
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
            upcoming: 'Ближайшие даты'
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
            upcoming: 'Najbližšie dátumy'
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
            upcoming: 'Upcoming Dates'
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
            upcoming: 'Найближчі дати'
        }
    };

    // ПОЛУЧАЕМ ТЕКУЩИЙ ЯЗЫК
    function getCurrentLanguage() {
        return document.documentElement.lang || 'ru';
    }

    // ПОЛУЧАЕМ ПЕРЕВОД
    function t(key, category = null, subKey = null) {
        const lang = getCurrentLanguage();
        
        if (category && subKey && translations[lang]?.[category]?.[subKey]) {
            return translations[lang][category][subKey];
        }
        
        if (category && translations[lang]?.[category]?.[key]) {
            return translations[lang][category][key];
        }
        
        if (translations[lang]?.[key]) {
            return translations[lang][key];
        }
        
        // Fallback to Russian
        if (category && subKey && translations.ru?.[category]?.[subKey]) {
            return translations.ru[category][subKey];
        }
        
        if (category && translations.ru?.[category]?.[key]) {
            return translations.ru[category][key];
        }
        
        return translations.ru?.[key] || key;
    }

    // ВСЕ ПРАЗДНИКИ 2026 ПО МЕСЯЦАМ
    const holidays = {
        0: [ // Январь
            { day: 1, name: 'День образования Словацкой Республики', icon: '🇸🇰', shortName: 'День Республики' },
            { day: 6, name: 'Богоявление', icon: '👑', shortName: 'Богоявление' }
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
            { day: 5, name: 'День Кирилла и Мефодия', icon: '📜', shortName: 'Кирилл и Мефодий' }
        ],
        7: [ // Август
            { day: 29, name: 'День Словацкого восстания', icon: '⚔️', shortName: 'День восстания' }
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
            { day: 26, name: 'Рождество', icon: '🎁', shortName: 'Рождество' }
        ]
    };

    // ТИПЫ ДНЕЙ ДЛЯ ЛЕГЕНДЫ
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

    // ПОЛУЧАЕМ ТЕКУЩУЮ ДАТУ
    function getCurrentDate() {
        const today = new Date();
        return {
            day: today.getDate(),
            month: today.getMonth(),
            year: today.getFullYear()
        };
    }

    // ВЫЧИСЛЯЕМ РАЗНИЦУ В ДНЯХ
    function daysBetween(date1, date2) {
        const d1 = new Date(date1.year, date1.month, date1.day);
        const d2 = new Date(date2.year, date2.month, date2.day);
        const diffTime = d2 - d1;
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
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
                        icon.title = t('salary');
                        container.appendChild(icon);
                    }
                    
                    if (holiday) {
                        cell.classList.add('has-holiday');
                        const icon = document.createElement('span');
                        icon.className = 'day-icon-important';
                        icon.textContent = holiday.icon;
                        icon.title = t(holiday.name, 'holidays');
                        container.appendChild(icon);
                    }
                }
            });
        }, 100);
    }

    // ОБЪЕДИНЯЕМ ВСЕ ЭЛЕМЕНТЫ ЛЕГЕНДЫ В ОДНОМ СТИЛЕ
    function createUnifiedLegend() {
        const legendContainer = document.querySelector('.calendar-legend');
        if (!legendContainer) return;

        // Очищаем контейнер
        const existingLegend = document.getElementById('unified-legend');
        if (existingLegend) existingLegend.remove();

        // Собираем все уникальные праздники
        const allHolidays = [];
        const seen = new Set();
        
        Object.values(holidays).flat().forEach(h => {
            if (!seen.has(h.icon)) {
                seen.add(h.icon);
                allHolidays.push(h);
            }
        });

        allHolidays.sort((a, b) => {
            const aDay = a.day + (a.month * 100);
            const bDay = b.day + (b.month * 100);
            return aDay - bDay;
        });

        const unifiedLegendHTML = `
            <div id="unified-legend" class="unified-legend">
                <div class="legend-section">
                    <div class="legend-title">
                        <i class="fas fa-calendar-day"></i>
                        <span>${t('dayTypesTitle', null, null) || 'Типы дней'}</span>
                    </div>
                    <div class="legend-items">
                        ${dayTypes.map(d => {
                            const translatedName = t(d.name, 'dayTypes');
                            return `
                                <div class="legend-item" title="${translatedName}">
                                    <span class="legend-color" style="background: ${d.color};"></span>
                                    <span class="legend-icon">${d.icon}</span>
                                    <span class="legend-text">${translatedName}</span>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
                
                <div class="legend-section">
                    <div class="legend-title">
                        <i class="fas fa-star" style="color: var(--primary);"></i>
                        <span>${t('legend')}</span>
                    </div>
                    <div class="legend-items">
                        <div class="legend-item" title="${t('salary')}">
                            <span class="legend-color" style="background: #00b060;"></span>
                            <span class="legend-icon">💰</span>
                            <span class="legend-text">${t('salary')}</span>
                        </div>
                        ${allHolidays.map(h => {
                            const translatedName = t(h.name, 'holidays');
                            return `
                                <div class="legend-item" title="${translatedName}">
                                    <span class="legend-color" style="background: #f59e0b;"></span>
                                    <span class="legend-icon">${h.icon}</span>
                                    <span class="legend-text">${translatedName}</span>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
            </div>
        `;

        legendContainer.innerHTML = unifiedLegendHTML;
    }

    // СОЗДАЕМ КРАСИВЫЙ ВИДЖЕТ
    function createBeautifulWidget() {
        const currentDate = getCurrentDate();
        const selectedMonth = getCurrentMonth();
        const year = 2026;
        
        const oldWidget = document.getElementById('importantDatesWidget');
        if (oldWidget) oldWidget.remove();
        
        const allDates = [];
        
        // Добавляем зарплату
        const salaryDay = getSalaryDay(selectedMonth, year);
        allDates.push({
            day: salaryDay,
            month: selectedMonth,
            type: 'salary',
            name: t('salary'),
            icon: '💰',
            fullName: t('salary')
        });
        
        // Добавляем праздники
        (holidays[selectedMonth] || []).forEach(h => {
            allDates.push({
                day: h.day,
                month: selectedMonth,
                type: 'holiday',
                name: t(h.name, 'holidays'),
                fullName: h.name,
                icon: h.icon
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
            const eventDate = { day: d.day, month: d.month, year: year };
            const diff = daysBetween(currentDate, eventDate);
            
            let badge = '';
            let badgeClass = '';
            
            if (diff < 0) {
                badge = t('past');
                badgeClass = 'past';
            } else if (diff === 0) {
                badge = t('today');
                badgeClass = 'today';
            } else if (diff === 1) {
                badge = t('tomorrow');
                badgeClass = 'tomorrow';
            } else {
                badge = `${diff} ${t('days')}`;
                badgeClass = 'future';
            }
            
            const dateStr = formatDate(d.day, d.month);
            const color = getDateColor(d.type);
            
            itemsHTML += `
                <div class="widget-item ${d.type}" title="${d.fullName}">
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
                <h3>${t('upcoming')}</h3>
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

        /* Единая легенда */
        .unified-legend {
            display: flex;
            flex-direction: column;
            gap: 20px;
            width: 100%;
            padding: 15px;
            background: var(--dark-light);
            border-radius: 16px;
            border: 1px solid var(--border);
        }
        
        .legend-section {
            width: 100%;
        }
        
        .legend-title {
            display: flex;
            align-items: center;
            gap: 8px;
            margin-bottom: 12px;
            font-weight: 600;
            color: var(--primary);
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
            transition: all 0.2s ease;
            color: var(--text);
        }
        
        .legend-item:hover {
            border-color: var(--primary);
            transform: translateY(-2px);
            box-shadow: 0 4px 8px rgba(0,0,0,0.2);
        }
        
        .legend-color {
            width: 8px;
            height: 8px;
            border-radius: 2px;
            flex-shrink: 0;
        }
        
        .legend-icon {
            font-size: 1rem;
            flex-shrink: 0;
        }
        
        .legend-text {
            color: var(--text);
            white-space: nowrap;
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
            cursor: help;
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
            flex-shrink: 0;
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
            flex-shrink: 0;
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

        @media (max-width: 768px) {
            .legend-items {
                gap: 5px;
            }
            
            .legend-item {
                padding: 4px 8px;
                font-size: 0.8rem;
            }
            
            .widget-item {
                flex-wrap: wrap;
            }
            
            .item-badge {
                width: 100%;
                text-align: center;
                margin-top: 5px;
            }
        }
    `;
    document.head.appendChild(style);

    // Следим за сменой языка
    function watchLanguageChanges() {
        const observer = new MutationObserver(() => {
            console.log('🔄 Язык изменен, обновляем интерфейс');
            createUnifiedLegend();
            if (document.getElementById('dashboard').classList.contains('active')) {
                createBeautifulWidget();
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
        createBeautifulWidget();
        createUnifiedLegend();
        watchLanguageChanges();
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
                    createUnifiedLegend();
                }, 300);
            }
            if (view === 'dashboard') {
                setTimeout(createBeautifulWidget, 300);
            }
        };
    }

    // ПЕРЕХВАТ ДОБАВЛЕНИЯ ЗАПИСИ
    const originalAddRecord = window.addRecord;
    if (originalAddRecord) {
        window.addRecord = function(type) {
            originalAddRecord(type);
            setTimeout(() => {
                if (document.getElementById('calendar').classList.contains('active')) {
                    updateCalendar();
                }
                if (document.getElementById('dashboard').classList.contains('active')) {
                    createBeautifulWidget();
                }
            }, 300);
        };
    }
})();
