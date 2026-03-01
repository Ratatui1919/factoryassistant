// modules/important-dates.js - ПРОСТАЯ И НАДЕЖНАЯ ВЕРСИЯ

(function() {
    console.log('🔥 Модуль важных дат запущен');

    // ========== ПЕРЕВОДЫ ==========
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
            titles: {
                dayTypes: 'Типы дней',
                important: 'Важные даты',
                upcoming: 'Ближайшие даты'
            },
            badges: {
                past: 'прошло',
                today: 'сегодня',
                tomorrow: 'завтра',
                days: 'дн.'
            }
        },
        sk: {
            salary: 'Deň výplaty',
            holidays: {
                'День образования Словацкой Республики': 'Deň vzniku SR',
                'Богоявление': 'Traja králi',
                'Страстная пятница': 'Veľký piatok',
                'Пасхальный понедельник': 'Veľkonočný pondelok',
                'День труда': 'Sviatok práce',
                'День Кирилла и Мефодия': 'Cyril a Metod',
                'День Словацкого восстания': 'SNP',
                'День всех святых': 'Všetkých svätých',
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
            titles: {
                dayTypes: 'Typy dní',
                important: 'Dôležité dátumy',
                upcoming: 'Najbližšie dátumy'
            },
            badges: {
                past: 'prešlo',
                today: 'dnes',
                tomorrow: 'zajtra',
                days: 'dní'
            }
        },
        en: {
            salary: 'Payday',
            holidays: {
                'День образования Словацкой Республики': 'Slovak Republic Day',
                'Богоявление': 'Epiphany',
                'Страстная пятница': 'Good Friday',
                'Пасхальный понедельник': 'Easter Monday',
                'День труда': 'Labour Day',
                'День Кирилла и Мефодия': 'Cyril & Methodius Day',
                'День Словацкого восстания': 'SNP Day',
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
            titles: {
                dayTypes: 'Day Types',
                important: 'Important Dates',
                upcoming: 'Upcoming Dates'
            },
            badges: {
                past: 'past',
                today: 'today',
                tomorrow: 'tomorrow',
                days: 'days'
            }
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
            titles: {
                dayTypes: 'Типи днів',
                important: 'Важливі дати',
                upcoming: 'Найближчі дати'
            },
            badges: {
                past: 'минуло',
                today: 'сьогодні',
                tomorrow: 'завтра',
                days: 'дн.'
            }
        }
    };

    // ========== ПРАЗДНИКИ 2026 ==========
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

    // ========== ТИПЫ ДНЕЙ ==========
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

    // ========== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ==========
    function getCurrentLanguage() {
        return document.documentElement.lang || 'ru';
    }

    function t(key, category, subKey = null) {
        const lang = getCurrentLanguage();
        
        if (category === 'holidays' && translations[lang]?.holidays?.[key]) {
            return translations[lang].holidays[key];
        }
        if (category === 'dayTypes' && translations[lang]?.dayTypes?.[key]) {
            return translations[lang].dayTypes[key];
        }
        if (category === 'titles' && translations[lang]?.titles?.[key]) {
            return translations[lang].titles[key];
        }
        if (category === 'badges' && translations[lang]?.badges?.[key]) {
            return translations[lang].badges[key];
        }
        if (translations[lang]?.[key]) {
            return translations[lang][key];
        }
        
        // Fallback
        if (category === 'holidays' && translations.ru?.holidays?.[key]) return translations.ru.holidays[key];
        if (category === 'dayTypes' && translations.ru?.dayTypes?.[key]) return translations.ru.dayTypes[key];
        return translations.ru?.[key] || key;
    }

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

    function getSalaryDay(month) {
        let workDays = 0;
        let day = 1;
        const maxDays = new Date(2026, month + 1, 0).getDate();
        
        while (workDays < 3 && day <= maxDays) {
            const date = new Date(2026, month, day);
            const dayOfWeek = date.getDay();
            if (dayOfWeek !== 0 && dayOfWeek !== 6) {
                const monthHolidays = holidays[month] || [];
                if (!monthHolidays.some(h => h.day === day)) {
                    workDays++;
                    if (workDays === 3) return day;
                }
            }
            day++;
        }
        return day;
    }

    // ========== ОБНОВЛЕНИЕ КАЛЕНДАРЯ ==========
    function updateCalendar() {
        const month = getCurrentMonth();
        const salaryDay = getSalaryDay(month);
        const monthHolidays = holidays[month] || [];
        
        document.querySelectorAll('.day-icons-container').forEach(el => el.remove());
        document.querySelectorAll('.has-salary, .has-holiday').forEach(el => {
            el.classList.remove('has-salary', 'has-holiday');
        });
        
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
    }

    // ========== СОЗДАНИЕ ЛЕГЕНДЫ ==========
    function createLegend() {
        const container = document.querySelector('.calendar-legend');
        if (!container) return;

        const lang = getCurrentLanguage();
        
        let html = `
            <div class="legend-grid">
                <div class="legend-section">
                    <div class="legend-title">${t('dayTypes', 'titles')}</div>
                    <div class="legend-items">
        `;
        
        dayTypes.forEach(d => {
            html += `
                <div class="legend-item">
                    <span class="legend-color" style="background: ${d.color};"></span>
                    <span class="legend-icon">${d.icon}</span>
                    <span class="legend-text">${t(d.name, 'dayTypes')}</span>
                </div>
            `;
        });
        
        html += `
                </div>
            </div>
            <div class="legend-section">
                <div class="legend-title">${t('important', 'titles')}</div>
                <div class="legend-items">
                    <div class="legend-item">
                        <span class="legend-color" style="background: #00b060;"></span>
                        <span class="legend-icon">💰</span>
                        <span class="legend-text">${t('salary')}</span>
                    </div>
        `;
        
        // Уникальные праздники
        const seen = new Set();
        Object.values(holidays).flat().forEach(h => {
            if (!seen.has(h.icon)) {
                seen.add(h.icon);
                html += `
                    <div class="legend-item">
                        <span class="legend-color" style="background: #f59e0b;"></span>
                        <span class="legend-icon">${h.icon}</span>
                        <span class="legend-text">${t(h.name, 'holidays')}</span>
                    </div>
                `;
            }
        });
        
        html += `
                </div>
            </div>
        </div>
        `;
        
        container.innerHTML = html;
    }

    // ========== СОЗДАНИЕ ВИДЖЕТА ==========
    function createWidget() {
        const old = document.getElementById('importantDatesWidget');
        if (old) old.remove();
        
        const month = getCurrentMonth();
        const today = new Date();
        const currentDate = { day: today.getDate(), month: today.getMonth(), year: today.getFullYear() };
        
        const dates = [];
        
        // Зарплата
        dates.push({
            day: getSalaryDay(month),
            month: month,
            type: 'salary',
            name: t('salary'),
            icon: '💰'
        });
        
        // Праздники
        (holidays[month] || []).forEach(h => {
            dates.push({
                day: h.day,
                month: month,
                type: 'holiday',
                name: t(h.name, 'holidays'),
                icon: h.icon
            });
        });
        
        dates.sort((a, b) => a.day - b.day);
        
        const insertPoint = document.querySelector('.stats-row');
        if (!insertPoint) return;
        
        let itemsHtml = '';
        
        dates.forEach(d => {
            const eventDate = { day: d.day, month: d.month, year: 2026 };
            const diff = Math.ceil((new Date(2026, d.month, d.day) - new Date(currentDate.year, currentDate.month, currentDate.day)) / (1000 * 60 * 60 * 24));
            
            let badge = '';
            if (diff < 0) badge = t('past', 'badges');
            else if (diff === 0) badge = t('today', 'badges');
            else if (diff === 1) badge = t('tomorrow', 'badges');
            else badge = `${diff} ${t('days', 'badges')}`;
            
            const months = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];
            const dateStr = `${d.day} ${months[d.month]}`;
            
            itemsHtml += `
                <div class="widget-item ${d.type}">
                    <div class="item-icon" style="background: ${d.type === 'salary' ? '#00b06020' : '#f59e0b20'}; color: ${d.type === 'salary' ? '#00b060' : '#f59e0b'};">${d.icon}</div>
                    <div class="item-content">
                        <div class="item-title">${d.name}</div>
                        <div class="item-date">${dateStr}</div>
                    </div>
                    <div class="item-badge ${diff < 0 ? 'past' : diff === 0 ? 'today' : diff === 1 ? 'tomorrow' : 'future'}">${badge}</div>
                </div>
            `;
        });
        
        const widget = document.createElement('div');
        widget.id = 'importantDatesWidget';
        widget.className = 'important-widget';
        widget.innerHTML = `
            <div class="widget-header">
                <i class="fas fa-calendar-alt"></i>
                <h3>${t('upcoming', 'titles')}</h3>
            </div>
            <div class="widget-items">
                ${itemsHtml}
            </div>
        `;
        
        insertPoint.parentNode.insertBefore(widget, insertPoint.nextSibling);
    }

    // ========== СТИЛИ ==========
    const style = document.createElement('style');
    style.textContent = `
        /* Календарь */
        .day-icons-container {
            display: flex;
            gap: 2px;
            justify-content: center;
            margin-top: 2px;
            flex-wrap: wrap;
        }
        .day-icon-important {
            font-size: 0.9rem;
        }
        .day.has-salary {
            border: 2px solid #00b060 !important;
        }
        .day.has-holiday {
            border: 2px solid #f59e0b !important;
        }
        .day.has-salary.has-holiday {
            border: 2px solid !important;
            border-color: #00b060 #f59e0b #00b060 #f59e0b !important;
        }

        /* Легенда */
        .legend-grid {
            display: flex;
            flex-direction: column;
            gap: 15px;
            width: 100%;
            padding: 15px;
            background: var(--dark-light);
            border-radius: 16px;
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
            gap: 5px;
            padding: 5px 10px;
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
        .legend-text {
            color: var(--text);
        }

        /* Виджет */
        .important-widget {
            margin: 20px 0;
            padding: 20px;
            border-radius: 24px;
            background: linear-gradient(135deg, var(--dark-card), var(--dark-light));
            border: 1px solid var(--border);
        }
        .widget-header {
            display: flex;
            align-items: center;
            gap: 10px;
            margin-bottom: 20px;
            padding-bottom: 15px;
            border-bottom: 1px solid var(--border);
        }
        .widget-header i {
            font-size: 1.3rem;
            color: var(--primary);
        }
        .widget-header h3 {
            font-size: 1.2rem;
            margin: 0;
            color: var(--text);
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
            padding: 12px;
            background: var(--dark);
            border-radius: 16px;
            border: 1px solid var(--border);
        }
        .item-icon {
            width: 40px;
            height: 40px;
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.3rem;
        }
        .item-content {
            flex: 1;
        }
        .item-title {
            font-weight: 600;
            color: var(--text);
            font-size: 0.95rem;
        }
        .item-date {
            font-size: 0.8rem;
            color: var(--text-muted);
        }
        .item-badge {
            padding: 4px 10px;
            border-radius: 30px;
            font-size: 0.8rem;
            font-weight: 500;
        }
        .item-badge.past { background: #ef444420; color: #ef4444; }
        .item-badge.today { background: #00b06020; color: #00b060; font-weight: 600; }
        .item-badge.tomorrow { background: #f59e0b20; color: #f59e0b; }
        .item-badge.future { background: #64748b20; color: #94a3b8; }

        /* Мобильные */
        @media (max-width: 768px) {
            .legend-item {
                font-size: 0.75rem;
                padding: 4px 8px;
            }
            .widget-item {
                flex-wrap: wrap;
            }
            .item-badge {
                width: 100%;
                text-align: center;
                margin-left: 55px;
            }
            .day-icon-important {
                font-size: 0.8rem;
            }
        }
        @media (max-width: 480px) {
            .legend-item {
                font-size: 0.7rem;
                padding: 3px 6px;
            }
            .item-icon {
                width: 35px;
                height: 35px;
                font-size: 1.1rem;
            }
        }
    `;
    document.head.appendChild(style);

    // ========== СВАЙП ДЛЯ ОБНОВЛЕНИЯ ==========
    let touchStartY = 0;
    let touchEndY = 0;
    
    document.addEventListener('touchstart', (e) => {
        touchStartY = e.touches[0].clientY;
    }, { passive: true });
    
    document.addEventListener('touchend', (e) => {
        touchEndY = e.changedTouches[0].clientY;
        const diff = touchEndY - touchStartY;
        
        if (diff > 80 && window.scrollY === 0) {
            const indicator = document.createElement('div');
            indicator.style.cssText = `
                position: fixed;
                top: 20px;
                left: 50%;
                transform: translateX(-50%);
                background: var(--primary);
                color: white;
                padding: 10px 20px;
                border-radius: 30px;
                z-index: 10000;
                font-weight: 500;
                box-shadow: 0 4px 12px rgba(0,0,0,0.3);
                animation: fadeIn 0.3s;
            `;
            indicator.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Обновление...';
            document.body.appendChild(indicator);
            
            setTimeout(() => {
                location.reload();
            }, 500);
        }
    }, { passive: true });

    // ========== СЛЕДИМ ЗА ЯЗЫКОМ ==========
    function watchLanguage() {
        const observer = new MutationObserver(() => {
            setTimeout(() => {
                createLegend();
                createWidget();
                updateCalendar();
            }, 100);
        });
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
    }

    // ========== ЗАПУСК ==========
    setTimeout(() => {
        createLegend();
        createWidget();
        updateCalendar();
        watchLanguage();
    }, 1000);

    // ========== ПЕРЕХВАТ ФУНКЦИЙ ==========
    const origChangeMonth = window.changeMonth;
    if (origChangeMonth) {
        window.changeMonth = function(delta) {
            origChangeMonth(delta);
            setTimeout(() => {
                updateCalendar();
                createWidget();
            }, 300);
        };
    }

    const origSetView = window.setView;
    if (origSetView) {
        window.setView = function(view) {
            origSetView(view);
            setTimeout(() => {
                if (view === 'calendar') {
                    createLegend();
                    updateCalendar();
                }
                if (view === 'dashboard') {
                    createWidget();
                }
            }, 300);
        };
    }
})();
