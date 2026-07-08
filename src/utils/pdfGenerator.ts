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

export function exportCustomBudgetReportToPDF(options: {
  title: string;
  subtitle: string;
  includeKPIs: boolean;
  includeUnits: boolean;
  includeTopCC: boolean;
  includeFileList: boolean;
  includeRecentRows: boolean;
  stats: {
    totalOrcado: number;
    totalRealizado: number;
    variation: number;
    executionRate: number;
    sesiOrcado: number;
    sesiRealizado: number;
    senaiOrcado: number;
    senaiRealizado: number;
    firjanOrcado: number;
    firjanRealizado: number;
  };
  topCCs: Array<{ name: string; value: number }>;
  uploadedFiles: Array<{ name: string; size: string; uploadedAt: string; type: string }>;
  recentRows: Array<any>;
}) {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  // --- Header Banner ---
  doc.setFillColor(31, 23, 56); // Deep purple corporate theme
  doc.rect(0, 0, 210, 38, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text("FIRJAN SESI SENAI • ADMIN HUB", 15, 14);
  
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text("SISTEMA DE AUDITORIA ORÇAMENTÁRIA E DIRETORIA FINANCEIRA", 15, 19);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setFillColor(168, 85, 247); // Light purple badge
  doc.rect(145, 10, 50, 10, "F");
  doc.setTextColor(255, 255, 255);
  doc.text("CONSOLIDADO YTD", 170, 16.5, { align: "center" });

  // Title / Subtitle on page body
  let currentY = 48;
  doc.setTextColor(31, 23, 56);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(15);
  doc.text(options.title.toUpperCase(), 15, currentY);
  currentY += 6;

  doc.setFont("helvetica", "italic");
  doc.setTextColor(100, 100, 100);
  doc.setFontSize(10);
  doc.text(options.subtitle, 15, currentY);
  currentY += 8;

  doc.setTextColor(140, 140, 140);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.text(`Documento Executivo Gerado em: ${new Date().toLocaleDateString("pt-BR")} às ${new Date().toLocaleTimeString("pt-BR")} • Coordenadora Marília de Melo Brito`, 15, currentY);
  currentY += 4;

  doc.setDrawColor(220, 220, 220);
  doc.setLineWidth(0.5);
  doc.line(15, currentY, 195, currentY);
  currentY += 10;

  // --- Section: KPIs Summary ---
  if (options.includeKPIs) {
    doc.setTextColor(31, 23, 56);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("1. RESUMO EXECUTIVO DE CONTAS (YTD)", 15, currentY);
    currentY += 6;

    // Drawing 3 blocks for KPIs
    const drawKpiCard = (x: number, y: number, w: number, h: number, title: string, value: string, sub: string, titleColor: [number, number, number]) => {
      doc.setFillColor(248, 249, 250);
      doc.rect(x, y, w, h, "F");
      doc.setDrawColor(230, 230, 230);
      doc.rect(x, y, w, h, "S");
      
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(titleColor[0], titleColor[1], titleColor[2]);
      doc.text(title, x + 4, y + 5);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(20, 20, 20);
      doc.text(value, x + 4, y + 12);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(7);
      doc.setTextColor(120, 120, 120);
      doc.text(sub, x + 4, y + 18);
    };

    drawKpiCard(15, currentY, 56, 22, "TOTAL ORÇADO (PLANEJADO)", `R$ ${options.stats.totalOrcado.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`, "Planejado para o ano fiscal", [100, 110, 120]);
    drawKpiCard(76, currentY, 56, 22, "TOTAL REALIZADO (EXECUÇÃO)", `R$ ${options.stats.totalRealizado.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`, "Consumido em lançamentos reais", [168, 85, 247]);
    
    const isEconomia = options.stats.variation <= 0;
    const varText = `R$ ${Math.abs(options.stats.variation).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;
    const varStatus = isEconomia ? "Economia (Saving)" : "Desvio (Estouro)";
    const cardColor: [number, number, number] = isEconomia ? [16, 124, 65] : [220, 38, 38];
    drawKpiCard(137, currentY, 58, 22, `SALDO DE VARIAÇÃO (${varStatus})`, varText, isEconomia ? "Abaixo do teto planejado" : "Aviso de despesas excedidas", cardColor);

    currentY += 27;

    // Executive thermometer text
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(80, 80, 80);
    doc.text(`Taxa de Execução Orçamentária Geral: ${options.stats.executionRate.toFixed(1)}%`, 15, currentY);
    
    // Draw thermometer
    doc.setFillColor(235, 235, 240);
    doc.rect(15, currentY + 2, 180, 3, "F");
    const barWidth = Math.min(180, (options.stats.executionRate / 100) * 180);
    doc.setFillColor(147, 51, 234);
    doc.rect(15, currentY + 2, barWidth, 3, "F");
    
    currentY += 12;
  }

  // --- Section: Breakdown by Units ---
  if (options.includeUnits) {
    doc.setTextColor(31, 23, 56);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("2. DESDOBRAMENTO POR ENTIDADE/ÓRGÃO", 15, currentY);
    currentY += 6;

    // Header of table
    doc.setFillColor(31, 23, 56);
    doc.rect(15, currentY, 180, 7, "F");
    
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.text("Órgão", 18, currentY + 4.5);
    doc.text("Teto Planejado (R$)", 60, currentY + 4.5);
    doc.text("Execução Realizada (R$)", 110, currentY + 4.5);
    doc.text("Exec. (%)", 165, currentY + 4.5);

    currentY += 7;

    const drawUnitRow = (name: string, planejado: number, realizado: number) => {
      doc.setFillColor(252, 252, 253);
      doc.rect(15, currentY, 180, 7, "F");
      doc.setDrawColor(240, 240, 240);
      doc.rect(15, currentY, 180, 7, "S");
      
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(40, 40, 40);
      doc.text(name, 18, currentY + 4.5);

      doc.setFont("helvetica", "normal");
      doc.text(planejado.toLocaleString("pt-BR", { minimumFractionDigits: 2 }), 60, currentY + 4.5);
      doc.text(realizado.toLocaleString("pt-BR", { minimumFractionDigits: 2 }), 110, currentY + 4.5);
      
      const rate = planejado > 0 ? (realizado / planejado) * 100 : 0;
      doc.setFont("helvetica", "bold");
      doc.text(`${rate.toFixed(1)}%`, 165, currentY + 4.5);
      currentY += 7;
    };

    drawUnitRow("SESI - Serviço Social da Indústria", options.stats.sesiOrcado, options.stats.sesiRealizado);
    drawUnitRow("SENAI - Serviço Nacional de Aprendizagem", options.stats.senaiOrcado, options.stats.senaiRealizado);
    drawUnitRow("FIRJAN - Federação das Indústrias", options.stats.firjanOrcado, options.stats.firjanRealizado);

    currentY += 6;
  }

  // Check for page break if space is tight
  if (currentY > 210) {
    doc.addPage();
    currentY = 20;
  }

  // --- Section: Top Offenders ---
  if (options.includeTopCC && options.topCCs && options.topCCs.length > 0) {
    doc.setTextColor(31, 23, 56);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("3. MAIORES CONSUMOS POR CENTRO DE CUSTO", 15, currentY);
    currentY += 6;

    doc.setFillColor(31, 23, 56);
    doc.rect(15, currentY, 180, 7, "F");
    
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.text("Centro de Custo", 18, currentY + 4.5);
    doc.text("Consumo Registrado (R$)", 140, currentY + 4.5);

    currentY += 7;

    options.topCCs.forEach((cc) => {
      doc.setFillColor(252, 252, 253);
      doc.rect(15, currentY, 180, 7, "F");
      doc.setDrawColor(240, 240, 240);
      doc.rect(15, currentY, 180, 7, "S");
      
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(50, 50, 50);
      doc.text(cc.name, 18, currentY + 4.5);
      doc.text(cc.value.toLocaleString("pt-BR", { minimumFractionDigits: 2 }), 140, currentY + 4.5);
      
      currentY += 7;
    });

    currentY += 6;
  }

  if (currentY > 210) {
    doc.addPage();
    currentY = 20;
  }

  // --- Section: Uploaded files ---
  if (options.includeFileList && options.uploadedFiles && options.uploadedFiles.length > 0) {
    doc.setTextColor(31, 23, 56);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("4. FONTES DE INFORMAÇÕES INTEGRADAS (REPOSITÓRIO)", 15, currentY);
    currentY += 6;

    doc.setFillColor(31, 23, 56);
    doc.rect(15, currentY, 180, 7, "F");
    
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.text("Nome do Relatório Carregado", 18, currentY + 4.5);
    doc.text("Tamanho", 110, currentY + 4.5);
    doc.text("Identificação de Tipo", 140, currentY + 4.5);

    currentY += 7;

    options.uploadedFiles.forEach((file) => {
      doc.setFillColor(252, 252, 253);
      doc.rect(15, currentY, 180, 7, "F");
      doc.setDrawColor(240, 240, 240);
      doc.rect(15, currentY, 180, 7, "S");
      
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
      doc.setTextColor(55, 55, 55);
      doc.text(file.name.length > 50 ? file.name.substring(0, 48) + "..." : file.name, 18, currentY + 4.5);
      doc.text(file.size, 110, currentY + 4.5);
      
      const isDet = file.name.toLowerCase().includes("detalhe") || file.name.toLowerCase().includes("orcamento") || file.name.toLowerCase().includes("abr") || file.name.toLowerCase().includes("mai");
      const isRaz = file.name.toLowerCase().includes("razao") || file.name.toLowerCase().includes("extrato") || file.name.toLowerCase().includes("ledger");
      let idType = isDet ? "Planilha de Detalhes Orçados" : isRaz ? "Razão de Auditoria Fiscal" : "Dados Orçamentários";
      
      doc.text(idType, 140, currentY + 4.5);
      
      currentY += 7;
    });

    currentY += 6;
  }

  if (currentY > 210) {
    doc.addPage();
    currentY = 20;
  }

  // --- Section: Recent Rows (Data Sample) ---
  if (options.includeRecentRows && options.recentRows && options.recentRows.length > 0) {
    doc.setTextColor(31, 23, 56);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("5. EXTRATO DE REGISTROS ORÇAMENTÁRIOS INTEGRADOS", 15, currentY);
    currentY += 6;

    doc.setFillColor(31, 23, 56);
    doc.rect(15, currentY, 180, 7, "F");
    
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.text("Órgão", 18, currentY + 4.5);
    doc.text("Centro de Custo", 40, currentY + 4.5);
    doc.text("Descrição Conta N6", 90, currentY + 4.5);
    doc.text("Tipo", 145, currentY + 4.5);
    doc.text("Total (R$)", 165, currentY + 4.5);

    currentY += 7;

    const sample = options.recentRows.slice(0, 10);
    sample.forEach((row) => {
      doc.setFillColor(252, 252, 253);
      doc.rect(15, currentY, 180, 7, "F");
      doc.setDrawColor(240, 240, 240);
      doc.rect(15, currentY, 180, 7, "S");
      
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7);
      doc.setTextColor(60, 60, 60);
      
      const org = String(row["Organização"] || row["organizacao"] || "SESI").substring(0, 10);
      const cc = String(row["Descricao Centro de Custo"] || row["Centro de Custo"] || "Geral").substring(0, 25);
      const c6 = String(row["Descricao Conta N6"] || row["conta"] || "Salários").substring(0, 28);
      const orig = String(row["Origem"] || row["tipo"] || "REALIZADO");
      const totVal = row["Total"] || row["valor"] || "0";
      const tot = Number(String(totVal).replace(/[^\d.-]/g, "")) || 0;

      doc.text(org, 18, currentY + 4.5);
      doc.text(cc, 40, currentY + 4.5);
      doc.text(c6, 90, currentY + 4.5);
      doc.text(orig, 145, currentY + 4.5);
      doc.text(tot.toLocaleString("pt-BR", { minimumFractionDigits: 2 }), 165, currentY + 4.5);
      
      currentY += 7;
    });

    currentY += 6;
  }

  if (currentY > 215) {
    doc.addPage();
    currentY = 20;
  }

  // --- Signatures & Homologation ---
  doc.setDrawColor(220, 220, 220);
  doc.setLineWidth(0.5);
  doc.line(15, currentY + 5, 195, currentY + 5);
  currentY += 15;

  doc.setTextColor(31, 23, 56);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text("5. CERTIFICAÇÃO E AUDITORIA FINANCEIRA", 15, currentY);
  currentY += 5;

  doc.setFont("helvetica", "normal");
  doc.setTextColor(80, 80, 80);
  doc.setFontSize(8);
  doc.text(
    "Este relatório consolidado representa o fechamento e desdobramentos de gastos acumulados YTD do exercício financeiro. Todos os lançamentos foram auditados em tempo real através de cruzamento eletrônico com os extratos bancários das contas fiscais.",
    15,
    currentY,
    { maxWidth: 180 }
  );
  currentY += 18;

  // Signatures side by side
  doc.line(15, currentY + 10, 95, currentY + 10);
  doc.setFont("helvetica", "bold");
  doc.text("Marília Moreira de Melo Brito", 55, currentY + 14, { align: "center" });
  doc.setFont("helvetica", "italic");
  doc.text("Coordenadora de Orçamento e Controle", 55, currentY + 18, { align: "center" });

  doc.line(115, currentY + 10, 195, currentY + 10);
  doc.setFont("helvetica", "bold");
  doc.text("Diretoria Financeira • FIRJAN", 155, currentY + 14, { align: "center" });
  doc.setFont("helvetica", "italic");
  doc.text("Assinatura e Homologação", 155, currentY + 18, { align: "center" });

  // Footer branding
  doc.setFont("helvetica", "bold");
  doc.setTextColor(150, 150, 150);
  doc.setFontSize(8);
  doc.text("FIRJAN ADMIN HUB • DEPARTAMENTO DE CONTROLADORIA E ORÇAMENTO", 105, 280, { align: "center" });

  // Save document
  doc.save(`${options.title.replace(/\s+/g, "_")}_YTD.pdf`);
}
