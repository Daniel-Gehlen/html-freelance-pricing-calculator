// Constantes de Taxas
const TAX_RATES = {
    simplesNacional: {
        ranges: [
            { maxRevenue: 180000, rate: 0.0600 },
            { maxRevenue: 360000, rate: 0.1120 },
            { maxRevenue: 720000, rate: 0.1350 },
            { maxRevenue: 1800000, rate: 0.1600 },
            { maxRevenue: 3600000, rate: 0.2100 },
            { maxRevenue: 4800000, rate: 0.2330 },
            { maxRevenue: Infinity, rate: 0.2450 }
        ]
    },
    inss: 0.0920,
    iR: 0.0275,
    administration: 0.0300,
    contingency: 0.0150
};

// Arrays globais
let fixedCosts = [];
let variableCosts = [];
let workingHours = [];
let workDays = [];

// Atualiza listas no HTML
function updateList(listId, items, type) {
    const list = document.getElementById(listId);
    list.innerHTML = items.map((item, index) => {
        const value = type === 'hours' ? item.availableHoursPerMonth : item.cost;
        const valueLabel = type === 'hours' ? 'Horas' : 'R$';
        return `
            <div>
                ${item.description} - ${valueLabel} ${value.toFixed(2)}
                <button onclick="editItem('${listId}', ${index}, '${type}')">Editar</button>
                <button onclick="deleteItem('${listId}', ${index}, '${type}')">Excluir</button>
            </div>
        `;
    }).join('');
}

// Adiciona item a uma lista específica
function addItem(listId, descriptionId, valueId, type) {
    const description = document.getElementById(descriptionId).value.trim();
    const value = parseFloat(document.getElementById(valueId).value);

    if (!description) {
        alert('A descrição não pode estar vazia!');
        return;
    }

    if (isNaN(value) || value <= 0) {
        alert('O valor deve ser um número maior que zero!');
        return;
    }

    const item = type === 'hours' ? { description, availableHoursPerMonth: value } : { description, cost: value };

    if (listId === 'fixedCostsList') {
        fixedCosts.push(item);
    } else if (listId === 'variableCostsList') {
        variableCosts.push(item);
    } else if (listId === 'workingHoursList') {
        workingHours.push(item);
    }

    // Atualiza a lista no HTML
    let listToUpdate;
    if (listId === 'fixedCostsList') {
        listToUpdate = fixedCosts;
    } else if (listId === 'variableCostsList') {
        listToUpdate = variableCosts;
    } else {
        listToUpdate = workingHours;
    }
    updateList(listId, listToUpdate, type);
    
    // Limpa os campos de entrada
    document.getElementById(descriptionId).value = '';
    document.getElementById(valueId).value = '';
}// Edita item em uma lista
function editItem(listId, index, type) {
    let list;
    if (listId === 'fixedCostsList') {
        list = fixedCosts;
    } else if (listId === 'variableCostsList') {
        list = variableCosts;
    } else {
        list = workingHours;
    }
    const item = list[index];

    const description = prompt('Nova descrição:', item.description);
    const value = parseFloat(prompt('Novo valor:', type === 'hours' ? item.availableHoursPerMonth : item.cost));

    if (description !== null && !isNaN(value)) {
        item.description = description;
        if (type === 'hours') {
            item.availableHoursPerMonth = value;
        } else {
            item.cost = value;
        }
        updateList(listId, list, type);
    }
}
// Exclui item de uma lista
function deleteItem(listId, index, type) {
    let list;
    if (listId === 'fixedCostsList') {
        list = fixedCosts;
    } else if (listId === 'variableCostsList') {
        list = variableCosts;
    } else {
        list = workingHours;
    }
    list.splice(index, 1);
    updateList(listId, list, type);
}
// Adiciona custos fixos
function addFixedCost() {
    const description = document.getElementById('newFixedCostDescription').value;
    const cost = parseFloat(document.getElementById('newFixedCost').value);
    if (!isNaN(cost)) {
        fixedCosts.push({ description, cost });
        updateList('fixedCostsList', fixedCosts);
        document.getElementById('newFixedCostDescription').value = '';
        document.getElementById('newFixedCost').value = '';
    }
}

