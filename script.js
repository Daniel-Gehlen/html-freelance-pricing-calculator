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
let extraHours = [];

// Variável global para armazenar os dados do freelancer (persistente)
let freelancerData = JSON.parse(localStorage.getItem('freelancerData')) || null;

/**
 * Salva os estados atuais no LocalStorage
 */
function saveData() {
    localStorage.setItem('fixedCosts', JSON.stringify(fixedCosts));
    localStorage.setItem('variableCosts', JSON.stringify(variableCosts));
    localStorage.setItem('workingHours', JSON.stringify(workingHours));
    localStorage.setItem('freelancerData', JSON.stringify(freelancerData));
}

/**
 * Carrega os estados do LocalStorage e atualiza a interface
 */
function loadData() {
    fixedCosts = JSON.parse(localStorage.getItem('fixedCosts')) || [];
    variableCosts = JSON.parse(localStorage.getItem('variableCosts')) || [];
    workingHours = JSON.parse(localStorage.getItem('workingHours')) || [];
    
    updateList('fixedCostsList', fixedCosts, 'cost');
    updateList('variableCostsList', variableCosts, 'cost');
    updateList('workingHoursList', workingHours, 'hours');
}

// Função para adicionar item a uma lista
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

    saveData();

    // Atualiza a lista no HTML
    updateList(listId, listId === 'fixedCostsList' ? fixedCosts : listId === 'variableCostsList' ? variableCosts : workingHours, type);

    // Limpa os campos de entrada
    document.getElementById(descriptionId).value = '';
    document.getElementById(valueId).value = '';
}

// Função para atualizar listas no HTML
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

// Função para editar item em uma lista
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
        saveData();
        updateList(listId, list, type);
    }
}

// Função para excluir item de uma lista
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
    saveData();
    updateList(listId, list, type);
}

// Função para alternar entre os tipos de cálculo
function toggleCalculationType(type) {
    const salaryGoalInput = document.getElementById('salaryGoal');
    const customHourlyRateInput = document.getElementById('customHourlyRate');

    if (type === 'salary') {
        salaryGoalInput.disabled = false;
        customHourlyRateInput.disabled = true;
        customHourlyRateInput.value = ''; // Limpa o valor do campo desabilitado
    } else if (type === 'hourlyRate') {
        salaryGoalInput.disabled = true;
        customHourlyRateInput.disabled = false;
        salaryGoalInput.value = ''; // Limpa o valor do campo desabilitado
    }
}

// Função para calcular os valores
function calculate() {
    const salaryGoal = parseFloat(document.getElementById('salaryGoal').value); // Salário líquido desejado
    const customHourlyRate = parseFloat(document.getElementById('customHourlyRate').value); // Valor da hora personalizado

    let totalFixedCosts = fixedCosts.reduce((sum, item) => sum + item.cost, 0);
    let totalVariableCosts = variableCosts.reduce((sum, item) => sum + item.cost, 0);
    let totalWorkingHours = workingHours.reduce((sum, item) => sum + item.availableHoursPerMonth, 0);

    let hourlyRate = 0;
    let projectTotal = 0;

    if (!isNaN(customHourlyRate) && customHourlyRate > 0) {
        // Baseado no valor da hora fornecido
        hourlyRate = customHourlyRate;
        projectTotal = hourlyRate * totalWorkingHours;
    } else if (!isNaN(salaryGoal) && salaryGoal > 0) {
        // Baseado no salário líquido desejado
        hourlyRate = (salaryGoal + totalFixedCosts + totalVariableCosts) / totalWorkingHours;
        projectTotal = hourlyRate * totalWorkingHours;
    } else {
        alert('Informe pelo menos o salário líquido ou o valor da hora.');
        return;
    }

    // Exibir os resultados
    document.getElementById("hourlyRate").innerText = hourlyRate.toFixed(2);
    document.getElementById("projectTotal").innerText = projectTotal.toFixed(2);
    document.getElementById("results").classList.remove("hidden");
}

// Função para calcular as taxas
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

