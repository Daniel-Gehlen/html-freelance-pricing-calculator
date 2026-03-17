// Constantes atualizadas para MEI (valores de 2023)
const TAX_RATES_MEI = {
  inss: 0.05, // 5% sobre o salário mínimo (R$ 66,00 em 2023)
  iss: 0.05, // 5% sobre o faturamento (para serviços)
  das: 66.0, // Valor fixo do DAS para MEI (em 2023)
};

// Arrays globais para armazenamento de dados
let fixedCosts = [];
let variableCosts = [];
let workingHours = [];
let workDays = [];
let extraHours = [];

// Variável global para armazenar os dados do freelancer (persistente)
let freelancerData =
  JSON.parse(localStorage.getItem("freelancerData_mei")) || null;

/**
 * Sistema de Notificações Global
 */
function showNotification(message, type = "info") {
  console.log(`[${type.toUpperCase()}] ${message}`);
  alert(message);
}

/**
 * Validação de entrada genérica
 */
function validateInput(value, description, type = "number") {
  if (!description || description.trim() === "") {
    showNotification("A descrição não pode estar vazia!", "error");
    return false;
  }
  if (type === "number" && (isNaN(value) || value <= 0)) {
    showNotification("O valor deve ser um número maior que zero!", "error");
    return false;
  }
  return true;
}

// Tratamento de Erros Global
window.onerror = function (message, source, lineno, colno, error) {
  showNotification(`Erro inesperado: ${message}`, "error");
  return true;
};

/**
 * Salva os estados atuais no LocalStorage
 */
function saveData() {
  localStorage.setItem("fixedCosts_mei", JSON.stringify(fixedCosts));
  localStorage.setItem("variableCosts_mei", JSON.stringify(variableCosts));
  localStorage.setItem("workingHours_mei", JSON.stringify(workingHours));
  localStorage.setItem("freelancerData_mei", JSON.stringify(freelancerData));
}

/**
 * Carrega os estados do LocalStorage
 */
function loadData() {
  fixedCosts = JSON.parse(localStorage.getItem("fixedCosts_mei")) || [];
  variableCosts = JSON.parse(localStorage.getItem("variableCosts_mei")) || [];
  workingHours = JSON.parse(localStorage.getItem("workingHours_mei")) || [];

  updateList("fixedCostsList", fixedCosts, "cost");
  updateList("variableCostsList", variableCosts, "cost");
  updateList("workingHoursList", workingHours, "hours");
}

// Função para adicionar item a uma lista
function addItem(listId, descriptionId, valueId, type) {
  const description = document.getElementById(descriptionId).value.trim();
  const value = parseFloat(document.getElementById(valueId).value);

  if (!validateInput(value, description, "number")) {
    return;
  }

  const item =
    type === "hours"
      ? { description, availableHoursPerMonth: value }
      : { description, cost: value };

  if (listId === "fixedCostsList") {
    fixedCosts.push(item);
  } else if (listId === "variableCostsList") {
    variableCosts.push(item);
  } else if (listId === "workingHoursList") {
    workingHours.push(item);
  }

  saveData();
  updateList(
    listId,
    listId === "fixedCostsList"
      ? fixedCosts
      : listId === "variableCostsList"
        ? variableCosts
        : workingHours,
    type,
  );

  document.getElementById(descriptionId).value = "";
  document.getElementById(valueId).value = "";
}

// Função para atualizar listas no HTML
function updateList(listId, items, type) {
  const list = document.getElementById(listId);
  list.innerHTML = items
    .map((item, index) => {
      const value = type === "hours" ? item.availableHoursPerMonth : item.cost;
      const valueLabel = type === "hours" ? "Horas" : "R$";
      return `
            <div class="list-item">
                ${item.description} - ${valueLabel} ${value.toFixed(2)}
                <button onclick="editItem('${listId}', ${index}, '${type}')">Editar</button>
                <button onclick="deleteItem('${listId}', ${index}, '${type}')">Excluir</button>
            </div>
        `;
    })
    .join("");
}

