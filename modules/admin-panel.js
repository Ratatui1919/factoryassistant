// modules/admin-panel.js - НОВАЯ ВЕРСИЯ С БОНУСАМИ ЗА ПОСЕЩАЕМОСТЬ

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

let adminSettings = {
    // Основные ставки
    hourlyRate: 6.10,
    lunchCost: 1.31,
    
    // Коэффициенты в процентах
    nightBonusPercent: 20,
    overtimePercent: 25,
    saturdayPercent: 25,           // Суббота +25% = коэффициент 1.25
    sundayPercent: 100,             // Воскресенье +100% = коэффициент 2.0
    saturdayFixedBonus: 4.34,       // Stravené за субботу
    
    extraBonus: 25,                 // Бонус за надчас
    
    // Бонусы за посещаемость (Productivity)
    productivityBonus: {
        enabled: true,
        fullMonth: 20,      // 20% если был весь месяц
        partialMonth: 15,   // 15% если пропущено 1-4 дня
        lowMonth: 10        // 10% если пропущено 5+ дней
    },
    
    // Фиксированные бонусы
    attendanceBonus: 10,        // Attendance
    monthlyEvalBonus: 8,        // Monthly eval.
    doplatokBonus: 28.75,       // Doplatok
    
    // Налоги
    socialRate: 0.04,    // Пенсионный 4%
    healthRate: 0.04,    // Медицинский 4%
    socialSecRate: 0.03, // Соц.страх 3%
    disabilityRate: 0.01, // Инвалидность 1%
    unemploymentRate: 0.01, // Безработица 1%
    taxRate: 0.19,       // Налог на доход 19%
    nonTaxable: 410,
    
    // Дополнительные настройки
    roundToCents: true,
    progressiveTax: false,
    
    // Дополнительные бонусы (вкл/выкл)
    qualityBonus: { enabled: false, amount: 0 },
    transportBonus: { enabled: false, amount: 0 },
    seniorityBonus: { enabled: false, amount: 0 },
    customBonuses: []
};

// Загрузка и сохранение...
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
    console.log('Применяю админ-настройки:', adminSettings);
    
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
    showNotification('✅ Зарплата пересчитана!', 'success');
}