// Adiciona custos variáveis
function addVariableCost() {
    const description = document.getElementById('newVariableCostDescription').value;
    const cost = parseFloat(document.getElementById('newVariableCost').value);
    if (!isNaN(cost)) {
        variableCosts.push({ description, cost });
        updateList('variableCostsList', variableCosts);
        document.getElementById('newVariableCostDescription').value = '';
        document.getElementById('newVariableCost').value = '';
    }
}

// Adiciona horas úteis
function addWorkingHour() {
    const description = document.getElementById('newWorkingHourDescription').value;
    const availableHoursPerMonth = parseFloat(document.getElementById('newWorkingHour').value);
    if (!isNaN(availableHoursPerMonth)) {
        workingHours.push({ description, availableHoursPerMonth });
        updateList('workingHoursList', workingHours);
        document.getElementById('newWorkingHourDescription').value = '';
        document.getElementById('newWorkingHour').value = '';
    }
}

// Calcula valores principais
function calculate() {
    const salaryGoal = parseFloat(document.getElementById('salaryGoal').value); // Salário líquido desejado
    const customHourlyRate = parseFloat(document.getElementById('customHourlyRate').value); // Valor da hora personalizado

    let totalFixedCosts = fixedCosts.reduce((sum, item) => sum + item.cost, 0);
    let totalVariableCosts = variableCosts.reduce((sum, item) => sum + item.cost, 0);
    let totalWorkingHours = workingHours.reduce((sum, item) => sum + item.availableHoursPerMonth, 0);

    let hourlyRate = 0;
    let projectTotal = 0;
    let hoursNeeded = 0;
    let taxesBreakdown = {};
    let contingencyReserve = 0;
    let monthsToSaveContingency = 0;  // Remover essa linha se não for usada
    let monthly13thReserve = 0;
    let totalExtraHours = extraHours.reduce((sum, entry) => sum + entry.hours, 0); // Total de horas extras
    let extraHoursTotalValue = 0;
    let weekendBonusHours = 0; // Horas em finais de semana
    let monthlyContingencyReserve = 0; // Valor mensal da reserva de contingência
    const monthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    const selectedWorkDays = workDays.map(day => day.toLocaleDateString("pt-BR"));

    // Verifica se há dias úteis e finais de semana
    const weekendDays = workDays.filter(day => day.getDay() === 0 || day.getDay() === 6).length;
    const weekdayDays = workDays.length - weekendDays;

    if (!isNaN(customHourlyRate) && customHourlyRate > 0) {
        // Baseado no valor da hora fornecido
        hourlyRate = customHourlyRate;
        const regularHours = weekdayDays * 8;
        weekendBonusHours = weekendDays * 8 * 2; // Horas com adicional para finais de semana
        const totalHours = regularHours + weekendBonusHours;

        projectTotal = hourlyRate * totalHours;
        extraHoursTotalValue = totalExtraHours * hourlyRate;

        // Receita mensal bruta estimada
        const monthlyRevenue = projectTotal + extraHoursTotalValue;

        // Taxas proporcionais à receita mensal
        taxesBreakdown = calculateTaxes(monthlyRevenue);

        // Reservas
        contingencyReserve = salaryGoal * 6;
        monthlyContingencyReserve = monthlyRevenue * 0.20;
        monthsToSaveContingency = contingencyReserve / monthlyContingencyReserve;
        monthly13thReserve = salaryGoal / 12;
    } else if (!isNaN(salaryGoal) && salaryGoal > 0) {
        // Baseado no salário líquido desejado
        const monthlyRevenue = salaryGoal / (1 - getTotalTaxRate());
        hourlyRate = totalWorkingHours > 0 ? (monthlyRevenue / (totalWorkingHours * 0.8)) : 0;
        projectTotal = monthlyRevenue + totalVariableCosts;
        extraHoursTotalValue = totalExtraHours * hourlyRate;

        taxesBreakdown = calculateTaxes(monthlyRevenue);

        // Reservas
        contingencyReserve = salaryGoal * 6;
        monthlyContingencyReserve = salaryGoal * 0.20;
        monthsToSaveContingency = contingencyReserve / monthlyContingencyReserve;
        monthly13thReserve = salaryGoal / 12;
    } else {
        alert('Informe pelo menos o salário líquido ou o valor da hora.');
        return;
    }

    // Gera o relatório detalhado
    const report = `
        <h2>Relatório Completo (${monthNames[currentMonth]} ${currentYear})</h2>
        <p><strong>Valor Hora Base:</strong> R$ ${hourlyRate.toFixed(2)}</p>
        <p><strong>Valor Total do Projeto:</strong> R$ ${projectTotal.toFixed(2)}</p>
        <p><strong>Custos Fixos:</strong> R$ ${totalFixedCosts.toFixed(2)}</p>
        <p><strong>Custos Variáveis:</strong> R$ ${totalVariableCosts.toFixed(2)}</p>
        <p><strong>Horas Mensais Disponíveis:</strong> ${totalWorkingHours.toFixed(2)}</p>
        <p><strong>Horas Necessárias para atingir R$ ${salaryGoal.toFixed(2)}:</strong> ${hoursNeeded > 0 ? hoursNeeded.toFixed(2) : 'N/A'} horas</p>
        <p><strong>Horas em Finais de Semana:</strong> ${weekendBonusHours > 0 ? weekendBonusHours : 'Nenhuma'} horas (com adicional)</p>
        <p><strong>Reserva para Contingência (6 meses):</strong> R$ ${contingencyReserve.toFixed(2)}</p>
        <p><strong>Tempo para alcançar a reserva (20% ao mês):</strong> ${contingencyReserve / monthlyContingencyReserve} meses</p>
        <p><strong>Reserva Mensal para Contingência:</strong> R$ ${monthlyContingencyReserve.toFixed(2)} (20% da receita mensal)</p>
        <p><strong>Reserva Mensal para o 13º Salário:</strong> R$ ${monthly13thReserve.toFixed(2)}</p>
        <p><strong>Quebra de Taxas Mensais:</strong></p>
        <ul>
            <li>Simples Nacional: R$ ${taxesBreakdown.simples.toFixed(2)} (${((taxesBreakdown.simples / projectTotal) * 100).toFixed(2)}%)</li>
            <li>INSS: R$ ${taxesBreakdown.inss.toFixed(2)} (${((taxesBreakdown.inss / projectTotal) * 100).toFixed(2)}%)</li>
            <li>IR: R$ ${taxesBreakdown.ir.toFixed(2)} (${((taxesBreakdown.ir / projectTotal) * 100).toFixed(2)}%)</li>
            <li>Administração: R$ ${taxesBreakdown.admin.toFixed(2)} (${((taxesBreakdown.admin / projectTotal) * 100).toFixed(2)}%)</li>
            <li>Contingência: R$ ${taxesBreakdown.contingency.toFixed(2)} (${((taxesBreakdown.contingency / projectTotal) * 100).toFixed(2)}%)</li>
            <li><strong>Total de Taxas:</strong> R$ ${taxesBreakdown.total.toFixed(2)} (${((taxesBreakdown.total / projectTotal) * 100).toFixed(2)}%)</li>
        </ul>
        <p><strong>Dias Selecionados para Trabalho:</strong> ${selectedWorkDays.join(', ')}</p>
        <p><strong>Total de Horas Extras:</strong> ${totalExtraHours} horas (R$ ${extraHoursTotalValue.toFixed(2)})</p>
        <p><strong>Dias de Horas Extras:</strong> ${extraHours.map(e => e.date.toLocaleDateString('pt-BR')).join(', ')}</p>
    `;

    document.getElementById('results').innerHTML = report;
    document.getElementById('results').classList.remove('hidden');
}





