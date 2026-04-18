// modules/admin-panel.js - ПОЛНАЯ ВЕРСИЯ (с переключателями бонусов и защитой)

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

// ===== ПАРОЛЬ ДЛЯ ВХОДА (СМЕНИТЕ НА СВОЙ!) =====
const ADMIN_PASSWORD = "Vaillant2024";

let isAdminAuthenticated = false;

// ===== НАСТРОЙКИ ПО УМОЛЧАНИЮ =====
let adminSettings = {
    // Основные ставки
    hourlyRate: 6.10,
    lunchCost: 1.31,
    
    // Коэффициенты в процентах
    nightBonusPercent: 20,
    overtimePercent: 25,
    saturdayPercent: 25,
    sundayPercent: 100,
    
    // Надчасы (extra blocks)
    extraBlockHours: 3.5,        // Фактических часов в одном надчасе
    extraBlockPaidHours: 7.5,    // Сколько засчитывается в табель
    extraBlockBonus: 25,         // Бонус за 2 надчаса
    
    // БОНУСЫ (каждый можно включить/выключить)
    straveneBonus: { enabled: true, amount: 4.34 },      // Stravené за субботу
    attendanceBonus: { enabled: true, amount: 10 },      // Attendance
    monthlyEvalBonus: { enabled: true, amount: 8 },      // Monthly eval.
    doplatokBonus: { enabled: true, amount: 28.75 },     // Doplatok
    
    // Бонус продуктивности
    productivityBonus: { 
        enabled: true,
        fullMonth: 20,      // Полный месяц - 20%
        partialMonth: 15,   // Пропущено 1-4 дня - 15%
        lowMonth: 10        // Пропущено 5+ дней - 10%
    },
    
    // Налоги
    healthRate: 0.04,        // Медицинский 4%
    socialRate: 0.04,        // Пенсионный 4%
    socialSecRate: 0.03,     // Социальный 3%
    taxRate: 0.19,           // Налог на доход 19%
    nonTaxable: 410,
    
    roundToCents: true,
    progressiveTax: false,
    customBonuses: []
};

// ===== ЗАГРУЗКА И СОХРАНЕНИЕ =====
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

export function saveAdminSettings() {
    localStorage.setItem('adminSalarySettings', JSON.stringify(adminSettings));
    showNotification('⚙️ Настройки сохранены', 'success');
}

export function applyAdminSettingsToGlobal() {
    const hourlyRateInput = document.getElementById('hourlyRate');
    if (hourlyRateInput) hourlyRateInput.value = adminSettings.hourlyRate;
    
    const lunchCostInput = document.getElementById('lunchCost');
    if (lunchCostInput) lunchCostInput.value = adminSettings.lunchCost;
    
    localStorage.setItem('adminSalarySettings', JSON.stringify(adminSettings));
    forceUpdateAllData();
}

function forceUpdateAllData() {
    if (window.updateDashboard) window.updateDashboard();
    if (window.buildCalendar) window.buildCalendar();
    if (window.calculateAllStats) window.calculateAllStats();
    if (window.updateFinanceStats) window.updateFinanceStats();
}

// ===== ПРОВЕРКА ПАРОЛЯ =====
export function checkAdminPassword(password) {
    return password === ADMIN_PASSWORD;
}