// Функция для расчёта бонуса продуктивности
export function calculateProductivityBonus(workDaysCount, totalMonthDays, regularHours, hourlyRate) {
    const missedDays = totalMonthDays - workDaysCount;
    let percent = 0;
    
    if (missedDays === 0) {
        percent = adminSettings.productivityBonus.fullMonth;
    } else if (missedDays <= 4) {
        percent = adminSettings.productivityBonus.partialMonth;
    } else {
        percent = adminSettings.productivityBonus.lowMonth;
    }
    
    const bonusAmount = (regularHours * hourlyRate) * (percent / 100);
    return { percent, bonusAmount, missedDays };
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
            hr { border-color: rgba(255,255,255,0.1); margin: 15px 0; }
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
                    <span class="admin-label">💰 Часовая ставка <small>6,10 € по умолчанию</small></span>
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
            
            <!-- Коэффициенты -->
            <div class="admin-section">
                <h3><i class="fas fa-percent"></i> Коэффициенты доплат</h3>
                <div class="admin-row">
                    <span class="admin-label">🌙 Ночная смена <small>доплата к ставке</small></span>
                    <div class="admin-value">
                        <input type="number" id="adminNightBonus" step="5" value="${adminSettings.nightBonusPercent}"> %
                    </div>
                </div>
                <div class="admin-row">
                    <span class="admin-label">⏱️ Переработка <small>доплата к ставке</small></span>
                    <div class="admin-value">
                        <input type="number" id="adminOvertimePercent" step="5" value="${adminSettings.overtimePercent}"> %
                    </div>
                </div>
                <div class="admin-row">
                    <span class="admin-label">📅 Суббота <small>доплата к ставке (25%)</small></span>
                    <div class="admin-value">
                        <input type="number" id="adminSaturdayPercent" step="5" value="${adminSettings.saturdayPercent}"> %
                    </div>
                </div>
                <div class="admin-row">
                    <span class="admin-label">📅 Воскресенье <small>доплата к ставке</small></span>
                    <div class="admin-value">
                        <input type="number" id="adminSundayPercent" step="10" value="${adminSettings.sundayPercent}"> %
                    </div>
                </div>
            </div>
            
            <!-- Бонусы -->
            <div class="admin-section">
                <h3><i class="fas fa-gift"></i> Бонусы</h3>
                <div class="admin-row">
                    <span class="admin-label">🍽️ Stravené за субботу <small>4,34 € за каждую субботу</small></span>
                    <div class="admin-value">
                        <input type="number" id="adminSaturdayFixedBonus" step="1" value="${adminSettings.saturdayFixedBonus}"> €
                    </div>
                </div>
                <div class="admin-row">
                    <span class="admin-label">⭐ Бонус за надчас <small>за каждые 2 блока</small></span>
                    <div class="admin-value">
                        <input type="number" id="adminExtraBonus" step="5" value="${adminSettings.extraBonus}"> €
                    </div>
                </div>
                <div class="admin-row">
                    <span class="admin-label">✅ Attendance <small>бонус за присутствие</small></span>
                    <div class="admin-value">
                        <input type="number" id="adminAttendanceBonus" step="5" value="${adminSettings.attendanceBonus}"> €
                    </div>
                </div>
                <div class="admin-row">
                    <span class="admin-label">📊 Monthly eval. <small>бонус за оценку</small></span>
                    <div class="admin-value">
                        <input type="number" id="adminMonthlyEvalBonus" step="5" value="${adminSettings.monthlyEvalBonus}"> €
                    </div>
                </div>
                <div class="admin-row">
                    <span class="admin-label">💰 Doplatok <small>дополнительный бонус</small></span>
                    <div class="admin-value">
                        <input type="number" id="adminDoplatokBonus" step="5" value="${adminSettings.doplatokBonus}"> €
                    </div>
                </div>
            </div>
            
            <!-- Бонус продуктивности -->
            <div class="admin-section">
                <h3><i class="fas fa-chart-line"></i> Бонус продуктивности (Productivity)</h3>
                <div class="admin-row">
                    <span class="admin-label">✅ Полный месяц (без пропусков)</span>
                    <div class="admin-value">
                        <input type="number" id="adminProdFullMonth" step="5" value="${adminSettings.productivityBonus.fullMonth}"> %
                    </div>
                </div>
                <div class="admin-row">
                    <span class="admin-label">⚠️ Пропущено 1-4 дня</span>
                    <div class="admin-value">
                        <input type="number" id="adminProdPartialMonth" step="5" value="${adminSettings.productivityBonus.partialMonth}"> %
                    </div>
                </div>
                <div class="admin-row">
                    <span class="admin-label">❌ Пропущено 5+ дней</span>
                    <div class="admin-value">
                        <input type="number" id="adminProdLowMonth" step="5" value="${adminSettings.productivityBonus.lowMonth}"> %
                    </div>
                </div>
            </div>
            
            <!-- Налоги -->
            <div class="admin-section">
                <h3><i class="fas fa-percent"></i> Налоги и отчисления (Словакия)</h3>
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
            
            <div class="admin-buttons">
                <button class="btn-admin-apply" onclick="window.applyAdminSettingsAndClose()">✅ Применить и закрыть</button>
                <button class="btn-admin-reset" onclick="window.resetAdminSettings()">🔄 Сброс</button>
            </div>
            
            <div class="info-text">
                <i class="fas fa-info-circle"></i> 
                <strong>Как считается бонус продуктивности:</strong><br>
                • Полный месяц: 20% от (обычные часы × ставка)<br>
                • Пропущено 1-4 дня: 15%<br>
                • Пропущено 5+ дней: 10%<br>
                • Суббота: +25% + Stravené 4,34 €
            </div>
        </div>
    `;
    
    document.body.appendChild(panel);
    
    // Добавляем обработчики
    const inputs = ['adminHourlyRate', 'adminLunchCost', 'adminNightBonus', 'adminOvertimePercent', 
                    'adminSaturdayPercent', 'adminSundayPercent', 'adminSaturdayFixedBonus', 'adminExtraBonus',
                    'adminAttendanceBonus', 'adminMonthlyEvalBonus', 'adminDoplatokBonus',
                    'adminProdFullMonth', 'adminProdPartialMonth', 'adminProdLowMonth',
                    'adminHealthRate', 'adminSocialRate', 'adminSocialSecRate', 'adminTaxRate', 'adminNonTaxable'];
    
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
    adminSettings.saturdayFixedBonus = parseFloat(document.getElementById('adminSaturdayFixedBonus')?.value || adminSettings.saturdayFixedBonus);
    adminSettings.extraBonus = parseFloat(document.getElementById('adminExtraBonus')?.value || adminSettings.extraBonus);
    adminSettings.attendanceBonus = parseFloat(document.getElementById('adminAttendanceBonus')?.value || adminSettings.attendanceBonus);
    adminSettings.monthlyEvalBonus = parseFloat(document.getElementById('adminMonthlyEvalBonus')?.value || adminSettings.monthlyEvalBonus);
    adminSettings.doplatokBonus = parseFloat(document.getElementById('adminDoplatokBonus')?.value || adminSettings.doplatokBonus);
    adminSettings.productivityBonus.fullMonth = parseFloat(document.getElementById('adminProdFullMonth')?.value || adminSettings.productivityBonus.fullMonth);
    adminSettings.productivityBonus.partialMonth = parseFloat(document.getElementById('adminProdPartialMonth')?.value || adminSettings.productivityBonus.partialMonth);
    adminSettings.productivityBonus.lowMonth = parseFloat(document.getElementById('adminProdLowMonth')?.value || adminSettings.productivityBonus.lowMonth);
    adminSettings.healthRate = parseFloat(document.getElementById('adminHealthRate')?.value || adminSettings.healthRate * 100) / 100;
    adminSettings.socialRate = parseFloat(document.getElementById('adminSocialRate')?.value || adminSettings.socialRate * 100) / 100;
    adminSettings.socialSecRate = parseFloat(document.getElementById('adminSocialSecRate')?.value || adminSettings.socialSecRate * 100) / 100;
    adminSettings.taxRate = parseFloat(document.getElementById('adminTaxRate')?.value || adminSettings.taxRate * 100) / 100;
    adminSettings.nonTaxable = parseFloat(document.getElementById('adminNonTaxable')?.value || adminSettings.nonTaxable);
}

export function applyAdminSettingsAndClose() {
    updateAdminPreview();
    saveAdminSettings();
    applyAdminSettingsToGlobal();
    closeAdminPanel();
}

export function openAdminPanel() {
    const panel = document.getElementById('adminPanel');
    if (panel) {
        document.getElementById('adminHourlyRate').value = adminSettings.hourlyRate;
        document.getElementById('adminLunchCost').value = adminSettings.lunchCost;
        document.getElementById('adminNightBonus').value = adminSettings.nightBonusPercent;
        document.getElementById('adminOvertimePercent').value = adminSettings.overtimePercent;
        document.getElementById('adminSaturdayPercent').value = adminSettings.saturdayPercent;
        document.getElementById('adminSundayPercent').value = adminSettings.sundayPercent;
        document.getElementById('adminSaturdayFixedBonus').value = adminSettings.saturdayFixedBonus;
        document.getElementById('adminExtraBonus').value = adminSettings.extraBonus;
        document.getElementById('adminAttendanceBonus').value = adminSettings.attendanceBonus;
        document.getElementById('adminMonthlyEvalBonus').value = adminSettings.monthlyEvalBonus;
        document.getElementById('adminDoplatokBonus').value = adminSettings.doplatokBonus;
        document.getElementById('adminProdFullMonth').value = adminSettings.productivityBonus.fullMonth;
        document.getElementById('adminProdPartialMonth').value = adminSettings.productivityBonus.partialMonth;
        document.getElementById('adminProdLowMonth').value = adminSettings.productivityBonus.lowMonth;
        document.getElementById('adminHealthRate').value = adminSettings.healthRate * 100;
        document.getElementById('adminSocialRate').value = adminSettings.socialRate * 100;
        document.getElementById('adminSocialSecRate').value = adminSettings.socialSecRate * 100;
        document.getElementById('adminTaxRate').value = adminSettings.taxRate * 100;
        document.getElementById('adminNonTaxable').value = adminSettings.nonTaxable;
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
            hourlyRate: 6.10,
            lunchCost: 1.31,
            nightBonusPercent: 20,
            overtimePercent: 25,
            saturdayPercent: 25,
            sundayPercent: 100,
            saturdayFixedBonus: 4.34,
            extraBonus: 25,
            attendanceBonus: 10,
            monthlyEvalBonus: 8,
            doplatokBonus: 28.75,
            productivityBonus: { fullMonth: 20, partialMonth: 15, lowMonth: 10 },
            healthRate: 0.04,
            socialRate: 0.04,
            socialSecRate: 0.03,
            disabilityRate: 0.01,
            unemploymentRate: 0.01,
            taxRate: 0.19,
            nonTaxable: 410,
            roundToCents: true,
            progressiveTax: false,
            qualityBonus: { enabled: false, amount: 0 },
            transportBonus: { enabled: false, amount: 0 },
            seniorityBonus: { enabled: false, amount: 0 },
            customBonuses: []
        };
        saveAdminSettings();
        applyAdminSettingsToGlobal();
        openAdminPanel();
        showNotification('🔄 Настройки сброшены!', 'info');
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

window.openAdminPanel = openAdminPanel;
window.closeAdminPanel = closeAdminPanel;
window.applyAdminSettingsAndClose = applyAdminSettingsAndClose;
window.resetAdminSettings = resetAdminSettings;

export function initAdminPanel() {
    loadAdminSettings();
    createAdminPanel();
    addAdminButton();
}