// Função para editar item em uma lista
function editItem(listId, index, type) {
  let list;
  if (listId === "fixedCostsList") {
    list = fixedCosts;
  } else if (listId === "variableCostsList") {
    list = variableCosts;
  } else {
    list = workingHours;
  }
  const item = list[index];

  // Preencher o modal
  document.getElementById("editIndex").value = index;
  document.getElementById("editListId").value = listId;
  document.getElementById("editType").value = type;
  document.getElementById("editDescription").value = item.description;
  document.getElementById("editValue").value =
    type === "hours" ? item.availableHoursPerMonth : item.cost;

  // Mostrar o modal (Bootstrap 5)
  const editModal = new bootstrap.Modal(document.getElementById("editModal"));
  editModal.show();
}

/**
 * Confirma a edição vinda do modal
 */
function confirmEdit() {
  const index = document.getElementById("editIndex").value;
  const listId = document.getElementById("editListId").value;
  const type = document.getElementById("editType").value;
  const description = document.getElementById("editDescription").value;
  const value = parseFloat(document.getElementById("editValue").value);

  if (!validateInput(value, description, "number")) return;

  let list;
  if (listId === "fixedCostsList") {
    list = fixedCosts;
  } else if (listId === "variableCostsList") {
    list = variableCosts;
  } else {
    list = workingHours;
  }

  const item = list[index];
  item.description = description;
  if (type === "hours") {
    item.availableHoursPerMonth = value;
  } else {
    item.cost = value;
  }

  saveData();
  updateList(listId, list, type);

  // Fechar o modal
  const modalElement = document.getElementById("editModal");
  const modalInstance = bootstrap.Modal.getInstance(modalElement);
  modalInstance.hide();

  showNotification("Item atualizado com sucesso!", "success");
}

// Função para excluir item de uma lista
function deleteItem(listId, index, type) {
  let list;
  if (listId === "fixedCostsList") {
    list = fixedCosts;
  } else if (listId === "variableCostsList") {
    list = variableCosts;
  } else {
    list = workingHours;
  }
  list.splice(index, 1);
  updateList(listId, list, type);
}

// Função para alternar entre os tipos de cálculo
function toggleCalculationType(type) {
  const salaryGoalInput = document.getElementById("salaryGoal");
  const customHourlyRateInput = document.getElementById("customHourlyRate");

  if (type === "salary") {
    salaryGoalInput.disabled = false;
    customHourlyRateInput.disabled = true;
    customHourlyRateInput.value = "";
  } else if (type === "hourlyRate") {
    salaryGoalInput.disabled = true;
    customHourlyRateInput.disabled = false;
    salaryGoalInput.value = "";
  }
}

// Função para calcular os valores
function calculate() {
  const salaryGoal = parseFloat(document.getElementById("salaryGoal").value);
  const customHourlyRate = parseFloat(
    document.getElementById("customHourlyRate").value,
  );

  let totalFixedCosts = fixedCosts.reduce((sum, item) => sum + item.cost, 0);
  let totalVariableCosts = variableCosts.reduce(
    (sum, item) => sum + item.cost,
    0,
  );
  let totalWorkingHours = workingHours.reduce(
    (sum, item) => sum + item.availableHoursPerMonth,
    0,
  );

  if (totalWorkingHours <= 0) {
    alert("O total de horas trabalhadas deve ser maior que zero!");
    return;
  }

  let hourlyRate = 0;
  let projectTotal = 0;

  if (!isNaN(customHourlyRate) && customHourlyRate > 0) {
    hourlyRate = customHourlyRate;
    projectTotal = hourlyRate * totalWorkingHours;
  } else if (!isNaN(salaryGoal) && salaryGoal > 0) {
    hourlyRate =
      (salaryGoal + totalFixedCosts + totalVariableCosts) / totalWorkingHours;
    projectTotal = hourlyRate * totalWorkingHours;
  } else {
    alert("Informe pelo menos o salário líquido ou o valor da hora.");
    return;
  }

  document.getElementById("hourlyRate").innerText = hourlyRate.toFixed(2);
  document.getElementById("projectTotal").innerText = projectTotal.toFixed(2);
  document.getElementById("results").classList.remove("hidden");

  // Gerar Gráfico
  renderCharts(
    totalFixedCosts,
    totalVariableCosts,
    projectTotal - totalFixedCosts - totalVariableCosts,
  );
}

let costsChart = null;
/**
 * Renderiza o gráfico de distribuição de custos
 */