// ===== МОДАЛКА ВВОДА ПАРОЛЯ =====
function showPasswordModal() {
    const modal = document.createElement('div');
    modal.id = 'adminPasswordModal';
    modal.innerHTML = `
        <style>
            #adminPasswordModal {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0,0,0,0.95);
                z-index: 10000000;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            .password-container {
                background: var(--dark-card, #1e293b);
                border-radius: 24px;
                padding: 30px 25px;
                width: 300px;
                text-align: center;
                border: 2px solid var(--primary, #00b060);
            }
            .password-container i { font-size: 50px; color: var(--primary, #00b060); margin-bottom: 15px; }
            .password-container h3 { color: var(--text, #fff); margin-bottom: 20px; }
            .password-container input {
                width: 100%;
                padding: 12px;
                border-radius: 12px;
                border: 1px solid var(--border, #334155);
                background: var(--bg-color, #0f172a);
                color: var(--text, #fff);
                font-size: 16px;
                text-align: center;
                margin-bottom: 15px;
            }
            .password-container input:focus {
                outline: none;
                border-color: var(--primary, #00b060);
            }
            .password-container button {
                width: 100%;
                padding: 12px;
                border: none;
                border-radius: 12px;
                font-weight: 600;
                cursor: pointer;
                margin-bottom: 10px;
            }
            .btn-password-submit { background: var(--primary, #00b060); color: white; }
            .btn-password-cancel { background: #ef4444; color: white; }
            .error-message { color: #ef4444; font-size: 12px; margin-top: 10px; display: none; }
        </style>
        <div class="password-container">
            <i class="fas fa-lock"></i>
            <h3>Введите пароль</h3>
            <input type="password" id="adminPasswordInput" placeholder="Пароль" autocomplete="off">
            <button class="btn-password-submit" onclick="window.submitAdminPassword()">Войти</button>
            <button class="btn-password-cancel" onclick="window.closePasswordModal()">Отмена</button>
            <div class="error-message" id="passwordError">Неверный пароль!</div>
        </div>
    `;
    document.body.appendChild(modal);
    
    window.submitAdminPassword = () => {
        const input = document.getElementById('adminPasswordInput');
        const error = document.getElementById('passwordError');
        if (checkAdminPassword(input.value)) {
            isAdminAuthenticated = true;
            closePasswordModal();
            showAdminPanelContent();
        } else {
            error.style.display = 'block';
            input.value = '';
            input.focus();
        }
    };
    
    window.closePasswordModal = () => {
        const modal = document.getElementById('adminPasswordModal');
        if (modal) modal.remove();
    };
    
    document.getElementById('adminPasswordInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') window.submitAdminPassword();
    });
}

// ===== ОТКРЫТИЕ АДМИН-ПАНЕЛИ =====
export function openAdminPanel() {
    if (isAdminAuthenticated) {
        showAdminPanelContent();
    } else {
        showPasswordModal();
    }
}

// ===== ПОКАЗ СОДЕРЖИМОГО АДМИН-ПАНЕЛИ =====
function showAdminPanelContent() {
    let panel = document.getElementById('adminPanel');
    if (!panel) {
        createAdminPanel();
        panel = document.getElementById('adminPanel');
    }
    
    // Обновляем все поля текущими значениями
    document.getElementById('adminHourlyRate').value = adminSettings.hourlyRate;
    document.getElementById('adminLunchCost').value = adminSettings.lunchCost;
    document.getElementById('adminNightBonus').value = adminSettings.nightBonusPercent;
    document.getElementById('adminOvertimePercent').value = adminSettings.overtimePercent;
    document.getElementById('adminSaturdayPercent').value = adminSettings.saturdayPercent;
    document.getElementById('adminSundayPercent').value = adminSettings.sundayPercent;
    document.getElementById('adminExtraBlockHours').value = adminSettings.extraBlockHours;
    document.getElementById('adminExtraBlockBonus').value = adminSettings.extraBlockBonus;
    
    document.getElementById('straveneEnabled').checked = adminSettings.straveneBonus.enabled;
    document.getElementById('straveneAmount').value = adminSettings.straveneBonus.amount;
    document.getElementById('attendanceEnabled').checked = adminSettings.attendanceBonus.enabled;
    document.getElementById('attendanceAmount').value = adminSettings.attendanceBonus.amount;
    document.getElementById('monthlyEvalEnabled').checked = adminSettings.monthlyEvalBonus.enabled;
    document.getElementById('monthlyEvalAmount').value = adminSettings.monthlyEvalBonus.amount;
    document.getElementById('doplatokEnabled').checked = adminSettings.doplatokBonus.enabled;
    document.getElementById('doplatokAmount').value = adminSettings.doplatokBonus.amount;
    document.getElementById('productivityEnabled').checked = adminSettings.productivityBonus.enabled;
    document.getElementById('prodFullMonth').value = adminSettings.productivityBonus.fullMonth;
    document.getElementById('prodPartialMonth').value = adminSettings.productivityBonus.partialMonth;
    document.getElementById('prodLowMonth').value = adminSettings.productivityBonus.lowMonth;
    
    document.getElementById('adminHealthRate').value = adminSettings.healthRate * 100;
    document.getElementById('adminSocialRate').value = adminSettings.socialRate * 100;
    document.getElementById('adminSocialSecRate').value = adminSettings.socialSecRate * 100;
    document.getElementById('adminTaxRate').value = adminSettings.taxRate * 100;
    document.getElementById('adminNonTaxable').value = adminSettings.nonTaxable;
    document.getElementById('adminRoundToCents').checked = adminSettings.roundToCents;
    document.getElementById('adminProgressiveTax').checked = adminSettings.progressiveTax;
    
    panel.classList.add('open');
}

