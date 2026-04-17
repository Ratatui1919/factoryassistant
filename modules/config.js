// config.js - Система управления настройками с защитой паролем

// Настройки по умолчанию
const DEFAULT_SETTINGS = {
    // Основные коэффициенты
    baseRate: 15.0,           // базовая ставка €/час
    nightMultiplier: 1.35,    // ночной коэффициент (35% доплаты)
    sundayMultiplier: 1.50,   // воскресный коэффициент
    saturdayBonus: 5.0,       // фиксированная доплата за субботу €/час
    
    // Бонусы
    fixedBonusEnabled: true,   // включен ли бонус 25€
    fixedBonusAmount: 25.0,    // сумма фиксированного бонуса
    
    // Дополнительные настройки
    overtimeThreshold: 40,     // порог overtime (часов в неделю)
    overtimeMultiplier: 1.5,   // коэффициент за overtime
    
    // Налоги и вычеты
    taxRate: 0.20,            // налог 20%
    socialSecurityRate: 0.10, // соцстрах 10%
    
    // Специальные доплаты
    hazardousWorkBonus: 0,     // доплата за вредность €/час (0 - отключено)
    transportAllowance: 0      // транспортные €/день
};

// Функция для проверки пароля
function checkAdminPassword(inputPassword) {
    // ИЗМЕНИТЕ ЭТОТ ПАРОЛЬ НА СВОЙ!
    const ADMIN_PASSWORD = "YourStrongPassword123";
    return inputPassword === ADMIN_PASSWORD;
}

// Получить текущие настройки
function getSettings() {
    const saved = localStorage.getItem('factoryAssistantSettings');
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

// Сохранить настройки (только после проверки пароля)
function saveSettings(newSettings, password) {
    if (!checkAdminPassword(password)) {
        throw new Error('Неверный пароль! Доступ запрещён.');
    }
    
    // Валидация данных
    const validated = {};
    for (let key in DEFAULT_SETTINGS) {
        if (newSettings[key] !== undefined) {
            if (typeof DEFAULT_SETTINGS[key] === 'number') {
                validated[key] = parseFloat(newSettings[key]) || DEFAULT_SETTINGS[key];
            } else if (typeof DEFAULT_SETTINGS[key] === 'boolean') {
                validated[key] = Boolean(newSettings[key]);
            } else {
                validated[key] = newSettings[key];
            }
        }
    }
    
    localStorage.setItem('factoryAssistantSettings', JSON.stringify(validated));
    return validated;
}

// Сбросить настройки на стандартные (требует пароль)
function resetToDefaults(password) {
    if (!checkAdminPassword(password)) {
        throw new Error('Неверный пароль!');
    }
    localStorage.setItem('factoryAssistantSettings', JSON.stringify(DEFAULT_SETTINGS));
    return DEFAULT_SETTINGS;
}

// Функция для расчёта зарплаты (используйте её в index.html)
function calculateSalary(hoursData, settings = null) {
    const config = settings || getSettings();
    
    // hoursData должен содержать:
    // {
    //   normalHours: 40,
    //   saturdayHours: 8,
    //   sundayHours: 0,
    //   nightHours: 0,
    //   hazardousHours: 0,
    //   daysWorked: 20
    // }
    
    let total = 0;
    
    // Обычные часы
    total += hoursData.normalHours * config.baseRate;
    
    // Субботы (фиксированная доплата)
    total += hoursData.saturdayHours * (config.baseRate + config.saturdayBonus);
    
    // Воскресенья (повышенный коэффициент)
    total += hoursData.sundayHours * config.baseRate * config.sundayMultiplier;
    
    // Ночные часы
    total += hoursData.nightHours * config.baseRate * config.nightMultiplier;
    
    // Вредность
    if (config.hazardousWorkBonus > 0) {
        total += hoursData.hazardousHours * config.hazardousWorkBonus;
    }
    
    // Транспортные
    if (config.transportAllowance > 0) {
        total += hoursData.daysWorked * config.transportAllowance;
    }
    
    // Overtime (если обычные часы больше порога)
    if (hoursData.normalHours > config.overtimeThreshold) {
        const overtime = hoursData.normalHours - config.overtimeThreshold;
        total += overtime * config.baseRate * (config.overtimeMultiplier - 1);
    }
    
    // Фиксированный бонус
    if (config.fixedBonusEnabled) {
        total += config.fixedBonusAmount;
    }
    
    // Вычет налогов
    const tax = total * config.taxRate;
    const socialSecurity = total * config.socialSecurityRate;
    
    return {
        gross: total,
        tax: tax,
        socialSecurity: socialSecurity,
        net: total - tax - socialSecurity,
        details: {
            ...hoursData,
            rates: {
                base: config.baseRate,
                saturdayBonus: config.saturdayBonus,
                sundayMultiplier: config.sundayMultiplier,
                nightMultiplier: config.nightMultiplier
            }
        }
    };
}