function renderCharts(fixed, variable, profit) {
  const canvas = document.getElementById("costsChart");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");

  if (costsChart) {
    costsChart.destroy();
  }

  costsChart = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: ["Custos Fixos", "Custos Variáveis", "Lucro Estimado"],
      datasets: [
        {
          data: [fixed, variable, profit],
          backgroundColor: ["#6366f1", "#10b981", "#f59e0b"],
          borderWidth: 0,
        },
      ],
    },
    options: {
      plugins: {
        legend: { position: "bottom", labels: { color: "#f8fafc" } },
      },
    },
  });
}

/**
 * Exporta os resultados para PDF
 */
function exportToPDF() {
  const element = document.getElementById("results");
  const opt = {
    margin: 10,
    filename: "Orcamento_MEI.pdf",
    image: { type: "jpeg", quality: 0.98 },
    html2canvas: { scale: 2, backgroundColor: "#0f172a" },
    jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
  };
  html2pdf().set(opt).from(element).save();
}

// Função para calcular as taxas do MEI
function calculateTaxesMEI(monthlyRevenue) {
  if (!monthlyRevenue || monthlyRevenue <= 0)
    return {
      das: 0,
      inss: 0,
      iss: 0,
      inssPercentage: "0.00",
      issPercentage: "0.00",
      totalPercentage: "0.00",
    };

  const iss = Math.min(monthlyRevenue * TAX_RATES_MEI.iss, 81.9);
  const inss = TAX_RATES_MEI.das - iss > 0 ? TAX_RATES_MEI.das - iss : 0;
  const totalTaxes = TAX_RATES_MEI.das;

  return {
    das: totalTaxes,
    inss: inss,
    iss: iss,
    inssPercentage: ((inss / monthlyRevenue) * 100).toFixed(2),
    issPercentage: ((iss / monthlyRevenue) * 100).toFixed(2),
    totalPercentage: ((totalTaxes / monthlyRevenue) * 100).toFixed(2),
  };
}

// Função para calcular reservas financeiras
function calculateReserves(salaryGoal, projectTotal) {
  if (!salaryGoal || salaryGoal <= 0) {
    return {
      contingencyReserve: 0,
      monthlyContingencyReserve: 0,
      monthsToSaveContingency: 0,
      monthly13thReserve: 0,
      vacationReserve: 0,
    };
  }

  const contingencyReserve = salaryGoal * 6;
  const monthlyContingencyReserve = projectTotal * 0.2;
  const monthsToSaveContingency =
    monthlyContingencyReserve > 0
      ? contingencyReserve / monthlyContingencyReserve
      : 0;

  return {
    contingencyReserve: contingencyReserve,
    monthlyContingencyReserve: monthlyContingencyReserve,
    monthsToSaveContingency: monthsToSaveContingency.toFixed(1),
    monthly13thReserve: salaryGoal / 12,
    vacationReserve: salaryGoal / 12,
  };
}

// Função para formatar moeda
function formatCurrency(value) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

// Função para coletar dados do freelancer
async function collectFreelancerData() {
  if (!freelancerData) {
    freelancerData = {
      name: prompt("Por favor, insira seu nome completo:") || "Freelancer MEI",
      email:
        prompt("Por favor, insira seu e-mail:") || "contato@freelancer.com",
      whatsApp:
        prompt("Por favor, insira seu número de WhatsApp:") ||
        "(00) 00000-0000",
      projectName:
        prompt("Por favor, insira o nome do projeto:") || "Projeto MEI",
    };

    try {
      await validateFreelancerData(freelancerData);
    } catch (error) {
      alert(error.message);
      return collectFreelancerData();
    }
  }
  return freelancerData;
}

// Função para validar dados do freelancer
async function validateFreelancerData(data) {
  if (!data.name || !data.email || !data.whatsApp || !data.projectName) {
    throw new Error("Todos os dados do freelancer são obrigatórios");
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(data.email)) {
    throw new Error("Por favor, insira um e-mail válido");
  }

  const whatsAppRegex = /^(\+?55)?\s?(\(?\d{2}\)?)?\s?(\d{4,5}\-?\d{4})$/;
  if (!whatsAppRegex.test(data.whatsApp)) {
    throw new Error("Por favor, insira um número de WhatsApp válido");
  }

  return true;
}

