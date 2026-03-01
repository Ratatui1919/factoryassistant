// js/notifications.js - УВЕДОМЛЕНИЯ

import { showNotification } from './utils.js';

let notificationTimeout = null;

// Показать уведомление (переопределяем из utils.js для совместимости)
window.showNotification = showNotification;

// Скрыть уведомление
window.hideNotification = function() {
    const notification = document.getElementById('notification');
    if (notification) notification.classList.add('hidden');
};
