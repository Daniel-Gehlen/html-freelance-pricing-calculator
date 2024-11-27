// Constants for Tax Rates and Financial Planning
const TAX_RATES = {
    simplesNacional: {
        ranges: [
            { maxRevenue: 180000, rate: 0.0600 },   // Até R$ 180.000
            { maxRevenue: 360000, rate: 0.1120 },   // De R$ 180.000,01 a R$ 360.000
            { maxRevenue: 720000, rate: 0.1350 },   // De R$ 360.000,01 a R$ 720.000
            { maxRevenue: 1800000, rate: 0.1600 },  // De R$ 720.000,01 a R$ 1.800.000
            { maxRevenue: 3600000, rate: 0.2100 },  // De R$ 1.800.000,01 a R$ 3.600.000
            { maxRevenue: 4800000, rate: 0.2330 },  // De R$ 3.600.000,01 a R$ 4.800.000
            { maxRevenue: Infinity, rate: 0.2450 }  // Acima de R$ 4.800.000
        ]
    },
    inss: 0.0920,     // INSS for Individual Microentrepreneur (MEI)
    iR: 0.0275,       // Income Tax withholding (lowest bracket)
    administration: 0.0300,  // Accounting and administrative costs
    contingency: 0.0150      // Contingency reserve
};

const FINANCIAL_PLANNING_RATES = {
    ferias: {
        diasFerias: 30,
        percentual: 1/12  // 1/12 do salário por mês para acumular férias em um ano
    },
    decimoTerceiro: {
        percentual: 1/12  // 1/12 do salário por mês para acumular 13º em um ano
    },
    reservaEmergencia: {
        mesesReserva: 6,
        percentualMensal: function(salarioMensal) {
            // Calcula percentual mensal para acumular reserva em 24 meses (2 anos)
            const reservaTotal = salarioMensal * this.mesesReserva;
            return (reservaTotal / (salarioMensal * 12)) / 24 * 100;
        }
    }
};

// Global Arrays for Costs and Hours
let fixedCosts = [];
let variableCosts = [];
let workingHours = [];

// Financial Planning Calculation Functions
function calcularReservaFinanceira(salarioLiquido) {
    const ferias = FINANCIAL_PLANNING_RATES.ferias.percentual * 100;
    const decimoTerceiro = FINANCIAL_PLANNING_RATES.decimoTerceiro.percentual * 100;
    const reservaEmergencia = FINANCIAL_PLANNING_RATES.reservaEmergencia.percentualMensal(salarioLiquido);

    const totalReserva = ferias + decimoTerceiro + reservaEmergencia;

    return {
        ferias: ferias,
        decimoTerceiro: decimoTerceiro,
        reservaEmergencia: reservaEmergencia,
        total: totalReserva,
        mesesReservaEmergencia: 24  // tempo para acumular a reserva de emergência
    };
}

// Tax Calculation Functions
function calculateSimplesTax(annualRevenue) {
    const taxRange = TAX_RATES.simplesNacional.ranges.find(range => annualRevenue <= range.maxRevenue);
    return taxRange ? taxRange.rate : TAX_RATES.simplesNacional.ranges[TAX_RATES.simplesNacional.ranges.length - 1].rate;
}

// List Management Functions
function updateList(listId, items) {
    const list = document.getElementById(listId);
    list.innerHTML = items.map((item, index) => {
        const value = item.cost !== undefined ? item.cost.toFixed(2) : item.availableHoursPerMonth.toFixed(2);
        const valueLabel = item.cost !== undefined ? 'R$' : 'Horas';
        return `<div>${index}: ${item.description} - ${valueLabel} ${value}</div>`;
    }).join('');
}

// Cost Management Functions
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
        document.getElementById('newVariableCostDescription').value = '';
        document.getElementById('newVariableCost').value = '';
    }
}

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

