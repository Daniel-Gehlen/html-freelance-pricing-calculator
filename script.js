let fixedCosts = [];
let variableCosts = [];
let workingHours = [];

function addFixedCost() {
    const description = document.getElementById('newFixedCostDescription').value;
    const cost = parseFloat(document.getElementById('newFixedCost').value);
    if (!isNaN(cost)) {
        fixedCosts.push({ description, cost });
        updateList('fixedCostsList', fixedCosts);
    }
}

function editFixedCost() {
    const index = parseInt(prompt("Digite o índice do custo fixo a ser editado:"), 10);
    const newDescription = prompt("Digite a nova descrição:");
    const newCost = parseFloat(prompt("Digite o novo valor:"));
    if (!isNaN(newCost) && !isNaN(index) && index >= 0 && index < fixedCosts.length) {
        fixedCosts[index] = { description: newDescription, cost: newCost };
        updateList('fixedCostsList', fixedCosts);
    }
}

function deleteFixedCost() {
    const index = parseInt(prompt("Digite o índice do custo fixo a ser excluído:"), 10);
    if (!isNaN(index) && index >= 0 && index < fixedCosts.length) {
        fixedCosts.splice(index, 1);
        updateList('fixedCostsList', fixedCosts);
    }
}

function addVariableCost() {
    const description = document.getElementById('newVariableCostDescription').value;
    const cost = parseFloat(document.getElementById('newVariableCost').value);
    if (!isNaN(cost)) {
        variableCosts.push({ description, cost });
        updateList('variableCostsList', variableCosts);
    }
}

function editVariableCost() {
    const index = parseInt(prompt("Digite o índice do custo variável a ser editado:"), 10);
    const newDescription = prompt("Digite a nova descrição:");
    const newCost = parseFloat(prompt("Digite o novo valor:"));
    if (!isNaN(newCost) && !isNaN(index) && index >= 0 && index < variableCosts.length) {
        variableCosts[index] = { description: newDescription, cost: newCost };
        updateList('variableCostsList', variableCosts);
    }
}

function deleteVariableCost() {
    const index = parseInt(prompt("Digite o índice do custo variável a ser excluído:"), 10);
    if (!isNaN(index) && index >= 0 && index < variableCosts.length) {
        variableCosts.splice(index, 1);
        updateList('variableCostsList', variableCosts);
    }
}

function addWorkingHour() {
    const description = document.getElementById('newWorkingHourDescription').value;
    const hour = parseFloat(document.getElementById('newWorkingHour').value);
    if (!isNaN(hour)) {
        workingHours.push({ description, hour });
        updateList('workingHoursList', workingHours);
    }
}

function editWorkingHour() {
    const index = parseInt(prompt("Digite o índice da hora útil a ser editada:"), 10);
    const newDescription = prompt("Digite a nova descrição:");
    const newHour = parseFloat(prompt("Digite o novo valor:"));
    if (!isNaN(newHour) && !isNaN(index) && index >= 0 && index < workingHours.length) {
        workingHours[index] = { description: newDescription, hour: newHour };
        updateList('workingHoursList', workingHours);
    }
}

function deleteWorkingHour() {
    const index = parseInt(prompt("Digite o índice da hora útil a ser excluída:"), 10);
    if (!isNaN(index) && index >= 0 && index < workingHours.length) {
        workingHours.splice(index, 1);
        updateList('workingHoursList', workingHours);
    }
}

function updateList(listId, items) {
    const list = document.getElementById(listId);
    list.innerHTML = items.map((item, index) => `<div>${index}: ${item.description} - R$ ${item.cost ? item.cost.toFixed(2) : item.hour.toFixed(2)}</div>`).join('');
}

function calculate() {
    const salaryGoal = parseFloat(document.getElementById('salaryGoal').value);
    const taxRate = 0.15; // 15% de impostos e previdência
    const salaryWithTax = salaryGoal / (1 - taxRate);

    const totalFixedCosts = fixedCosts.reduce((sum, item) => sum + item.cost, 0);
    const totalVariableCosts = variableCosts.reduce((sum, item) => sum + item.cost, 0);
    const totalWorkingHours = workingHours.reduce((sum, item) => sum + item.hour, 0);

    const totalMonthlyCosts = totalFixedCosts + salaryWithTax;
    const hourlyRate = totalMonthlyCosts / (totalWorkingHours * 0.8); // 20% de margem de atraso
    const projectTotal = totalMonthlyCosts + totalVariableCosts;

    document.getElementById('hourlyRate').textContent = `R$ ${hourlyRate.toFixed(2)}`;
    document.getElementById('totalMonthly').textContent = `R$ ${totalMonthlyCosts.toFixed(2)}`;
    document.getElementById('projectTotal').textContent = `R$ ${projectTotal.toFixed(2)}`;

    const detailedReport = `
    Relatório Detalhado:
    - Custos Fixos Totais: R$ ${totalFixedCosts.toFixed(2)}
    - Meta Salarial Líquida: R$ ${salaryGoal.toFixed(2)}
    - Meta Salarial com Impostos: R$ ${salaryWithTax.toFixed(2)}
    - Custos Variáveis Totais: R$ ${totalVariableCosts.toFixed(2)}
    - Horas Úteis Totais: ${totalWorkingHours}
    - Horas Úteis com Margem de Atraso: ${totalWorkingHours * 0.8}
    - Valor Hora Base: R$ ${hourlyRate.toFixed(2)}
    - Valor Total Mensal: R$ ${totalMonthlyCosts.toFixed(2)}
    - Valor Total do Projeto: R$ ${projectTotal.toFixed(2)}
    `;

    document.getElementById('detailedReport').textContent = detailedReport;
    document.getElementById('results').classList.remove('hidden');
}

document.getElementById('pricingForm').addEventListener('submit', function(event) {
    event.preventDefault();
    calculate();
});