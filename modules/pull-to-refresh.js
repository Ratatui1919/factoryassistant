// modules/pull-to-refresh.js - ОБНОВЛЕНИЕ СТРАНИЦЫ СВАЙПОМ

(function() {
    // Работает только на мобильных устройствах
    if (!('ontouchstart' in window)) return;
    
    console.log('⚡ Pull-to-refresh модуль загружен');
    
    let touchStartY = 0;
    let touchMoveY = 0;
    let isPulling = false;
    const threshold = 80;
    
    // Создаем индикатор
    const indicator = document.createElement('div');
    indicator.id = 'pull-to-refresh-indicator';
    indicator.style.cssText = `
        position: fixed;
        top: -50px;
        left: 0;
        right: 0;
        background: var(--primary, #00b060);
        color: white;
        text-align: center;
        padding: 15px;
        font-size: 14px;
        font-weight: 500;
        z-index: 10000;
        transition: top 0.2s;
        box-shadow: 0 2px 10px rgba(0,0,0,0.2);
        backdrop-filter: blur(5px);
    `;
    indicator.innerHTML = '⬇️ Потяните для обновления';
    document.body.appendChild(indicator);
    
    // Обработчик начала касания
    document.addEventListener('touchstart', (e) => {
        if (window.scrollY === 0) {
            touchStartY = e.touches[0].clientY;
            isPulling = true;
        }
    }, { passive: true });
    
    // Обработчик движения
    document.addEventListener('touchmove', (e) => {
        if (!isPulling) return;
        
        touchMoveY = e.touches[0].clientY;
        const diff = touchMoveY - touchStartY;
        
        if (diff > 0 && diff < threshold) {
            indicator.style.top = `${diff - 50}px`;
            indicator.innerHTML = '⬇️ Потяните для обновления';
        } else if (diff >= threshold) {
            indicator.style.top = '0';
            indicator.innerHTML = '🔄 Отпустите для обновления';
        }
    }, { passive: true });
    
    // Обработчик окончания касания
    document.addEventListener('touchend', (e) => {
        if (!isPulling) return;
        
        const diff = touchMoveY - touchStartY;
        
        if (diff >= threshold) {
            // Показываем индикатор загрузки
            indicator.style.top = '0';
            indicator.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Обновление...';
            
            // Обновляем страницу через 300мс
            setTimeout(() => {
                window.location.reload();
            }, 300);
        } else {
            // Прячем индикатор
            indicator.style.top = '-50px';
        }
        
        isPulling = false;
    }, { passive: true });
    
    // Прячем индикатор при скролле
    window.addEventListener('scroll', () => {
        if (window.scrollY > 0) {
            indicator.style.top = '-50px';
            isPulling = false;
        }
    }, { passive: true });
})();
