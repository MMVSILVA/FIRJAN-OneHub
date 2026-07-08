import React, { useState, useMemo } from "react";
import { 
  Search, Filter, Plus, Edit2, Trash2, Eye, FileText, 
  CheckCircle2, Clock, AlertTriangle, Building2, User, 
  Calendar, DollarSign, BarChart3, PieChart as PieChartIcon, 
  Activity, X, Check, Save
} from "lucide-react";
import { 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, LineChart, Line, PieChart, Pie, Cell 
} from "recharts";
import { motion, AnimatePresence } from "motion/react";

import { MaintenanceTicket } from "../types";

interface MaintenanceDashboardProps {
  tickets: MaintenanceTicket[];
  setTickets: React.Dispatch<React.SetStateAction<MaintenanceTicket[]>>;
  theme: string;
  activeSubTab: "demandas" | "analise" | "dashboard" | "visualizacao" | "dados";
  setActiveSubTab: (tab: "demandas" | "analise" | "dashboard" | "visualizacao" | "dados") => void;
  showAddOSModal: boolean;
  setShowAddOSModal: (show: boolean) => void;
  newOS: {
    equipment: string;
    area: string;
    priority: "Alta" | "Média" | "Baixa";
    description: string;
    cost: number;
    unit: "SESI" | "SENAI";
    classification: string;
    executor: string;
  };
  setNewOS: React.Dispatch<React.SetStateAction<any>>;
  handleCreateOS: (e: React.FormEvent) => void;
  addToast: (title: string, message: string, type: "success" | "warning" | "info" | "error") => void;
  exportOSToPDF: (ticket: MaintenanceTicket) => void;
}