// Função para gerar orçamento para o cliente
async function generateClientBudget() {
  try {
    const data = await collectFreelancerData();
    const projectTotal =
      parseFloat(document.getElementById("projectTotal").innerText) || 0;
    const hourlyRate =
      parseFloat(document.getElementById("hourlyRate").innerText) || 0;
    const currentDate = new Date().toLocaleDateString("pt-BR");

    const totalFixedCosts = fixedCosts.reduce(
      (sum, item) => sum + item.cost,
      0,
    );
    const totalVariableCosts = variableCosts.reduce(
      (sum, item) => sum + item.cost,
      0,
    );
    const totalWorkingHours = workingHours.reduce(
      (sum, item) => sum + item.availableHoursPerMonth,
      0,
    );
    const taxes = calculateTaxesMEI(projectTotal);

    const fixedCostsDetails =
      fixedCosts
        .map((item) => `- ${item.description}: ${formatCurrency(item.cost)}`)
        .join("\n") || "Nenhum custo fixo informado";

    const variableCostsDetails =
      variableCosts
        .map((item) => `- ${item.description}: ${formatCurrency(item.cost)}`)
        .join("\n") || "Nenhum custo variável informado";

    const workingHoursDetails =
      workingHours
        .map(
          (item) =>
            `- ${item.description}: ${item.availableHoursPerMonth} horas`,
        )
        .join("\n") || "Nenhuma hora informada";

    const budgetContent = `
==================================================
ORÇAMENTO DETALHADO - ${data.projectName.toUpperCase()}
==================================================
Data: ${currentDate}
Profissional: ${data.name}
Contato: ${data.email} | WhatsApp: ${data.whatsApp}
==================================================

VALORES DO PROJETO:
- Valor Hora: ${formatCurrency(hourlyRate)}
- Horas Estimadas: ${totalWorkingHours} horas
- Valor Total do Projeto: ${formatCurrency(projectTotal)}

DETALHAMENTO DE CUSTOS FIXOS (${fixedCosts.length} itens):
${fixedCostsDetails}
TOTAL CUSTOS FIXOS: ${formatCurrency(totalFixedCosts)}

DETALHAMENTO DE CUSTOS VARIÁVEIS (${variableCosts.length} itens):
${variableCostsDetails}
TOTAL CUSTOS VARIÁVEIS: ${formatCurrency(totalVariableCosts)}

DETALHAMENTO DE HORAS TRABALHADAS:
${workingHoursDetails}
TOTAL HORAS: ${totalWorkingHours} horas

IMPOSTOS (MEI):
- DAS (Documento de Arrecadação do Simples Nacional): ${formatCurrency(taxes.das)}
  - INSS (5% do salário mínimo): ${formatCurrency(taxes.inss)} (${taxes.inssPercentage}%)
  - ISS (5% do faturamento): ${formatCurrency(taxes.iss)} (${taxes.issPercentage}%)
- TOTAL IMPOSTOS: ${formatCurrency(taxes.das)} (${taxes.totalPercentage}% do faturamento)

==================================================
VALOR FINAL DO PROJETO: ${formatCurrency(projectTotal)}
==================================================
`;

    openPopup(budgetContent, "Orçamento Detalhado");
    downloadFile(
      budgetContent,
      `Orcamento_${data.projectName}_${currentDate.replace(/\//g, "-")}.txt`,
    );
  } catch (error) {
    alert(`Erro ao gerar orçamento: ${error.message}`);
  }
}

