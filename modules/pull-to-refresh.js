// ========== ПОЛНОСТЬЮ ИСПРАВЛЕННЫЙ PULL-TO-REFRESH ==========
(function() {
    // Только для мобильных
    if (!('ontouchstart' in window)) return;
    
    console.log('⚡ Pull-to-refresh инициализация');
    
    let startY = 0;
    let currentY = 0;
    let isPulling = false;
    let isRefreshing = false;
    const threshold = 80;
    
    // Индикатор (уже есть в HTML)
    const indicator = document.getElementById('refreshIndicator');
    if (!indicator) return;
    
    // Функция обновления данных
    async function refreshData() {
        if (!window.currentUser) return;
        
        try {
            const snapshot = await firebase.database().ref('users/' + window.currentUser.uid).once('value');
            const data = snapshot.val();
            
            if (data) {
                window.state.goals = data.goals || [];
                window.state.debts = data.debts || { owed: [], owe: [] };
                window.state.transactions = data.transactions || { EUR: [], UAH: [] };
            }
            
            // Перерисовываем всё
            if (typeof window.renderGoals === 'function') window.renderGoals();
            if (typeof window.renderDebts === 'function') window.renderDebts();
            if (typeof window.updateDebtStats === 'function') window.updateDebtStats();
            if (typeof window.updateJournal === 'function') window.updateJournal();
            
        } catch (error) {
            console.error('Ошибка обновления:', error);
        }
    }
    
    // Обработчик начала касания
    document.addEventListener('touchstart', (e) => {
        if (window.scrollY > 5 || isRefreshing) return;
        startY = e.touches[0].clientY;
        isPulling = true;
    }, { passive: true });
    
    // Обработчик движения
    document.addEventListener('touchmove', (e) => {
        if (!isPulling || isRefreshing || window.scrollY > 5) return;
        
        currentY = e.touches[0].clientY;
        const diff = currentY - startY;
        
        if (diff > 0) {
            e.preventDefault(); // Блокируем стандартный скролл
            
            if (diff > threshold) {
                indicator.classList.add('active');
                indicator.innerHTML = '<i class="fas fa-arrow-up"></i> Отпустите для обновления';
            } else {
                // Показываем прогресс
                const progress = Math.min(diff / threshold * 100, 100);
                indicator.innerHTML = `<i class="fas fa-arrow-down"></i> Потяните (${Math.round(progress)}%)`;
            }
        }
    }, { passive: false });
    
    // Обработчик окончания касания
    document.addEventListener('touchend', async (e) => {
        if (!isPulling || isRefreshing || window.scrollY > 5) return;
        
        const diff = currentY - startY;
        
        if (diff > threshold) {
            isRefreshing = true;
            
            // Меняем индикатор
            indicator.classList.add('active');
            indicator.innerHTML = '<i class="fas fa-sync-alt fa-spin"></i> Обновление...';
            
            // Обновляем данные
            await refreshData();
            
            // Ждем немного для красоты
            setTimeout(() => {
                indicator.classList.remove('active');
                indicator.innerHTML = '<i class="fas fa-check"></i> Обновлено';
                
                // Прячем индикатор
                setTimeout(() => {
                    indicator.classList.remove('active');
                }, 500);
                
                isRefreshing = false;
            }, 600);
            
        } else {
            // Просто прячем
            indicator.classList.remove('active');
        }
        
        isPulling = false;
        startY = 0;
        currentY = 0;
    });
    
    // Прячем при скролле
    window.addEventListener('scroll', () => {
        if (window.scrollY > 10) {
            indicator.classList.remove('active');
            isPulling = false;
        }
    }, { passive: true });
    
})();
