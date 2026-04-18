// modules/admin-panel.js - Админ-панель для управления расчётом зарплаты

import { 
    BASE_RATE, 
    LUNCH_COST_REAL, 
    SATURDAY_BONUS, 
    NIGHT_BONUS_PERCENT,
    SOCIAL_RATE,
    HEALTH_RATE,
    TAX_RATE,
    NON_TAXABLE
} from './salary.js';

import { saveUserSettings, loadUserSettings } from './firebase-config.js';

// Состояние админ-панели
let adminPanelVisible = false;
let adminSettings = {
    // Основные коэффициенты
    hourlyRate: BASE_RATE,
    lunchCost: LUNCH_COST_REAL,
    saturdayBonus: SATURDAY_BONUS,
    nightBonusPercent: NIGHT_BONUS_PERCENT,
    saturdayCoeff: 1.5,
    sundayCoeff: 2.0,
    overtimeCoeff: 1.5,
    extraBonus: 25,
    
    // Налоги
    socialRate: SOCIAL_RATE,
    healthRate: HEALTH_RATE,
    taxRate: TAX_RATE,
    nonTaxable: NON_TAXABLE,
    
    // Дополнительные бонусы
    customBonuses: [],
    
    // Настройки
    roundToCents: true,
    progressiveTax: false,
    
    // Специальные бонусы
    qualityBonus: { enabled: false, amount: 30 },
    transportBonus: { enabled: false, amount: 25 },
    seniorityBonus: { enabled: false, amount: 50 }
};

// Загрузка сохранённых настроек
export function loadAdminSettings() {
    const saved = localStorage.getItem('adminSalarySettings');
    if (saved) {
        try {
            const parsed = JSON.parse(saved);
            Object.assign(adminSettings, parsed);
        } catch(e) {}
    }
    applyAdminSettings();
}

// Сохранение настроек
export function saveAdminSettings() {
    localStorage.setItem('adminSalarySettings', JSON.stringify(adminSettings));
    showNotification('⚙️ Настройки админ-панели сохранены', 'success');
}

// Применение настроек к глобальным переменным
export function applyAdminSettings() {
    // Переопределяем глобальные настройки через window
    if (window.updateGlobalSettings) {
        window.updateGlobalSettings(adminSettings);
    }
    
    // Обновляем поля в профиле, если они есть
    const hourlyRateInput = document.getElementById('hourlyRate');
    if (hourlyRateInput) hourlyRateInput.value = adminSettings.hourlyRate;
    
    const lunchCostInput = document.getElementById('lunchCost');
    if (lunchCostInput) lunchCostInput.value = adminSettings.lunchCost;
    
    const nightBonusInput = document.getElementById('nightBonus');
    if (nightBonusInput) nightBonusInput.value = adminSettings.nightBonusPercent;
    
    const saturdayBonusInput = document.getElementById('saturdayBonus');
    if (saturdayBonusInput) saturdayBonusInput.value = adminSettings.saturdayCoeff;
    
    const extraBonusInput = document.getElementById('extraBonus');
    if (extraBonusInput) extraBonusInput.value = adminSettings.extraBonus;
    
    // Пересчитываем зарплату
    if (window.updateDashboard) window.updateDashboard();
}

