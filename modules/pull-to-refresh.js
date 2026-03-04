// modules/pull-to-refresh.js - ВИПРАВЛЕНА ВЕРСІЯ

(function() {
    'use strict';

    // Перевіряємо, чи це мобільний пристрій
    if (!('ontouchstart' in window)) {
        console.log('📱 Pull-to-refresh: не мобільний пристрій, модуль вимкнено');
        return;
    }
    
    console.log('⚡ Pull-to-refresh: модуль завантажено');

    // ========== НАЛАШТУВАННЯ ==========
    const THRESHOLD = 80;          // Мінімальна відстань для спрацювання (px)
    const ANIMATION_TIME = 400;     // Час анімації зникнення (мс)
    
    // ========== ЗМІННІ СТАНУ ==========
    let startY = 0;
    let currentY = 0;
    let isPulling = false;
    let isRefreshing = false;
    
    // ========== СТВОРЕННЯ ІНДИКАТОРА ==========
    let indicator = document.getElementById('pull-to-refresh-indicator');
    
    if (!indicator) {
        indicator = document.createElement('div');
        indicator.id = 'pull-to-refresh-indicator';
        
        // Базові стилі з CSS змінними для кращої інтеграції
        const primaryColor = getComputedStyle(document.documentElement)
            .getPropertyValue('--primary-color').trim() || '#4CAF50';
        
        indicator.style.cssText = `
            position: fixed;
            top: -60px;
            left: 0;
            right: 0;
            height: 60px;
            background: ${primaryColor};
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 12px;
            font-size: 16px;
            font-weight: 500;
            z-index: 10000;
            transition: top 0.2s cubic-bezier(0.2, 0.9, 0.3, 1);
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
            backdrop-filter: blur(8px);
            border-bottom: 1px solid rgba(255,255,255,0.2);
        `;
        
        document.body.appendChild(indicator);
    }

    // ========== ФУНКЦІЯ ОНОВЛЕННЯ КОНТЕНТУ ==========
    async function refreshPageContent() {
        try {
            // Показуємо спінер
            indicator.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Оновлення...';
            
            // Перевіряємо, чи є глобальна функція оновлення даних
            if (typeof window.refreshData === 'function') {
                // Якщо є спеціальна функція - використовуємо її
                await window.refreshData();
            } else {
                // Інакше просто перезавантажуємо сторінку
                setTimeout(() => {
                    window.location.reload();
                }, ANIMATION_TIME);
                return;
            }
            
            // Показуємо успіх
            indicator.innerHTML = '<i class="fas fa-check"></i> Оновлено!';
            
            // Ховаємо індикатор через пів секунди
            setTimeout(() => {
                indicator.style.top = '-60px';
                isRefreshing = false;
            }, 500);
            
        } catch (error) {
            console.error('❌ Помилка оновлення:', error);
            indicator.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Помилка';
            
            setTimeout(() => {
                indicator.style.top = '-60px';
                isRefreshing = false;
            }, 1000);
        }
    }

    // ========== ОБРОБНИКИ ПОДІЙ ==========
    
    // Початок дотику
    document.addEventListener('touchstart', (e) => {
        // Спрацьовує тільки коли ми в самому верху сторінки і не в процесі оновлення
        if (window.scrollY <= 5 && !isRefreshing) {
            startY = e.touches[0].clientY;
            isPulling = true;
        }
    }, { passive: true });

    // Рух пальцем
    document.addEventListener('touchmove', (e) => {
        if (!isPulling || isRefreshing) return;
        
        currentY = e.touches[0].clientY;
        const pullDistance = currentY - startY;
        
        // Тільки якщо тягнемо вниз
        if (pullDistance > 0) {
            e.preventDefault(); // Запобігаємо стандартному скролу
            
            // Плавна поява індикатора
            if (pullDistance < THRESHOLD) {
                // Показуємо індикатор частково
                const progress = Math.min(pullDistance / THRESHOLD * 100, 100);
                indicator.style.top = `${pullDistance - 60}px`;
                indicator.innerHTML = `<i class="fas fa-arrow-down"></i> Потягніть (${Math.round(progress)}%)`;
            } else {
                // Досягли порогу
                indicator.style.top = '0';
                indicator.innerHTML = '<i class="fas fa-arrow-up"></i> Відпустіть для оновлення';
            }
        }
    }, { passive: false });

    // Відпускання пальця
    document.addEventListener('touchend', async (e) => {
        if (!isPulling || isRefreshing) return;
        
        const pullDistance = currentY - startY;
        
        if (pullDistance >= THRESHOLD) {
            // Спрацьовує оновлення
            isRefreshing = true;
            indicator.style.top = '0';
            await refreshPageContent();
        } else {
            // Просто ховаємо індикатор
            indicator.style.top = '-60px';
        }
        
        // Скидаємо стан
        isPulling = false;
        startY = 0;
        currentY = 0;
    });

    // Ховаємо індикатор при скролі вниз
    window.addEventListener('scroll', () => {
        if (window.scrollY > 10 && !isRefreshing) {
            indicator.style.top = '-60px';
            isPulling = false;
        }
    }, { passive: true });

    console.log('✅ Pull-to-refresh: готовий до роботи');
})();
