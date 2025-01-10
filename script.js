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
        document.getElementById('salaryGoal').value = (projectTotal - totalFixedCosts - totalVariableCosts).toFixed(2); // Exibe o salário líquido calculado
    } else if (!isNaN(salaryGoal) && salaryGoal > 0) {
        // Baseado no salário líquido desejado
        hourlyRate = (salaryGoal + totalFixedCosts + totalVariableCosts) / totalWorkingHours;
        projectTotal = hourlyRate * totalWorkingHours;
        document.getElementById('customHourlyRate').value = hourlyRate.toFixed(2); // Exibe o valor da hora calculado
    } else {
        alert('Informe pelo menos o salário líquido ou o valor da hora.');
        return;
    }

    // Exibir os resultados
    document.getElementById("hourlyRate").innerText = hourlyRate.toFixed(2);
    document.getElementById("projectTotal").innerText = projectTotal.toFixed(2);
    document.getElementById("results").classList.remove("hidden");

    // Gerar o orçamento e relatório automaticamente após o cálculo
    generateClientBudget();
    generateFreelancerReport();
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

// Função para obter o IP do cliente
async function getClientIP() {
    try {
        const response = await fetch('https://api.ipify.org?format=json');
        const data = await response.json();
        return data.ip;
    } catch (error) {
        console.error("Erro ao obter o IP:", error);
        return "IP não disponível";
    }
}

// Função para codificar o IP
function encodeIP(ip) {
    return btoa(ip);
}

// Função para gerar o orçamento para o cliente
async function generateClientBudget() {
    const clientIP = await getClientIP();
    const encodedIP = encodeIP(clientIP);

    // Informações do freelancer
    const freelancerName = prompt("Digite seu nome completo:", "Seu Nome");
    const freelancerEmail = prompt("Digite seu e-mail:", "seuemail@exemplo.com");
    const freelancerWhatsApp = prompt("Digite seu WhatsApp:", "(11) 98765-4321");

    // Informações do projeto
    const projectName = prompt("Digite o nome do projeto:", "Desenvolvimento de Software");
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
Freelancer: ${freelancerName}
E-mail: ${freelancerEmail}
WhatsApp: ${freelancerWhatsApp}
==============================
Projeto: ${projectName}
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
IP Codificado: ${encodedIP}
==============================
Observação: Este orçamento é uma estimativa e não constitui um comprovante de recebimento de serviço. 
É apenas uma aproximação não minuciosa, mas próxima da realidade.
==============================
`;

    // Tenta abrir uma nova janela
    const budgetWindowForClient = window.open("", "Orçamento para o Cliente", "width=600,height=600");

    if (budgetWindowForClient) {
        // Se a janela foi aberta com sucesso
        budgetWindowForClient.document.write(`<pre>${budgetContentForClient}</pre>`);
        budgetWindowForClient.document.close();
    } else {
        // Se a janela não foi aberta (pop-up bloqueado ou contexto restrito)
        alert("Pop-up bloqueado! O orçamento será exibido abaixo.");
        const resultsDiv = document.getElementById("results");
        resultsDiv.innerHTML = `<pre>${budgetContentForClient}</pre>`;
    }

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
    const clientIP = await getClientIP();
    const encodedIP = encodeIP(clientIP);

    // Informações do freelancer
    const freelancerName = prompt("Digite seu nome completo:", "Seu Nome");
    const freelancerEmail = prompt("Digite seu e-mail:", "seuemail@exemplo.com");
    const freelancerWhatsApp = prompt("Digite seu WhatsApp:", "(11) 98765-4321");

    // Informações do projeto
    const projectName = prompt("Digite o nome do projeto:", "Desenvolvimento de Software");
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
Freelancer: ${freelancerName}
E-mail: ${freelancerEmail}
WhatsApp: ${freelancerWhatsApp}
==============================
Projeto: ${projectName}
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
IP Codificado: ${encodedIP}
==============================
`;

    // Tenta abrir uma nova janela
    const reportWindowForFreelancer = window.open("", "Relatório para o Freelancer", "width=600,height=600");

    if (reportWindowForFreelancer) {
        // Se a janela foi aberta com sucesso
        reportWindowForFreelancer.document.write(`<pre>${reportContentForFreelancer}</pre>`);
        reportWindowForFreelancer.document.close();
    } else {
        // Se a janela não foi aberta (pop-up bloqueado ou contexto restrito)
        alert("Pop-up bloqueado! O relatório será exibido abaixo.");
        const resultsDiv = document.getElementById("results");
        resultsDiv.innerHTML = `<pre>${reportContentForFreelancer}</pre>`;
    }

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