function calculateTaxes(monthlyRevenue) {
    const simplesTaxRate = TAX_RATES.simplesNacional.ranges.find(r => monthlyRevenue * 12 <= r.maxRevenue)?.rate || 0;
    const totalTaxRate = simplesTaxRate + TAX_RATES.inss + TAX_RATES.iR + TAX_RATES.administration + TAX_RATES.contingency;

    return {
        simples: monthlyRevenue * simplesTaxRate,
        inss: monthlyRevenue * TAX_RATES.inss,
        ir: monthlyRevenue * TAX_RATES.iR,
        admin: monthlyRevenue * TAX_RATES.administration,
        contingency: monthlyRevenue * TAX_RATES.contingency,
        total: monthlyRevenue * totalTaxRate
    };
}

function getTotalTaxRate() {
    return TAX_RATES.simplesNacional.ranges.reduce((acc, r) => acc + r.rate, 0) + TAX_RATES.inss + TAX_RATES.iR + TAX_RATES.administration + TAX_RATES.contingency;
}



// Inicializa calendário e eventos
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('results').classList.add('hidden');
});

// Renderização do calendário
let currentYear = new Date().getFullYear();
let currentMonth = new Date().getMonth();
let extraHours = []; // Armazena as horas extras adicionadas

// Atualiza o calendário com o mês atual ou selecionado
function renderCalendar() {
    const calendar = document.getElementById('calendar');
    const monthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const firstDay = new Date(currentYear, currentMonth, 1).getDay();

    let calendarHTML = `
        <div class="calendar-header">
            <button onclick="changeMonth(-1)">&#9664;</button>
            <h3>${monthNames[currentMonth]} ${currentYear}</h3>
            <button onclick="changeMonth(1)">&#9654;</button>
        </div>
        <button onclick="toggleSelectAll()">Selecionar/Deselecionar Todos os Dias</button>
        <div class="calendar-grid">
            <div>Dom</div><div>Seg</div><div>Ter</div><div>Qua</div>
            <div>Qui</div><div>Sex</div><div>Sáb</div>
    `;

    for (let i = 0; i < firstDay; i++) {
        calendarHTML += '<div class="empty-day"></div>';
    }

    for (let day = 1; day <= daysInMonth; day++) {
        const fullDate = new Date(currentYear, currentMonth, day);
        const isWorkDay = workDays.some(d =>
            d.getFullYear() === fullDate.getFullYear() &&
            d.getMonth() === fullDate.getMonth() &&
            d.getDate() === fullDate.getDate()
        );

        calendarHTML += `
            <div class="day ${isWorkDay ? 'work-day' : ''}" 
                 onclick="toggleWorkDay(${currentYear}, ${currentMonth}, ${day})">
                ${day}
            </div>
        `;
    }

    calendarHTML += '</div>';
    calendar.innerHTML = calendarHTML;
}

