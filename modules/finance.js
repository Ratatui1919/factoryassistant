// modules/finance.js - ФИНАНСЫ

import { getCurrentUser, updateUserData } from './auth.js';
import { showNotification, t } from './utils.js';

// Обновление финансовой статистики
export function updateFinanceStats() {
    const dashboardNet = parseFloat(document.getElementById('net')?.innerText) || 0;
    const dashboardGross = parseFloat(document.getElementById('gross')?.innerText) || 0;
    const dashboardLunch = parseFloat(document.getElementById('lunchCost')?.innerText) || 0;
    const taxes = Math.max(dashboardGross - dashboardNet, 0);
    const savings = dashboardNet * 0.1;
    
    const financeNet = document.getElementById('financeNet');
    const financeGross = document.getElementById('financeGross');
    const financeTax = document.getElementById('financeTax');
    const financeLunch = document.getElementById('financeLunch');
    const financeSavings = document.getElementById('financeSavings');
    const pieTotal = document.getElementById('pieTotal');
    
    if (financeNet) financeNet.innerText = dashboardNet.toFixed(2) + ' €';
    if (financeGross) financeGross.innerText = dashboardGross.toFixed(2) + ' €';
    if (financeTax) financeTax.innerText = taxes.toFixed(2) + ' €';
    if (financeLunch) financeLunch.innerText = dashboardLunch.toFixed(2) + ' €';
    if (financeSavings) financeSavings.innerText = savings.toFixed(2) + ' €';
    if (pieTotal) pieTotal.innerText = dashboardNet.toFixed(2) + ' €';
    
    buildPieChart(
        Math.max(dashboardNet, 0.01),
        Math.max(taxes, 0.01),
        Math.max(dashboardLunch, 0.01),
        Math.max(savings, 0.01)
    );
}

// Построение круговой диаграммы
function buildPieChart(net, tax, lunch, savings) {
    const canvas = document.getElementById('pieChart');
    if (!canvas) return;
    
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.width = canvas.parentElement?.clientWidth || 300;
    canvas.height = canvas.parentElement?.clientHeight || 300;
    
    // Проверяем существование графика перед уничтожением
    if (window.pieChart) {
        try {
            if (typeof window.pieChart.destroy === 'function') {
                window.pieChart.destroy();
            }
        } catch (e) {
            console.warn('Ошибка при уничтожении графика:', e);
        }
        window.pieChart = null;
    }
    
    const ctx = canvas.getContext('2d');
    const textColor = getComputedStyle(document.documentElement).getPropertyValue('--text').trim() || '#ffffff';
    
    try {
        window.pieChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: [t('netIncome') || 'Чистый доход', t('taxes') || 'Налоги', t('lunches') || 'Обеды', t('savings') || 'Сбережения'],
                datasets: [{
                    data: [net, tax, lunch, savings],
                    backgroundColor: ['#00b060', '#f59e0b', '#ef4444', '#8b5cf6'],
                    borderWidth: 0
                }]
            },
            options: { 
                responsive: true, 
                maintainAspectRatio: true,
                cutout: '70%', 
                plugins: { 
                    legend: { 
                        position: 'bottom', 
                        labels: { color: textColor } 
                    } 
                } 
            }
        });
    } catch (error) {
        console.error('Ошибка создания графика:', error);
    }
}

// Загрузка финансовой цели
export function loadFinancialGoal() {
    console.log('loadFinancialGoal вызван');
    const user = getCurrentUser();
    if (!user) {
        console.log('loadFinancialGoal: пользователь не найден');
        return;
    }
    
    console.log('Загрузка финансовой цели пользователя:', user.financialGoal);
    
    const goal = user.financialGoal;
    const goalInputs = document.querySelector('.goal-inputs');
    const goalProgress = document.getElementById('goalProgress');
    const goalActions = document.getElementById('goalActions');
    
    if (!goalInputs || !goalProgress) {
        console.log('Элементы финансовой цели не найдены');
        return;
    }
    
    if (goal?.name && goal.amount > 0) {
        console.log('Цель существует:', goal);
        
        const goalNameDisplay = document.getElementById('goalNameDisplay');
        const goalTarget = document.getElementById('goalTarget');
        const goalName = document.getElementById('goalName');
        const goalAmount = document.getElementById('goalAmount');
        
        if (goalNameDisplay) goalNameDisplay.innerText = goal.name;
        if (goalTarget) goalTarget.innerText = goal.amount.toFixed(2) + ' €';
        if (goalName) goalName.value = goal.name;
        if (goalAmount) goalAmount.value = goal.amount;
        
        goal.saved = goal.saved || 0;
        goal.history = goal.history || [];
        
        if (goalInputs) goalInputs.style.display = 'none';
        if (goalProgress) goalProgress.style.display = 'block';
        if (goalActions) goalActions.style.display = 'flex';
        
        updateGoalDisplay();
    } else {
        console.log('Цель не существует, показываем форму ввода');
        const goalName = document.getElementById('goalName');
        const goalAmount = document.getElementById('goalAmount');
        
        if (goalName) goalName.value = '';
        if (goalAmount) goalAmount.value = '';
        if (goalInputs) goalInputs.style.display = 'flex';
        if (goalProgress) goalProgress.style.display = 'none';
    }
}

