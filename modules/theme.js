// modules/theme.js - УПРАВЛЕНИЕ ТЕМАМИ

import { getCurrentUser, updateUserData } from './auth.js';

// Теми
const themes = {
    dark: {
        '--primary': '#00b060',
        '--primary-dark': '#009048',
        '--primary-light': '#00d070',
        '--dark': '#0a0c14',
        '--dark-light': '#1a1e2a',
        '--dark-card': '#121620',
        '--text': '#ffffff',
        '--text-muted': '#a0a8b8',
        '--border': '#2a303c'
    },
    light: {
        '--primary': '#00b060',
        '--primary-dark': '#009048',
        '--primary-light': '#00d070',
        '--dark': '#f5f7fa',
        '--dark-light': '#ffffff',
        '--dark-card': '#ffffff',
        '--text': '#1a1e2a',
        '--text-muted': '#6b7280',
        '--border': '#e2e8f0'
    },
    blue: {
        '--primary': '#3b82f6',
        '--primary-dark': '#2563eb',
        '--primary-light': '#60a5fa',
        '--dark': '#0f172a',
        '--dark-light': '#1e293b',
        '--dark-card': '#1a2639',
        '--text': '#f8fafc',
        '--text-muted': '#94a3b8',
        '--border': '#334155'
    },
    purple: {
        '--primary': '#8b5cf6',
        '--primary-dark': '#7c3aed',
        '--primary-light': '#a78bfa',
        '--dark': '#1e1b4b',
        '--dark-light': '#2e1a5e',
        '--dark-card': '#271d54',
        '--text': '#faf5ff',
        '--text-muted': '#c4b5fd',
        '--border': '#4c1d95'
    },
    orange: {
        '--primary': '#f97316',
        '--primary-dark': '#ea580c',
        '--primary-light': '#fb923c',
        '--dark': '#1c1917',
        '--dark-light': '#292524',
        '--dark-card': '#231f1e',
        '--text': '#fff7ed',
        '--text-muted': '#fdba74',
        '--border': '#7c2d12'
    },
    red: {
        '--primary': '#ef4444',
        '--primary-dark': '#dc2626',
        '--primary-light': '#f87171',
        '--dark': '#1f1a1a',
        '--dark-light': '#2d2424',
        '--dark-card': '#271f1f',
        '--text': '#fef2f2',
        '--text-muted': '#fca5a5',
        '--border': '#991b1b'
    },
    green: {
        '--primary': '#10b981',
        '--primary-dark': '#059669',
        '--primary-light': '#34d399',
        '--dark': '#0c1a14',
        '--dark-light': '#1a2e22',
        '--dark-card': '#15271d',
        '--text': '#ecfdf5',
        '--text-muted': '#6ee7b7',
        '--border': '#065f46'
    },
    pink: {
        '--primary': '#ec4899',
        '--primary-dark': '#db2777',
        '--primary-light': '#f472b6',
        '--dark': '#24141e',
        '--dark-light': '#382130',
        '--dark-card': '#2f1b28',
        '--text': '#fdf2f8',
        '--text-muted': '#f9a8d4',
        '--border': '#9d174d'
    },
    mint: {
        '--primary': '#14b8a6',
        '--primary-dark': '#0d9488',
        '--primary-light': '#2dd4bf',
        '--dark': '#0f1a18',
        '--dark-light': '#1e2e2a',
        '--dark-card': '#182622',
        '--text': '#f0fdfa',
        '--text-muted': '#5eead4',
        '--border': '#115e59'
    },
    gray: {
        '--primary': '#6b7280',
        '--primary-dark': '#4b5563',
        '--primary-light': '#9ca3af',
        '--dark': '#111827',
        '--dark-light': '#1f2937',
        '--dark-card': '#1a232e',
        '--text': '#f9fafb',
        '--text-muted': '#d1d5db',
        '--border': '#374151'
    }
};

// Применить тему
function applyTheme(themeName) {
    const theme = themes[themeName] || themes.dark;
    const root = document.documentElement;
    
    Object.keys(theme).forEach(key => {
        root.style.setProperty(key, theme[key]);
    });
    
    document.body.classList.remove(
        'theme-dark', 'theme-light', 'theme-blue', 'theme-purple',
        'theme-orange', 'theme-red', 'theme-green', 'theme-pink',
        'theme-mint', 'theme-gray'
    );
    document.body.classList.add(`theme-${themeName}`);
}

// Установить тему
window.setTheme = function(theme) {
    localStorage.setItem('vaillant_theme', theme);
    
    if (theme === 'auto') {
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            applyTheme('dark');
        } else {
            applyTheme('light');
        }
    } else {
        applyTheme(theme);
    }
    
    document.querySelectorAll('.theme-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.theme === theme) {
            btn.classList.add('active');
        }
    });
    
    const user = getCurrentUser();
    if (user) {
        updateUserData({ theme: theme }).catch(() => {});
    }
    
    // Обновляем графики
    setTimeout(() => {
        if (document.getElementById('dashboard')?.classList.contains('active') && window.buildYearChart) {
            window.buildYearChart();
        }
        if (document.getElementById('stats')?.classList.contains('active') && window.loadYearStats) {
            window.loadYearStats();
        }
        if (document.getElementById('finance')?.classList.contains('active') && window.updateFinanceStats) {
            window.updateFinanceStats();
        }
    }, 200);
};