// Создание и отображение админ-панели
export function createAdminPanel() {
    // Создаём контейнер для админ-панели
    const panel = document.createElement('div');
    panel.id = 'adminPanel';
    panel.innerHTML = `
        <style>
            #adminPanel {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0,0,0,0.95);
                z-index: 1000000;
                overflow-y: auto;
                transition: transform 0.3s ease;
                transform: translateX(100%);
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            }
            
            #adminPanel.open {
                transform: translateX(0);
            }
            
            .admin-container {
                max-width: 500px;
                margin: 0 auto;
                padding: 20px 16px 30px;
                background: var(--bg-color, #0f172a);
                min-height: 100vh;
            }
            
            .admin-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 20px;
                padding-bottom: 15px;
                border-bottom: 2px solid var(--primary, #00b060);
            }
            
            .admin-header h2 {
                font-size: 1.4rem;
                color: var(--text, #fff);
                margin: 0;
            }
            
            .admin-close {
                background: rgba(255,255,255,0.1);
                border: none;
                width: 40px;
                height: 40px;
                border-radius: 20px;
                font-size: 1.3rem;
                cursor: pointer;
                color: var(--text, #fff);
            }
            
            .admin-section {
                background: var(--dark-card, #1e293b);
                border-radius: 16px;
                padding: 16px;
                margin-bottom: 16px;
            }
            
            .admin-section h3 {
                font-size: 1rem;
                margin-bottom: 12px;
                color: var(--primary, #00b060);
                display: flex;
                align-items: center;
                gap: 8px;
            }
            
            .admin-row {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 10px 0;
                border-bottom: 1px solid rgba(255,255,255,0.1);
            }
            
            .admin-row:last-child {
                border-bottom: none;
            }
            
            .admin-label {
                font-size: 0.85rem;
                color: var(--text-muted, #94a3b8);
            }
            
            .admin-value {
                display: flex;
                align-items: center;
                gap: 8px;
            }
            
            .admin-value input {
                width: 80px;
                padding: 6px 10px;
                border-radius: 8px;
                border: 1px solid var(--border, #334155);
                background: var(--bg-color, #0f172a);
                color: var(--text, #fff);
                text-align: center;
            }
            
            .admin-value input:focus {
                outline: none;
                border-color: var(--primary, #00b060);
            }
            
            .admin-toggle {
                position: relative;
                display: inline-block;
                width: 44px;
                height: 24px;
            }
            
            .admin-toggle input {
                opacity: 0;
                width: 0;
                height: 0;
            }
            
            .toggle-slider {
                position: absolute;
                cursor: pointer;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background-color: #475569;
                transition: 0.3s;
                border-radius: 24px;
            }
            
            .toggle-slider:before {
                position: absolute;
                content: "";
                height: 18px;
                width: 18px;
                left: 3px;
                bottom: 3px;
                background-color: white;
                transition: 0.3s;
                border-radius: 50%;
            }
            
            .admin-toggle input:checked + .toggle-slider {
                background-color: var(--primary, #00b060);
            }
            
            .admin-toggle input:checked + .toggle-slider:before {
                transform: translateX(20px);
            }
            
            .admin-badge {
                background: var(--primary, #00b060);
                color: white;
                padding: 2px 8px;
                border-radius: 12px;
                font-size: 0.7rem;
            }
            
            .admin-buttons {
                display: flex;
                gap: 12px;
                margin-top: 20px;
            }
            
            .admin-buttons button {
                flex: 1;
                padding: 12px;
                border: none;
                border-radius: 12px;
                font-weight: 600;
                cursor: pointer;
            }
            
            .btn-admin-save {
                background: var(--primary, #00b060);
                color: white;
            }
            
            .btn-admin-reset {
                background: #ef4444;
                color: white;
            }
            
            .custom-bonus-item {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 8px 0;
                border-bottom: 1px solid rgba(255,255,255,0.1);
            }
            
            .add-bonus-row {
                display: flex;
                gap: 8px;
                margin-top: 12px;
            }
            
            .add-bonus-row input {
                flex: 1;
                padding: 8px;
                border-radius: 8px;
                border: 1px solid var(--border, #334155);
                background: var(--bg-color, #0f172a);
                color: var(--text, #fff);
            }
            
            .delete-bonus {
                background: rgba(239,68,68,0.2);
                border: none;
                padding: 4px 10px;
                border-radius: 8px;
                cursor: pointer;
                color: #ef4444;
            }
        </style>
        
        <div class="admin-container">
            <div class="admin-header">
                <h2><i class="fas fa-crown"></i> Админ-панель</h2>
                <button class="admin-close" onclick="window.closeAdminPanel()">✕</button>
            </div>
            
            <!-- Основные ставки -->
            <div class="admin-section">
                <h3><i class="fas fa-euro-sign"></i> Основные ставки</h3>
                <div class="admin-row">
                    <span class="admin-label">💰 Часовая ставка (€)</span>
                    <div class="admin-value">
                        <input type="number" id="adminHourlyRate" step="0.01" value="${adminSettings.hourlyRate}">
                    </div>
                </div>
                <div class="admin-row">
                    <span class="admin-label">🍽️ Стоимость обеда (€)</span>
                    <div class="admin-value">
                        <input type="number" id="adminLunchCost" step="0.01" value="${adminSettings.lunchCost}">
                    </div>
                </div>
                <div class="admin-row">
                    <span class="admin-label">🌙 Ночная доплата (%)</span>
                    <div class="admin-value">
                        <input type="number" id="adminNightBonus" step="1" value="${adminSettings.nightBonusPercent}">
                    </div>
                </div>
            </div>
            
            <!-- Коэффициенты -->
            <div class="admin-section">
                <h3><i class="fas fa-chart-line"></i> Коэффициенты</h3>
                <div class="admin-row">
                    <span class="admin-label">📅 Суббота (коэф.)</span>
                    <div class="admin-value">
                        <input type="number" id="adminSaturdayCoeff" step="0.1" value="${adminSettings.saturdayCoeff}">
                    </div>
                </div>
                <div class="admin-row">
                    <span class="admin-label">📅 Воскресенье (коэф.)</span>
                    <div class="admin-value">
                        <input type="number" id="adminSundayCoeff" step="0.1" value="${adminSettings.sundayCoeff}">
                    </div>
                </div>
                <div class="admin-row">
                    <span class="admin-label">⏱️ Переработка (коэф.)</span>
                    <div class="admin-value">
                        <input type="number" id="adminOvertimeCoeff" step="0.1" value="${adminSettings.overtimeCoeff}">
                    </div>
                </div>
                <div class="admin-row">
                    <span class="admin-label">🎁 Бонус за субботу (€)</span>
                    <div class="admin-value">
                        <input type="number" id="adminSaturdayBonus" step="5" value="${adminSettings.saturdayBonus}">
                    </div>
                </div>
                <div class="admin-row">
                    <span class="admin-label">⭐ Бонус за надчас (€)</span>
                    <div class="admin-value">
                        <input type="number" id="adminExtraBonus" step="5" value="${adminSettings.extraBonus}">
                    </div>
                </div>
            </div>
            
            <!-- Налоги -->
            <div class="admin-section">
                <h3><i class="fas fa-percent"></i> Налоги</h3>
                <div class="admin-row">
                    <span class="admin-label">🏥 Социальный налог (%)</span>
                    <div class="admin-value">
                        <input type="number" id="adminSocialRate" step="0.1" value="${(adminSettings.socialRate * 100).toFixed(1)}">
                    </div>
                </div>
                <div class="admin-row">
                    <span class="admin-label">🩺 Медицинский налог (%)</span>
                    <div class="admin-value">
                        <input type="number" id="adminHealthRate" step="0.1" value="${(adminSettings.healthRate * 100).toFixed(1)}">
                    </div>
                </div>
                <div class="admin-row">
                    <span class="admin-label">📊 Налог на доход (%)</span>
                    <div class="admin-value">
                        <input type="number" id="adminTaxRate" step="1" value="${(adminSettings.taxRate * 100).toFixed(0)}">
                    </div>
                </div>
                <div class="admin-row">
                    <span class="admin-label">💳 Необлагаемая сумма (€)</span>
                    <div class="admin-value">
                        <input type="number" id="adminNonTaxable" step="10" value="${adminSettings.nonTaxable}">
                    </div>
                </div>
            </div>
            
            <!-- Дополнительные бонусы -->
            <div class="admin-section">
                <h3><i class="fas fa-gift"></i> Бонусы</h3>
                <div class="admin-row">
                    <span class="admin-label">⭐ Премия за качество</span>
                    <div class="admin-value">
                        <input type="number" id="adminQualityBonusAmount" step="10" value="${adminSettings.qualityBonus.amount}" style="width: 70px;">
                        <label class="admin-toggle">
                            <input type="checkbox" id="adminQualityBonusEnabled" ${adminSettings.qualityBonus.enabled ? 'checked' : ''}>
                            <span class="toggle-slider"></span>
                        </label>
                    </div>
                </div>
                <div class="admin-row">
                    <span class="admin-label">🚗 Транспортный бонус</span>
                    <div class="admin-value">
                        <input type="number" id="adminTransportBonusAmount" step="10" value="${adminSettings.transportBonus.amount}" style="width: 70px;">
                        <label class="admin-toggle">
                            <input type="checkbox" id="adminTransportBonusEnabled" ${adminSettings.transportBonus.enabled ? 'checked' : ''}>
                            <span class="toggle-slider"></span>
                        </label>
                    </div>
                </div>
                <div class="admin-row">
                    <span class="admin-label">🎓 Бонус за стаж</span>
                    <div class="admin-value">
                        <input type="number" id="adminSeniorityBonusAmount" step="10" value="${adminSettings.seniorityBonus.amount}" style="width: 70px;">
                        <label class="admin-toggle">
                            <input type="checkbox" id="adminSeniorityBonusEnabled" ${adminSettings.seniorityBonus.enabled ? 'checked' : ''}>
                            <span class="toggle-slider"></span>
                        </label>
                    </div>
                </div>
            </div>
            
            <!-- Дополнительные настройки -->
            <div class="admin-section">
                <h3><i class="fas fa-cog"></i> Дополнительно</h3>
                <div class="admin-row">
                    <span class="admin-label">🔄 Округление до центов</span>
                    <label class="admin-toggle">
                        <input type="checkbox" id="adminRoundToCents" ${adminSettings.roundToCents ? 'checked' : ''}>
                        <span class="toggle-slider"></span>
                    </label>
                </div>
                <div class="admin-row">
                    <span class="admin-label">📈 Прогрессивный налог</span>
                    <label class="admin-toggle">
                        <input type="checkbox" id="adminProgressiveTax" ${adminSettings.progressiveTax ? 'checked' : ''}>
                        <span class="toggle-slider"></span>
                    </label>
                </div>
            </div>
            
            <div class="admin-buttons">
                <button class="btn-admin-save" onclick="window.saveAdminSettingsToStorage()">💾 Сохранить</button>
                <button class="btn-admin-reset" onclick="window.resetAdminSettings()">🔄 Сброс</button>
            </div>
            
            <p style="font-size: 11px; text-align: center; color: #64748b; margin-top: 20px;">
                <i class="fas fa-shield-alt"></i> Все настройки сохраняются локально
            </p>
        </div>
    `;
    
    document.body.appendChild(panel);
    
    // Добавляем обработчики
    document.getElementById('adminHourlyRate').addEventListener('change', updateAdminPreview);
    document.getElementById('adminLunchCost').addEventListener('change', updateAdminPreview);
    document.getElementById('adminNightBonus').addEventListener('change', updateAdminPreview);
    document.getElementById('adminSaturdayCoeff').addEventListener('change', updateAdminPreview);
    document.getElementById('adminSundayCoeff').addEventListener('change', updateAdminPreview);
    document.getElementById('adminOvertimeCoeff').addEventListener('change', updateAdminPreview);
    document.getElementById('adminSaturdayBonus').addEventListener('change', updateAdminPreview);
    document.getElementById('adminExtraBonus').addEventListener('change', updateAdminPreview);
    document.getElementById('adminSocialRate').addEventListener('change', updateAdminPreview);
    document.getElementById('adminHealthRate').addEventListener('change', updateAdminPreview);
    document.getElementById('adminTaxRate').addEventListener('change', updateAdminPreview);
    document.getElementById('adminNonTaxable').addEventListener('change', updateAdminPreview);
}