// Обновление отображения цели
function updateGoalDisplay() {
    const user = getCurrentUser();
    if (!user?.financialGoal) return;
    
    const goal = user.financialGoal;
    
    const goalSaved = document.getElementById('goalSaved');
    const goalRemaining = document.getElementById('goalRemaining');
    const goalPercent = document.getElementById('goalPercent');
    const goalProgressBar = document.getElementById('goalProgressBar');
    
    if (goalSaved) goalSaved.innerText = (goal.saved || 0).toFixed(2) + ' €';
    if (goalRemaining) goalRemaining.innerText = Math.max(goal.amount - (goal.saved || 0), 0).toFixed(2) + ' €';
    
    const percent = Math.min(((goal.saved || 0) / goal.amount) * 100, 100);
    if (goalPercent) goalPercent.innerText = percent.toFixed(1) + '%';
    if (goalProgressBar) goalProgressBar.style.width = percent + '%';
    
    updateHistoryList();
}

// Обновление списка истории
function updateHistoryList() {
    const user = getCurrentUser();
    const historyList = document.getElementById('goalHistory');
    if (!historyList || !user?.financialGoal?.history) return;
    
    let html = '';
    user.financialGoal.history.slice().reverse().slice(0, 10).forEach(item => {
        html += `<div class="history-item">
            <span>${item.type === 'add' ? '➕' : '➖'} ${item.date}</span>
            <span style="color:${item.type === 'add' ? '#00b060' : '#ef4444'}">${item.type === 'add' ? '+' : '-'}${item.amount.toFixed(2)} €</span>
            <span style="color:#94a3b8;">(баланс: ${item.balance.toFixed(2)} €)</span>
        </div>`;
    });
    historyList.innerHTML = html || '<div style="color:#94a3b8;">История пуста</div>';
}

// Сохранение цели
export async function saveGoal() {
    const user = getCurrentUser();
    if (!user) return;
    
    const name = document.getElementById('goalName')?.value.trim();
    const amount = parseFloat(document.getElementById('goalAmount')?.value);
    
    if (!name || isNaN(amount) || amount <= 0) {
        return alert('Введите название и сумму цели');
    }
    
    user.financialGoal = { name, amount, saved: 0, history: [], date: new Date().toISOString() };
    await updateUserData({ financialGoal: user.financialGoal });
    
    showNotification('Цель сохранена');
    loadFinancialGoal();
}

// Удаление цели
export async function clearGoal() {
    const user = getCurrentUser();
    if (!user?.financialGoal) return;
    
    if (confirm('Удалить цель?')) {
        user.financialGoal = null;
        await updateUserData({ financialGoal: null });
        showNotification('Цель удалена');
        loadFinancialGoal();
    }
}

// Добавление к цели
export async function addToGoal() {
    const user = getCurrentUser();
    if (!user?.financialGoal) return;
    
    const amount = parseFloat(prompt('Сколько добавить?', '100'));
    if (isNaN(amount) || amount <= 0) return alert('Введите сумму');
    
    user.financialGoal.saved = (user.financialGoal.saved || 0) + amount;
    user.financialGoal.history = user.financialGoal.history || [];
    user.financialGoal.history.push({ 
        type: 'add', 
        amount, 
        date: new Date().toLocaleString(), 
        balance: user.financialGoal.saved 
    });
    
    await updateUserData({ financialGoal: user.financialGoal });
    loadFinancialGoal();
    showNotification(`Добавлено ${amount} €`);
}

// Снятие с цели
export async function withdrawFromGoal() {
    const user = getCurrentUser();
    if (!user?.financialGoal) return;
    
    const amount = parseFloat(prompt('Сколько снять?', '50'));
    if (isNaN(amount) || amount <= 0) return alert('Введите сумму');
    if (amount > (user.financialGoal.saved || 0)) return alert('Недостаточно средств');
    
    user.financialGoal.saved -= amount;
    user.financialGoal.history = user.financialGoal.history || [];
    user.financialGoal.history.push({ 
        type: 'withdraw', 
        amount, 
        date: new Date().toLocaleString(), 
        balance: user.financialGoal.saved 
    });
    
    await updateUserData({ financialGoal: user.financialGoal });
    loadFinancialGoal();
    showNotification(`Снято ${amount} €`);
}

// ===== ЭКСПОРТ ФУНКЦИЙ В ГЛОБАЛЬНУЮ ОБЛАСТЬ ВИДИМОСТИ =====
window.updateFinanceStats = updateFinanceStats;
window.loadFinancialGoal = loadFinancialGoal;
window.saveGoal = saveGoal;
window.clearGoal = clearGoal;
window.addToGoal = addToGoal;
window.withdrawFromGoal = withdrawFromGoal;