// Função para gerar relatório completo
async function generateFreelancerReport() {
  try {
    const data = await collectFreelancerData();
    const projectTotal =
      parseFloat(document.getElementById("projectTotal").innerText) || 0;
    const hourlyRate =
      parseFloat(document.getElementById("hourlyRate").innerText) || 0;
    const salaryGoal =
      parseFloat(document.getElementById("salaryGoal").value) || 0;
    const currentDate = new Date().toLocaleDateString("pt-BR");

    const totalFixedCosts = fixedCosts.reduce(
      (sum, item) => sum + item.cost,
      0,
    );
    const totalVariableCosts = variableCosts.reduce(
      (sum, item) => sum + item.cost,
      0,
    );
    const totalWorkingHours = workingHours.reduce(
      (sum, item) => sum + item.availableHoursPerMonth,
      0,
    );
    const taxes = calculateTaxesMEI(projectTotal);
    const reserves = calculateReserves(salaryGoal, projectTotal);

    const reportContent = `
==================================================
RELATÓRIO FINANCEIRO COMPLETO - MEI
==================================================
Data: ${currentDate}
Profissional: ${data.name}
Projeto: ${data.projectName}
==================================================

RESUMO FINANCEIRO:
- Faturamento Bruto: ${formatCurrency(projectTotal)}
- Custos Fixos: ${formatCurrency(totalFixedCosts)}
- Custos Variáveis: ${formatCurrency(totalVariableCosts)}
- Impostos (DAS MEI): ${formatCurrency(taxes.das)}
- Lucro Líquido: ${formatCurrency(projectTotal - totalFixedCosts - totalVariableCosts - taxes.das)}

DETALHAMENTO TRIBUTÁRIO (MEI):
- DAS (Documento de Arrecadação do Simples Nacional): ${formatCurrency(taxes.das)}
  - INSS (Previdência): ${formatCurrency(taxes.inss)} (${taxes.inssPercentage}% do faturamento)
  - ISS (Serviços): ${formatCurrency(taxes.iss)} (${taxes.issPercentage}% do faturamento)
- Alíquota Efetiva Total: ${taxes.totalPercentage}%

PLANEJAMENTO FINANCEIRO:
- Meta de Remuneração Mensal: ${formatCurrency(salaryGoal)}
- Reserva de Contingência (6 meses): ${formatCurrency(reserves.contingencyReserve)}
- Reserva Mensal para Contingência: ${formatCurrency(reserves.monthlyContingencyReserve)} (20% do faturamento)
- Tempo para constituir reserva: ${reserves.monthsToSaveContingency} meses
- Reserva Mensal para 13º Salário: ${formatCurrency(reserves.monthly13thReserve)}
- Reserva Mensal para Férias: ${formatCurrency(reserves.vacationReserve)}

ANÁLISE DE PRODUTIVIDADE:
- Valor Hora Calculado: ${formatCurrency(hourlyRate)}
- Horas Trabalhadas no Mês: ${totalWorkingHours} horas
- Receita por Hora Efetiva: ${formatCurrency(projectTotal / totalWorkingHours)}

RECOMENDAÇÕES:
1. Manter pelo menos 20% do faturamento em reserva financeira
2. Revisar os valores dos impostos mensalmente (DAS MEI)
3. Atualizar os custos fixos e variáveis trimestralmente
4. Ajustar o valor hora conforme aumento de experiência e portfólio

==================================================
`;

    openPopup(reportContent, "Relatório Financeiro MEI");
    downloadFile(
      reportContent,
      `Relatorio_MEI_${currentDate.replace(/\//g, "-")}.txt`,
    );
  } catch (error) {
    alert(`Erro ao gerar relatório: ${error.message}`);
  }
}

// Função para abrir popup com conteúdo
function openPopup(content, title) {
  const popup = window.open(
    "",
    title,
    "width=700,height=600,scrollbars=yes,resizable=yes",
  );
  popup.document.write(`
        <html>
        <head>
            <title>${title}</title>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; margin: 20px; white-space: pre-wrap; }
                h1 { color: #2c3e50; }
                .highlight { background-color: #f8f9fa; padding: 10px; border-radius: 5px; }
            </style>
        </head>
        <body>
            <h1>${title}</h1>
            <div class="highlight">${content}</div>
            <button onclick="window.print()">Imprimir</button>
            <button onclick="window.close()">Fechar</button>
        </body>
        </html>
    `);
  popup.document.close();
}

// Função para download de arquivo
function downloadFile(content, filename) {
  try {
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (error) {
    alert(`Erro ao baixar arquivo: ${error.message}`);
  }
}

// Inicialização ao carregar a página
document.addEventListener("DOMContentLoaded", () => {
  try {
    if (typeof loadData === "function") {
      loadData();
    }
    const results = document.getElementById("results");
    if (results) {
      results.classList.add("hidden");
    }
    toggleCalculationType("salary");
  } catch (error) {
    console.error("Falha na inicialização:", error);
  }
});