function updateAdminPreview() {
    // Собираем текущие значения
    adminSettings.hourlyRate = parseFloat(document.getElementById('adminHourlyRate').value);
    adminSettings.lunchCost = parseFloat(document.getElementById('adminLunchCost').value);
    adminSettings.nightBonusPercent = parseFloat(document.getElementById('adminNightBonus').value);
    adminSettings.saturdayCoeff = parseFloat(document.getElementById('adminSaturdayCoeff').value);
    adminSettings.sundayCoeff = parseFloat(document.getElementById('adminSundayCoeff').value);
    adminSettings.overtimeCoeff = parseFloat(document.getElementById('adminOvertimeCoeff').value);
    adminSettings.saturdayBonus = parseFloat(document.getElementById('adminSaturdayBonus').value);
    adminSettings.extraBonus = parseFloat(document.getElementById('adminExtraBonus').value);
    adminSettings.socialRate = parseFloat(document.getElementById('adminSocialRate').value) / 100;
    adminSettings.healthRate = parseFloat(document.getElementById('adminHealthRate').value) / 100;
    adminSettings.taxRate = parseFloat(document.getElementById('adminTaxRate').value) / 100;
    adminSettings.nonTaxable = parseFloat(document.getElementById('adminNonTaxable').value);
    adminSettings.qualityBonus.amount = parseFloat(document.getElementById('adminQualityBonusAmount').value);
    adminSettings.qualityBonus.enabled = document.getElementById('adminQualityBonusEnabled').checked;
    adminSettings.transportBonus.amount = parseFloat(document.getElementById('adminTransportBonusAmount').value);
    adminSettings.transportBonus.enabled = document.getElementById('adminTransportBonusEnabled').checked;
    adminSettings.seniorityBonus.amount = parseFloat(document.getElementById('adminSeniorityBonusAmount').value);
    adminSettings.seniorityBonus.enabled = document.getElementById('adminSeniorityBonusEnabled').checked;
    adminSettings.roundToCents = document.getElementById('adminRoundToCents').checked;
    adminSettings.progressiveTax = document.getElementById('adminProgressiveTax').checked;
    
    // Применяем настройки
    applyAdminSettings();
    
    // Пересчитываем зарплату
    if (window.updateDashboard) window.updateDashboard();
}

