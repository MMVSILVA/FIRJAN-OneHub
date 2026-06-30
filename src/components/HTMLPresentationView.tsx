import React, { useState, useEffect } from "react";
import { 
  Play, 
  Pause, 
  ChevronLeft, 
  ChevronRight, 
  Copy, 
  ExternalLink, 
  Printer, 
  Download, 
  X, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Clock, 
  Wrench, 
  Layers, 
  FileSpreadsheet, 
  Sparkles, 
  CheckCircle, 
  AlertTriangle, 
  Share2, 
  Maximize2 
} from "lucide-react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell 
} from "recharts";

interface PresentationProps {
  theme: "dark" | "light" | "contrast";
  setTheme: (t: "dark" | "light" | "contrast") => void;
  calculatedStats: any;
  onClose: () => void;
  maintenanceTickets: any[];
  costCenters: any[];
  billingInvoices: any[];
  isDateInSelectedTimeframe: (d: string) => boolean;
  globalUnidade: string;
  globalProduto: string;
}

export function HTMLPresentationView({
  theme,
  setTheme,
  calculatedStats,
  onClose,
  maintenanceTickets,
  costCenters,
  billingInvoices,
  isDateInSelectedTimeframe,
  globalUnidade,
  globalProduto
}: PresentationProps) {
  const [slide, setSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [copied, setCopied] = useState(false);

  // Total slides count: 6
  const totalSlides = 6;

  // Autoplay effect
  useEffect(() => {
    let interval: any;
    if (isPlaying) {
      interval = setInterval(() => {
        setSlide((prev) => (prev + 1) % totalSlides);
      }, 5000);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  // Generate shareable link
  const handleCopyLink = () => {
    const origin = window.location.origin + window.location.pathname;
    const shareUrl = `${origin}?view=presentation`;
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  // Aggregate Data for Charts in presentation
  // OS Status count
  const pendingOS = maintenanceTickets.filter(t => t.status === "Pendente").length;
  const activeOS = maintenanceTickets.filter(t => t.status === "Em Execução").length;
  const completedOS = maintenanceTickets.filter(t => t.status === "Concluído").length;

  const osChartData = [
    { name: "Pendente", quantidade: pendingOS, fill: "#EF4444" },
    { name: "Em Execução", quantidade: activeOS, fill: "#F59E0B" },
    { name: "Concluído", quantidade: completedOS, fill: "#10B981" }
  ];

  // Budget Limits vs Spent for top 4 cost centers
  const budgetChartData = costCenters.slice(0, 4).map(cc => ({
    name: (cc.name || "").substring(0, 15),
    Limite: cc.budgetLimit,
    Consumido: cc.spent
  }));

  // Faturamento components
  const paidBilling = billingInvoices.filter(i => i.status === "Pago").reduce((acc, c) => acc + c.value, 0);
  const pendingBilling = billingInvoices.filter(i => i.status === "Pendente").reduce((acc, c) => acc + c.value, 0);
  const overdueBilling = billingInvoices.filter(i => i.status === "Atrasado").reduce((acc, c) => acc + c.value, 0);

  const billingChartData = [
    { name: "Pago", valor: paidBilling, color: "#10B981" },
    { name: "Pendente", valor: pendingBilling, color: "#3B82F6" },
    { name: "Atrasado", valor: overdueBilling, color: "#EF4444" }
  ];

  return (
    <div className={`min-h-screen flex flex-col justify-between ${
      theme === "contrast" 
        ? "bg-black text-[#FFFF00]" 
        : "bg-[#090810] text-slate-100"
    } font-sans relative overflow-hidden`}>
      
      {/* Visual background glows */}
      {theme !== "contrast" && (
        <>
          <div className="absolute top-[-15%] left-[-15%] w-[60%] h-[60%] rounded-full bg-purple-500/10 blur-[150px] pointer-events-none" />
          <div className="absolute bottom-[-15%] right-[-15%] w-[60%] h-[60%] rounded-full bg-cyan-500/10 blur-[150px] pointer-events-none" />
        </>
      )}

      {/* Header Bar */}
      <header className="border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur px-6 py-4 flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <div className="bg-purple-900/40 p-2 rounded-lg border border-purple-500/30">
            <Layers className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h1 className="text-sm font-bold font-mono tracking-wider text-white uppercase flex items-center gap-2">
              FIRJAN OneHub <span className="text-[10px] px-2 py-0.5 bg-purple-950 border border-purple-800 text-purple-300 rounded-full">Slide Show Mode</span>
            </h1>
            <p className="text-[10px] text-zinc-400">Apresentação Estratégica Executiva em HTML</p>
          </div>
        </div>

        {/* Presentation Controls */}
        <div className="flex items-center gap-2.5">
          <button 
            onClick={handleCopyLink}
            className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs text-purple-300 hover:text-white rounded-lg flex items-center gap-1.5 transition"
          >
            <Copy className="w-3.5 h-3.5" />
            {copied ? "Link Copiado!" : "Gerar Link Compartilhável"}
          </button>

          <button 
            onClick={() => window.open(window.location.pathname + "?view=report", "_blank")}
            className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs text-sky-400 hover:text-white rounded-lg flex items-center gap-1.5 transition"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Abrir Relatório Customizado
          </button>

          <button 
            onClick={() => setIsPlaying(!isPlaying)}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 border transition ${
              isPlaying 
                ? "bg-amber-950/30 text-amber-400 border-amber-500/30 hover:bg-amber-900/30" 
                : "bg-emerald-950/30 text-emerald-400 border-emerald-500/30 hover:bg-emerald-900/30"
            }`}
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            {isPlaying ? "PAUSAR AUTOPLAY" : "AUTOPLAY (5s)"}
          </button>

          <button 
            onClick={onClose}
            className="p-1.5 bg-zinc-900 hover:bg-red-950/40 border border-zinc-800 hover:border-red-500/30 rounded-lg text-zinc-400 hover:text-red-400 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Slide Stage (16:9 constrained) */}
      <main className="flex-1 flex items-center justify-center p-6 z-10">
        <div className="w-full max-w-5xl aspect-video bg-[#0c0a15] rounded-2xl border border-zinc-800/80 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col justify-between p-8 relative">
          
          {/* Top subtle line */}
          <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-purple-500 via-cyan-500 to-emerald-500" />

          {/* Slide 1: Cover */}
          {slide === 0 && (
            <div className="flex-1 flex flex-col justify-between text-left">
              <div className="space-y-3">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-purple-950/40 border border-purple-800 text-purple-400 text-[10px] font-mono rounded-full font-bold uppercase tracking-wider">
                  <Sparkles className="w-3 h-3" /> Relatório Executivo Integrado
                </div>
                <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white leading-tight mt-2 font-display">
                  OneHub Gestão de Performance <br />
                  <span className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">SESI • SENAI Integrado</span>
                </h2>
                <p className="text-sm text-zinc-400 max-w-xl leading-relaxed">
                  Consolidação corporativa em tempo de execução: ordens operacionais de Thais Nicolau, limites e auditoria orçamentária de Marília Moreira, recebíveis e controle de inadimplência de Crislei.
                </p>
              </div>

              <div className="border-t border-zinc-800/60 pt-6 flex flex-wrap items-center justify-between gap-4">
                <div className="space-y-1">
                  <span className="text-[9px] font-mono text-zinc-500 block uppercase">Responsável pela Governança</span>
                  <strong className="text-xs text-zinc-300">Coordenadora Tatiane Teixeira Rocha</strong>
                </div>
                <div className="space-y-1 md:text-right">
                  <span className="text-[9px] font-mono text-zinc-500 block uppercase">Data de Apresentação</span>
                  <strong className="text-xs text-purple-400 font-mono">{new Date().toLocaleDateString("pt-BR", { dateStyle: "long" })}</strong>
                </div>
              </div>
            </div>
          )}

          {/* Slide 2: Executive Performance KPIs */}
          {slide === 1 && (
            <div className="flex-1 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase tracking-widest block">SLIDE 2 DE 6 • DESEMPENHO</span>
                <h3 className="text-2xl font-black text-white uppercase font-display tracking-tight mt-1">Indicadores e KPIs Executivos</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 my-auto">
                <div className="bg-[#121020] border border-zinc-800 p-4 rounded-xl flex flex-col justify-between">
                  <div className="flex items-center justify-between text-emerald-450">
                    <span className="text-[9px] font-mono font-bold text-zinc-500">RECEITA</span>
                    <TrendingUp className="w-4 h-4 text-emerald-500" />
                  </div>
                  <div className="mt-2">
                    <strong className="text-lg font-mono text-white">R$ {calculatedStats.totalIssuedBilling.toLocaleString("pt-BR")}</strong>
                    <p className="text-[9px] text-zinc-400 mt-1">Faturamento total YTD</p>
                  </div>
                </div>

                <div className="bg-[#121020] border border-zinc-800 p-4 rounded-xl flex flex-col justify-between">
                  <div className="flex items-center justify-between text-red-400">
                    <span className="text-[9px] font-mono font-bold text-zinc-500">DESPESAS</span>
                    <TrendingDown className="w-4 h-4 text-red-500" />
                  </div>
                  <div className="mt-2">
                    <strong className="text-lg font-mono text-white">R$ {calculatedStats.totalSpent.toLocaleString("pt-BR")}</strong>
                    <p className="text-[9px] text-zinc-400 mt-1">Centros de custos + reparos</p>
                  </div>
                </div>

                <div className="bg-[#121020] border border-zinc-800 p-4 rounded-xl flex flex-col justify-between">
                  <div className="flex items-center justify-between text-cyan-400">
                    <span className="text-[9px] font-mono font-bold text-zinc-500">CAIXA DISPONÍVEL</span>
                    <DollarSign className="w-4 h-4 text-cyan-400" />
                  </div>
                  <div className="mt-2">
                    <strong className="text-lg font-mono text-white">R$ {calculatedStats.availableBudget.toLocaleString("pt-BR")}</strong>
                    <p className="text-[9px] text-emerald-400 mt-1">Saldo remanescente ativo</p>
                  </div>
                </div>

                <div className="bg-[#121020] border border-zinc-800 p-4 rounded-xl flex flex-col justify-between">
                  <div className="flex items-center justify-between text-amber-500">
                    <span className="text-[9px] font-mono font-bold text-zinc-500">INADIMPLÊNCIA</span>
                    <AlertTriangle className="w-4 h-4 text-amber-500" />
                  </div>
                  <div className="mt-2">
                    <strong className="text-lg font-mono text-white">R$ {calculatedStats.overdueBilling.toLocaleString("pt-BR")}</strong>
                    <p className="text-[9px] text-red-400 mt-1">Notas vencidas em atraso</p>
                  </div>
                </div>
              </div>

              <div className="bg-zinc-950/50 p-2.5 rounded-lg border border-zinc-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-400 shrink-0" />
                <p className="text-[10px] text-zinc-400">
                  <strong className="text-white">Diagnóstico Rápido:</strong> Elevada liquidez operacional garantida pela receita síncrona. Porém, o saldo orçamentário requer intervenções pontuais para corrigir desequilíbrios de centros de custos críticos.
                </p>
              </div>
            </div>
          )}

          {/* Slide 3: Manutenção / Thais */}
          {slide === 2 && (
            <div className="flex-1 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase tracking-widest block">SLIDE 3 DE 6 • OPERAÇÕES</span>
                <h3 className="text-2xl font-black text-white uppercase font-display tracking-tight mt-1">Eficiência de Atendimento e SLA de Ativos</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-auto">
                <div className="space-y-3">
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono text-zinc-500 uppercase">Resumo Industrial (Thais Nicolau)</span>
                    <h4 className="text-lg font-bold text-white">Controle de Ativos e Reparos Críticos</h4>
                  </div>
                  <ul className="text-xs space-y-1.5 text-zinc-350 list-disc list-inside">
                    <li>Total de Ordens de Serviço: <strong className="text-white">{maintenanceTickets.length} ordens de trabalho</strong></li>
                    <li>SLA em Execução Ordinária: <strong className="text-amber-400">{activeOS} chamados ativos</strong></li>
                    <li>Investimento Corrente: <strong className="text-white">R$ {calculatedStats.totalMaintenanceCost.toLocaleString("pt-BR")}</strong> em maquinário</li>
                    <li>Gargalo Identificado: <strong className="text-red-400">OS-106 Ponte Rolante (R$ 4.800)</strong> aguardando peças</li>
                  </ul>
                  <div className="p-2 bg-emerald-950/20 border border-emerald-900/30 rounded text-[10px] text-emerald-400">
                    ✔ 84h SLA médio de resolução - Desempenho Operacional Estável.
                  </div>
                </div>

                <div className="h-44 bg-zinc-950/40 p-2 rounded-xl border border-zinc-900 flex flex-col justify-between">
                  <span className="text-[9px] font-mono text-zinc-500 uppercase block text-center">Distribuição de Status de OS</span>
                  <div className="h-36 w-full">
                    <ResponsiveContainer width="99%" height={140}>
                      <BarChart data={osChartData} margin={{ top: 5, right: 10, left: -25, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#222" />
                        <XAxis dataKey="name" stroke="#666" fontSize={10} />
                        <YAxis stroke="#666" fontSize={10} />
                        <Tooltip contentStyle={{ background: "#0c0a15", border: "1px solid #333", fontSize: 10 }} />
                        <Bar dataKey="quantidade" radius={[4, 4, 0, 0]}>
                          {osChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              <p className="text-[9px] text-zinc-500 font-mono text-right">Filtro Unidade Ativo: {globalUnidade} | Linhas Operacionais Estáveis</p>
            </div>
          )}

          {/* Slide 4: Budget / Marília */}
          {slide === 3 && (
            <div className="flex-1 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-mono text-purple-400 font-bold uppercase tracking-widest block">SLIDE 4 DE 6 • ORÇAMENTO</span>
                <h3 className="text-2xl font-black text-white uppercase font-display tracking-tight mt-1">Consolidação Orçamentária e Tetos PMO</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-auto">
                <div className="h-44 bg-zinc-950/40 p-2 rounded-xl border border-zinc-900 flex flex-col justify-between">
                  <span className="text-[9px] font-mono text-zinc-500 uppercase block text-center">Comparativo de Orçamento por CC (R$)</span>
                  <div className="h-36 w-full">
                    <ResponsiveContainer width="99%" height={140}>
                      <BarChart data={budgetChartData} margin={{ top: 5, right: 5, left: -10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#222" />
                        <XAxis dataKey="name" stroke="#666" fontSize={9} />
                        <YAxis stroke="#666" fontSize={9} />
                        <Tooltip contentStyle={{ background: "#0c0a15", border: "1px solid #333", fontSize: 10 }} />
                        <Legend wrapperStyle={{ fontSize: 9 }} />
                        <Bar dataKey="Limite" fill="#4F46E5" radius={[2, 2, 0, 0]} />
                        <Bar dataKey="Consumido" fill="#EF4444" radius={[2, 2, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono text-zinc-500 uppercase">Integridade Fiscal (Marília Moreira)</span>
                    <h4 className="text-lg font-bold text-white">Auditoria dos Centros de Custo</h4>
                  </div>
                  <ul className="text-xs space-y-1.5 text-zinc-350 list-disc list-inside">
                    <li>Cota Geral Alocada: <strong className="text-white">R$ {calculatedStats.totalAllocated.toLocaleString("pt-BR")}</strong></li>
                    <li>Utilização do Período: <strong className="text-white">R$ {calculatedStats.totalSpent.toLocaleString("pt-BR")}</strong></li>
                    <li>Saldo Disponível: <strong className="text-emerald-400">R$ {calculatedStats.availableBudget.toLocaleString("pt-BR")}</strong></li>
                    <li className="text-red-450 font-bold">CC-5 (Rita de Cássia) apresenta estouro grave acima de R$ 50.000.</li>
                  </ul>
                  <div className="p-2 bg-red-950/20 border border-red-900/30 rounded text-[10px] text-red-400">
                    ⚠ Recomenda-se remanejamento de saldos da Sede RJ para cobrir CC-5.
                  </div>
                </div>
              </div>

              <p className="text-[9px] text-zinc-500 font-mono text-right">Governança Integrada PMO FIRJAN</p>
            </div>
          )}

          {/* Slide 5: Recebíveis / Cris */}
          {slide === 4 && (
            <div className="flex-1 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-mono text-amber-500 font-bold uppercase tracking-widest block">SLIDE 5 DE 6 • FINANCEIRO</span>
                <h3 className="text-2xl font-black text-white uppercase font-display tracking-tight mt-1">Faturamento Contratual e Saúde de Caixa</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-auto">
                <div className="space-y-3">
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono text-zinc-500 uppercase">Recebíveis e Inadimplência (Cris/Acrislei)</span>
                    <h4 className="text-lg font-bold text-white">Análise Comercial e Custódia de Receitas</h4>
                  </div>
                  <ul className="text-xs space-y-1.5 text-zinc-350 list-disc list-inside">
                    <li>Total Emitido YTD: <strong className="text-white">R$ {calculatedStats.totalIssuedBilling.toLocaleString("pt-BR")}</strong></li>
                    <li>Faturas Recebidas (Liquidadas): <strong className="text-emerald-400">R$ {calculatedStats.totalPaidBilling.toLocaleString("pt-BR")}</strong></li>
                    <li>Faturas Atrasadas/Vencidas: <strong className="text-red-400">R$ {calculatedStats.overdueBilling.toLocaleString("pt-BR")}</strong></li>
                    <li>Alvo de Protesto: <strong className="text-white">CSN Siderúrgica Norte (R$ 32.000)</strong> em atraso</li>
                  </ul>
                  <div className="p-2 bg-amber-950/20 border border-amber-900/30 rounded text-[10px] text-amber-400">
                    ⚠ Inadimplência sob atenção em {Math.round((calculatedStats.overdueBilling / (calculatedStats.totalIssuedBilling || 1)) * 100)}% das notas emitidas.
                  </div>
                </div>

                <div className="h-44 bg-zinc-950/40 p-2 rounded-xl border border-zinc-900 flex flex-col justify-between">
                  <span className="text-[9px] font-mono text-zinc-500 uppercase block text-center">Faturamento por Categoria (R$)</span>
                  <div className="h-36 w-full flex items-center justify-center">
                    <ResponsiveContainer width="99%" height={140}>
                      <PieChart>
                        <Pie
                          data={billingChartData}
                          cx="50%"
                          cy="50%"
                          innerRadius={30}
                          outerRadius={55}
                          paddingAngle={5}
                          dataKey="valor"
                        >
                          {billingChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value: any) => `R$ ${value.toLocaleString("pt-BR")}`} />
                        <Legend wrapperStyle={{ fontSize: 9 }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              <p className="text-[9px] text-zinc-500 font-mono text-right">Controle de Carteira de Recebíveis</p>
            </div>
          )}

          {/* Slide 6: Plan / Governance */}
          {slide === 5 && (
            <div className="flex-1 flex flex-col justify-between text-left">
              <div>
                <span className="text-[10px] font-mono text-purple-400 font-bold uppercase tracking-widest block">SLIDE 6 DE 6 • DIRETRIZES</span>
                <h3 className="text-2xl font-black text-white uppercase font-display tracking-tight mt-1">Diretrizes da Diretoria e Plano de Ação</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-auto">
                <div className="space-y-2 bg-[#121020] border border-purple-500/10 p-4 rounded-xl">
                  <span className="text-[10px] text-purple-400 font-mono font-bold block uppercase">REMANEJAMENTO FISCAL</span>
                  <p className="text-xs text-zinc-300 leading-relaxed">
                    Aprovar a alocação imediata de <strong className="text-white">R$ 50.000</strong> de saldos sobressalentes da Sede RJ (Marília) para sanear a conta do <strong className="text-red-400">CC-5</strong> e evitar bloqueios operacionais de folha.
                  </p>
                </div>

                <div className="space-y-2 bg-[#121020] border border-cyan-500/10 p-4 rounded-xl">
                  <span className="text-[10px] text-cyan-400 font-mono font-bold block uppercase">NOTIFICAÇÃO CSN</span>
                  <p className="text-xs text-zinc-300 leading-relaxed">
                    Acionar o setor jurídico para notificação extrajudicial e protesto em cartório de faturamento vencido da <strong className="text-white">CSN Siderúrgica Norte (R$ 32.000)</strong> vencido há 18 dias.
                  </p>
                </div>

                <div className="space-y-2 bg-[#121020] border border-emerald-500/10 p-4 rounded-xl">
                  <span className="text-[10px] text-emerald-400 font-mono font-bold block uppercase">APROVAÇÃO OS-106</span>
                  <p className="text-xs text-zinc-300 leading-relaxed">
                    Autorizar e liberar o fundo financeiro emergencial de <strong className="text-white">R$ 4.800</strong> para Thais adquirir as peças mecânicas para o reparo da Ponte Rolante.
                  </p>
                </div>

                <div className="space-y-2 bg-[#121020] border border-zinc-800 p-4 rounded-xl">
                  <span className="text-[10px] text-zinc-400 font-mono font-bold block uppercase">AUDITORIA E SINCRO</span>
                  <p className="text-xs text-zinc-300 leading-relaxed">
                    Instruir operadores regionais do SESI/SENAI a utilizarem a funcionalidade offline para registro de ordens sem dependência de link de internet estável.
                  </p>
                </div>
              </div>

              <div className="border-t border-zinc-800/50 pt-4 flex items-center justify-between">
                <span className="text-[10px] text-zinc-500 font-mono">FIRJAN OneHub • Governança de Resultados</span>
                <div className="flex gap-2">
                  <span className="text-[9px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded font-mono uppercase font-bold">SLA Aprovado</span>
                  <span className="text-[9px] bg-purple-500/10 border border-purple-500/20 text-purple-400 px-2 py-0.5 rounded font-mono uppercase font-bold">Auditado</span>
                </div>
              </div>
            </div>
          )}

          {/* Slide Footer / Pager */}
          <div className="border-t border-zinc-800/80 pt-4 mt-6 flex items-center justify-between">
            <button
              onClick={() => setSlide((prev) => (prev - 1 + totalSlides) % totalSlides)}
              className="bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-xs text-zinc-300 font-mono px-3 py-1 rounded-lg flex items-center gap-1 transition"
            >
              <ChevronLeft className="w-3.5 h-3.5" /> Anterior
            </button>

            <div className="flex items-center gap-2">
              {Array.from({ length: totalSlides }).map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setSlide(idx)}
                  className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                    idx === slide ? "bg-purple-500 scale-125 shadow-[0_0_8px_rgba(168,85,247,0.5)]" : "bg-zinc-800"
                  }`}
                  title={`Ir para Slide ${idx + 1}`}
                />
              ))}
            </div>

            <button
              onClick={() => setSlide((prev) => (prev + 1) % totalSlides)}
              className="bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-xs text-zinc-300 font-mono px-3 py-1 rounded-lg flex items-center gap-1 transition"
            >
              Próximo <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>
      </main>

      {/* Footer Branding */}
      <footer className="border-t border-zinc-900 bg-zinc-950 px-6 py-3 flex items-center justify-between z-10 text-[10px] text-zinc-500">
        <div>
          <span>FIRJAN SESI SENAI OneHub • Sistema Integrado de Inteligência Corporativa</span>
        </div>
        <div>
          <span>Gerado em {new Date().toLocaleTimeString()} • Operação Blindada e Criptografada</span>
        </div>
      </footer>
    </div>
  );
}

interface ReportProps {
  theme: "dark" | "light" | "contrast";
  setTheme: (t: "dark" | "light" | "contrast") => void;
  calculatedStats: any;
  onClose: () => void;
  maintenanceTickets: any[];
  costCenters: any[];
  billingInvoices: any[];
  isDateInSelectedTimeframe: (d: string) => boolean;
  globalUnidade: string;
  globalProduto: string;
}

export function HTMLCustomReportView({
  theme,
  setTheme,
  calculatedStats,
  onClose,
  maintenanceTickets,
  costCenters,
  billingInvoices,
  isDateInSelectedTimeframe,
  globalUnidade,
  globalProduto
}: ReportProps) {
  const handlePrint = () => {
    window.print();
  };

  // Process details
  const pendingInvoices = billingInvoices.filter(i => i.status === "Pendente");
  const overdueInvoices = billingInvoices.filter(i => i.status === "Atrasado");
  const activeOSList = maintenanceTickets.filter(o => o.status === "Pendente" || o.status === "Em Execução");

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans p-8 md:p-12 selection:bg-slate-200">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Navigation & Print Top Bar (Hidden during Print) */}
        <div className="print:hidden flex items-center justify-between border-b border-slate-200 pb-4 mb-4">
          <div className="flex items-center gap-2">
            <span className="text-xs bg-slate-150 text-slate-700 font-mono px-2 py-1 rounded border border-slate-200">
              MODO IMPRESSÃO & RELATÓRIO
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="py-1.5 px-3 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              Imprimir / Salvar PDF
            </button>
            <button
              onClick={onClose}
              className="py-1.5 px-3 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-lg text-xs font-medium flex items-center gap-1.5 transition cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
              Voltar ao OneHub
            </button>
          </div>
        </div>

        {/* Executive Letterhead */}
        <div className="border-b-4 border-slate-900 pb-6 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div className="space-y-1">
            <span className="text-[10px] tracking-widest font-mono font-bold text-blue-800 uppercase">
              FIRJAN • SERVIÇO SOCIAL DA INDÚSTRIA (SESI) • SERVIÇO NACIONAL DE APRENDIZAGEM INDUSTRIAL (SENAI)
            </span>
            <h1 className="text-3xl font-black tracking-tight text-slate-900 font-display">
              RELATÓRIO CONSOLIDADO DE GOVERNANÇA YTD
            </h1>
            <p className="text-xs text-slate-500 font-mono">
              Hub Integrado de Gestão Operacional, Recursos Orçamentários e Carteira Comercial
            </p>
          </div>
          <div className="text-left md:text-right text-xs font-mono space-y-0.5 text-slate-600">
            <div><strong>Emissor:</strong> Tatiane Teixeira Rocha</div>
            <div><strong>Cargo:</strong> Coordenadora Geral de Resultados</div>
            <div><strong>Emissão:</strong> {new Date().toLocaleDateString("pt-BR")}</div>
            <div><strong>Status:</strong> <span className="text-emerald-700 font-bold">AUDITADO</span></div>
          </div>
        </div>

        {/* Executive Summary Narrative */}
        <section className="space-y-3">
          <h2 className="text-sm font-mono font-bold text-slate-800 uppercase tracking-widest border-b border-slate-200 pb-1.5">
            1. Sumário Executivo
          </h2>
          <p className="text-xs text-slate-700 leading-relaxed text-justify">
            Este memorando corporativo consolida a auditoria e os resultados operacionais em tempo de execução das unidades Firjan SESI e SENAI. O objetivo deste instrumento é fornecer à coordenação e à diretoria uma visão analítica limpa, interligando a performance técnica de manutenção de ativos da Engenheira <strong>Thais Nicolau</strong>, a situação orçamentária fiscal sob guarda da Controller <strong>Marília Moreira</strong> e a situação de faturamento e fluxo comercial liderada pela Coordenadora de Recebíveis <strong>Acrislei Araujo (Cris)</strong>.
          </p>
          <p className="text-xs text-slate-700 leading-relaxed text-justify">
            A liquidez geral do período apresenta-se em conformidade regulatória. Contudo, desvios pontuais na conta orçamentária regional de Rita de Cássia (CC-5) e pendências de recebíveis de clientes estratégicos em atraso exigem decisões deliberativas urgentes do comitê administrativo corporativo.
          </p>
        </section>

        {/* High-Level Metrics Matrix */}
        <section className="space-y-4">
          <h2 className="text-sm font-mono font-bold text-slate-800 uppercase tracking-widest border-b border-slate-200 pb-1.5">
            2. Matriz de Indicadores de Resultados
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="border border-slate-200 p-3 rounded-lg bg-slate-50">
              <span className="text-[9px] font-mono font-bold text-slate-500 block uppercase">Faturamento Bruto</span>
              <strong className="text-lg font-mono text-slate-900 block mt-1">R$ {calculatedStats.totalIssuedBilling.toLocaleString("pt-BR")}</strong>
              <span className="text-[8px] text-emerald-600 block mt-0.5">100% Sincronizado</span>
            </div>

            <div className="border border-slate-200 p-3 rounded-lg bg-slate-50">
              <span className="text-[9px] font-mono font-bold text-slate-500 block uppercase">Despesas Consolidadas</span>
              <strong className="text-lg font-mono text-slate-900 block mt-1">R$ {calculatedStats.totalSpent.toLocaleString("pt-BR")}</strong>
              <span className="text-[8px] text-slate-500 block mt-0.5">Centros + Chamados</span>
            </div>

            <div className="border border-slate-200 p-3 rounded-lg bg-slate-50">
              <span className="text-[9px] font-mono font-bold text-slate-500 block uppercase">Margem Operacional YTD</span>
              <strong className="text-lg font-mono text-emerald-700 block mt-1">
                {calculatedStats.totalIssuedBilling > 0 
                  ? (( (calculatedStats.totalIssuedBilling - calculatedStats.totalSpent) / calculatedStats.totalIssuedBilling) * 100).toFixed(1) 
                  : "0"}%
              </strong>
              <span className="text-[8px] text-slate-500 block mt-0.5">Rentabilidade Operacional</span>
            </div>

            <div className="border border-slate-200 p-3 rounded-lg bg-slate-50">
              <span className="text-[9px] font-mono font-bold text-slate-500 block uppercase">Inadimplência Crítica</span>
              <strong className="text-lg font-mono text-red-600 block mt-1">R$ {calculatedStats.overdueBilling.toLocaleString("pt-BR")}</strong>
              <span className="text-[8px] text-red-600 font-bold block mt-0.5">
                {Math.round((calculatedStats.overdueBilling / (calculatedStats.totalIssuedBilling || 1)) * 100)}% de Perda Temporária
              </span>
            </div>
          </div>
        </section>

        {/* Section 3: Thais - Maintenance */}
        <section className="space-y-3">
          <h2 className="text-sm font-mono font-bold text-slate-800 uppercase tracking-widest border-b border-slate-200 pb-1.5">
            3. SLA & Manutenção Operacional (Supervisão Thais Nicolau)
          </h2>
          <p className="text-xs text-slate-700 leading-relaxed text-justify">
            O pilar de engenharia e manutenção predial industrial relata estabilidade nas linhas operacionais, com SLA médio acumulado de 84 horas para atendimento e regularização de falhas em pontes rampa, subestações e tornos CNC. Atualmente, o montante investido no período soma <strong>R$ {calculatedStats.totalMaintenanceCost.toLocaleString("pt-BR")}</strong> em reparos de ativos.
          </p>
          <div className="border border-slate-200 rounded-lg overflow-hidden mt-3">
            <table className="w-full text-left text-[11px] border-collapse">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-200 text-slate-700 font-mono text-[9px] uppercase font-bold">
                  <th className="p-2 pl-3">OS ID</th>
                  <th className="p-2">Equipamento / Ativo</th>
                  <th className="p-2">Setor Regional</th>
                  <th className="p-2">Solicitante</th>
                  <th className="p-2 text-right">Custo Estimado</th>
                  <th className="p-2 pr-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody>
                {activeOSList.slice(0, 4).map((os) => (
                  <tr key={os.id} className="border-b border-slate-100 hover:bg-slate-50 transition">
                    <td className="p-2 pl-3 font-mono font-bold text-slate-900">{os.id}</td>
                    <td className="p-2 font-medium">{os.equipment}</td>
                    <td className="p-2 text-slate-600">{os.area}</td>
                    <td className="p-2 text-slate-500">{os.requester}</td>
                    <td className="p-2 text-right font-mono text-slate-900">R$ {os.cost.toLocaleString("pt-BR")}</td>
                    <td className="p-2 pr-3 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                        os.status === "Pendente" ? "bg-red-100 text-red-800" : "bg-amber-100 text-amber-800"
                      }`}>
                        {os.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-[10px] text-slate-500 italic mt-1">
            * Destaque crítico: O chamado <strong>OS-106 Ponte Rolante (R$ 4.800)</strong> necessita de liberação orçamentária emergencial de insumos técnicos para evitar parada total do pátio de carregamento pesado do SENAI.
          </p>
        </section>

        {/* Section 4: Marília - Budget Centers */}
        <section className="space-y-3">
          <h2 className="text-sm font-mono font-bold text-slate-800 uppercase tracking-widest border-b border-slate-200 pb-1.5">
            4. Orçamentos e Alocação PMO (Auditoria Marília Moreira)
          </h2>
          <p className="text-xs text-slate-700 leading-relaxed text-justify">
            A governança fiscal de centros de custo está em constante monitoramento. A cota autorizada acumulada de <strong>R$ {calculatedStats.totalAllocated.toLocaleString("pt-BR")}</strong> mitigou riscos severos de estouros globais. Contudo, o acompanhamento pormenorizado revelou estouro financeiro no centro <strong>CC-5 (Supervisão Rita de Cássia)</strong> em virtude de gastos imprevistos com logística industrial e licenças de software, totalizando um saldo devedor superior a <strong>R$ 50.000</strong>.
          </p>
          <div className="border border-slate-200 rounded-lg overflow-hidden mt-3">
            <table className="w-full text-left text-[11px] border-collapse">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-200 text-slate-700 font-mono text-[9px] uppercase font-bold">
                  <th className="p-2 pl-3">Código CC</th>
                  <th className="p-2">Nome do Centro de Custo</th>
                  <th className="p-2">Responsável Regional</th>
                  <th className="p-2 text-right">Limite PMO</th>
                  <th className="p-2 text-right">Consumido Real</th>
                  <th className="p-2 pr-3 text-center">Farol Regulatório</th>
                </tr>
              </thead>
              <tbody>
                {costCenters.map((cc) => (
                  <tr key={cc.id} className="border-b border-slate-100 hover:bg-slate-50 transition">
                    <td className="p-2 pl-3 font-mono font-bold text-slate-900">{cc.id}</td>
                    <td className="p-2 font-medium">{cc.name}</td>
                    <td className="p-2 text-slate-600">{cc.responsible}</td>
                    <td className="p-2 text-right font-mono">R$ {cc.budgetLimit.toLocaleString("pt-BR")}</td>
                    <td className="p-2 text-right font-mono text-slate-900">R$ {cc.spent.toLocaleString("pt-BR")}</td>
                    <td className="p-2 pr-3 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                        cc.status === "Crítico" ? "bg-red-100 text-red-800" : cc.status === "Atenção" ? "bg-amber-100 text-amber-800" : "bg-green-100 text-green-800"
                      }`}>
                        {cc.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Section 5: Cris - Receivables & Billing */}
        <section className="space-y-3">
          <h2 className="text-sm font-mono font-bold text-slate-800 uppercase tracking-widest border-b border-slate-200 pb-1.5">
            5. Faturamento e Custódia Comercial (Supervisão Crislei Divino)
          </h2>
          <p className="text-xs text-slate-700 leading-relaxed text-justify">
            A saúde do caixa corporativo depende da regularidade e adimplência das notas contratuais emitidas. Do faturamento bruto do período, foram devidamente liquidados <strong>R$ {calculatedStats.totalPaidBilling.toLocaleString("pt-BR")}</strong>. Estão pendentes de liquidação regular <strong>R$ {calculatedStats.pendingBilling.toLocaleString("pt-BR")}</strong>. O foco imediato de ação localiza-se na carteira inadimplente vencida de <strong>R$ {calculatedStats.overdueBilling.toLocaleString("pt-BR")}</strong>.
          </p>
          <div className="border border-slate-200 rounded-lg overflow-hidden mt-3">
            <table className="w-full text-left text-[11px] border-collapse">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-200 text-slate-700 font-mono text-[9px] uppercase font-bold">
                  <th className="p-2 pl-3">Nota Fiscal</th>
                  <th className="p-2">Cliente / Contrato</th>
                  <th className="p-2">Data Emissão</th>
                  <th className="p-2">Data Vencimento</th>
                  <th className="p-2 text-right">Valor Líquido</th>
                  <th className="p-2 pr-3 text-center">Status Cobrança</th>
                </tr>
              </thead>
              <tbody>
                {[...overdueInvoices, ...pendingInvoices].slice(0, 4).map((inv) => (
                  <tr key={inv.id} className="border-b border-slate-100 hover:bg-slate-50 transition">
                    <td className="p-2 pl-3 font-mono font-bold text-slate-900">{inv.id}</td>
                    <td className="p-2 font-medium">{inv.client}</td>
                    <td className="p-2 text-slate-500 font-mono">{inv.issueDate}</td>
                    <td className="p-2 text-slate-500 font-mono">{inv.dueDate}</td>
                    <td className="p-2 text-right font-mono text-slate-900">R$ {inv.value.toLocaleString("pt-BR")}</td>
                    <td className="p-2 pr-3 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                        inv.status === "Atrasado" ? "bg-red-100 text-red-800" : "bg-blue-100 text-blue-800"
                      }`}>
                        {inv.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-[10px] text-slate-500 italic mt-1">
            * Foco de Cobrança Crítico: Iniciar cobrança administrativa direta do saldo vencido da <strong>CSN Siderúrgica Norte (R$ 32.000)</strong>, em atraso há 18 dias.
          </p>
        </section>

        {/* Section 6: Action Plan & Resolutions */}
        <section className="space-y-4">
          <h2 className="text-sm font-mono font-bold text-slate-800 uppercase tracking-widest border-b border-slate-200 pb-1.5">
            6. Deliberações e Plano de Ação Estratégico
          </h2>
          <p className="text-xs text-slate-700 leading-relaxed text-justify">
            Com base nos dados integrados e auditados do OneHub, o comitê de diretoria e a Coordenadora Tatiane Teixeira Rocha determinam o seguinte curso imediato de ações administrativas:
          </p>
          <div className="space-y-3 pl-3">
            <div className="flex gap-2">
              <strong className="text-xs font-mono text-slate-800 min-w-[20px]">1.</strong>
              <div className="text-xs text-slate-700">
                <strong className="text-slate-900">Remanejamento Fiscal CC-5:</strong> Aprovar a transferência regulatória de saldos de caixa de contingência da regional Sede RJ (guarda de Marília) no valor de <strong>R$ 50.000</strong> para regularizar e cobrir o déficit operacional de Rita de Cássia no CC-5.
              </div>
            </div>
            <div className="flex gap-2">
              <strong className="text-xs font-mono text-slate-800 min-w-[20px]">2.</strong>
              <div className="text-xs text-slate-700">
                <strong className="text-slate-900">Régua de Cobrança e Protesto Jurídico:</strong> Acionar assessoria jurídica contratual para protestar as parcelas atrasadas do cliente CSN Siderúrgica Norte (R$ 32.000) caso não ocorra regularização voluntária nas próximas 48 horas úteis.
              </div>
            </div>
            <div className="flex gap-2">
              <strong className="text-xs font-mono text-slate-800 min-w-[20px]">3.</strong>
              <div className="text-xs text-slate-700">
                <strong className="text-slate-900">Liberação de Recurso para Reparo Ativo:</strong> Deferir e assinar eletronicamente a autorização de compras de <strong>R$ 4.800</strong> para aquisição de peças de rolamento mecânico sob demanda de Thais Nicolau para restabelecer a Ponte Rolante SENAI.
              </div>
            </div>
          </div>
        </section>

        {/* Signature Area */}
        <div className="pt-12 flex justify-between items-center text-xs text-slate-500 font-mono">
          <div className="text-center w-64 space-y-1">
            <div className="border-t border-slate-400 pt-1.5">Tatiane Teixeira Rocha</div>
            <div className="text-[10px] text-slate-400 uppercase font-bold">Coordenação Executiva FIRJAN</div>
          </div>
          <div className="text-right text-[10px] space-y-0.5 text-slate-400">
            <div>OneHub Report ID: HUB-REP-2026-YTD</div>
            <div>Código Hash de Integridade: <span className="font-mono text-blue-900 font-bold">798B3F35-43A0-4545-9574</span></div>
            <div>Gerado em conformidade com as diretrizes da Diretoria FIRJAN</div>
          </div>
        </div>

      </div>
    </div>
  );
}
