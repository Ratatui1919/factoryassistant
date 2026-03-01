// modules/important-dates.js - ОЧЕНЬ ПРОСТАЯ ВЕРСИЯ

(function() {
    console.log('🔥 Модуль важных дат запущен');

    // Праздники 2026
    const holidays = [
        { month: 3, day: 3, name: 'Страстная пятница', icon: '✝️' },
        { month: 3, day: 6, name: 'Пасхальный понедельник', icon: '🐣' },
    ];

    // Функция обновления всего
    function updateAll() {
        console.log('🔄 Обновление...');
        
        // Получаем текущий месяц из заголовка
        const title = document.getElementById('calendarMonth')?.textContent || '';
        let currentMonth = new Date().getMonth();
        
        if (title.includes('апрель') || title.includes('Апрель')) currentMonth = 3;
        else if (title.includes('март') || title.includes('Март')) currentMonth = 2;
        
        console.log('Текущий месяц:', currentMonth + 1);
        
        // Очищаем старые иконки
        document.querySelectorAll('.day-icons-container').forEach(el => el.remove());
        document.querySelectorAll('.has-salary, .has-holiday').forEach(el => {
            el.classList.remove('has-salary', 'has-holiday');
        });
        
        // Добавляем новые иконки
        setTimeout(() => {
            const cells = document.querySelectorAll('#calendarGrid .day:not(.empty)');
            cells.forEach(cell => {
                const dayNum = cell.querySelector('.day-number')?.textContent;
                if (!dayNum) return;
                
                const day = parseInt(dayNum);
                
                // Проверяем праздники
                const holiday = holidays.find(h => h.month === currentMonth && h.day === day);
                if (holiday) {
                    cell.classList.add('has-holiday');
                    
                    let container = cell.querySelector('.day-icons-container');
                    if (!container) {
                        container = document.createElement('div');
                        container.className = 'day-icons-container';
                        cell.appendChild(container);
                    }
                    
                    const icon = document.createElement('span');
                    icon.className = 'day-icon-important';
                    icon.textContent = holiday.icon;
                    icon.title = holiday.name;
                    container.appendChild(icon);
                }
            });
        }, 100);
        
        // Обновляем виджет
        setTimeout(() => {
            const widget = document.getElementById('importantDatesWidget');
            if (widget) widget.remove();
            
            const insertPoint = document.querySelector('.stats-row');
            if (!insertPoint) return;
            
            const newWidget = document.createElement('div');
            newWidget.className = 'important-dates-widget glass-effect';
            newWidget.id = 'importantDatesWidget';
            newWidget.innerHTML = `
                <div class="widget-header">
                    <i class="fas fa-calendar-star"></i>
                    <h3>📅 Ближайшие даты</h3>
                </div>
                <div class="dates-list">
                    <div class="date-item holiday">
                        <div class="date-icon">✝️</div>
                        <div class="date-info">
                            <div class="date-title">Страстная пятница</div>
                            <div class="date-day">3 апреля</div>
                        </div>
                        <div class="date-countdown">тест</div>
                    </div>
                </div>
            `;
            
            insertPoint.parentNode.insertBefore(newWidget, insertPoint.nextSibling);
        }, 200);
    }

    // Добавляем стили
    const style = document.createElement('style');
    style.textContent = `
        .day-icons-container { display: flex; gap: 2px; justify-content: center; }
        .day-icon-important { font-size: 1rem; }
        .day.has-holiday { border: 2px solid orange !important; }
        .important-dates-widget { margin: 20px 0; padding: 20px; border-radius: 20px; background: var(--glass-bg); }
        .date-item { display: flex; align-items: center; gap: 12px; padding: 12px; background: var(--dark-light); border-radius: 12px; margin: 5px 0; }
    `;
    document.head.appendChild(style);

    // Запускаем
    setTimeout(updateAll, 2000);
    
    // Перехватываем смену месяца
    const orig = window.changeMonth;
    if (orig) {
        window.changeMonth = function(d) {
            orig(d);
            setTimeout(updateAll, 500);
        };
    }
})();