export const MaintenanceDashboard: React.FC<MaintenanceDashboardProps> = ({
  tickets,
  setTickets,
  theme,
  activeSubTab,
  setActiveSubTab,
  showAddOSModal,
  setShowAddOSModal,
  newOS,
  setNewOS,
  handleCreateOS,
  addToast,
  exportOSToPDF
}) => {
  // Filters & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("Todas");
  const [priorityFilter, setPriorityFilter] = useState("Todas");
  const [unitFilter, setUnitFilter] = useState("Todas");
  const [classificationFilter, setClassificationFilter] = useState("Todas");

  // Selection/Modal states for CRUD
  const [selectedTicket, setSelectedTicket] = useState<MaintenanceTicket | null>(null);
  const [editingTicket, setEditingTicket] = useState<MaintenanceTicket | null>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  // Classifications list
  const classificationsList = useMemo(() => {
    const list = new Set<string>();
    tickets.forEach(t => {
      if (t.classification && t.classification !== "undefined") {
        list.add(t.classification);
      }
    });
    return Array.from(list);
  }, [tickets]);

  // Safe helper to clean string representations
  const cleanStr = (val: any, fallback: string = "Geral") => {
    if (val === undefined || val === null) return fallback;
    const str = String(val).trim();
    if (str.toLowerCase() === "undefined" || str === "") return fallback;
    return str;
  };

  // Safe helper to format currency
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(val);
  };

  // Filtered List
  const filteredTickets = useMemo(() => {
    return tickets.filter(t => {
      const equip = cleanStr(t.equipment, "Chamado de Reparo").toLowerCase();
      const desc = cleanStr(t.description, "").toLowerCase();
      const id = cleanStr(t.id, "").toLowerCase();
      const sector = cleanStr(t.area, "Administração").toLowerCase();
      const exec = cleanStr(t.executor, "Alexandre").toLowerCase();
      const search = searchQuery.toLowerCase();

      const matchesSearch = 
        equip.includes(search) || 
        desc.includes(search) || 
        id.includes(search) || 
        sector.includes(search) || 
        exec.includes(search);

      const matchesStatus = statusFilter === "Todas" || 
        (statusFilter === "Concluído" && t.status === "Concluído") ||
        (statusFilter === "Em Andamento" && (t.status === "Em Execução" || t.status === "Pendente"));

      const matchesPriority = priorityFilter === "Todas" || t.priority === priorityFilter;
      const matchesUnit = unitFilter === "Todas" || t.unit === unitFilter;
      
      const tClass = cleanStr(t.classification, "Outros");
      const matchesClass = classificationFilter === "Todas" || tClass === classificationFilter;

      return matchesSearch && matchesStatus && matchesPriority && matchesUnit && matchesClass;
    });
  }, [tickets, searchQuery, statusFilter, priorityFilter, unitFilter, classificationFilter]);

  // Paginated List
  const paginatedTickets = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredTickets.slice(start, start + itemsPerPage);
  }, [filteredTickets, currentPage]);

  const totalPages = Math.ceil(filteredTickets.length / itemsPerPage) || 1;

  // KPI calculations
  const stats = useMemo(() => {
    const total = tickets.length;
    const completed = tickets.filter(t => t.status === "Concluído").length;
    const inProgress = tickets.filter(t => t.status === "Em Execução").length;
    const pending = tickets.filter(t => t.status === "Pendente").length;
    const ongoing = inProgress + pending;
    
    const totalCost = tickets.reduce((acc, t) => acc + (Number(t.cost) || 0), 0);
    const completedCost = tickets.filter(t => t.status === "Concluído").reduce((acc, t) => acc + (Number(t.cost) || 0), 0);
    const ongoingCost = tickets.filter(t => t.status !== "Concluído").reduce((acc, t) => acc + (Number(t.cost) || 0), 0);

    const completionRate = total > 0 ? (completed / total) * 100 : 0;

    return {
      total,
      completed,
      ongoing,
      pending,
      inProgress,
      totalCost,
      completedCost,
      ongoingCost,
      completionRate
    };
  }, [tickets]);

  // Charts data
  const chartsData = useMemo(() => {
    // 1. Costs by Classification
    const classMap: Record<string, number> = {};
    const classCountMap: Record<string, number> = {};
    tickets.forEach(t => {
      const cls = cleanStr(t.classification, "Outros");
      classMap[cls] = (classMap[cls] || 0) + (Number(t.cost) || 0);
      classCountMap[cls] = (classCountMap[cls] || 0) + 1;
    });
    const costByClass = Object.keys(classMap).map(name => ({
      name,
      custo: classMap[name],
      quantidade: classCountMap[name]
    })).sort((a, b) => b.custo - a.custo);

    // 2. Costs by Sector / Area
    const sectorMap: Record<string, number> = {};
    tickets.forEach(t => {
      const area = cleanStr(t.area, "Administração");
      sectorMap[area] = (sectorMap[area] || 0) + (Number(t.cost) || 0);
    });
    const costBySector = Object.keys(sectorMap).map(name => ({
      name,
      custo: sectorMap[name]
    })).sort((a, b) => b.custo - a.custo).slice(0, 8); // Top 8 sectors

    // 3. Trend Q1: Completed vs Pending over time
    // Filter to Q1 2026 dates (Jan, Feb, Mar, Apr, May, Jun 2026)
    const months = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun"];
    const trendMap = months.reduce((acc, m) => {
      acc[m] = { concluido: 0, andamento: 0, total: 0 };
      return acc;
    }, {} as Record<string, { concluido: number; andamento: number; total: number }>);

    tickets.forEach(t => {
      if (!t.date) return;
      const dateStr = String(t.date);
      let monthLabel = "";
      if (dateStr.includes("-01-")) monthLabel = "Jan";
      else if (dateStr.includes("-02-")) monthLabel = "Fev";
      else if (dateStr.includes("-03-")) monthLabel = "Mar";
      else if (dateStr.includes("-04-")) monthLabel = "Abr";
      else if (dateStr.includes("-05-")) monthLabel = "Mai";
      else if (dateStr.includes("-06-")) monthLabel = "Jun";

      if (monthLabel && trendMap[monthLabel]) {
        trendMap[monthLabel].total += 1;
        if (t.status === "Concluído") {
          trendMap[monthLabel].concluido += 1;
        } else {
          trendMap[monthLabel].andamento += 1;
        }
      }
    });

    const monthlyTrend = months.map(name => ({
      name,
      Concluidos: trendMap[name].concluido,
      Andamento: trendMap[name].andamento,
      Total: trendMap[name].total
    }));

    return {
      costByClass,
      costBySector,
      monthlyTrend
    };
  }, [tickets]);

  // Handle delete
  const handleDeleteTicket = (id: string) => {
    if (window.confirm(`Confirma a exclusão definitiva da Ordem de Serviço ${id}?`)) {
      setTickets(prev => prev.filter(t => t.id !== id));
      addToast("OS Excluída", `A ordem de serviço ${id} foi removida dos registros.`, "success");
      setSelectedTicket(null);
    }
  };

  // Handle edit save
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTicket) return;

    setTickets(prev => prev.map(t => t.id === editingTicket.id ? editingTicket : t));
    addToast("OS Atualizada", `As alterações da ${editingTicket.id} foram salvas com sucesso.`, "success");
    setEditingTicket(null);
    setSelectedTicket(null);
  };

  return (
    <div className="space-y-6">
      
      {/* KPIs Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Tickets */}
        <div className={`p-4 border rounded-xl transition-all ${
          theme === "contrast" 
            ? "bg-black border-[#FFFF00] text-[#FFFF00]"
            : theme === "dark" 
              ? "bg-zinc-950/40 border-zinc-900 text-slate-100" 
              : "bg-white border-slate-200/90 shadow-xs text-slate-800"
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-mono tracking-wider text-slate-400">Total de Chamados</span>
            <Activity className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <h4 className="text-2xl font-black font-mono">{stats.total}</h4>
            <span className="text-[10px] text-slate-400 font-mono">Unidades unificadas</span>
          </div>
        </div>

        {/* Ongoing */}
        <div className={`p-4 border rounded-xl transition-all ${
          theme === "contrast" 
            ? "bg-black border-[#FFFF00] text-[#FFFF00]"
            : theme === "dark" 
              ? "bg-zinc-950/40 border-zinc-900 text-slate-100" 
              : "bg-white border-slate-200/90 shadow-xs text-slate-800"
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-mono tracking-wider text-slate-400">Em Andamento</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <h4 className="text-2xl font-black font-mono text-amber-500">{stats.ongoing}</h4>
            <span className="text-[10px] text-slate-400 font-mono">
              ({stats.inProgress} exec / {stats.pending} pend)
            </span>
          </div>
        </div>

        {/* Completed */}
        <div className={`p-4 border rounded-xl transition-all ${
          theme === "contrast" 
            ? "bg-black border-[#FFFF00] text-[#FFFF00]"
            : theme === "dark" 
              ? "bg-zinc-950/40 border-zinc-900 text-slate-100" 
              : "bg-white border-slate-200/90 shadow-xs text-slate-800"
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-mono tracking-wider text-slate-400">Concluídos</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <h4 className="text-2xl font-black font-mono text-emerald-500">{stats.completed}</h4>
            <span className="text-[10px] text-emerald-500 font-bold font-mono">
              {stats.completionRate.toFixed(1)}% taxa
            </span>
          </div>
        </div>

        {/* Real Cost Budget */}
        <div className={`p-4 border rounded-xl transition-all ${
          theme === "contrast" 
            ? "bg-black border-[#FFFF00] text-[#FFFF00]"
            : theme === "dark" 
              ? "bg-zinc-950/40 border-zinc-900 text-slate-100" 
              : "bg-white border-slate-200/90 shadow-xs text-slate-800"
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-mono tracking-wider text-slate-400">Custo Total Executado</span>
            <DollarSign className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <h4 className="text-xl font-bold font-mono text-emerald-600 dark:text-[#00E676]">
              {formatCurrency(stats.completedCost)}
            </h4>
            <span className="text-[9px] text-slate-400 font-mono">Ativo</span>
          </div>
        </div>
      </div>

      {/* ========================================================== */}
      {/* TAB 1: DEMANDAS (Central de Chamados Residenciais & Industriais) */}
      {/* ========================================================== */}
      {activeSubTab === "demandas" && (
        <div className="space-y-4">
          <div className={`p-6 border rounded-xl ${
            theme === "contrast" 
              ? "bg-black border-[#FFFF00]"
              : theme === "dark" 
                ? "bg-zinc-950/20 border-zinc-900" 
                : "bg-white border-slate-200 shadow-xs"
          }`}>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="text-lg font-bold uppercase tracking-tight flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-emerald-600 dark:text-[#00E676]" />
                  Central de Chamados Residenciais & Industriais
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Exibição detalhada de ordens e chamados unificados. Use os filtros abaixo para refinar a visualização.
                </p>
              </div>

              {/* Live Status Summary Panel */}
              <div className="flex items-center gap-3 bg-zinc-900/10 dark:bg-zinc-900/50 p-2 rounded-lg text-xs font-mono">
                <div className="flex items-center gap-1.5 px-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse"></span>
                  <span className="text-slate-400">Em Andamento:</span>
                  <span className="font-bold text-amber-500">{stats.ongoing}</span>
                </div>
                <div className="w-px h-4 bg-zinc-700/30"></div>
                <div className="flex items-center gap-1.5 px-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                  <span className="text-slate-400">Concluído:</span>
                  <span className="font-bold text-emerald-500">{stats.completed}</span>
                </div>
              </div>
            </div>

            {/* Quick Filters */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3 mb-6">
              {/* Search input */}
              <div className="relative md:col-span-1">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Buscar equipamento, executor..."
                  value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                  className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-slate-300 dark:border-zinc-800 bg-transparent focus:outline-none focus:ring-1 focus:ring-emerald-500 font-sans"
                />
              </div>

              {/* Status Selector */}
              <div>
                <select
                  value={statusFilter}
                  onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-zinc-800 bg-transparent focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
                >
                  <option value="Todas" className="bg-zinc-900">Situação: Todas</option>
                  <option value="Em Andamento" className="bg-zinc-900">Situação: Em Andamento</option>
                  <option value="Concluído" className="bg-zinc-900">Situação: Concluído</option>
                </select>
              </div>

              {/* Unit Selector (SESI/SENAI) */}
              <div>
                <select
                  value={unitFilter}
                  onChange={(e) => { setUnitFilter(e.target.value); setCurrentPage(1); }}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-zinc-800 bg-transparent focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
                >
                  <option value="Todas" className="bg-zinc-900">SESI/SENAI: Todas</option>
                  <option value="SESI" className="bg-zinc-900">SESI</option>
                  <option value="SENAI" className="bg-zinc-900">SENAI</option>
                </select>
              </div>

              {/* Classification Selector */}
              <div>
                <select
                  value={classificationFilter}
                  onChange={(e) => { setClassificationFilter(e.target.value); setCurrentPage(1); }}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-zinc-800 bg-transparent focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
                >
                  <option value="Todas" className="bg-zinc-900">Classificação: Todas</option>
                  {classificationsList.map(c => (
                    <option key={c} value={c} className="bg-zinc-900">{c}</option>
                  ))}
                </select>
              </div>

              {/* Reset Filters */}
              <div>
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery("");
                    setStatusFilter("Todas");
                    setPriorityFilter("Todas");
                    setUnitFilter("Todas");
                    setClassificationFilter("Todas");
                    setCurrentPage(1);
                  }}
                  className="w-full py-2 bg-zinc-100 dark:bg-zinc-900/60 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-xs font-bold rounded-lg transition text-slate-500 dark:text-zinc-300 cursor-pointer border border-zinc-700/20"
                >
                  Limpar Filtros
                </button>
              </div>
            </div>

            {/* Main Unified Table */}
            <div className="overflow-x-auto rounded-lg border border-zinc-500/10">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-zinc-100 dark:bg-zinc-900/50 text-[10px] uppercase font-mono tracking-wider text-slate-500 dark:text-zinc-400 border-b border-zinc-800/15">
                    <th className="py-3 px-4 font-black">Situação</th>
                    <th className="py-3 px-4 font-black">Demandas (Equipamento / Descrição)</th>
                    <th className="py-3 px-4 font-black">Data Conclusão</th>
                    <th className="py-3 px-4 font-black">Executor</th>
                    <th className="py-3 px-4 font-black">Classificação</th>
                    <th className="py-3 px-4 font-black">Setor</th>
                    <th className="py-3 px-4 font-black text-center">SESI/SENAI</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-500/10 text-xs">
                  {paginatedTickets.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-400 font-mono">
                        Nenhuma ordem de serviço encontrada com os filtros selecionados.
                      </td>
                    </tr>
                  ) : (
                    paginatedTickets.map((ticket) => {
                      const isCompleted = ticket.status === "Concluído";
                      const finalExecutor = cleanStr(ticket.executor, "Alexandre");
                      const finalClassification = cleanStr(ticket.classification, "Elétrica");
                      const finalArea = cleanStr(ticket.area, "Educação Profissional");
                      const finalEquipment = cleanStr(ticket.equipment, "Dispositivo de Reparo");
                      
                      return (
                        <tr 
                          key={ticket.id} 
                          className="hover:bg-zinc-550/5 dark:hover:bg-zinc-900/40 transition-colors cursor-pointer"
                          onClick={() => setSelectedTicket(ticket)}
                        >
                          {/* Situação */}
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              isCompleted 
                                ? "bg-emerald-500/10 text-emerald-500 dark:text-emerald-400"
                                : ticket.status === "Em Execução"
                                  ? "bg-amber-500/10 text-amber-500 dark:text-amber-400 animate-pulse"
                                  : "bg-blue-500/10 text-blue-500 dark:text-blue-400"
                            }`}>
                              {isCompleted ? "Concluído" : "Em Andamento"}
                            </span>
                          </td>

                          {/* Demandas */}
                          <td className="py-3.5 px-4">
                            <div className="font-bold text-slate-800 dark:text-zinc-200 font-sans">
                              {finalEquipment}
                            </div>
                            <div className="text-[10px] text-slate-400 line-clamp-1 max-w-sm mt-0.5">
                              {cleanStr(ticket.description, "Sem observações adicionais.")}
                            </div>
                          </td>

                          {/* Data Conclusão */}
                          <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500 dark:text-zinc-400">
                            {isCompleted 
                              ? (ticket.conclusionDate && ticket.conclusionDate.toLowerCase() !== "undefined" ? ticket.conclusionDate : ticket.date)
                              : <span className="text-zinc-500 italic">-</span>
                            }
                          </td>

                          {/* Executor */}
                          <td className="py-3.5 px-4 text-slate-600 dark:text-zinc-300 font-medium">
                            {finalExecutor}
                          </td>

                          {/* Classificação */}
                          <td className="py-3.5 px-4">
                            <span className="px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-900 border border-zinc-750 text-[10px] text-slate-500 dark:text-zinc-400">
                              {finalClassification}
                            </span>
                          </td>

                          {/* Setor */}
                          <td className="py-3.5 px-4 text-slate-600 dark:text-zinc-400 text-xs">
                            {finalArea}
                          </td>

                          {/* SESI/SENAI */}
                          <td className="py-3.5 px-4 text-center">
                            <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-black font-mono tracking-wider ${
                              ticket.unit === "SENAI" 
                                ? "bg-red-500/10 text-red-500 border border-red-500/20"
                                : "bg-sky-500/10 text-sky-500 border border-sky-500/20"
                            }`}>
                              {ticket.unit || "SESI"}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-zinc-500/10 font-mono text-xs">
                <span className="text-slate-400">
                  Mostrando {filteredTickets.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} a {Math.min(currentPage * itemsPerPage, filteredTickets.length)} de {filteredTickets.length} chamados
                </span>
                <div className="flex items-center gap-1">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    className="p-1 px-2 bg-zinc-100 dark:bg-zinc-900 border border-zinc-800 disabled:opacity-40 rounded cursor-pointer"
                  >
                    Anterior
                  </button>
                  <span className="px-2 text-slate-300">Pág. {currentPage} de {totalPages}</span>
                  <button
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    className="p-1 px-2 bg-zinc-100 dark:bg-zinc-900 border border-zinc-800 disabled:opacity-40 rounded cursor-pointer"
                  >
                    Próxima
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================== */}
      {/* TAB 2: ANÁLISE (Q1 Análise) */}
      {/* ========================================================== */}
      {activeSubTab === "analise" && (
        <div className="space-y-6">
          <div className={`p-6 border rounded-xl ${
            theme === "contrast" 
              ? "bg-black border-[#FFFF00]"
              : theme === "dark" 
                ? "bg-zinc-950/20 border-zinc-900" 
                : "bg-white border-slate-200 shadow-xs"
          }`}>
            <h3 className="text-lg font-bold uppercase tracking-tight flex items-center gap-2 mb-2">
              <BarChart3 className="w-5 h-5 text-emerald-600 dark:text-[#00E676]" />
              Análise de Distribuição e Custos Q1 2026
            </h3>
            <p className="text-xs text-slate-400 mb-6">
              Distribuição quantitativa e avaliação orçamentária das ordens de serviço por classificação no primeiro trimestre de 2026.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Classification metrics panel */}
              <div className="md:col-span-1 space-y-4">
                <h4 className="text-xs font-black uppercase font-mono tracking-wider text-slate-500">
                  Resumo das Classificações
                </h4>
                <div className="divide-y divide-zinc-500/10">
                  {chartsData.costByClass.slice(0, 6).map((item, index) => (
                    <div key={item.name} className="py-2.5 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                        <span className="font-semibold text-xs text-slate-700 dark:text-zinc-200">{item.name}</span>
                      </div>
                      <div className="text-right">
                        <div className="font-mono text-xs font-bold">{item.quantidade} OS</div>
                        <div className="text-[10px] text-slate-400 font-mono">{formatCurrency(item.custo)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Mid graph: costs breakdown bar chart */}
              <div className="md:col-span-2 h-[300px]">
                <h4 className="text-xs font-black uppercase font-mono tracking-wider text-slate-500 mb-3">
                  Volume de Investimento Operacional (BRL)
                </h4>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartsData.costByClass.slice(0, 5)}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
                    <XAxis dataKey="name" stroke="#a1a1aa" fontSize={11} />
                    <YAxis stroke="#a1a1aa" fontSize={11} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: "#18181b", borderColor: "#27272a" }}
                      itemStyle={{ color: "#00E676" }}
                      labelStyle={{ color: "#fff" }}
                    />
                    <Bar dataKey="custo" fill="#10b981" radius={[4, 4, 0, 0]}>
                      {chartsData.costByClass.slice(0, 5).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={index === 0 ? "#10b981" : "#059669"} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================== */}
      {/* TAB 3: DASHBOARD BI */}
      {/* ========================================================== */}
      {activeSubTab === "dashboard" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className={`p-6 border rounded-xl lg:col-span-2 ${
            theme === "contrast" ? "bg-black border-[#FFFF00]" : theme === "dark" ? "bg-zinc-950/20 border-zinc-900" : "bg-white border-slate-200 shadow-xs"
          }`}>
            <h3 className="text-lg font-bold uppercase tracking-tight mb-4">Evolução Mensal de Chamados</h3>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartsData.monthlyTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#282828" />
                  <XAxis dataKey="name" stroke="#888888" fontSize={11} />
                  <YAxis stroke="#888888" fontSize={11} />
                  <Tooltip contentStyle={{ backgroundColor: "#18181b", borderColor: "#27272a" }} />
                  <Legend />
                  <Line type="monotone" dataKey="Total" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                  <Line type="monotone" dataKey="Concluidos" stroke="#10b981" strokeWidth={2.5} dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="Andamento" stroke="#f59e0b" strokeWidth={2} strokeDasharray="4 4" dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Key Allocation & SLA Widget */}
          <div className="space-y-6 lg:col-span-1">
            <div className={`p-6 border rounded-xl ${
              theme === "contrast" ? "bg-black border-[#FFFF00]" : theme === "dark" ? "bg-zinc-950/20 border-zinc-900" : "bg-white border-slate-200 shadow-xs"
            }`}>
              <h3 className="text-md font-bold uppercase tracking-tight mb-4">Eficiência SLAs</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs font-mono mb-1">
                    <span className="text-slate-400">RESOLUÇÃO DE CRÍTICOS</span>
                    <span className="text-emerald-500 font-bold">94.2%</span>
                  </div>
                  <div className="w-full bg-zinc-800 rounded-full h-2">
                    <div className="bg-emerald-500 h-2 rounded-full" style={{ width: "94.2%" }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs font-mono mb-1">
                    <span className="text-slate-400">RESOLUÇÃO DE MÉDIOS</span>
                    <span className="text-sky-500 font-bold">88.5%</span>
                  </div>
                  <div className="w-full bg-zinc-800 rounded-full h-2">
                    <div className="bg-sky-500 h-2 rounded-full" style={{ width: "88.5%" }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs font-mono mb-1">
                    <span className="text-slate-400">ATENDIMENTO DE ROTINA</span>
                    <span className="text-amber-500 font-bold">81.0%</span>
                  </div>
                  <div className="w-full bg-zinc-800 rounded-full h-2">
                    <div className="bg-amber-500 h-2 rounded-full" style={{ width: "81%" }}></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions Panel */}
            <div className={`p-6 border rounded-xl ${
              theme === "contrast" ? "bg-black border-[#FFFF00]" : theme === "dark" ? "bg-zinc-950/20 border-zinc-900" : "bg-white border-slate-200 shadow-xs"
            }`}>
              <h3 className="text-md font-bold uppercase tracking-tight mb-3">Atalhos Operacionais</h3>
              <div className="space-y-2">
                <button
                  onClick={() => {
                    setStatusFilter("Em Andamento");
                    setActiveSubTab("demandas");
                  }}
                  className="w-full p-2.5 text-xs text-left bg-zinc-900 hover:bg-zinc-800 text-slate-300 font-bold rounded-lg transition border border-zinc-800 cursor-pointer flex items-center justify-between"
                >
                  <span>Filtrar em Execução</span>
                  <span className="bg-amber-500/10 text-amber-500 font-mono px-1.5 py-0.5 rounded text-[10px]">{stats.ongoing}</span>
                </button>
                <button
                  onClick={() => setShowAddOSModal(true)}
                  className="w-full p-2.5 text-xs text-left bg-emerald-900/30 hover:bg-emerald-950/40 text-emerald-400 font-bold rounded-lg transition border border-emerald-800/40 cursor-pointer flex items-center justify-between"
                >
                  <span>Lançar Nova Ordem</span>
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================== */}
      {/* TAB 4: VISUALIZAÇÃO */}
      {/* ========================================================== */}
      {activeSubTab === "visualizacao" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Classification Distribution Pie */}
          <div className={`p-6 border rounded-xl ${
            theme === "contrast" ? "bg-black border-[#FFFF00]" : theme === "dark" ? "bg-zinc-950/20 border-zinc-900" : "bg-white border-slate-200 shadow-xs"
          }`}>
            <h3 className="text-md font-bold uppercase tracking-tight mb-4 flex items-center gap-1.5">
              <PieChartIcon className="w-4 h-4 text-emerald-500" /> Categoria de Demandas (Incidência)
            </h3>
            <div className="h-[250px] flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartsData.costByClass.slice(0, 6)}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="quantidade"
                  >
                    {chartsData.costByClass.slice(0, 6).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={["#10b981", "#3b82f6", "#f59e0b", "#ec4899", "#8b5cf6", "#14b8a6"][index % 6]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" height={36} iconSize={10} fontSize={10} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Cost by Area Bar */}
          <div className={`p-6 border rounded-xl ${
            theme === "contrast" ? "bg-black border-[#FFFF00]" : theme === "dark" ? "bg-zinc-950/20 border-zinc-900" : "bg-white border-slate-200 shadow-xs"
          }`}>
            <h3 className="text-md font-bold uppercase tracking-tight mb-4 flex items-center gap-1.5">
              <BarChart3 className="w-4 h-4 text-emerald-500" /> Custos de Manutenção por Setor / Local
            </h3>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartsData.costBySector} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#252525" />
                  <XAxis type="number" stroke="#888888" fontSize={9} />
                  <YAxis dataKey="name" type="category" stroke="#888888" fontSize={9} width={100} />
                  <Tooltip formatter={(v: any) => formatCurrency(Number(v))} />
                  <Bar dataKey="custo" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================== */}
      {/* TAB 5: DADOS_ (Editable table with view, edit, and delete) */}
      {/* ========================================================== */}
      {activeSubTab === "dados" && (
        <div className={`p-6 border rounded-xl ${
          theme === "contrast" ? "bg-black border-[#FFFF00]" : theme === "dark" ? "bg-zinc-950/20 border-zinc-900" : "bg-white border-slate-200 shadow-xs"
        }`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h3 className="text-md font-bold uppercase tracking-tight">Gerenciamento Base de Dados</h3>
              <p className="text-xs text-slate-400">Edite, visualize os detalhes ou exclua registros diretamente.</p>
            </div>
            
            <button
              onClick={() => setShowAddOSModal(true)}
              className="py-2 px-3 bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-bold font-mono uppercase rounded-lg flex items-center gap-1 cursor-pointer transition"
            >
              <Plus className="w-4 h-4" /> Novo Registro
            </button>
          </div>

          {/* Quick inline search for dados tab */}
          <div className="mb-4">
            <div className="relative max-w-sm">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar por ID, equipamento ou executor..."
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-slate-300 dark:border-zinc-800 bg-transparent focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Actions table */}
          <div className="overflow-x-auto rounded-lg border border-zinc-500/10">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-zinc-100 dark:bg-zinc-900/50 text-[10px] uppercase font-mono tracking-wider text-slate-500 dark:text-zinc-400 border-b border-zinc-800/15">
                  <th className="py-3 px-4">Código</th>
                  <th className="py-3 px-4">Demanda / Equipamento</th>
                  <th className="py-3 px-4">Unidade</th>
                  <th className="py-3 px-4">Classificação</th>
                  <th className="py-3 px-4">Executor</th>
                  <th className="py-3 px-4">Custo</th>
                  <th className="py-3 px-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-500/10 text-xs">
                {paginatedTickets.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400 font-mono">
                      Nenhum registro encontrado.
                    </td>
                  </tr>
                ) : (
                  paginatedTickets.map((t) => {
                    const finalExecutor = cleanStr(t.executor, "Alexandre");
                    const finalClassification = cleanStr(t.classification, "Elétrica");
                    const finalEquipment = cleanStr(t.equipment, "Inspeção Geral");
                    return (
                      <tr key={t.id} className="hover:bg-zinc-550/5 dark:hover:bg-zinc-900/20 transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-[11px] text-emerald-600 dark:text-[#00E676]">{t.id}</td>
                        <td className="py-3 px-4">
                          <div className="font-semibold text-slate-800 dark:text-zinc-200">{finalEquipment}</div>
                          <div className="text-[10px] text-slate-400 line-clamp-1">{cleanStr(t.description, "")}</div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold font-mono bg-zinc-800 text-slate-300">
                            {t.unit || "SESI"}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-[11px] text-slate-400">{finalClassification}</span>
                        </td>
                        <td className="py-3 px-4 font-medium">{finalExecutor}</td>
                        <td className="py-3 px-4 font-mono font-bold text-slate-700 dark:text-zinc-300">
                          {formatCurrency(t.cost || 0)}
                        </td>
                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          <div className="inline-flex items-center gap-1">
                            <button
                              title="Visualizar OS"
                              onClick={() => setSelectedTicket(t)}
                              className="p-1 text-slate-400 hover:text-white hover:bg-zinc-800 rounded transition cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            <button
                              title="Editar OS"
                              onClick={() => { setEditingTicket({ ...t }); }}
                              className="p-1 text-sky-400 hover:text-sky-300 hover:bg-sky-500/10 rounded transition cursor-pointer"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              title="Excluir OS"
                              onClick={() => handleDeleteTicket(t.id)}
                              className="p-1 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded transition cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-zinc-500/10 font-mono text-xs">
              <span className="text-slate-400">
                Mostrando {filteredTickets.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} a {Math.min(currentPage * itemsPerPage, filteredTickets.length)} de {filteredTickets.length} registros
              </span>
              <div className="flex items-center gap-1">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  className="p-1 px-2 bg-zinc-100 dark:bg-zinc-900 border border-zinc-800 disabled:opacity-40 rounded cursor-pointer"
                >
                  Anterior
                </button>
                <span className="px-2 text-slate-300">Pág. {currentPage} de {totalPages}</span>
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  className="p-1 px-2 bg-zinc-100 dark:bg-zinc-900 border border-zinc-800 disabled:opacity-40 rounded cursor-pointer"
                >
                  Próxima
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================== */}
      {/* MODAL: EXIBIR DETALHES DE O.S. (VISUALIZAR) */}
      {/* ========================================================== */}
      <AnimatePresence>
        {selectedTicket && !editingTicket && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs font-sans">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`w-full max-w-lg p-6 rounded-xl border shadow-xl relative ${
                theme === "contrast" ? "bg-black border-[#FFFF00] text-[#FFFF00]" : "bg-zinc-950 text-white border-zinc-800"
              }`}
            >
              <button
                type="button"
                onClick={() => setSelectedTicket(null)}
                className="absolute top-4 right-4 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-2 mb-4">
                <FileText className="w-5 h-5 text-emerald-500" />
                <h4 className="text-md font-black uppercase tracking-tight font-mono">
                  Ordem de Serviço {selectedTicket.id}
                </h4>
              </div>

              <div className="space-y-4 text-xs font-sans">
                {/* Status Header */}
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-zinc-900 border border-zinc-800">
                  <span className="text-slate-400">Situação Atual:</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                    selectedTicket.status === "Concluído" ? "bg-emerald-500/20 text-emerald-400" : "bg-amber-500/20 text-amber-400"
                  }`}>
                    {selectedTicket.status === "Concluído" ? "Concluído" : "Em Andamento"}
                  </span>
                </div>

                {/* Details layout */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Equipamento / Demanda</span>
                    <span className="font-bold text-slate-200 text-sm mt-0.5 block">{cleanStr(selectedTicket.equipment, "Equipamento")}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Setor / Local</span>
                    <span className="font-semibold text-slate-200 text-sm mt-0.5 block">{cleanStr(selectedTicket.area, "Administração")}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Executor</span>
                    <span className="font-semibold text-slate-200 mt-0.5 block">{cleanStr(selectedTicket.executor, "Alexandre")}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Classificação</span>
                    <span className="font-semibold text-slate-200 mt-0.5 block">{cleanStr(selectedTicket.classification, "Elétrica")}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Unidade Principal</span>
                    <span className="font-bold text-emerald-500 font-mono mt-0.5 block">{selectedTicket.unit || "SESI"}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Custo de Reparo</span>
                    <span className="font-bold text-slate-100 font-mono mt-0.5 block">{formatCurrency(selectedTicket.cost || 0)}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Data Abertura</span>
                    <span className="font-semibold text-slate-300 font-mono mt-0.5 block">{selectedTicket.date}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Data Conclusão</span>
                    <span className="font-semibold text-slate-300 font-mono mt-0.5 block">
                      {selectedTicket.status === "Concluído" 
                        ? (selectedTicket.conclusionDate && selectedTicket.conclusionDate.toLowerCase() !== "undefined" ? selectedTicket.conclusionDate : selectedTicket.date)
                        : "Não aplicável"
                      }
                    </span>
                  </div>
                </div>

                <div>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Descrição de Falha / Resolução</span>
                  <p className="text-slate-300 bg-zinc-900 p-3 rounded-lg border border-zinc-800/60 mt-1 leading-relaxed max-h-24 overflow-y-auto">
                    {cleanStr(selectedTicket.description, "Nenhuma observação detalhada cadastrada.")}
                  </p>
                </div>

                {/* PDF export button */}
                <div className="flex gap-2 pt-4 border-t border-zinc-800">
                  <button
                    type="button"
                    onClick={() => {
                      exportOSToPDF(selectedTicket);
                      addToast("Relatório PDF", `A Ordem de Serviço ${selectedTicket.id} foi salva como PDF.`, "success");
                    }}
                    className="flex-1 py-2 px-4 bg-emerald-800 hover:bg-emerald-700 text-white font-bold rounded-lg cursor-pointer transition text-center"
                  >
                    Exportar PDF 📄
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedTicket(null)}
                    className="py-2 px-4 bg-zinc-800 hover:bg-zinc-700 text-slate-300 font-bold rounded-lg cursor-pointer transition"
                  >
                    Fechar
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================== */}
      {/* MODAL: EDITAR O.S. (CRUD) */}
      {/* ========================================================== */}
      <AnimatePresence>
        {editingTicket && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs font-sans">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 15 }}
              className={`w-full max-w-lg p-6 rounded-xl border shadow-2xl relative ${
                theme === "contrast" ? "bg-black border-[#FFFF00] text-[#FFFF00]" : "bg-zinc-950 text-white border-zinc-800"
              }`}
            >
              <button
                type="button"
                onClick={() => setEditingTicket(null)}
                className="absolute top-4 right-4 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-2 mb-4">
                <Edit2 className="w-5 h-5 text-sky-500" />
                <h4 className="text-md font-black uppercase tracking-tight font-mono">
                  Editar Ordem de Serviço {editingTicket.id}
                </h4>
              </div>

              <form onSubmit={handleSaveEdit} className="space-y-4 text-xs font-sans">
                {/* Status select */}
                <div>
                  <label className="block text-slate-400 mb-1">Situação / Status</label>
                  <select
                    value={editingTicket.status}
                    onChange={(e) => setEditingTicket(prev => prev ? { ...prev, status: e.target.value as any } : null)}
                    className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 focus:outline-none focus:ring-1 focus:ring-sky-500"
                  >
                    <option value="Pendente">Pendente</option>
                    <option value="Em Execução">Em Execução</option>
                    <option value="Concluído">Concluído</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {/* Equipment */}
                  <div>
                    <label className="block text-slate-400 mb-1">Equipamento / Demanda</label>
                    <input
                      type="text"
                      value={editingTicket.equipment}
                      onChange={(e) => setEditingTicket(prev => prev ? { ...prev, equipment: e.target.value } : null)}
                      className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 focus:outline-none focus:ring-1 focus:ring-sky-500"
                      required
                    />
                  </div>

                  {/* Area / Setor */}
                  <div>
                    <label className="block text-slate-400 mb-1">Setor / Localização</label>
                    <input
                      type="text"
                      value={editingTicket.area}
                      onChange={(e) => setEditingTicket(prev => prev ? { ...prev, area: e.target.value } : null)}
                      className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 focus:outline-none focus:ring-1 focus:ring-sky-500"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {/* Unit (SESI/SENAI) */}
                  <div>
                    <label className="block text-slate-400 mb-1">Unidade</label>
                    <select
                      value={editingTicket.unit}
                      onChange={(e) => setEditingTicket(prev => prev ? { ...prev, unit: e.target.value as any } : null)}
                      className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 focus:outline-none focus:ring-1 focus:ring-sky-500"
                    >
                      <option value="SESI">SESI</option>
                      <option value="SENAI">SENAI</option>
                    </select>
                  </div>

                  {/* Priority */}
                  <div>
                    <label className="block text-slate-400 mb-1">Severidade / Prioridade</label>
                    <select
                      value={editingTicket.priority}
                      onChange={(e) => setEditingTicket(prev => prev ? { ...prev, priority: e.target.value as any } : null)}
                      className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 focus:outline-none focus:ring-1 focus:ring-sky-500"
                    >
                      <option value="Alta">Alta</option>
                      <option value="Média">Média</option>
                      <option value="Baixa">Baixa</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {/* Executor */}
                  <div>
                    <label className="block text-slate-400 mb-1">Executor Técnico</label>
                    <input
                      type="text"
                      value={editingTicket.executor || ""}
                      onChange={(e) => setEditingTicket(prev => prev ? { ...prev, executor: e.target.value } : null)}
                      className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 focus:outline-none focus:ring-1 focus:ring-sky-500"
                      placeholder="Ex: Alexandre"
                    />
                  </div>

                  {/* Classification */}
                  <div>
                    <label className="block text-slate-400 mb-1">Classificação</label>
                    <input
                      type="text"
                      value={editingTicket.classification || ""}
                      onChange={(e) => setEditingTicket(prev => prev ? { ...prev, classification: e.target.value } : null)}
                      className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 focus:outline-none focus:ring-1 focus:ring-sky-500"
                      placeholder="Ex: Elétrica"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {/* Cost */}
                  <div>
                    <label className="block text-slate-400 mb-1">Preço / Custo de Reparo (R$)</label>
                    <input
                      type="number"
                      value={editingTicket.cost}
                      onChange={(e) => setEditingTicket(prev => prev ? { ...prev, cost: Number(e.target.value) } : null)}
                      className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 focus:outline-none focus:ring-1 focus:ring-sky-500 font-mono"
                      required
                    />
                  </div>

                  {/* Dates */}
                  <div>
                    <label className="block text-slate-400 mb-1">Data de Conclusão</label>
                    <input
                      type="date"
                      value={editingTicket.conclusionDate || ""}
                      onChange={(e) => setEditingTicket(prev => prev ? { ...prev, conclusionDate: e.target.value } : null)}
                      className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 focus:outline-none focus:ring-1 focus:ring-sky-500 font-mono"
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-slate-400 mb-1">Descrição do Problema / Atividade</label>
                  <textarea
                    rows={3}
                    value={editingTicket.description}
                    onChange={(e) => setEditingTicket(prev => prev ? { ...prev, description: e.target.value } : null)}
                    className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 focus:outline-none focus:ring-1 focus:ring-sky-500 font-sans"
                    required
                  />
                </div>

                {/* Form Buttons */}
                <div className="flex gap-2 pt-4 border-t border-zinc-800">
                  <button
                    type="submit"
                    className="flex-1 py-2 bg-emerald-700 hover:bg-emerald-600 text-white font-bold rounded-lg flex items-center justify-center gap-1 cursor-pointer transition"
                  >
                    <Save className="w-4 h-4" /> Salvar Alterações
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingTicket(null)}
                    className="py-2 px-4 bg-zinc-850 hover:bg-zinc-800 text-slate-300 font-bold rounded-lg cursor-pointer transition"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================== */}
      {/* MODAL: EMITIR NOVA OS (CRIAR) */}
      {/* ========================================================== */}
      <AnimatePresence>
        {showAddOSModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs font-sans">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`w-full max-w-lg p-6 rounded-xl border shadow-2xl relative ${
                theme === "contrast" ? "bg-black border-[#FFFF00] text-[#FFFF00]" : "bg-zinc-950 text-white border-zinc-800"
              }`}
            >
              <button
                type="button"
                onClick={() => setShowAddOSModal(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-2 mb-4">
                <Plus className="w-5 h-5 text-emerald-500" />
                <h4 className="text-md font-black uppercase tracking-tight font-mono">
                  Lançar Nova Ordem de Serviço
                </h4>
              </div>

              <form onSubmit={handleCreateOS} className="space-y-4 text-xs font-sans">
                <div className="grid grid-cols-2 gap-3">
                  {/* Equipment */}
                  <div>
                    <label className="block text-slate-400 mb-1">Equipamento / Demanda *</label>
                    <input
                      type="text"
                      value={newOS.equipment}
                      onChange={(e) => setNewOS(prev => ({ ...prev, equipment: e.target.value }))}
                      className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 focus:outline-none focus:ring-1 focus:ring-emerald-500 text-white"
                      placeholder="Nome do ativo ou problema"
                      required
                    />
                  </div>

                  {/* Area / Setor */}
                  <div>
                    <label className="block text-slate-400 mb-1">Setor / Localização *</label>
                    <input
                      type="text"
                      value={newOS.area}
                      onChange={(e) => setNewOS(prev => ({ ...prev, area: e.target.value }))}
                      className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 focus:outline-none focus:ring-1 focus:ring-emerald-500 text-white"
                      placeholder="Bloco, sala ou setor"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {/* Unit (SESI/SENAI) */}
                  <div>
                    <label className="block text-slate-400 mb-1">Unidade principal</label>
                    <select
                      value={newOS.unit}
                      onChange={(e) => setNewOS(prev => ({ ...prev, unit: e.target.value }))}
                      className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 focus:outline-none focus:ring-1 focus:ring-emerald-500 text-white"
                    >
                      <option value="SESI">SESI</option>
                      <option value="SENAI">SENAI</option>
                    </select>
                  </div>

                  {/* Priority */}
                  <div>
                    <label className="block text-slate-400 mb-1">Severidade / Prioridade</label>
                    <select
                      value={newOS.priority}
                      onChange={(e) => setNewOS(prev => ({ ...prev, priority: e.target.value }))}
                      className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 focus:outline-none focus:ring-1 focus:ring-emerald-500 text-white"
                    >
                      <option value="Alta">Alta</option>
                      <option value="Média">Média</option>
                      <option value="Baixa">Baixa</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {/* Executor */}
                  <div>
                    <label className="block text-slate-400 mb-1">Executor Técnico</label>
                    <input
                      type="text"
                      value={newOS.executor}
                      onChange={(e) => setNewOS(prev => ({ ...prev, executor: e.target.value }))}
                      className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 focus:outline-none focus:ring-1 focus:ring-emerald-500 text-white"
                      placeholder="Ex: Alexandre"
                    />
                  </div>

                  {/* Classification */}
                  <div>
                    <label className="block text-slate-400 mb-1">Classificação</label>
                    <input
                      type="text"
                      value={newOS.classification}
                      onChange={(e) => setNewOS(prev => ({ ...prev, classification: e.target.value }))}
                      className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 focus:outline-none focus:ring-1 focus:ring-emerald-500 text-white"
                      placeholder="Ex: Elétrica"
                    />
                  </div>
                </div>

                {/* Cost */}
                <div>
                  <label className="block text-slate-400 mb-1">Preço / Custo de Reparo Estimado (R$)</label>
                  <input
                    type="number"
                    value={newOS.cost}
                    onChange={(e) => setNewOS(prev => ({ ...prev, cost: Number(e.target.value) }))}
                    className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 focus:outline-none focus:ring-1 focus:ring-emerald-500 text-white font-mono"
                    required
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-slate-400 mb-1">Descrição Detalhada do Problema *</label>
                  <textarea
                    rows={3}
                    value={newOS.description}
                    onChange={(e) => setNewOS(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 focus:outline-none focus:ring-1 focus:ring-emerald-500 text-white font-sans"
                    placeholder="Especifique o problema encontrado com detalhes..."
                    required
                  />
                </div>

                {/* Form Buttons */}
                <div className="flex gap-2 pt-4 border-t border-zinc-800">
                  <button
                    type="submit"
                    className="flex-1 py-2 bg-emerald-800 hover:bg-emerald-700 text-white font-bold rounded-lg flex items-center justify-center gap-1 cursor-pointer transition"
                  >
                    <Check className="w-4 h-4" /> Emitir Ordem de Serviço
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddOSModal(false)}
                    className="py-2 px-4 bg-zinc-850 hover:bg-zinc-800 text-slate-300 font-bold rounded-lg cursor-pointer transition"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
