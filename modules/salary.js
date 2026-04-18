// js/salary.js - РАСЧЕТ ЗАРПЛАТЫ

// Константы
export const BASE_RATE = 6.10;
export const LUNCH_COST_REAL = 1.31;
export const SATURDAY_BONUS = 25;
export const NIGHT_BONUS_PERCENT = 20;
export const SOCIAL_RATE = 0.094;
export const HEALTH_RATE = 0.10;
export const TAX_RATE = 0.19;
export const NON_TAXABLE = 410;

// Замените существующую функцию calculateDayEarnings на эту:

export function calculateDayEarnings(record, rate, settings) {
    let hours = record.hours || 7.5;
    
    // Получаем админ-настройки
    let adminSettings = {};
    try {
        const saved = localStorage.getItem('adminSalarySettings');
        if (saved) {
            adminSettings = JSON.parse(saved);
        }
    } catch(e) {}
    
    const satCoeff = adminSettings.saturdayCoeff || 1.5;
    const sunCoeff = adminSettings.sundayCoeff || 2.0;
    const overtimeCoeff = adminSettings.overtimeCoeff || 1.5;
    const satBonus = adminSettings.saturdayBonus || 25;
    const nightBonus = adminSettings.nightBonusPercent || 20;
    const extraBonus = adminSettings.extraBonus || 25;
    
    switch(record.type) {
        case 'night': 
            return hours * rate * (1 + nightBonus/100);
        case 'overtime': 
            return hours * rate * overtimeCoeff;
        case 'sat': 
            return hours * rate * satCoeff + satBonus;
        case 'sun': 
            return hours * rate * sunCoeff;
        case 'extra': 
            return (hours/2) * rate * 1.36;
        case 'sick': 
            return hours * rate * 0.6;
        case 'vacation': 
        case 'doctor': 
            return hours * rate;
        default: 
            return hours * rate;
    }
}

// Расчет зарплаты за месяц
export function calculateMonthlySalary(records, month, year, settings) {
    const today = new Date();
    today.setHours(0,0,0,0);
    
    const monthly = records.filter(r => {
        const d = new Date(r.date);
        d.setHours(0,0,0,0);
        return d.getMonth() === month && d.getFullYear() === year && d <= today;
    });
    
    const workDays = monthly.filter(r => {
        const d = new Date(r.date);
        const dayOfWeek = d.getDay();
        return dayOfWeek !== 0 && dayOfWeek !== 6 && 
               r.type !== 'off' && r.type !== 'sick' && 
               r.type !== 'vacation' && r.type !== 'doctor';
    }).length;
    
    const rate = settings?.hourlyRate || BASE_RATE;
    const lunchCost = (settings?.lunchCost || LUNCH_COST_REAL) * workDays;
    
    let stats = { 
        gross: 0, 
        hours: 0, 
        overtimeHours: 0, 
        saturdays: 0, 
        sundays: 0, 
        extraBlocks: 0, 
        doctorDays: 0 
    };
    
    monthly.forEach(r => {
        if (r.type === 'off') return;
        const hours = r.hours || 7.5;
        stats.hours += hours;
        stats.gross += calculateDayEarnings(r, rate, settings);
        
        if (r.type === 'overtime') stats.overtimeHours += hours;
        if (r.type === 'sat') stats.saturdays++;
        if (r.type === 'sun') stats.sundays++;
        if (r.type === 'extra') stats.extraBlocks++;
        if (r.type === 'doctor') stats.doctorDays++;
    });
    
    stats.gross += Math.floor(stats.extraBlocks / 2) * (settings?.extraBonus || 25);
    stats.gross -= lunchCost;
    
    let net = stats.gross;
    if (stats.gross > 0) {
        const social = stats.gross * SOCIAL_RATE;
        const health = stats.gross * HEALTH_RATE;
        const taxable = Math.max(stats.gross - social - health - NON_TAXABLE, 0);
        const tax = taxable * TAX_RATE;
        net = stats.gross - social - health - tax;
    }
    
    return { ...stats, net, lunchCost };
}

// Расчет статистики за год
export function calculateYearlyStats(records, year, settings) {
    const today = new Date();
    today.setHours(0,0,0,0);
    const rate = settings?.hourlyRate || BASE_RATE;
    
    const yearRecords = records.filter(r => {
        const d = new Date(r.date);
        d.setHours(0,0,0,0);
        return d.getFullYear() === year && d <= today && r.type !== 'off';
    });
    
    let totalGross = 0, totalHours = 0, totalLunch = 0;
    const monthTotals = new Array(12).fill(0);
    let extraBlocksCount = 0;
    
    yearRecords.forEach(r => {
        const d = new Date(r.date);
        const hours = r.hours || 7.5;
        totalHours += hours;
        const amount = calculateDayEarnings(r, rate, settings);
        totalGross += amount;
        monthTotals[d.getMonth()] += amount;
        
        const dayOfWeek = d.getDay();
        if (dayOfWeek !== 0 && dayOfWeek !== 6 && 
            r.type !== 'sick' && r.type !== 'vacation' && r.type !== 'doctor') {
            totalLunch += settings?.lunchCost || LUNCH_COST_REAL;
        }
        if (r.type === 'extra') extraBlocksCount++;
    });
    
    totalGross += Math.floor(extraBlocksCount / 2) * (settings?.extraBonus || 25);
    totalGross -= totalLunch;
    
    return { totalGross, totalHours, totalLunch, monthTotals };
}