// ===== СОЗДАНИЕ АДМИН-ПАНЕЛИ =====
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
            .admin-header h2 i { color: #fbbf24; margin-right: 8px; }
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
                width: 80px;
                padding: 6px 10px;
                border-radius: 8px;
                border: 1px solid var(--border, #334155);
                background: var(--bg-color, #0f172a);
                color: var(--text, #fff);
                text-align: center;
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
            .btn-admin-apply { background: var(--primary, #00b060); color: white; }
            .btn-admin-reset { background: #ef4444; color: white; }
            .info-text {
                font-size: 11px;
                text-align: center;
                color: #64748b;
                margin-top: 20px;
                padding: 12px;
                background: rgba(0,0,0,0.3);
                border-radius: 12px;
            }
            .bonus-badge {
                background: rgba(0,176,96,0.2);
                padding: 2px 8px;
                border-radius: 12px;
                font-size: 0.7rem;
                color: #00b060;
            }
            hr { border-color: rgba(255,255,255,0.1); margin: 15px 0; }
        </style>
        
        <div class="admin-container">
            <div class="admin-header">
                <h2><i class="fas fa-crown"></i> Админ-панель <span class="bonus-badge"><i class="fas fa-lock"></i> Защищено</span></h2>
                <button class="admin-close" onclick="window.closeAdminPanel()">✕</button>
            </div>
            
            <!-- Основные ставки -->
            <div class="admin-section">
                <h3><i class="fas fa-euro-sign"></i> Основные ставки</h3>
                <div class="admin-row">
                    <span class="admin-label">💰 Часовая ставка</span>
                    <div class="admin-value">
                        <input type="number" id="adminHourlyRate" step="0.01" value="${adminSettings.hourlyRate}"> €
                    </div>
                </div>
                <div class="admin-row">
                    <span class="admin-label">🍽️ Стоимость обеда</span>
                    <div class="admin-value">
                        <input type="number" id="adminLunchCost" step="0.01" value="${adminSettings.lunchCost}"> €
                    </div>
                </div>
            </div>
            
            <!-- Коэффициенты -->
            <div class="admin-section">
                <h3><i class="fas fa-percent"></i> Коэффициенты доплат</h3>
                <div class="admin-row">
                    <span class="admin-label">🌙 Ночная смена</span>
                    <div class="admin-value">
                        <input type="number" id="adminNightBonus" step="5" value="${adminSettings.nightBonusPercent}"> %
                    </div>
                </div>
                <div class="admin-row">
                    <span class="admin-label">⏱️ Переработка (Overtime)</span>
                    <div class="admin-value">
                        <input type="number" id="adminOvertimePercent" step="5" value="${adminSettings.overtimePercent}"> %
                    </div>
                </div>
                <div class="admin-row">
                    <span class="admin-label">📅 Суббота</span>
                    <div class="admin-value">
                        <input type="number" id="adminSaturdayPercent" step="5" value="${adminSettings.saturdayPercent}"> %
                    </div>
                </div>
                <div class="admin-row">
                    <span class="admin-label">📅 Воскресенье</span>
                    <div class="admin-value">
                        <input type="number" id="adminSundayPercent" step="10" value="${adminSettings.sundayPercent}"> %
                    </div>
                </div>
            </div>
            
            <!-- Надчасы -->
            <div class="admin-section">
                <h3><i class="fas fa-clock"></i> Надчасы (Extra blocks)</h3>
                <div class="admin-row">
                    <span class="admin-label">⏰ Фактических часов в надчасе</span>
                    <div class="admin-value">
                        <input type="number" id="adminExtraBlockHours" step="0.5" value="${adminSettings.extraBlockHours}"> ч
                    </div>
                </div>
                <div class="admin-row">
                    <span class="admin-label">💰 Бонус за 2 надчаса</span>
                    <div class="admin-value">
                        <input type="number" id="adminExtraBlockBonus" step="5" value="${adminSettings.extraBlockBonus}"> €
                    </div>
                </div>
            </div>
            
            <!-- Бонусы с переключателями -->
            <div class="admin-section">
                <h3><i class="fas fa-gift"></i> Бонусы</h3>
                
                <div class="admin-row">
                    <span class="admin-label">🍽️ Stravené за субботу <small>4,34 € за каждую субботу</small></span>
                    <div class="admin-value">
                        <input type="number" id="straveneAmount" step="1" value="${adminSettings.straveneBonus.amount}" style="width: 70px;"> €
                        <label class="admin-toggle">
                            <input type="checkbox" id="straveneEnabled" ${adminSettings.straveneBonus.enabled ? 'checked' : ''}>
                            <span class="toggle-slider"></span>
                        </label>
                    </div>
                </div>
                
                <div class="admin-row">
                    <span class="admin-label">✅ Attendance <small>бонус за присутствие</small></span>
                    <div class="admin-value">
                        <input type="number" id="attendanceAmount" step="5" value="${adminSettings.attendanceBonus.amount}" style="width: 70px;"> €
                        <label class="admin-toggle">
                            <input type="checkbox" id="attendanceEnabled" ${adminSettings.attendanceBonus.enabled ? 'checked' : ''}>
                            <span class="toggle-slider"></span>
                        </label>
                    </div>
                </div>
                
                <div class="admin-row">
                    <span class="admin-label">📊 Monthly eval. <small>бонус за оценку</small></span>
                    <div class="admin-value">
                        <input type="number" id="monthlyEvalAmount" step="5" value="${adminSettings.monthlyEvalBonus.amount}" style="width: 70px;"> €
                        <label class="admin-toggle">
                            <input type="checkbox" id="monthlyEvalEnabled" ${adminSettings.monthlyEvalBonus.enabled ? 'checked' : ''}>
                            <span class="toggle-slider"></span>
                        </label>
                    </div>
                </div>
                
                <div class="admin-row">
                    <span class="admin-label">💰 Doplatok <small>дополнительный бонус</small></span>
                    <div class="admin-value">
                        <input type="number" id="doplatokAmount" step="5" value="${adminSettings.doplatokBonus.amount}" style="width: 70px;"> €
                        <label class="admin-toggle">
                            <input type="checkbox" id="doplatokEnabled" ${adminSettings.doplatokBonus.enabled ? 'checked' : ''}>
                            <span class="toggle-slider"></span>
                        </label>
                    </div>
                </div>
            </div>
            
            <!-- Бонус продуктивности -->
            <div class="admin-section">
                <h3><i class="fas fa-chart-line"></i> Бонус продуктивности</h3>
                <div class="admin-row">
                    <span class="admin-label">📊 Включить бонус</span>
                    <label class="admin-toggle">
                        <input type="checkbox" id="productivityEnabled" ${adminSettings.productivityBonus.enabled ? 'checked' : ''}>
                        <span class="toggle-slider"></span>
                    </label>
                </div>
                <div class="admin-row">
                    <span class="admin-label">✅ Полный месяц (без пропусков)</span>
                    <div class="admin-value">
                        <input type="number" id="prodFullMonth" step="5" value="${adminSettings.productivityBonus.fullMonth}"> %
                    </div>
                </div>
                <div class="admin-row">
                    <span class="admin-label">⚠️ Пропущено 1-4 дня</span>
                    <div class="admin-value">
                        <input type="number" id="prodPartialMonth" step="5" value="${adminSettings.productivityBonus.partialMonth}"> %
                    </div>
                </div>
                <div class="admin-row">
                    <span class="admin-label">❌ Пропущено 5+ дней</span>
                    <div class="admin-value">
                        <input type="number" id="prodLowMonth" step="5" value="${adminSettings.productivityBonus.lowMonth}"> %
                    </div>
                </div>
            </div>
            
            <!-- Налоги -->
            <div class="admin-section">
                <h3><i class="fas fa-percent"></i> Налоги</h3>
                <div class="admin-row">
                    <span class="admin-label">🏥 Медицинский налог</span>
                    <div class="admin-value">
                        <input type="number" id="adminHealthRate" step="0.5" value="${adminSettings.healthRate * 100}"> %
                    </div>
                </div>
                <div class="admin-row">
                    <span class="admin-label">💰 Пенсионный налог</span>
                    <div class="admin-value">
                        <input type="number" id="adminSocialRate" step="0.5" value="${adminSettings.socialRate * 100}"> %
                    </div>
                </div>
                <div class="admin-row">
                    <span class="admin-label">📊 Социальный налог</span>
                    <div class="admin-value">
                        <input type="number" id="adminSocialSecRate" step="0.5" value="${adminSettings.socialSecRate * 100}"> %
                    </div>
                </div>
                <div class="admin-row">
                    <span class="admin-label">📊 Налог на доход</span>
                    <div class="admin-value">
                        <input type="number" id="adminTaxRate" step="1" value="${adminSettings.taxRate * 100}"> %
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
                <button class="btn-admin-reset" onclick="window.resetAdminSettings()">🔄 Сброс</button>
            </div>
            
            <div class="info-text">
                <i class="fas fa-info-circle"></i> 
                <strong>Ваши данные за март:</strong><br>
                • 15 обычных дней × 7,5ч = 112,5ч<br>
                • 1 суббота × 7,5ч = 7,5ч (+25% + 4,34€)<br>
                • 7 надчасов × 3,5ч = 24,5ч (засчитывается как 7,5ч каждый)<br>
                <strong>Всего в табеле: 172,5 часов</strong>
            </div>
        </div>
    `;
    
    document.body.appendChild(panel);
    
    // Добавляем обработчики
    const inputs = ['adminHourlyRate', 'adminLunchCost', 'adminNightBonus', 'adminOvertimePercent', 
                    'adminSaturdayPercent', 'adminSundayPercent', 'adminExtraBlockHours', 'adminExtraBlockBonus',
                    'straveneAmount', 'attendanceAmount', 'monthlyEvalAmount', 'doplatokAmount',
                    'prodFullMonth', 'prodPartialMonth', 'prodLowMonth',
                    'adminHealthRate', 'adminSocialRate', 'adminSocialSecRate', 'adminTaxRate', 'adminNonTaxable',
                    'adminRoundToCents', 'adminProgressiveTax',
                    'straveneEnabled', 'attendanceEnabled', 'monthlyEvalEnabled', 'doplatokEnabled', 'productivityEnabled'];
    
    inputs.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.addEventListener('change', updateAdminPreview);
    });
}

function updateAdminPreview() {
    adminSettings.hourlyRate = parseFloat(document.getElementById('adminHourlyRate')?.value || adminSettings.hourlyRate);
    adminSettings.lunchCost = parseFloat(document.getElementById('adminLunchCost')?.value || adminSettings.lunchCost);
    adminSettings.nightBonusPercent = parseFloat(document.getElementById('adminNightBonus')?.value || adminSettings.nightBonusPercent);
    adminSettings.overtimePercent = parseFloat(document.getElementById('adminOvertimePercent')?.value || adminSettings.overtimePercent);
    adminSettings.saturdayPercent = parseFloat(document.getElementById('adminSaturdayPercent')?.value || adminSettings.saturdayPercent);
    adminSettings.sundayPercent = parseFloat(document.getElementById('adminSundayPercent')?.value || adminSettings.sundayPercent);
    adminSettings.extraBlockHours = parseFloat(document.getElementById('adminExtraBlockHours')?.value || adminSettings.extraBlockHours);
    adminSettings.extraBlockBonus = parseFloat(document.getElementById('adminExtraBlockBonus')?.value || adminSettings.extraBlockBonus);
    
    adminSettings.straveneBonus.amount = parseFloat(document.getElementById('straveneAmount')?.value || adminSettings.straveneBonus.amount);
    adminSettings.straveneBonus.enabled = document.getElementById('straveneEnabled')?.checked || false;
    adminSettings.attendanceBonus.amount = parseFloat(document.getElementById('attendanceAmount')?.value || adminSettings.attendanceBonus.amount);
    adminSettings.attendanceBonus.enabled = document.getElementById('attendanceEnabled')?.checked || false;
    adminSettings.monthlyEvalBonus.amount = parseFloat(document.getElementById('monthlyEvalAmount')?.value || adminSettings.monthlyEvalBonus.amount);
    adminSettings.monthlyEvalBonus.enabled = document.getElementById('monthlyEvalEnabled')?.checked || false;
    adminSettings.doplatokBonus.amount = parseFloat(document.getElementById('doplatokAmount')?.value || adminSettings.doplatokBonus.amount);
    adminSettings.doplatokBonus.enabled = document.getElementById('doplatokEnabled')?.checked || false;
    adminSettings.productivityBonus.enabled = document.getElementById('productivityEnabled')?.checked || false;
    adminSettings.productivityBonus.fullMonth = parseFloat(document.getElementById('prodFullMonth')?.value || adminSettings.productivityBonus.fullMonth);
    adminSettings.productivityBonus.partialMonth = parseFloat(document.getElementById('prodPartialMonth')?.value || adminSettings.productivityBonus.partialMonth);
    adminSettings.productivityBonus.lowMonth = parseFloat(document.getElementById('prodLowMonth')?.value || adminSettings.productivityBonus.lowMonth);
    
    adminSettings.healthRate = parseFloat(document.getElementById('adminHealthRate')?.value || adminSettings.healthRate * 100) / 100;
    adminSettings.socialRate = parseFloat(document.getElementById('adminSocialRate')?.value || adminSettings.socialRate * 100) / 100;
    adminSettings.socialSecRate = parseFloat(document.getElementById('adminSocialSecRate')?.value || adminSettings.socialSecRate * 100) / 100;
    adminSettings.taxRate = parseFloat(document.getElementById('adminTaxRate')?.value || adminSettings.taxRate * 100) / 100;
    adminSettings.nonTaxable = parseFloat(document.getElementById('adminNonTaxable')?.value || adminSettings.nonTaxable);
    adminSettings.roundToCents = document.getElementById('adminRoundToCents')?.checked || false;
    adminSettings.progressiveTax = document.getElementById('adminProgressiveTax')?.checked || false;
}

// ===== ПРИМЕНЕНИЕ И ЗАКРЫТИЕ =====
export function applyAdminSettingsAndClose() {
    updateAdminPreview();
    saveAdminSettings();
    applyAdminSettingsToGlobal();
    closeAdminPanel();
    showNotification('✅ Настройки применены! Зарплата пересчитана', 'success');
}

export function closeAdminPanel() {
    const panel = document.getElementById('adminPanel');
    if (panel) panel.classList.remove('open');
}

export function resetAdminSettings() {
    if (confirm('Сбросить все настройки к стандартным?')) {
        adminSettings = {
            hourlyRate: 6.10,
            lunchCost: 1.31,
            nightBonusPercent: 20,
            overtimePercent: 25,
            saturdayPercent: 25,
            sundayPercent: 100,
            extraBlockHours: 3.5,
            extraBlockPaidHours: 7.5,
            extraBlockBonus: 25,
            straveneBonus: { enabled: true, amount: 4.34 },
            attendanceBonus: { enabled: true, amount: 10 },
            monthlyEvalBonus: { enabled: true, amount: 8 },
            doplatokBonus: { enabled: true, amount: 28.75 },
            productivityBonus: { enabled: true, fullMonth: 20, partialMonth: 15, lowMonth: 10 },
            healthRate: 0.04,
            socialRate: 0.04,
            socialSecRate: 0.03,
            taxRate: 0.19,
            nonTaxable: 410,
            roundToCents: true,
            progressiveTax: false,
            customBonuses: []
        };
        saveAdminSettings();
        applyAdminSettingsToGlobal();
        showNotification('🔄 Настройки сброшены к стандартным!', 'info');
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

// Глобальные функции для вызова из HTML
window.openAdminPanel = openAdminPanel;
window.closeAdminPanel = closeAdminPanel;
window.applyAdminSettingsAndClose = applyAdminSettingsAndClose;
window.resetAdminSettings = resetAdminSettings;

export function initAdminPanel() {
    loadAdminSettings();
    createAdminPanel();
    addAdminButton();
}
