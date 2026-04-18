// modules/admin-panel.js - ИСПРАВЛЕННАЯ ВЕРСИЯ (С ПРИМЕНЕНИЕМ НАСТРОЕК)

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

// Состояние админ-панели
let adminSettings = {
    hourlyRate: BASE_RATE,
    lunchCost: LUNCH_COST_REAL,
    nightBonusPercent: NIGHT_BONUS_PERCENT,
    overtimePercent: 25,
    saturdayPercent: 50,
    sundayPercent: 100,
    saturdayFixedBonus: SATURDAY_BONUS,
    extraBonus: 25,
    socialRate: SOCIAL_RATE,
    healthRate: HEALTH_RATE,
    taxRate: TAX_RATE,
    nonTaxable: NON_TAXABLE,
    qualityBonus: { enabled: false, amount: 30 },
    transportBonus: { enabled: false, amount: 25 },
    seniorityBonus: { enabled: false, amount: 50 },
    customBonuses: [],
    roundToCents: true,
    progressiveTax: false
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
    applyAdminSettingsToGlobal();
}

// Сохранение настроек
export function saveAdminSettings() {
    localStorage.setItem('adminSalarySettings', JSON.stringify(adminSettings));
    showNotification('⚙️ Настройки сохранены', 'success');
}

// ПРИМЕНЕНИЕ НАСТРОЕК К ГЛОБАЛЬНЫМ ПЕРЕМЕННЫМ
export function applyAdminSettingsToGlobal() {
    console.log('Применяю админ-настройки:', adminSettings);
    
    // 1. Обновляем поля в профиле
    const hourlyRateInput = document.getElementById('hourlyRate');
    if (hourlyRateInput) hourlyRateInput.value = adminSettings.hourlyRate;
    
    const lunchCostInput = document.getElementById('lunchCost');
    if (lunchCostInput) lunchCostInput.value = adminSettings.lunchCost;
    
    const nightBonusInput = document.getElementById('nightBonus');
    if (nightBonusInput) nightBonusInput.value = adminSettings.nightBonusPercent;
    
    const saturdayBonusInput = document.getElementById('saturdayBonus');
    if (saturdayBonusInput) saturdayBonusInput.value = adminSettings.saturdayPercent / 100 + 1;
    
    const extraBonusInput = document.getElementById('extraBonus');
    if (extraBonusInput) extraBonusInput.value = adminSettings.extraBonus;
    
    // 2. Сохраняем в localStorage для salary.js
    localStorage.setItem('adminSalarySettings', JSON.stringify(adminSettings));
    
    // 3. Обновляем все данные на странице
    forceUpdateAllData();
}

// ПРИНУДИТЕЛЬНОЕ ОБНОВЛЕНИЕ ВСЕХ ДАННЫХ
function forceUpdateAllData() {
    console.log('Принудительное обновление всех данных...');
    
    // Обновляем дашборд
    if (window.updateDashboard) {
        window.updateDashboard();
    }
    
    // Обновляем календарь
    if (window.buildCalendar) {
        window.buildCalendar();
    }
    
    // Обновляем статистику
    if (window.calculateAllStats) {
        window.calculateAllStats();
    }
    
    // Обновляем финансы
    if (window.updateFinanceStats) {
        window.updateFinanceStats();
    }
    
    // Перерисовываем графики
    if (window.buildYearChart) {
        window.buildYearChart();
    }
    
    // Дополнительно обновляем отображение месяца
    if (window.updateMonthDisplay) {
        window.updateMonthDisplay();
    }
    
    // Показываем уведомление
    showNotification('✅ Зарплата пересчитана с новыми ставками!', 'success');
}

