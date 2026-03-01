// js/weather.js - ПОГОДНЫЕ ЭФФЕКТЫ

import { getCurrentUser, updateUserData } from './auth.js';

let weatherParticles = null;
let weatherAnimation = null;

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
    
    toggleWeatherEffect();
};

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
    
    if (weatherParticles) {
        document.body.removeChild(weatherParticles);
        weatherParticles = null;
        if (weatherAnimation) {
            cancelAnimationFrame(weatherAnimation);
            weatherAnimation = null;
        }
    }
    
    if (!enabled || mode === 'off') return;
    
    let effectType = mode;
    if (mode === 'auto') {
        const tempText = document.getElementById('weatherTemp')?.textContent || '0°C';
        const temp = parseInt(tempText) || 0;
        if (temp < 0) effectType = 'snow';
        else if (temp > 0 && temp < 10) effectType = 'rain';
        else return;
    }
    
    createWeatherEffect(effectType);
};

// Создание погодного эффекта
function createWeatherEffect(type) {
    const canvas = document.createElement('canvas');
    canvas.id = 'weather-particles';
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = '9999';
    document.body.appendChild(canvas);
    weatherParticles = canvas;
    
    const ctx = canvas.getContext('2d');
    let width = window.innerWidth;
    let height = window.innerHeight;
    
    window.addEventListener('resize', () => {
        width = window.innerWidth;
        height = window.innerHeight;
        canvas.width = width;
        canvas.height = height;
    });
    
    canvas.width = width;
    canvas.height = height;
    
    const particles = [];
    const particleCount = type === 'snow' ? 150 : 200;
    
    for (let i = 0; i < particleCount; i++) {
        particles.push({
            x: Math.random() * width,
            y: Math.random() * height,
            size: type === 'snow' ? Math.random() * 5 + 2 : Math.random() * 3 + 1,
            speedY: type === 'snow' ? Math.random() * 2 + 1 : Math.random() * 5 + 3,
            speedX: type === 'snow' ? Math.random() * 0.5 - 0.25 : Math.random() * 2 - 1,
            opacity: Math.random() * 0.7 + 0.3
        });
    }
    
    function animate() {
        if (!weatherParticles) return;
        ctx.clearRect(0, 0, width, height);
        
        particles.forEach(p => {
            if (type === 'snow') {
                ctx.fillStyle = `rgba(255, 255, 255, ${p.opacity})`;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fill();
            } else {
                ctx.fillStyle = `rgba(174, 194, 224, ${p.opacity * 0.6})`;
                ctx.fillRect(p.x, p.y, 1, p.size * 2);
            }
            
            p.y += p.speedY;
            p.x += p.speedX;
            
            if (p.y > height) { p.y = -10; p.x = Math.random() * width; }
            if (p.x > width) p.x = 0;
            if (p.x < 0) p.x = width;
        });
        
        weatherAnimation = requestAnimationFrame(animate);
    }
    
    animate();
}
