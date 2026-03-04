// modules/pull-to-refresh.js - СТИЛЬНА ВЕРСІЯ

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
    
    // Отримуємо основний колір з теми сайту (якщо є)
    const getThemeColor = () => {
        const style = getComputedStyle(document.documentElement);
        return style.getPropertyValue('--primary-color').trim() || 
               style.getPropertyValue('--accent-color').trim() || 
               style.getPropertyValue('--primary').trim() || 
               '#00b060'; // Дефолтний зелений
    };
    
    // Отримуємо колір тексту
    const getTextColor = () => {
        const style = getComputedStyle(document.documentElement);
        return style.getPropertyValue('--text-color').trim() || 
               style.getPropertyValue('--text').trim() || 
               '#ffffff';
    };
    
    const primaryColor = getThemeColor();
    const textColor = getTextColor();
    
    // ========== СТВОРЕННЯ ІНДИКАТОРА ==========
    let indicator = document.getElementById('pull-to-refresh-indicator');
    
    if (!indicator) {
        indicator = document.createElement('div');
        indicator.id = 'pull-to-refresh-indicator';
        
        // Базові стилі
        indicator.style.cssText = `
            position: fixed;
            top: -80px;
            left: 0;
            right: 0;
            height: 80px;
            background: rgba(20, 30, 40, 0.85);
            backdrop-filter: blur(12px);
            -webkit-backdrop-filter: blur(12px);
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 16px;
            font-size: 16px;
            font-weight: 500;
            letter-spacing: 0.3px;
            z-index: 10000;
            transition: top 0.3s cubic-bezier(0.2, 0.9, 0.3, 1);
            box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
        `;
        
        // Додаємо стилі для іконок
        const style = document.createElement('style');
        style.textContent = `
            .ptr-icon {
                width: 24px;
                height: 24px;
                display: inline-flex;
                align-items: center;
                justify-content: center;
                animation: ptr-spin 1s linear infinite;
            }
            
            @keyframes ptr-spin {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
            }
            
            .ptr-arrow {
                transition: transform 0.2s;
                color: ${primaryColor};
            }
            
            .ptr-check {
                color: #4CAF50;
                animation: ptr-pop 0.3s ease-out;
            }
            
            @keyframes ptr-pop {
                0% { transform: scale(0); }
                50% { transform: scale(1.2); }
                100% { transform: scale(1); }
            }
            
            .ptr-progress {
                position: absolute;
                bottom: 0;
                left: 0;
                height: 3px;
                background: linear-gradient(90deg, ${primaryColor}, #ffffff);
                transition: width 0.1s;
                border-radius: 0 2px 2px 0;
            }
        `;
        document.head.appendChild(style);
        
        // Контейнер для контенту
        const content = document.createElement('div');
        content.id = 'ptr-content';
        content.style.cssText = `
            display: flex;
            align-items: center;
            gap: 12px;
            position: relative;
        `;
        
        // Іконка
        const icon = document.createElement('span');
        icon.id = 'ptr-icon';
        icon.innerHTML = '↓';
        icon.style.cssText = `
            font-size: 24px;
            color: ${primaryColor};
            transition: transform 0.3s;
            display: inline-block;
        `;
        
        // Текст
        const text = document.createElement('span');
        text.id = 'ptr-text';
        text.textContent = 'Потягніть для оновлення';
        text.style.cssText = `
            font-weight: 500;
            text-shadow: 0 1px 2px rgba(0,0,0,0.2);
        `;
        
        // Прогрес бар
        const progress = document.createElement('div');
        progress.id = 'ptr-progress';
        progress.style.cssText = `
            position: absolute;
            bottom: -15px;
            left: 0;
            width: 0%;
            height: 3px;
            background: linear-gradient(90deg, ${primaryColor}, #ffffff);
            transition: width 0.1s;
            border-radius: 0 2px 2px 0;
            opacity: 0.7;
        `;
        
        content.appendChild(icon);
        content.appendChild(text);
        content.appendChild(progress);
        indicator.appendChild(content);
        
        document.body.appendChild(indicator);
    }

    // ========== ФУНКЦІЯ ОНОВЛЕННЯ ІНДИКАТОРА ==========
    function updateIndicator(pullDistance) {
        const icon = document.getElementById('ptr-icon');
        const text = document.getElementById('ptr-text');
        const progress = document.getElementById('ptr-progress');
        
        if (!icon || !text || !progress) return;
        
        if (pullDistance < THRESHOLD) {
            // Тільки тягнемо
            const percent = Math.min(pullDistance / THRESHOLD * 100, 100);
            
            icon.innerHTML = '↓';
            icon.style.transform = `rotate(${pullDistance * 0.5}deg)`;
            text.textContent = `Потягніть для оновлення ${Math.round(percent)}%`;
            
            progress.style.width = `${percent}%`;
            progress.style.opacity = '0.7';
            
        } else {
            // Готові до оновлення
            icon.innerHTML = '↑';
            icon.style.transform = 'rotate(180deg)';
            text.textContent = 'Відпустіть для оновлення';
            
            progress.style.width = '100%';
            progress.style.opacity = '1';
        }
    }

    // ========== ФУНКЦІЯ ОНОВЛЕННЯ КОНТЕНТУ ==========
    async function refreshPageContent() {
        const icon = document.getElementById('ptr-icon');
        const text = document.getElementById('ptr-text');
        const progress = document.getElementById('ptr-progress');
        
        try {
            // Показуємо спінер
            icon.innerHTML = '↻';
            icon.style.animation = 'ptr-spin 1s linear infinite';
            icon.style.transform = 'none';
            text.textContent = 'Оновлення...';
            
            if (progress) progress.style.opacity = '0';
            
            // Перевіряємо, чи є глобальна функція оновлення даних
            if (typeof window.refreshData === 'function') {
                await window.refreshData();
            } else {
                // Інакше просто перезавантажуємо сторінку
                setTimeout(() => {
                    window.location.reload();
                }, ANIMATION_TIME);
                return;
            }
            
            // Показуємо успіх
            icon.innerHTML = '✓';
            icon.style.animation = 'ptr-pop 0.3s ease-out';
            text.textContent = 'Оновлено!';
            
            // Ховаємо індикатор через пів секунди
            setTimeout(() => {
                indicator.style.top = '-80px';
                
                // Скидаємо іконку
                setTimeout(() => {
                    if (!isRefreshing) {
                        icon.innerHTML = '↓';
                        icon.style.animation = 'none';
                        text.textContent = 'Потягніть для оновлення';
                        if (progress) {
                            progress.style.width = '0%';
                            progress.style.opacity = '0.7';
                        }
                    }
                }, 300);
                
                isRefreshing = false;
            }, 500);
            
        } catch (error) {
            console.error('❌ Помилка оновлення:', error);
            
            icon.innerHTML = '⚠';
            icon.style.animation = 'none';
            text.textContent = 'Помилка';
            
            setTimeout(() => {
                indicator.style.top = '-80px';
                
                setTimeout(() => {
                    if (!isRefreshing) {
                        icon.innerHTML = '↓';
                        icon.style.animation = 'none';
                        text.textContent = 'Потягніть для оновлення';
                        if (progress) {
                            progress.style.width = '0%';
                            progress.style.opacity = '0.7';
                        }
                    }
                }, 300);
                
                isRefreshing = false;
            }, 1000);
        }
    }

    // ========== ОБРОБНИКИ ПОДІЙ ==========
    
    // Початок дотику
    document.addEventListener('touchstart', (e) => {
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
        
        if (pullDistance > 0) {
            e.preventDefault();
            
            // Показуємо індикатор
            if (pullDistance < 100) {
                indicator.style.top = `${Math.min(pullDistance - 80, 0)}px`;
            } else {
                indicator.style.top = '0';
            }
            
            updateIndicator(pullDistance);
        }
    }, { passive: false });

    // Відпускання пальця
    document.addEventListener('touchend', async (e) => {
        if (!isPulling || isRefreshing) return;
        
        const pullDistance = currentY - startY;
        
        if (pullDistance >= THRESHOLD) {
            isRefreshing = true;
            indicator.style.top = '0';
            await refreshPageContent();
        } else {
            indicator.style.top = '-80px';
            
            // Скидаємо індикатор
            const icon = document.getElementById('ptr-icon');
            const text = document.getElementById('ptr-text');
            const progress = document.getElementById('ptr-progress');
            
            if (icon) {
                icon.innerHTML = '↓';
                icon.style.transform = 'none';
            }
            if (text) text.textContent = 'Потягніть для оновлення';
            if (progress) {
                progress.style.width = '0%';
                progress.style.opacity = '0.7';
            }
        }
        
        isPulling = false;
        startY = 0;
        currentY = 0;
    });

    // Ховаємо індикатор при скролі вниз
    window.addEventListener('scroll', () => {
        if (window.scrollY > 10 && !isRefreshing) {
            indicator.style.top = '-80px';
            isPulling = false;
            
            // Скидаємо індикатор
            const icon = document.getElementById('ptr-icon');
            const text = document.getElementById('ptr-text');
            const progress = document.getElementById('ptr-progress');
            
            if (icon) {
                icon.innerHTML = '↓';
                icon.style.transform = 'none';
            }
            if (text) text.textContent = 'Потягніть для оновлення';
            if (progress) {
                progress.style.width = '0%';
                progress.style.opacity = '0.7';
            }
        }
    }, { passive: true });

    console.log('✅ Pull-to-refresh: стильна версія готова');
})();
