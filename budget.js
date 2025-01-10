// Função para obter o IP do cliente (usando uma API externa)
async function getClientIP() {
    try {
        const response = await fetch('https://api.ipify.org?format=json');
        const data = await response.json();
        return data.ip; // Retorna o IP do cliente
    } catch (error) {
        console.error("Erro ao obter o IP:", error);
        return "IP não disponível";
    }
}

// Função para codificar o IP (usando Base64)
function encodeIP(ip) {
    return btoa(ip); // Codifica o IP em Base64
}

// Função para gerar o orçamento
async function generateBudget() {
    // Obter o IP do cliente
    const clientIP = await getClientIP();
    const encodedIP = encodeIP(clientIP); // Codifica o IP

    // Informações do freelancer
    const freelancerName = prompt("Digite seu nome completo:", "Seu Nome");
    const freelancerEmail = prompt("Digite seu e-mail:", "seuemail@exemplo.com");
    const freelancerWhatsApp = prompt("Digite seu WhatsApp:", "(11) 98765-4321");

    // Informações do projeto
    const projectName = prompt("Digite o nome do projeto:", "Desenvolvimento de Software");
    const projectTotal = document.getElementById("projectTotal").innerText || "R$ 0,00";
    const hourlyRate = document.getElementById("hourlyRate").innerText || "R$ 0,00";
    const currentDate = new Date().toLocaleDateString("pt-BR");

    // Criar o conteúdo do orçamento
    const budgetContent = `
==============================
ORÇAMENTO PARA CLIENTE
==============================
Data: ${currentDate}
Freelancer: ${freelancerName}
E-mail: ${freelancerEmail}
WhatsApp: ${freelancerWhatsApp}
==============================
Projeto: ${projectName}
Valor Hora: ${hourlyRate}
Valor Total do Projeto: ${projectTotal}
==============================
IP Codificado: ${encodedIP}
==============================
Observação: Este orçamento é uma estimativa e não constitui um comprovante de recebimento de serviço. 
É apenas uma aproximação não minuciosa, mas próxima da realidade.
==============================
`;

    // Exibir o orçamento em uma nova janela
    const budgetWindow = window.open("", "Orçamento", "width=600,height=400");
    budgetWindow.document.write(`<pre>${budgetContent}</pre>`);
    budgetWindow.document.close();

    // Opção para salvar o orçamento como arquivo de texto
    const blob = new Blob([budgetContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Orcamento_${currentDate.replace(/\//g, "-")}.txt`;
    a.click();
    URL.revokeObjectURL(url);
}