// Função para coletar os dados do freelancer (evita solicitações repetidas)
async function collectFreelancerData() {
    if (!freelancerData) {
        freelancerData = {
            name: prompt("Digite seu nome completo:", "Seu Nome"),
            email: prompt("Digite seu e-mail:", "seuemail@exemplo.com"),
            whatsApp: prompt("Digite seu WhatsApp:", "(11) 98765-4321"),
            projectName: prompt("Digite o nome do projeto:", "Desenvolvimento de Software")
        };
    }
    return freelancerData;
}

// Função para abrir pop-ups ou exibir conteúdo na página
function openPopup(content, title) {
    const popup = window.open("", title, "width=600,height=600");
    if (popup) {
        popup.document.write(`<pre>${content}</pre>`);
        popup.document.close();
    } else {
        alert("Pop-up bloqueado! O conteúdo será exibido abaixo.");
        const resultsDiv = document.getElementById("results");
        resultsDiv.innerHTML = `<pre>${content}</pre>`;
    }
}

// Função para gerar o orçamento para o cliente
async function generateClientBudget() {
    console.log("Gerando orçamento para o cliente...");
    const data = await collectFreelancerData();
    const projectTotal = parseFloat(document.getElementById("projectTotal").innerText.replace("R$", "").trim()) || 0;
    const hourlyRate = parseFloat(document.getElementById("hourlyRate").innerText.replace("R$", "").trim()) || 0;
    const currentDate = new Date().toLocaleDateString("pt-BR");

    // Cálculos adicionais
    const totalFixedCosts = fixedCosts.reduce((sum, item) => sum + item.cost, 0);
    const totalVariableCosts = variableCosts.reduce((sum, item) => sum + item.cost, 0);
    const totalWorkingHours = workingHours.reduce((sum, item) => sum + item.availableHoursPerMonth, 0);

    // Cálculo das taxas
    const taxesBreakdown = calculateTaxes(projectTotal);

    // Conteúdo do orçamento para o cliente
    const budgetContentForClient = `
==============================
ORÇAMENTO PARA CLIENTE
==============================
Data: ${currentDate}
Freelancer: ${data.name}
E-mail: ${data.email}
WhatsApp: ${data.whatsApp}
==============================
Projeto: ${data.projectName}
Valor Hora: R$ ${hourlyRate.toFixed(2)}
Valor Total do Projeto: R$ ${projectTotal.toFixed(2)}
==============================
Custos Fixos: R$ ${totalFixedCosts.toFixed(2)}
Custos Variáveis: R$ ${totalVariableCosts.toFixed(2)}
Horas Mensais Disponíveis: ${totalWorkingHours.toFixed(2)} horas
==============================
IMPOSTOS DETALHADOS:
- Simples Nacional: R$ ${taxesBreakdown.simples.toFixed(2)} (${((taxesBreakdown.simples / projectTotal) * 100).toFixed(2)}%)
- INSS: R$ ${taxesBreakdown.inss.toFixed(2)} (${((taxesBreakdown.inss / projectTotal) * 100).toFixed(2)}%)
- IR: R$ ${taxesBreakdown.ir.toFixed(2)} (${((taxesBreakdown.ir / projectTotal) * 100).toFixed(2)}%)
- Administração: R$ ${taxesBreakdown.admin.toFixed(2)} (${((taxesBreakdown.admin / projectTotal) * 100).toFixed(2)}%)
- Contingência: R$ ${taxesBreakdown.contingency.toFixed(2)} (${((taxesBreakdown.contingency / projectTotal) * 100).toFixed(2)}%)
- Total de Impostos: R$ ${taxesBreakdown.total.toFixed(2)} (${((taxesBreakdown.total / projectTotal) * 100).toFixed(2)}%)
==============================
`;

    // Exibir o orçamento
    openPopup(budgetContentForClient, "Orçamento para o Cliente");

    // Opção para salvar o orçamento como arquivo de texto
    const blob = new Blob([budgetContentForClient], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Orcamento_Cliente_${currentDate.replace(/\//g, "-")}.txt`;
    a.click();
    URL.revokeObjectURL(url);
}

// Função para gerar o relatório completo para o freelancer
async function generateFreelancerReport() {
    console.log("Gerando relatório para o freelancer...");
    const data = await collectFreelancerData();
    const projectTotal = parseFloat(document.getElementById("projectTotal").innerText.replace("R$", "").trim()) || 0;
    const hourlyRate = parseFloat(document.getElementById("hourlyRate").innerText.replace("R$", "").trim()) || 0;
    const currentDate = new Date().toLocaleDateString("pt-BR");

    // Cálculos adicionais
    const totalFixedCosts = fixedCosts.reduce((sum, item) => sum + item.cost, 0);
    const totalVariableCosts = variableCosts.reduce((sum, item) => sum + item.cost, 0);
    const totalWorkingHours = workingHours.reduce((sum, item) => sum + item.availableHoursPerMonth, 0);

    // Cálculo das taxas
    const taxesBreakdown = calculateTaxes(projectTotal);

    // Reservas e benefícios
    const salaryGoal = parseFloat(document.getElementById("salaryGoal").value) || 0;
    const contingencyReserve = salaryGoal * 6; // Reserva para 6 meses
    const monthlyContingencyReserve = salaryGoal * 0.20; // 20% da receita mensal
    const monthsToSaveContingency = contingencyReserve / monthlyContingencyReserve;
    const monthly13thReserve = salaryGoal / 12; // Reserva para o 13º salário
    const vacationReserve = salaryGoal / 12; // Reserva para férias (1/12 do salário)

    // Conteúdo do relatório para o freelancer
    const reportContentForFreelancer = `
==============================
RELATÓRIO COMPLETO PARA O FREELANCER
==============================
Data: ${currentDate}
Freelancer: ${data.name}
E-mail: ${data.email}
WhatsApp: ${data.whatsApp}
==============================
Projeto: ${data.projectName}
Valor Hora: R$ ${hourlyRate.toFixed(2)}
Valor Total do Projeto: R$ ${projectTotal.toFixed(2)}
==============================
Custos Fixos: R$ ${totalFixedCosts.toFixed(2)}
Custos Variáveis: R$ ${totalVariableCosts.toFixed(2)}
Horas Mensais Disponíveis: ${totalWorkingHours.toFixed(2)} horas
==============================
IMPOSTOS DETALHADOS:
- Simples Nacional: R$ ${taxesBreakdown.simples.toFixed(2)} (${((taxesBreakdown.simples / projectTotal) * 100).toFixed(2)}%)
- INSS: R$ ${taxesBreakdown.inss.toFixed(2)} (${((taxesBreakdown.inss / projectTotal) * 100).toFixed(2)}%)
- IR: R$ ${taxesBreakdown.ir.toFixed(2)} (${((taxesBreakdown.ir / projectTotal) * 100).toFixed(2)}%)
- Administração: R$ ${taxesBreakdown.admin.toFixed(2)} (${((taxesBreakdown.admin / projectTotal) * 100).toFixed(2)}%)
- Contingência: R$ ${taxesBreakdown.contingency.toFixed(2)} (${((taxesBreakdown.contingency / projectTotal) * 100).toFixed(2)}%)
- Total de Impostos: R$ ${taxesBreakdown.total.toFixed(2)} (${((taxesBreakdown.total / projectTotal) * 100).toFixed(2)}%)
==============================
RESERVAS E BENEFÍCIOS:
- Reserva para Contingência (6 meses): R$ ${contingencyReserve.toFixed(2)}
- Reserva Mensal para Contingência: R$ ${monthlyContingencyReserve.toFixed(2)} (20% da receita mensal)
- Tempo para alcançar a reserva: ${monthsToSaveContingency.toFixed(2)} meses
- Reserva Mensal para o 13º Salário: R$ ${monthly13thReserve.toFixed(2)}
- Reserva Mensal para Férias: R$ ${vacationReserve.toFixed(2)}
==============================
`;

    // Exibir o relatório
    openPopup(reportContentForFreelancer, "Relatório para o Freelancer");

    // Opção para salvar o relatório como arquivo de texto
    const blob = new Blob([reportContentForFreelancer], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Relatorio_Freelancer_${currentDate.replace(/\//g, "-")}.txt`;
    a.click();
    URL.revokeObjectURL(url);
}

// Inicialização ao carregar a página
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('results').classList.add('hidden');
});