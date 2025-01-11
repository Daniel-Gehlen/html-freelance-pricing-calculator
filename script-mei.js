// Constantes de Taxas para MEI
const TAX_RATES_MEI = {
    inss: 0.05, // 5% do salário mínimo (INSS)
    iss: 0.05,  // 5% (ISS para serviços)
    total: 0.10 // Total de impostos (10%)
};

// Arrays globais
let fixedCosts = [];
let variableCosts = [];
let workingHours = [];
let workDays = [];
let extraHours = [];

// Variável global para armazenar os dados do freelancer
let freelancerData = null;

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

// Função para calcular as taxas do MEI
function calculateTaxesMEI(monthlyRevenue) {
    const inss = monthlyRevenue * TAX_RATES_MEI.inss;
    const iss = monthlyRevenue * TAX_RATES_MEI.iss;
    const totalTaxes = monthlyRevenue * TAX_RATES_MEI.total;

    return {
        inss: inss,
        iss: iss,
        total: totalTaxes
    };
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
    const taxesBreakdown = calculateTaxesMEI(projectTotal);

    // Conteúdo do orçamento para o cliente
    const budgetContentForClient = `
==============================
ORÇAMENTO PARA CLIENTE (MEI)
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
IMPOSTOS DETALHADOS (MEI):
- INSS: R$ ${taxesBreakdown.inss.toFixed(2)} (${((taxesBreakdown.inss / projectTotal) * 100).toFixed(2)}%)
- ISS: R$ ${taxesBreakdown.iss.toFixed(2)} (${((taxesBreakdown.iss / projectTotal) * 100).toFixed(2)}%)
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
    a.download = `Orcamento_Cliente_MEI_${currentDate.replace(/\//g, "-")}.txt`;
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
    const taxesBreakdown = calculateTaxesMEI(projectTotal);

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
RELATÓRIO COMPLETO PARA O FREELANCER (MEI)
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
IMPOSTOS DETALHADOS (MEI):
- INSS: R$ ${taxesBreakdown.inss.toFixed(2)} (${((taxesBreakdown.inss / projectTotal) * 100).toFixed(2)}%)
- ISS: R$ ${taxesBreakdown.iss.toFixed(2)} (${((taxesBreakdown.iss / projectTotal) * 100).toFixed(2)}%)
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
    a.download = `Relatorio_Freelancer_MEI_${currentDate.replace(/\//g, "-")}.txt`;
    a.click();
    URL.revokeObjectURL(url);
}

// Função para abrir um popup com o conteúdo
function openPopup(content, title) {
    const popup = window.open("", title, "width=600,height=400");
    popup.document.write(`<pre>${content}</pre>`);
    popup.document.close();
}

// Função para coletar os dados do freelancer
async function collectFreelancerData() {
    if (!freelancerData) {
        freelancerData = {
            name: prompt("Por favor, insira seu nome completo:"),
            email: prompt("Por favor, insira seu e-mail:"),
            whatsApp: prompt("Por favor, insira seu número de WhatsApp:"),
            projectName: prompt("Por favor, insira o nome do projeto:")
        };
    }
    return freelancerData;
}

// Inicialização ao carregar a página
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('results').classList.add('hidden');
});