// Открытие админ-панели
export function openAdminPanel() {
    const panel = document.getElementById('adminPanel');
    if (panel) {
        panel.classList.add('open');
        // Обновляем значения в полях
        document.getElementById('adminHourlyRate').value = adminSettings.hourlyRate;
        document.getElementById('adminLunchCost').value = adminSettings.lunchCost;
        document.getElementById('adminNightBonus').value = adminSettings.nightBonusPercent;
        document.getElementById('adminSaturdayCoeff').value = adminSettings.saturdayCoeff;
        document.getElementById('adminSundayCoeff').value = adminSettings.sundayCoeff;
        document.getElementById('adminOvertimeCoeff').value = adminSettings.overtimeCoeff;
        document.getElementById('adminSaturdayBonus').value = adminSettings.saturdayBonus;
        document.getElementById('adminExtraBonus').value = adminSettings.extraBonus;
        document.getElementById('adminSocialRate').value = (adminSettings.socialRate * 100).toFixed(1);
        document.getElementById('adminHealthRate').value = (adminSettings.healthRate * 100).toFixed(1);
        document.getElementById('adminTaxRate').value = (adminSettings.taxRate * 100).toFixed(0);
        document.getElementById('adminNonTaxable').value = adminSettings.nonTaxable;
        document.getElementById('adminQualityBonusAmount').value = adminSettings.qualityBonus.amount;
        document.getElementById('adminQualityBonusEnabled').checked = adminSettings.qualityBonus.enabled;
        document.getElementById('adminTransportBonusAmount').value = adminSettings.transportBonus.amount;
        document.getElementById('adminTransportBonusEnabled').checked = adminSettings.transportBonus.enabled;
        document.getElementById('adminSeniorityBonusAmount').value = adminSettings.seniorityBonus.amount;
        document.getElementById('adminSeniorityBonusEnabled').checked = adminSettings.seniorityBonus.enabled;
        document.getElementById('adminRoundToCents').checked = adminSettings.roundToCents;
        document.getElementById('adminProgressiveTax').checked = adminSettings.progressiveTax;
    }
}