// Создание админ-панели
export function createAdminPanel() {
    if (document.getElementById('adminPanel')) return;
    
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
            }
            #adminPanel.open { transform: translateX(0); }
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
            .admin-header h2 { font-size: 1.4rem; color: var(--text, #fff); margin: 0; }
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
            .admin-row:last-child { border-bottom: none; }
            .admin-label {
                font-size: 0.85rem;
                color: var(--text-muted, #94a3b8);
            }
            .admin-label small {
                font-size: 0.7rem;
                color: var(--primary, #00b060);
                display: block;
            }
            .admin-value {
                display: flex;
                align-items: center;
                gap: 8px;
            }
            .admin-value input {
                width: 90px;
                padding: 8px 10px;
                border-radius: 8px;
                border: 1px solid var(--border, #334155);
                background: var(--bg-color, #0f172a);
                color: var(--text, #fff);
                text-align: center;
                font-size: 14px;
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
            .bonus-badge {
                background: rgba(0,176,96,0.2);
                padding: 2px 8px;
                border-radius: 12px;
                font-size: 0.7rem;
                color: #00b060;
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
            .btn-admin-save { background: var(--primary, #00b060); color: white; }
            .btn-admin-reset { background: #ef4444; color: white; }
            .btn-admin-apply { background: #3b82f6; color: white; }
            .info-text {
                font-size: 11px;
                text-align: center;
                color: #64748b;
                margin-top: 20px;
                padding: 12px;
                background: rgba(0,0,0,0.3);
                border-radius: 12px;
            }
            .info-text i { margin-right: 5px; }
        </style>
        
        <div class="admin-container">
            <div class="admin-header">
                <h2><i class="fas fa-crown"></i> Админ-панель</h2>
                <button class="admin-close" onclick="window.closeAdminPanel()">✕</button>
            </div>
            
            <div class="admin-section">
                <h3><i class="fas fa-euro-sign"></i> Основные ставки</h3>
                <div class="admin-row">
                    <span class="admin-label">💰 Часовая ставка <small>базовая оплата за 1 час</small></span>
                    <div class="admin-value">
                        <input type="number" id="adminHourlyRate" step="0.01" value="${adminSettings.hourlyRate}"> €
                    </div>
                </div>
                <div class="admin-row">
                    <span class="admin-label">🍽️ Стоимость обеда <small>вычитается за рабочий день</small></span>
                    <div class="admin-value">
                        <input type="number" id="adminLunchCost" step="0.01" value="${adminSettings.lunchCost}"> €
                    </div>
                </div>
            </div>
            
            <div class="admin-section">
                <h3><i class="fas fa-chart-line"></i> Коэффициенты (в процентах)</h3>
                <div class="admin-row">
                    <span class="admin-label">🌙 Ночная смена <small>доплата к ставке</small></span>
                    <div class="admin-value">
                        <input type="number" id="adminNightBonus" step="5" value="${adminSettings.nightBonusPercent}"> %
                    </div>
                </div>
                <div class="admin-row">
                    <span class="admin-label">⏱️ Переработка <small>например 25% = ×1.25</small></span>
                    <div class="admin-value">
                        <input type="number" id="adminOvertimePercent" step="5" value="${adminSettings.overtimePercent}"> %
                    </div>
                </div>
                <div class="admin-row">
                    <span class="admin-label">📅 Суббота <small>доплата к ставке</small></span>
                    <div class="admin-value">
                        <input type="number" id="adminSaturdayPercent" step="10" value="${adminSettings.saturdayPercent}"> %
                    </div>
                </div>
                <div class="admin-row">
                    <span class="admin-label">📅 Воскресенье <small>доплата к ставке</small></span>
                    <div class="admin-value">
                        <input type="number" id="adminSundayPercent" step="10" value="${adminSettings.sundayPercent}"> %
                    </div>
                </div>
            </div>
            
            <div class="admin-section">
                <h3><i class="fas fa-gift"></i> Фиксированные бонусы</h3>
                <div class="admin-row">
                    <span class="admin-label">🎁 Бонус за субботу <small>дополнительно к процентам</small></span>
                    <div class="admin-value">
                        <input type="number" id="adminSaturdayFixedBonus" step="5" value="${adminSettings.saturdayFixedBonus}"> €
                    </div>
                </div>
                <div class="admin-row">
                    <span class="admin-label">⭐ Бонус за надчас <small>за каждые 2 блока</small></span>
                    <div class="admin-value">
                        <input type="number" id="adminExtraBonus" step="5" value="${adminSettings.extraBonus}"> €
                    </div>
                </div>
            </div>
            
            <div class="admin-section">
                <h3><i class="fas fa-percent"></i> Налоги</h3>
                <div class="admin-row">
                    <span class="admin-label">🏥 Социальный налог</span>
                    <div class="admin-value">
                        <input type="number" id="adminSocialRate" step="0.5" value="${(adminSettings.socialRate * 100).toFixed(1)}"> %
                    </div>
                </div>
                <div class="admin-row">
                    <span class="admin-label">🩺 Медицинский налог</span>
                    <div class="admin-value">
                        <input type="number" id="adminHealthRate" step="0.5" value="${(adminSettings.healthRate * 100).toFixed(1)}"> %
                    </div>
                </div>
                <div class="admin-row">
                    <span class="admin-label">📊 Налог на доход</span>
                    <div class="admin-value">
                        <input type="number" id="adminTaxRate" step="1" value="${(adminSettings.taxRate * 100).toFixed(0)}"> %
                    </div>
                </div>
                <div class="admin-row">
                    <span class="admin-label">💳 Необлагаемая сумма</span>
                    <div class="admin-value">
                        <input type="number" id="adminNonTaxable" step="10" value="${adminSettings.nonTaxable}"> €
                    </div>
                </div>
            </div>
            
            <div class="admin-section">
                <h3><i class="fas fa-toggle-on"></i> Дополнительные бонусы</h3>
                <div class="admin-row">
                    <span class="admin-label">⭐ Премия за качество</span>
                    <div class="admin-value">
                        <input type="number" id="adminQualityBonusAmount" step="10" value="${adminSettings.qualityBonus.amount}" style="width: 70px;"> €
                        <label class="admin-toggle">
                            <input type="checkbox" id="adminQualityBonusEnabled" ${adminSettings.qualityBonus.enabled ? 'checked' : ''}>
                            <span class="toggle-slider"></span>
                        </label>
                    </div>
                </div>
                <div class="admin-row">
                    <span class="admin-label">🚗 Транспортный бонус</span>
                    <div class="admin-value">
                        <input type="number" id="adminTransportBonusAmount" step="10" value="${adminSettings.transportBonus.amount}" style="width: 70px;"> €
                        <label class="admin-toggle">
                            <input type="checkbox" id="adminTransportBonusEnabled" ${adminSettings.transportBonus.enabled ? 'checked' : ''}>
                            <span class="toggle-slider"></span>
                        </label>
                    </div>
                </div>
                <div class="admin-row">
                    <span class="admin-label">🎓 Бонус за стаж</span>
                    <div class="admin-value">
                        <input type="number" id="adminSeniorityBonusAmount" step="10" value="${adminSettings.seniorityBonus.amount}" style="width: 70px;"> €
                        <label class="admin-toggle">
                            <input type="checkbox" id="adminSeniorityBonusEnabled" ${adminSettings.seniorityBonus.enabled ? 'checked' : ''}>
                            <span class="toggle-slider"></span>
                        </label>
                    </div>
                </div>
            </div>
            
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
                <button class="btn-admin-apply" onclick="window.applyAdminSettingsAndClose()">✅ Применить и закрыть</button>
                <button class="btn-admin-save" onclick="window.saveAdminSettingsOnly()">💾 Сохранить</button>
                <button class="btn-admin-reset" onclick="window.resetAdminSettings()">🔄 Сброс</button>
            </div>
            
            <div class="info-text">
                <i class="fas fa-sync-alt"></i> 
                <strong>После изменения нажмите "Применить и закрыть"</strong><br>
                Цифры зарплаты обновятся сразу на всех страницах!
            </div>
        </div>
    `;
    
    document.body.appendChild(panel);
    
    // Добавляем обработчики для实时 обновления预览
    const inputs = ['adminHourlyRate', 'adminLunchCost', 'adminNightBonus', 'adminOvertimePercent', 
                    'adminSaturdayPercent', 'adminSundayPercent', 'adminSaturdayFixedBonus', 'adminExtraBonus',
                    'adminSocialRate', 'adminHealthRate', 'adminTaxRate', 'adminNonTaxable',
                    'adminQualityBonusAmount', 'adminTransportBonusAmount', 'adminSeniorityBonusAmount'];
    
    inputs.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.addEventListener('change', updateAdminPreview);
    });
    
    document.getElementById('adminQualityBonusEnabled')?.addEventListener('change', updateAdminPreview);
    document.getElementById('adminTransportBonusEnabled')?.addEventListener('change', updateAdminPreview);
    document.getElementById('adminSeniorityBonusEnabled')?.addEventListener('change', updateAdminPreview);
    document.getElementById('adminRoundToCents')?.addEventListener('change', updateAdminPreview);
    document.getElementById('adminProgressiveTax')?.addEventListener('change', updateAdminPreview);
}

function updateAdminPreview() {
    // Собираем текущие значения
    adminSettings.hourlyRate = parseFloat(document.getElementById('adminHourlyRate')?.value || adminSettings.hourlyRate);
    adminSettings.lunchCost = parseFloat(document.getElementById('adminLunchCost')?.value || adminSettings.lunchCost);
    adminSettings.nightBonusPercent = parseFloat(document.getElementById('adminNightBonus')?.value || adminSettings.nightBonusPercent);
    adminSettings.overtimePercent = parseFloat(document.getElementById('adminOvertimePercent')?.value || adminSettings.overtimePercent);
    adminSettings.saturdayPercent = parseFloat(document.getElementById('adminSaturdayPercent')?.value || adminSettings.saturdayPercent);
    adminSettings.sundayPercent = parseFloat(document.getElementById('adminSundayPercent')?.value || adminSettings.sundayPercent);
    adminSettings.saturdayFixedBonus = parseFloat(document.getElementById('adminSaturdayFixedBonus')?.value || adminSettings.saturdayFixedBonus);
    adminSettings.extraBonus = parseFloat(document.getElementById('adminExtraBonus')?.value || adminSettings.extraBonus);
    adminSettings.socialRate = parseFloat(document.getElementById('adminSocialRate')?.value || adminSettings.socialRate * 100) / 100;
    adminSettings.healthRate = parseFloat(document.getElementById('adminHealthRate')?.value || adminSettings.healthRate * 100) / 100;
    adminSettings.taxRate = parseFloat(document.getElementById('adminTaxRate')?.value || adminSettings.taxRate * 100) / 100;
    adminSettings.nonTaxable = parseFloat(document.getElementById('adminNonTaxable')?.value || adminSettings.nonTaxable);
    adminSettings.qualityBonus.amount = parseFloat(document.getElementById('adminQualityBonusAmount')?.value || adminSettings.qualityBonus.amount);
    adminSettings.qualityBonus.enabled = document.getElementById('adminQualityBonusEnabled')?.checked || false;
    adminSettings.transportBonus.amount = parseFloat(document.getElementById('adminTransportBonusAmount')?.value || adminSettings.transportBonus.amount);
    adminSettings.transportBonus.enabled = document.getElementById('adminTransportBonusEnabled')?.checked || false;
    adminSettings.seniorityBonus.amount = parseFloat(document.getElementById('adminSeniorityBonusAmount')?.value || adminSettings.seniorityBonus.amount);
    adminSettings.seniorityBonus.enabled = document.getElementById('adminSeniorityBonusEnabled')?.checked || false;
    adminSettings.roundToCents = document.getElementById('adminRoundToCents')?.checked || false;
    adminSettings.progressiveTax = document.getElementById('adminProgressiveTax')?.checked || false;
}

// ПРИМЕНЕНИЕ И ЗАКРЫТИЕ
export function applyAdminSettingsAndClose() {
    updateAdminPreview();
    saveAdminSettings();
    applyAdminSettingsToGlobal();
    closeAdminPanel();
    showNotification('✅ Настройки применены! Зарплата пересчитана', 'success');
}

export function saveAdminSettingsOnly() {
    updateAdminPreview();
    saveAdminSettings();
}

export function openAdminPanel() {
    const panel = document.getElementById('adminPanel');
    if (panel) {
        // Обновляем все поля текущими значениями
        document.getElementById('adminHourlyRate').value = adminSettings.hourlyRate;
        document.getElementById('adminLunchCost').value = adminSettings.lunchCost;
        document.getElementById('adminNightBonus').value = adminSettings.nightBonusPercent;
        document.getElementById('adminOvertimePercent').value = adminSettings.overtimePercent;
        document.getElementById('adminSaturdayPercent').value = adminSettings.saturdayPercent;
        document.getElementById('adminSundayPercent').value = adminSettings.sundayPercent;
        document.getElementById('adminSaturdayFixedBonus').value = adminSettings.saturdayFixedBonus;
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
        
        panel.classList.add('open');
    }
}

export function closeAdminPanel() {
    const panel = document.getElementById('adminPanel');
    if (panel) panel.classList.remove('open');
}

export function resetAdminSettings() {
    if (confirm('Сбросить все настройки к стандартным?')) {
        adminSettings = {
            hourlyRate: BASE_RATE,
            lunchCost: LUNCH_COST_REAL,
            nightBonusPercent: NIGHT_BONUS_PERCENT,
            overtimePercent: 25,
            saturdayPercent: 50,
            sundayPercent: 100,
            saturdayFixedBonus: SATURDAY_BONUS,
            extraBonus: 25,
            socialRate: SOCIAL_RATE,
            healthRate: HEALTH_RATE,
            taxRate: TAX_RATE,
            nonTaxable: NON_TAXABLE,
            qualityBonus: { enabled: false, amount: 30 },
            transportBonus: { enabled: false, amount: 25 },
            seniorityBonus: { enabled: false, amount: 50 },
            customBonuses: [],
            roundToCents: true,
            progressiveTax: false
        };
        saveAdminSettings();
        applyAdminSettingsToGlobal();
        openAdminPanel();
        showNotification('🔄 Настройки сброшены', 'info');
    }
}

function showNotification(msg, type) {
    const notif = document.getElementById('notification');
    if (notif) {
        const msgSpan = document.getElementById('notificationMessage');
        if (msgSpan) msgSpan.textContent = msg;
        notif.classList.remove('hidden');
        setTimeout(() => notif.classList.add('hidden'), 3000);
    }
}

// Добавляем кнопку админ-панели
export function addAdminButton() {
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

// Глобальные функции
window.openAdminPanel = openAdminPanel;
window.closeAdminPanel = closeAdminPanel;
window.applyAdminSettingsAndClose = applyAdminSettingsAndClose;
window.saveAdminSettingsOnly = saveAdminSettingsOnly;
window.resetAdminSettings = resetAdminSettings;

export function initAdminPanel() {
    loadAdminSettings();
    createAdminPanel();
    addAdminButton();
}
