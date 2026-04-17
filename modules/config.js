// modules/config.js - Центральное хранилище всех настроек

// Базовые настройки по умолчанию (словацкие правила 2026)
const DEFAULT_SETTINGS = {
    // --- Ставки и часы ---
    baseRate: 6.10,              // базовая ставка €/час
    shiftHours: 7.5,             // часов в смене
    nightBonusPercent: 20,       // ночная доплата (%)
    saturdayCoeff: 1.5,          // коэффициент субботы
    sundayCoeff: 2.0,            // коэффициент воскресенья
    extraBonus: 25,              // бонус за надчас (€)
    fixedBonusEnabled: true,     // бонус 25€ за субботу (вкл/выкл)
    overtimeCoeff: 1.5,          // коэффициент переработки
    
    // --- Расходы ---
    lunchCost: 1.31,             // обед в день (€)
    sickPayPercent: 60,          // оплата больничного (%)
    vacationPayPercent: 100,     // оплата отпуска (%)
    
    // --- Налоги и отчисления (Словакия 2026) ---
    socialInsurance: 9.4,        // социальное страхование (%)
    healthInsurance: 5.0,        // медицинское страхование (%)
    taxBaseRate: 19,             // базовая ставка налога (%)
    taxHighRate: 25,             // повышенная ставка (%)
    taxHighThreshold: 5000,      // порог для повышенной ставки (€ gross monthly)
    nonTaxablePart: 497.23,      // необлагаемая часть (€)
    
    // --- Доп. настройки ---
    defaultCurrency: "EUR",
    exchangeRate: 42.50,
    enableWeatherEffects: true
};

// Загружаем настройки из localStorage
export function getSystemSettings() {
    const saved = localStorage.getItem('vaillant_system_settings');
    if (saved) {
        try {
            return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
        } catch(e) {
            console.error('Ошибка загрузки настроек', e);
            return DEFAULT_SETTINGS;
        }
    }
    return DEFAULT_SETTINGS;
}

// Сохраняем настройки (только для админа)
export function saveSystemSettings(newSettings, password) {
    // Пароль проверяется в admin.html, здесь просто сохраняем
    const merged = { ...getSystemSettings(), ...newSettings };
    localStorage.setItem('vaillant_system_settings', JSON.stringify(merged));
    // Триггерим событие для обновления других вкладок
    window.dispatchEvent(new StorageEvent('storage', {
        key: 'vaillant_system_settings',
        newValue: JSON.stringify(merged)
    }));
    return merged;
}

// Сброс на стандарт
export function resetSystemSettings() {
    localStorage.setItem('vaillant_system_settings', JSON.stringify(DEFAULT_SETTINGS));
    window.dispatchEvent(new StorageEvent('storage', {
        key: 'vaillant_system_settings',
        newValue: JSON.stringify(DEFAULT_SETTINGS)
    }));
    return DEFAULT_SETTINGS;
}

// Применить настройки к полям профиля (вызывается в index.html)
export function applySettingsToProfile() {
    const settings = getSystemSettings();
    
    const fields = {
        hourlyRate: settings.baseRate,
        nightBonus: settings.nightBonusPercent,
        saturdayBonus: settings.saturdayCoeff,
        sundayBonus: settings.sundayCoeff,
        extraBonus: settings.extraBonus,
        lunchCost: settings.lunchCost
    };
    
    for (const [id, value] of Object.entries(fields)) {
        const el = document.getElementById(id);
        if (el) el.value = value;
    }
    
    console.log('✅ Настройки применены к профилю');
}

// Расчёт чистой зарплаты по словацким правилам
export function calculateNetSalary(grossMonthly, settings = null) {
    const cfg = settings || getSystemSettings();
    
    // 1. Отчисления
    const social = grossMonthly * (cfg.socialInsurance / 100);
    const health = grossMonthly * (cfg.healthInsurance / 100);
    const totalDeductions = social + health;
    
    // 2. База для налога
    let taxBase = grossMonthly - totalDeductions;
    let nonTaxable = cfg.nonTaxablePart;
    
    // Корректировка необлагаемой части при высоком доходе
    if (grossMonthly > 2000) {
        const reduction = Math.floor((grossMonthly - 2000) / 500) * 20;
        nonTaxable = Math.max(0, cfg.nonTaxablePart - reduction);
    }
    
    const taxableAmount = Math.max(0, taxBase - nonTaxable);
    
    // 3. Налог
    let tax = taxableAmount * (cfg.taxBaseRate / 100);
    if (grossMonthly > cfg.taxHighThreshold) {
        const highPart = grossMonthly - cfg.taxHighThreshold;
        const highTax = highPart * ((cfg.taxHighRate - cfg.taxBaseRate) / 100);
        tax += highTax;
    }
    
    const netSalary = grossMonthly - totalDeductions - tax;
    
    return {
        gross: grossMonthly,
        social: social,
        health: health,
        totalDeductions: totalDeductions,
        taxBase: taxBase,
        nonTaxable: nonTaxable,
        taxableAmount: taxableAmount,
        tax: tax,
        net: netSalary
    };
}