// Закрытие админ-панели
export function closeAdminPanel() {
    const panel = document.getElementById('adminPanel');
    if (panel) {
        panel.classList.remove('open');
    }
}

// Сохранение настроек в storage
export function saveAdminSettingsToStorage() {
    updateAdminPreview();
    saveAdminSettings();
    showNotification('✅ Настройки сохранены и применены!', 'success');
}

// Сброс настроек к стандартным
export function resetAdminSettings() {
    if (confirm('Сбросить все настройки админ-панели к стандартным?')) {
        adminSettings = {
            hourlyRate: BASE_RATE,
            lunchCost: LUNCH_COST_REAL,
            saturdayBonus: SATURDAY_BONUS,
            nightBonusPercent: NIGHT_BONUS_PERCENT,
            saturdayCoeff: 1.5,
            sundayCoeff: 2.0,
            overtimeCoeff: 1.5,
            extraBonus: 25,
            socialRate: SOCIAL_RATE,
            healthRate: HEALTH_RATE,
            taxRate: TAX_RATE,
            nonTaxable: NON_TAXABLE,
            customBonuses: [],
            roundToCents: true,
            progressiveTax: false,
            qualityBonus: { enabled: false, amount: 30 },
            transportBonus: { enabled: false, amount: 25 },
            seniorityBonus: { enabled: false, amount: 50 }
        };
        saveAdminSettings();
        applyAdminSettings();
        
        // Обновляем поля в админ-панели
        if (document.getElementById('adminHourlyRate')) {
            document.getElementById('adminHourlyRate').value = adminSettings.hourlyRate;
            document.getElementById('adminLunchCost').value = adminSettings.lunchCost;
            document.getElementById('adminNightBonus').value = adminSettings.nightBonusPercent;
            document.getElementById('adminSaturdayCoeff').value = adminSettings.saturdayCoeff;
            document.getElementById('adminSundayCoeff').value = adminSettings.sundayCoeff;
            document.getElementById('adminOvertimeCoeff').value = adminSettings.overtimeCoeff;
            document.getElementById('adminSaturdayBonus').value = adminSettings.saturdayBonus;
            document.getElementById('adminExtraBonus').value = adminSettings.extraBonus;
            document.getElementById('adminSocialRate').value = (adminSettings.socialRate * 100).toFixed(1);
            document.getElementById('adminHealthRate').value = (adminSettings.healthRate * 100).toFixed(1);
            document.getElementById('adminTaxRate').value = (adminSettings.taxRate * 100).toFixed(0);
            document.getElementById('adminNonTaxable').value = adminSettings.nonTaxable;
            document.getElementById('adminRoundToCents').checked = adminSettings.roundToCents;
            document.getElementById('adminProgressiveTax').checked = adminSettings.progressiveTax;
        }
        
        if (window.updateDashboard) window.updateDashboard();
        showNotification('🔄 Настройки сброшены к стандартным', 'info');
    }
}