// Altera o mês exibido no calendário
function changeMonth(direction) {
    currentMonth += direction;
    if (currentMonth > 11) {
        currentMonth = 0;
        currentYear++;
    } else if (currentMonth < 0) {
        currentMonth = 11;
        currentYear--;
    }
    renderCalendar();
}

// Seleciona/Deseleciona todos os dias
function toggleSelectAll() {
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const allDaysSelected = workDays.some(d => d.getMonth() === currentMonth && d.getFullYear() === currentYear);

    if (allDaysSelected) {
        workDays = workDays.filter(d => d.getMonth() !== currentMonth || d.getFullYear() !== currentYear);
    } else {
        for (let day = 1; day <= daysInMonth; day++) {
            const fullDate = new Date(currentYear, currentMonth, day);
            if (!workDays.some(d => d.getTime() === fullDate.getTime())) {
                workDays.push(fullDate);
            }
        }
    }
    renderCalendar();
}

// Alterna dias de trabalho individualmente
function toggleWorkDay(year, month, day) {
    const fullDate = new Date(year, month, day);
    const index = workDays.findIndex(d => d.getTime() === fullDate.getTime());

    if (index !== -1) {
        workDays.splice(index, 1);
    } else {
        workDays.push(fullDate);
    }

    renderCalendar();
}

// Adiciona horas extras para um dia específico
function addExtraHours() {
    const extraDate = document.getElementById('extraDate').value;
    const extraHoursInput = parseFloat(document.getElementById('extraHours').value);

    if (!extraDate || isNaN(extraHoursInput) || extraHoursInput <= 0) {
        alert('Informe uma data válida e um número positivo de horas extras.');
        return;
    }

    const extraDateObj = new Date(extraDate);  // Aqui a data selecionada
    if (extraDateObj > new Date()) {
        alert("Você não pode adicionar horas extras para o futuro.");
        return;
    }
    extraHours.push({ date: extraDateObj, hours: extraHoursInput });
    alert(`Horas extras adicionadas para ${extraDateObj.toLocaleDateString('pt-BR')}: ${extraHoursInput} horas`);
}



// Inicialização ao carregar a página
document.addEventListener('DOMContentLoaded', () => {
    renderCalendar();
    document.getElementById('results').classList.add('hidden');
});