// Main Calculation Function
function calculate() {
    const salaryGoal = parseFloat(document.getElementById('salaryGoal').value);
    const estimatedAnnualRevenue = salaryGoal * 12; // Estimated annual revenue

    // Tax calculations
    const simplesTaxRate = calculateSimplesTax(estimatedAnnualRevenue);
    const inssRate = TAX_RATES.inss;
    const incomeTaxRate = TAX_RATES.iR;
    const adminRate = TAX_RATES.administration;
    const contingencyRate = TAX_RATES.contingency;

    const totalTaxRate = simplesTaxRate + inssRate + incomeTaxRate + adminRate + contingencyRate;
    const salaryWithTax = salaryGoal / (1 - totalTaxRate);

    // Cost Calculations
    const totalFixedCosts = fixedCosts.reduce((sum, item) => sum + item.cost, 0);
    const totalVariableCosts = variableCosts.reduce((sum, item) => sum + item.cost, 0);
    const totalWorkingHours = workingHours.reduce((sum, item) => sum + item.availableHoursPerMonth, 0);

    const totalMonthlyCosts = totalFixedCosts + salaryWithTax;
    const hourlyRate = totalMonthlyCosts / (totalWorkingHours * 0.8); // 20% de margem de atraso
    const projectTotal = totalMonthlyCosts + totalVariableCosts;

    // Financial Planning Calculation
    const reservasFinanceiras = calcularReservaFinanceira(salaryGoal);

    // Update UI Elements
    document.getElementById('hourlyRate').textContent = `R$ ${hourlyRate.toFixed(2)}`;
    document.getElementById('totalMonthly').textContent = `R$ ${totalMonthlyCosts.toFixed(2)}`;
    document.getElementById('projectTotal').textContent = `R$ ${projectTotal.toFixed(2)}`;

    // Detailed Report
    const detailedReport = `
    Relatório Detalhado de Taxas e Custos:
    - Meta Salarial Líquida: R$ ${salaryGoal.toFixed(2)}
    - Receita Anual Estimada: R$ ${estimatedAnnualRevenue.toFixed(2)}

    Composição das Taxas:
    - Simples Nacional: ${(simplesTaxRate * 100).toFixed(2)}%
    - INSS: ${(inssRate * 100).toFixed(2)}%
    - Imposto de Renda: ${(incomeTaxRate * 100).toFixed(2)}%
    - Custos Administrativos: ${(adminRate * 100).toFixed(2)}%
    - Reserva de Contingência: ${(contingencyRate * 100).toFixed(2)}%
    - Total de Impostos e Taxas: ${(totalTaxRate * 100).toFixed(2)}%

    Detalhamento Financeiro:
    - Custos Fixos Totais: R$ ${totalFixedCosts.toFixed(2)}
    - Custos Variáveis Totais: R$ ${totalVariableCosts.toFixed(2)}
    - Meta Salarial com Impostos: R$ ${salaryWithTax.toFixed(2)}
    - Total de Horas Úteis: ${totalWorkingHours}
    - Horas Úteis com Margem de Atraso: ${(totalWorkingHours * 0.8).toFixed(2)}
    - Valor Hora Base: R$ ${hourlyRate.toFixed(2)}
    - Valor Total Mensal: R$ ${totalMonthlyCosts.toFixed(2)}
    - Valor Total do Projeto: R$ ${projectTotal.toFixed(2)}

    Planejamento Financeiro:
    - Reserva para Férias: ${reservasFinanceiras.ferias.toFixed(2)}% (por mês, acumulando em 1 ano)
    - Décimo Terceiro: ${reservasFinanceiras.decimoTerceiro.toFixed(2)}% (por mês, acumulando em 1 ano)
    - Reserva de Emergência: ${reservasFinanceiras.reservaEmergencia.toFixed(2)}% por mês
    - Total de Reservas Recomendadas: ${reservasFinanceiras.total.toFixed(2)}%

    Recomendação: Guarde ${reservasFinanceiras.total.toFixed(2)}% do seu faturamento mensalmente:
    - ${reservasFinanceiras.ferias.toFixed(2)}% para Férias (acumula em 1 ano)
    - ${reservasFinanceiras.decimoTerceiro.toFixed(2)}% para 13º Salário (acumula em 1 ano)
    - ${reservasFinanceiras.reservaEmergencia.toFixed(2)}% para Reserva de Emergência
      (Total de 6 meses de reserva em ${reservasFinanceiras.mesesReservaEmergencia} meses)
    `;

    document.getElementById('detailedReport').textContent = detailedReport;
    document.getElementById('results').classList.remove('hidden');
}

// Event Listeners
document.getElementById('pricingForm').addEventListener('submit', function(event) {
    event.preventDefault();
    calculate();
});