function showNotification(msg, type) {
    const notif = document.getElementById('notification');
    if (notif) {
        const msgSpan = document.getElementById('notificationMessage');
        if (msgSpan) msgSpan.textContent = msg;
        notif.classList.remove('hidden');
        setTimeout(() => notif.classList.add('hidden'), 3000);
    } else {
        alert(msg);
    }
}

// Добавляем кнопку админ-панели на страницу
export function addAdminButton() {
    // Ищем нижнюю навигацию
    const nav = document.querySelector('nav');
    if (nav && !document.getElementById('adminNavBtn')) {
        const adminBtn = document.createElement('button');
        adminBtn.id = 'adminNavBtn';
        adminBtn.className = 'nav-btn';
        adminBtn.innerHTML = '<i class="fas fa-crown"></i><span>Admin</span>';
        adminBtn.onclick = () => openAdminPanel();
        nav.appendChild(adminBtn);
    }
}

// Экспорт глобальных функций
window.openAdminPanel = openAdminPanel;
window.closeAdminPanel = closeAdminPanel;
window.saveAdminSettingsToStorage = saveAdminSettingsToStorage;
window.resetAdminSettings = resetAdminSettings;

// Загрузка при старте
export function initAdminPanel() {
    loadAdminSettings();
    createAdminPanel();
    addAdminButton();
}
