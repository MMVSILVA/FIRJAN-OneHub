import { jsPDF } from "jspdf";

interface MaintenanceTicket {
  id: string;
  equipment: string;
  area: string;
  priority: "Alta" | "Média" | "Baixa";
  requester: string;
  date: string;
  description: string;
  status: "Pendente" | "Em Execução" | "Concluído";
  cost: number;
  unit?: "SESI" | "SENAI";
  product?: string;
}

interface BillingInvoice {
  id: string;
  client: string;
  value: number;
  issueDate: string;
  dueDate: string;
  status: "Pago" | "Pendente" | "Atrasado";
  serviceType: string;
  unit?: "SESI" | "SENAI";
  product?: string;
}

/**
 * Exports an individual Maintenance Ticket (Order of Service) to a polished PDF report.
 */
export function exportOSToPDF(os: MaintenanceTicket) {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  // --- Corporate Header Banner ---
  doc.setFillColor(31, 23, 56); // Deep purple/slate color for premium branding
  doc.rect(0, 0, 210, 35, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("FIRJAN SENAI • SESI", 15, 15);
  
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text("SISTEMA UNIFICADO DE CONTROLE DE ATIVOS E MANUTENÇÃO", 15, 21);
  doc.text("RELATÓRIO INDIVIDUAL DE ORDEM DE SERVIÇO (O.S.)", 15, 26);

  // OS ID badge in the header
  doc.setFillColor(168, 85, 247); // Purple accent
  doc.rect(155, 10, 40, 15, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text(os.id, 175, 19, { align: "center" });

  // --- Metadata Section (Date & Info) ---
  doc.setTextColor(80, 80, 80);
  doc.setFont("helvetica", "italic");
  doc.setFontSize(9);
  doc.text(`Documento gerado em: ${new Date().toLocaleDateString("pt-BR")} às ${new Date().toLocaleTimeString("pt-BR")}`, 15, 43);

  // Horizontal line
  doc.setDrawColor(220, 220, 220);
  doc.setLineWidth(0.5);
  doc.line(15, 46, 195, 46);

  // --- Section 1: Dados Gerais ---
  doc.setTextColor(31, 23, 56);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("1. IDENTIFICAÇÃO E LOCALIZAÇÃO", 15, 54);

  // Draw table-like structure for details
  const drawRow = (y: number, label1: string, val1: string, label2: string, val2: string) => {
    doc.setFillColor(248, 249, 250);
    doc.rect(15, y, 180, 8, "F");
    doc.setDrawColor(235, 235, 235);
    doc.rect(15, y, 180, 8, "S");
    doc.line(105, y, 105, y + 8);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(80, 80, 80);
    doc.text(label1, 18, y + 5.5);
    doc.text(label2, 108, y + 5.5);

    doc.setFont("helvetica", "normal");
    doc.setTextColor(20, 20, 20);
    doc.text(val1, 45, y + 5.5);
    doc.text(val2, 138, y + 5.5);
  };

  drawRow(58, "Equipamento:", os.equipment, "Área / Setor:", os.area);
  drawRow(66, "Unidade:", os.unit || "SENAI", "Categoria Ativo:", os.product || "Manutenção Predial");
  drawRow(74, "Solicitante:", os.requester, "Data Agendada:", os.date);

  // --- Section 2: Severidade e Custo ---
  doc.setTextColor(31, 23, 56);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("2. PARÂMETROS OPERACIONAIS E ORÇAMENTÁRIOS", 15, 92);

  // Highlight blocks
  // Priority box
  const priorityColors: { [key: string]: [number, number, number] } = {
    "Alta": [220, 38, 38], // Red
    "Média": [217, 119, 6], // Orange
    "Baixa": [37, 99, 235], // Blue
  };
  const [pr, pg, pb] = priorityColors[os.priority] || [100, 100, 100];
  
  doc.setFillColor(pr, pg, pb);
  doc.rect(15, 96, 55, 18, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text("CRITICIDADE", 42.5, 102, { align: "center" });
  doc.setFontSize(12);
  doc.text(os.priority.toUpperCase(), 42.5, 109, { align: "center" });

  // Status box
  const statusColors: { [key: string]: [number, number, number] } = {
    "Concluído": [16, 124, 65], // Emerald
    "Em Execução": [217, 119, 6], // Amber
    "Pendente": [220, 38, 38], // Red
  };
  const [sr, sg, sb] = statusColors[os.status] || [100, 100, 100];

  doc.setFillColor(sr, sg, sb);
  doc.rect(77, 96, 55, 18, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text("STATUS", 104.5, 102, { align: "center" });
  doc.setFontSize(12);
  doc.text(os.status.toUpperCase(), 104.5, 109, { align: "center" });

  // Cost box
  doc.setFillColor(15, 23, 42); // Dark slate
  doc.rect(140, 96, 55, 18, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text("CUSTO ESTIMADO", 167.5, 102, { align: "center" });
  doc.setFontSize(11);
  doc.text(`R$ ${os.cost.toLocaleString("pt-BR")}`, 167.5, 109, { align: "center" });

  // --- Section 3: Descrição ---
  doc.setTextColor(31, 23, 56);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("3. DESCRIÇÃO DETALHADA DO CHAMADO / FALHA", 15, 126);

  doc.setFillColor(250, 250, 250);
  doc.rect(15, 130, 180, 26, "F");
  doc.setDrawColor(220, 220, 220);
  doc.rect(15, 130, 180, 26, "S");

  doc.setTextColor(40, 40, 40);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  const splitText = doc.splitTextToSize(os.description || "Sem descrição fornecida.", 172);
  doc.text(splitText, 19, 137);

  // --- Section 4: Termo de Responsabilidade ---
  doc.setTextColor(31, 23, 56);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("4. TERMO DE ACOMPANHAMENTO E HOMOLOGAÇÃO", 15, 168);

  doc.setTextColor(80, 80, 80);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.text(
    "Declaro que a manutenção descrita neste documento foi devidamente inspecionada pela Gestora Thais Nicolau e programada em conformidade com as diretrizes operacionais do departamento de manutenção predial e industrial de ativos da Firjan SESI SENAI.",
    15,
    173,
    { maxWidth: 180 }
  );

  // Signature lines
  doc.line(15, 215, 95, 215);
  doc.text("Thais Nicolau", 55, 219, { align: "center" });
  doc.setFont("helvetica", "italic");
  doc.text("Gestão de Manutenção de Ativos", 55, 223, { align: "center" });

  doc.setFont("helvetica", "normal");
  doc.line(115, 215, 195, 215);
  doc.text("Técnico / Responsável de Campo", 155, 219, { align: "center" });
  doc.setFont("helvetica", "italic");
  doc.text("Executor Autorizado", 155, 223, { align: "center" });

  // Footer / Branding
  doc.setFont("helvetica", "bold");
  doc.setTextColor(150, 150, 150);
  doc.setFontSize(8);
  doc.text("FIRJAN ADMIN HUB • CONTROLADORIA INTEGRADA", 105, 255, { align: "center" });

  // Save the PDF
  doc.save(`Ordem_Servico_${os.id}.pdf`);
}

/**
 * Exports an individual Billing Invoice (Faturamento) to a polished PDF receipt/report.
 */
export function exportInvoiceToPDF(inv: BillingInvoice) {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  // --- Corporate Header Banner ---
  doc.setFillColor(15, 23, 42); // Dark slate background for fiscal documents
  doc.rect(0, 0, 210, 35, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("FIRJAN SESI • SENAI", 15, 15);
  
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text("CONTROLE DE FATURAMENTO, COBRANÇA E INADIMPLÊNCIA", 15, 21);
  doc.text("COMPROVANTE DE CONCILIAÇÃO FINANCEIRA INTEGRADA", 15, 26);

  // Invoice ID badge in the header
  doc.setFillColor(245, 158, 11); // Amber accent
  doc.rect(155, 10, 40, 15, "F");
  doc.setTextColor(0, 0, 0); // Black text on yellow background for high contrast
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text(inv.id, 175, 19, { align: "center" });

  // --- Metadata Section (Date & Info) ---
  doc.setTextColor(80, 80, 80);
  doc.setFont("helvetica", "italic");
  doc.setFontSize(9);
  doc.text(`Documento gerado em: ${new Date().toLocaleDateString("pt-BR")} às ${new Date().toLocaleTimeString("pt-BR")}`, 15, 43);

  // Horizontal line
  doc.setDrawColor(220, 220, 220);
  doc.setLineWidth(0.5);
  doc.line(15, 46, 195, 46);

  // --- Section 1: Dados Gerais ---
  doc.setTextColor(15, 23, 42);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("1. IDENTIFICAÇÃO DO PROVEDOR / ASSOCIADO", 15, 54);

  // Draw table-like structure for details
  const drawRow = (y: number, label1: string, val1: string, label2: string, val2: string) => {
    doc.setFillColor(248, 249, 250);
    doc.rect(15, y, 180, 8, "F");
    doc.setDrawColor(235, 235, 235);
    doc.rect(15, y, 180, 8, "S");
    doc.line(105, y, 105, y + 8);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(80, 80, 80);
    doc.text(label1, 18, y + 5.5);
    doc.text(label2, 108, y + 5.5);

    doc.setFont("helvetica", "normal");
    doc.setTextColor(20, 20, 20);
    doc.text(val1, 45, y + 5.5);
    doc.text(val2, 138, y + 5.5);
  };

  const clientStr = String(inv.client || "");
  const serviceTypeStr = String(inv.serviceType || "");
  drawRow(58, "Razão Social:", clientStr.length > 30 ? clientStr.substring(0, 28) + "..." : clientStr, "Organização:", inv.unit || "SESI");
  drawRow(66, "Tipo Serviço:", serviceTypeStr.length > 30 ? serviceTypeStr.substring(0, 28) + "..." : serviceTypeStr, "Pilar Atividade:", inv.product || "Saúde");
  drawRow(74, "Data Emissão:", inv.issueDate, "Data Vencimento:", inv.dueDate);

  // --- Section 2: Valores e Situação Tributária ---
  doc.setTextColor(15, 23, 42);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("2. STATUS FINANCEIRO E LIQUIDAÇÃO", 15, 92);

  // Highlight blocks
  // Value Box
  doc.setFillColor(31, 41, 55); // Dark slate
  doc.rect(15, 96, 55, 18, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text("LÍQUIDO DA NOTA", 42.5, 102, { align: "center" });
  doc.setFontSize(11);
  doc.text(`R$ ${inv.value.toLocaleString("pt-BR")}`, 42.5, 109, { align: "center" });

  // Status Box
  const statusColors: { [key: string]: [number, number, number] } = {
    "Pago": [16, 124, 65], // Green
    "Pendente": [37, 99, 235], // Blue
    "Atrasado": [220, 38, 38], // Red
  };
  const [sr, sg, sb] = statusColors[inv.status] || [100, 100, 100];

  doc.setFillColor(sr, sg, sb);
  doc.rect(77, 96, 55, 18, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text("STATUS ATUAL", 104.5, 102, { align: "center" });
  doc.setFontSize(12);
  doc.text(inv.status.toUpperCase(), 104.5, 109, { align: "center" });

  // Unit Box
  doc.setFillColor(59, 130, 246); // Blue accent
  doc.rect(140, 96, 55, 18, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text("CENTRO DE CUSTO", 167.5, 102, { align: "center" });
  doc.setFontSize(11);
  doc.text(inv.unit || "SESI / SENAI", 167.5, 109, { align: "center" });

  // --- Section 3: Histórico e Descrição ---
  doc.setTextColor(15, 23, 42);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("3. DETALHES DE CONCILIAÇÃO E ESPECIFICAÇÃO", 15, 126);

  doc.setFillColor(250, 250, 250);
  doc.rect(15, 130, 180, 26, "F");
  doc.setDrawColor(220, 220, 220);
  doc.rect(15, 130, 180, 26, "S");

  doc.setTextColor(40, 40, 40);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  
  const textBody = inv.status === "Pago" 
    ? `Esta fatura foi conciliada eletronicamente e liquidada em conformidade com o cronograma de faturamento corporativo. O valor integral de R$ ${inv.value.toLocaleString("pt-BR")} foi registrado como Receita e creditado no caixa operacional da unidade ${inv.unit}.`
    : `Esta fatura encontra-se em aberto (status: ${inv.status}). O departamento de Faturamento e Cobrança sob coordenação de Acrislei sinaliza a pendência do pagamento para o serviço de ${inv.serviceType}.`;

  const splitText = doc.splitTextToSize(textBody, 172);
  doc.text(splitText, 19, 137);

  // --- Section 4: Termo de Responsabilidade ---
  doc.setTextColor(15, 23, 42);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("4. HOMOLOGAÇÃO FINANCEIRA", 15, 168);

  doc.setTextColor(80, 80, 80);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.text(
    "Declaro para os devidos fins regulamentares e de auditoria que os valores constantes deste comprovante foram processados pelo departamento de Controladoria e Faturamento (Cris) da Firjan SESI SENAI e estão em total acordo com o regulamento financeiro e tributário vigente.",
    15,
    173,
    { maxWidth: 180 }
  );

  // Signature lines
  doc.line(15, 215, 95, 215);
  doc.text("Acrislei (Cris)", 55, 219, { align: "center" });
  doc.setFont("helvetica", "italic");
  doc.text("Coordenação de Faturamento e Cobrança", 55, 223, { align: "center" });

  doc.setFont("helvetica", "normal");
  doc.line(115, 215, 195, 215);
  doc.text("Representante do Associado / Cliente", 155, 219, { align: "center" });
  doc.setFont("helvetica", "italic");
  doc.text("Assinatura e Carimbo", 155, 223, { align: "center" });

  // Footer / Branding
  doc.setFont("helvetica", "bold");
  doc.setTextColor(150, 150, 150);
  doc.setFontSize(8);
  doc.text("FIRJAN ADMIN HUB • DEPARTAMENTO DE FATURAMENTO CORPORATIVO", 105, 255, { align: "center" });

  // Save the PDF
  doc.save(`Fatura_${inv.id}.pdf`);
}
