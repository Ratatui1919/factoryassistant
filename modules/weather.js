// modules/weather.js - ПОГОДНЫЕ ЭФФЕКТЫ (ФИНАЛЬНАЯ ВЕРСИЯ)

import { getCurrentUser, updateUserData } from './auth.js';

let weatherParticles = null;
let weatherAnimation = null;
let canvasWidth = 0;
let canvasHeight = 0;

// Обновление погоды
window.updateWeather = async function() {
    const weatherTemp = document.getElementById('weatherTemp');
    if (!weatherTemp) return;
    
    try {
        const response = await fetch('https://api.open-meteo.com/v1/forecast?latitude=48.89&longitude=17.99&current_weather=true&timezone=auto');
        const data = await response.json();
        const temp = Math.round(data.current_weather.temperature);
        const weatherCode = data.current_weather.weathercode;
        
        let icon = '☀️';
        if (weatherCode >= 51 && weatherCode <= 67) icon = '🌧️';
        else if (weatherCode >= 71 && weatherCode <= 77) icon = '❄️';
        else if (weatherCode >= 80 && weatherCode <= 99) icon = '⛈️';
        else if (weatherCode >= 41 && weatherCode <= 49) icon = '☁️';
        else if (weatherCode >= 31 && weatherCode <= 35) icon = '🌫️';
        
        weatherTemp.innerHTML = `${icon} ${temp}°C`;
    } catch (error) {
        console.error('Ошибка получения погоды:', error);
        const temps = [2, 3, 4, 5, 6, 7, 8];
        const randomTemp = temps[Math.floor(Math.random() * temps.length)];
        weatherTemp.innerHTML = `☀️ ${randomTemp}°C`;
    }
    
    // После обновления погоды проверяем и включаем эффект
    restoreWeatherEffect();
};

// Восстановление эффекта после загрузки страницы
function restoreWeatherEffect() {
    const user = getCurrentUser();
    if (!user) return;
    
    const enabled = user.weatherEffectsEnabled;
    const mode = user.weatherEffectMode;
    
    if (!enabled || mode === 'off') return;
    
    // Устанавливаем чекбоксы
    const enabledCheckbox = document.getElementById('weatherEffectsEnabled');
    const modeSelect = document.getElementById('weatherEffectMode');
    
    if (enabledCheckbox) enabledCheckbox.checked = enabled;
    if (modeSelect) modeSelect.value = mode;
    
    // Включаем эффект
    setTimeout(() => {
        startWeatherEffect(mode);
    }, 500);
}

// Запуск эффекта
function startWeatherEffect(mode) {
    // Удаляем старый эффект
    if (weatherParticles) {
        document.body.removeChild(weatherParticles);
        weatherParticles = null;
        if (weatherAnimation) {
            cancelAnimationFrame(weatherAnimation);
            weatherAnimation = null;
        }
    }
    
    if (mode === 'off') return;
    
    let effectType = mode;
    if (mode === 'auto') {
        const tempText = document.getElementById('weatherTemp')?.textContent || '0°C';
        const temp = parseInt(tempText) || 0;
        if (temp < 0) effectType = 'snow';
        else if (temp > 0 && temp < 10) effectType = 'rain';
        else return;
    }
    
    createWeatherEffect(effectType);
}

// Переключение погодных эффектов
window.toggleWeatherEffect = function() {
    const enabled = document.getElementById('weatherEffectsEnabled')?.checked;
    const mode = document.getElementById('weatherEffectMode')?.value;
    
    const user = getCurrentUser();
    if (user) {
        updateUserData({
            weatherEffectsEnabled: enabled,
            weatherEffectMode: mode
        }).catch(() => {});
    }
    
    startWeatherEffect(mode);
};

// Создание погодного эффекта на весь экран
function createWeatherEffect(type) {
    // Удаляем старый canvas если есть
    const oldCanvas = document.getElementById('weather-particles');
    if (oldCanvas) {
        document.body.removeChild(oldCanvas);
    }
    
    // Создаем новый canvas
    const canvas = document.createElement('canvas');
    canvas.id = 'weather-particles';
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = '9999';
    canvas.style.display = 'block';
    document.body.appendChild(canvas);
    
    weatherParticles = canvas;
    
    // Устанавливаем размеры на весь экран
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        canvasWidth = window.innerWidth;
        canvasHeight = window.innerHeight;
    }
    
    resizeCanvas();
    
    window.addEventListener('resize', resizeCanvas);
    
    const ctx = canvas.getContext('2d');
    
    // Создаем частицы
    const particles = [];
    const particleCount = type === 'snow' ? 150 : 200;
    
    for (let i = 0; i < particleCount; i++) {
        particles.push({
            x: Math.random() * canvasWidth,
            y: Math.random() * canvasHeight,
            size: type === 'snow' ? Math.random() * 6 + 2 : Math.random() * 3 + 1,
            speedY: type === 'snow' ? Math.random() * 2 + 1 : Math.random() * 5 + 3,
            speedX: type === 'snow' ? Math.random() * 0.5 - 0.25 : Math.random() * 2 - 1,
            opacity: Math.random() * 0.7 + 0.3
        });
    }
    
    // Анимация
    function animate() {
        if (!weatherParticles || !ctx) return;
        
        // Проверяем размеры canvas
        if (canvas.width !== window.innerWidth || canvas.height !== window.innerHeight) {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            canvasWidth = window.innerWidth;
            canvasHeight = window.innerHeight;
        }
        
        // Очищаем canvas
        ctx.clearRect(0, 0, canvasWidth, canvasHeight);
        
        particles.forEach(p => {
            if (type === 'snow') {
                // Рисуем снежинки
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(255, 255, 255, ${p.opacity})`;
                ctx.fill();
            } else {
                // Рисуем дождь (капли)
                ctx.beginPath();
                ctx.moveTo(p.x, p.y);
                ctx.lineTo(p.x, p.y + p.size * 3);
                ctx.strokeStyle = `rgba(174, 194, 224, ${p.opacity})`;
                ctx.lineWidth = p.size * 0.7;
                ctx.stroke();
            }
            
            // Двигаем частицы
            p.y += p.speedY;
            p.x += p.speedX;
            
            // Сброс частиц за пределы экрана
            if (p.y > canvasHeight + 20) {
                p.y = -20;
                p.x = Math.random() * canvasWidth;
            }
            if (p.x > canvasWidth + 20) {
                p.x = -20;
            }
            if (p.x < -20) {
                p.x = canvasWidth + 20;
            }
        });
        
        weatherAnimation = requestAnimationFrame(animate);
    }
    
    animate();
}

// Инициализация при загрузке страницы
export function initWeather() {
    // Ждем загрузки пользователя
    setTimeout(() => {
        restoreWeatherEffect();
    }, 1000);
}

// Запускаем при загрузке модуля
setTimeout(() => {
    if (document.readyState === 'complete') {
        initWeather();
    } else {
        window.addEventListener('load', initWeather);
    }
}, 500);
