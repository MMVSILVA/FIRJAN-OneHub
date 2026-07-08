import React, { useState } from "react";
import { 
  ChevronLeft, ChevronRight, Wrench, FileText, X, Check, Clock, 
  AlertTriangle, DollarSign, ArrowRight, Play, CheckCircle2, ShieldCheck, Tag, Calendar,
  FileDown, Bell, Sparkles
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { exportOSToPDF, exportInvoiceToPDF } from "../utils/pdfGenerator";

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
  syncStatus?: "Sincronizado" | "Pendente";
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
  syncStatus?: "Sincronizado" | "Pendente";
}

interface CalendarModuleProps {
  theme: "dark" | "light" | "contrast";
  maintenanceTickets: MaintenanceTicket[];
  billingInvoices: BillingInvoice[];
  onUpdateOSStatus: (id: string, status: "Pendente" | "Em Execução" | "Concluído") => void;
  onPayInvoice: (id: string) => void;
  addToast: (title: string, msg: string, type: "success" | "info" | "warning") => void;
}

const WEEKDAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const MONTHS = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];

export default function CalendarModule({
  theme,
  maintenanceTickets,
  billingInvoices,
  onUpdateOSStatus,
  onPayInvoice,
  addToast
}: CalendarModuleProps) {
  // Let's default current view to June 2026 since the sample data resides mostly there!
  const [currentYear, setCurrentYear] = useState(2026);
  const [currentMonth, setCurrentMonth] = useState(5); // June (0-indexed is 5)
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<"all" | "os" | "invoice">("all");

  // --- Reference Today Date for 24h Reminder Simulation ---
  const [simulatedToday, setSimulatedToday] = useState("2026-06-11");

  // Helper to calculate tomorrow's date string relative to a given date string (YYYY-MM-DD)
  const getTomorrowStr = (todayStr: string) => {
    try {
      const d = new Date(todayStr + "T12:00:00");
      d.setDate(d.getDate() + 1);
      return d.toISOString().split("T")[0];
    } catch {
      return "";
    }
  };

  const tomorrowStr = getTomorrowStr(simulatedToday);

  // Reminders / Notifications (24h in advance of due dates)
  // Pending billing invoices due tomorrow
  const invoiceReminders = billingInvoices.filter(
    inv => inv.status !== "Pago" && inv.dueDate === tomorrowStr
  );

  // Critical (Alta priority) maintenance tickets due tomorrow
  const maintenanceReminders = maintenanceTickets.filter(
    os => os.priority === "Alta" && os.status !== "Concluído" && os.date === tomorrowStr
  );

  const totalRemindersCount = invoiceReminders.length + maintenanceReminders.length;

  const handlePrevMonth = () => {
    setSelectedDay(null);
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(prev => prev - 1);
    } else {
      setCurrentMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    setSelectedDay(null);
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(prev => prev + 1);
    } else {
      setCurrentMonth(prev => prev + 1);
    }
  };

  // Days in month calculation
  const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay();
  const totalDays = new Date(currentYear, currentMonth + 1, 0).getDate();
  const prevMonthTotalDays = new Date(currentYear, currentMonth, 0).getDate();

  // Create an array for calendar cells: padding with previous month's ending days
  const cells: Array<{ day: number; type: "current" | "prev" | "next"; dateStr: string }> = [];

  // Previous month padding
  for (let i = firstDayIndex - 1; i >= 0; i--) {
    const dayVal = prevMonthTotalDays - i;
    const prevM = currentMonth === 0 ? 11 : currentMonth - 1;
    const prevY = currentMonth === 0 ? currentYear - 1 : currentYear;
    cells.push({
      day: dayVal,
      type: "prev",
      dateStr: `${prevY}-${String(prevM + 1).padStart(2, "0")}-${String(dayVal).padStart(2, "0")}`
    });
  }

  // Current month days
  for (let i = 1; i <= totalDays; i++) {
    cells.push({
      day: i,
      type: "current",
      dateStr: `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(i).padStart(2, "0")}`
    });
  }

  // Next month padding to fill grid to multiples of 7
  const totalGridCells = 42; // standard 6-row calendar
  const nextMonthPadding = totalGridCells - cells.length;
  for (let i = 1; i <= nextMonthPadding; i++) {
    const nextM = currentMonth === 11 ? 0 : currentMonth + 1;
    const nextY = currentMonth === 11 ? currentYear + 1 : currentYear;
    cells.push({
      day: i,
      type: "next",
      dateStr: `${nextY}-${String(nextM + 1).padStart(2, "0")}-${String(i).padStart(2, "0")}`
    });
  }

  // Filters and stats for selected day
  const getEventsForDate = (dateStr: string) => {
    const dayOS = maintenanceTickets.filter(t => t.date === dateStr);
    const dayInvoices = billingInvoices.filter(inv => inv.dueDate === dateStr);
    return { dayOS, dayInvoices };
  };

  const selectedDateStr = selectedDay 
    ? `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(selectedDay).padStart(2, "0")}`
    : "";

  const selectedEvents = selectedDateStr ? getEventsForDate(selectedDateStr) : { dayOS: [], dayInvoices: [] };

  // Theme styles helper
  const isContrast = theme === "contrast";
  const isDark = theme === "dark";

  const containerBgClass = isContrast 
    ? "bg-black border-[#FFFF00] text-[#FFFF00]" 
    : isDark 
      ? "bg-[#090710]/80 border-purple-950/40 text-slate-100" 
      : "bg-white border-slate-200 text-slate-800 shadow-xl";

  const cardBgClass = isContrast
    ? "bg-black border-[#FFFF00] text-[#FFFF00]"
    : isDark
      ? "bg-zinc-950/50 border-zinc-900/60"
      : "bg-slate-50 border-slate-100 shadow-xs";

  return (
    <div className={`p-5 rounded-2xl border transition-all duration-300 ${containerBgClass}`}>
      
      {/* Calendar Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-4 border-b border-zinc-900/40">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-widest font-mono text-purple-400">
            FIRJAN SENAI • SESI AGENDA DE ATIVOS
          </span>
          <h2 className="text-xl font-black font-display tracking-tight uppercase flex items-center gap-2">
            <Calendar className="w-5 h-5 text-purple-500" />
            Cronograma e Vencimentos Unificados
          </h2>
          <p className="text-xs text-zinc-400 max-w-xl mt-1">
            Controle de datas de vencimento de faturas corporativas (Cris) e execução programada de ordens de manutenção corretiva e predial (Thais).
          </p>
        </div>

        {/* Month Selector Buttons */}
        <div className="flex items-center gap-2.5 bg-zinc-900/20 p-1 rounded-xl border border-zinc-950">
          <button 
            onClick={handlePrevMonth}
            className="p-1.5 rounded-lg hover:bg-zinc-800/60 text-zinc-300 transition-colors cursor-pointer"
            title="Mês Anterior"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          <div className="px-3 min-w-[140px] text-center">
            <span className="text-xs font-mono font-bold text-zinc-400 uppercase tracking-widest block text-[9px]">
              {currentYear}
            </span>
            <span className="text-sm font-extrabold font-display uppercase tracking-tight text-white block">
              {MONTHS[currentMonth]}
            </span>
          </div>

          <button 
            onClick={handleNextMonth}
            className="p-1.5 rounded-lg hover:bg-zinc-800/60 text-zinc-300 transition-colors cursor-pointer"
            title="Próximo Mês"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Calendar Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Calendar Grid Container (Left 2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="grid grid-cols-7 gap-1 text-center font-mono text-[11px] font-bold text-zinc-500 uppercase tracking-wider mb-2">
            {WEEKDAYS.map(day => (
              <div key={day} className="py-2">{day}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1.5">
            {cells.map((cell, idx) => {
              const { dayOS, dayInvoices } = getEventsForDate(cell.dateStr);
              const isSelected = selectedDay === cell.day && cell.type === "current";
              const isCurrentMonth = cell.type === "current";
              
              // Today highlighter
              const todayStr = new Date().toISOString().split("T")[0];
              const isToday = cell.dateStr === todayStr;

              // Compute cell classes
              let cellClass = "min-h-[100px] p-1.5 rounded-xl border flex flex-col justify-between transition-all duration-200 cursor-pointer ";
              if (isSelected) {
                cellClass += isContrast 
                  ? "bg-[#FFFF00] text-black border-[#FFFF00]" 
                  : "bg-purple-950/40 border-purple-500 text-white shadow-lg shadow-purple-500/5";
              } else if (isToday) {
                cellClass += isContrast
                  ? "border-dashed border-2 border-[#FFFF00]"
                  : "bg-emerald-950/20 border-emerald-500 text-emerald-400";
              } else if (isCurrentMonth) {
                cellClass += isContrast
                  ? "bg-black border-[#FFFF00] text-[#FFFF00] hover:bg-zinc-900"
                  : isDark
                    ? "bg-zinc-950/40 border-zinc-900/60 hover:bg-zinc-900/60 text-slate-100"
                    : "bg-slate-50/60 border-slate-100 hover:bg-slate-100 text-slate-800";
              } else {
                cellClass += isContrast
                  ? "bg-black border-[#FFFF00]/10 text-[#FFFF00]/40"
                  : isDark
                    ? "bg-zinc-950/10 border-zinc-900/10 text-zinc-600 hover:bg-zinc-900/20"
                    : "bg-slate-50/10 border-slate-100/40 text-slate-400 hover:bg-slate-100/50";
              }

              return (
                <div 
                  key={idx}
                  onClick={() => {
                    if (cell.type === "current") {
                      setSelectedDay(cell.day);
                    } else {
                      // navigate to appropriate month
                      if (cell.type === "prev") {
                        handlePrevMonth();
                      } else {
                        handleNextMonth();
                      }
                    }
                  }}
                  className={cellClass}
                >
                  {/* Day Header */}
                  <div className="flex justify-between items-center">
                    <span className={`text-xs font-mono font-bold ${
                      isToday ? "bg-emerald-500/20 text-emerald-400 px-1.5 py-0.2 rounded-md" : ""
                    }`}>
                      {cell.day}
                    </span>
                    {/* Event indicators markers */}
                    <div className="flex gap-1">
                      {dayOS.length > 0 && (
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" title={`${dayOS.length} Ordens de Serviço`} />
                      )}
                      {dayInvoices.length > 0 && (
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400" title={`${dayInvoices.length} Faturas`} />
                      )}
                    </div>
                  </div>

                  {/* Badges / Text inside cells (desktop display) */}
                  <div className="hidden sm:block space-y-1 mt-1 text-[8.5px] font-mono leading-none">
                    {dayOS.slice(0, 2).map(os => (
                      <div 
                        key={os.id}
                        className={`truncate p-1 rounded border flex items-center gap-0.5 font-sans ${
                          os.status === "Concluído" 
                            ? "bg-emerald-950/20 border-emerald-500/20 text-emerald-400" 
                            : os.status === "Em Execução"
                              ? "bg-amber-950/20 border-amber-500/20 text-amber-400"
                              : "bg-red-950/20 border-red-500/20 text-red-400"
                        }`}
                        title={`${os.id}: ${os.equipment}`}
                      >
                        <Wrench className="w-2 h-2 text-emerald-400" />
                        <span className="font-semibold">{os.id}</span>
                      </div>
                    ))}
                    {dayInvoices.slice(0, 2).map(inv => (
                      <div 
                        key={inv.id}
                        className={`truncate p-1 rounded border flex items-center gap-0.5 font-sans ${
                          inv.status === "Pago" 
                            ? "bg-blue-950/20 border-blue-500/20 text-blue-400" 
                            : inv.status === "Atrasado"
                              ? "bg-red-950/20 border-red-500/20 text-red-400 animate-pulse"
                              : "bg-yellow-950/20 border-yellow-500/20 text-yellow-400"
                        }`}
                        title={`${inv.id}: R$ ${inv.value}`}
                      >
                        <FileText className="w-2 h-2 text-amber-400" />
                        <span className="font-semibold">{inv.id}</span>
                      </div>
                    ))}
                    {(dayOS.length + dayInvoices.length) > 4 && (
                      <div className="text-zinc-500 text-[8px] text-right pl-1">+{(dayOS.length + dayInvoices.length) - 4} mais</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Detail Panel / Sidebar (Right 1 col) */}
        <div className={`p-4 rounded-xl border flex flex-col justify-between ${cardBgClass}`}>
          
          <div>
            {/* ====== SISTEMA DE LEMBRETES 24H ====== */}
            <div className="mb-6 pb-5 border-b border-zinc-900/40">
              <div className="flex items-center justify-between gap-2 mb-3">
                <h3 className="text-xs uppercase font-mono font-bold tracking-widest text-zinc-400 flex items-center gap-1.5">
                  <Bell className={`w-4 h-4 ${totalRemindersCount > 0 ? "text-amber-400 animate-bounce" : "text-zinc-500"}`} />
                  Alertas de 24 horas
                </h3>
                {totalRemindersCount > 0 && (
                  <span className="bg-red-500/20 text-red-400 border border-red-500/30 text-[9px] font-mono font-black px-1.5 py-0.5 rounded-full animate-pulse">
                    {totalRemindersCount} CRÍTICO{totalRemindersCount > 1 ? "S" : ""}
                  </span>
                )}
              </div>

              {/* Simulation Date Selector */}
              <div className="bg-zinc-900/40 p-2.5 rounded-xl border border-zinc-950/80 mb-3 space-y-2">
                <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400">
                  <span>Data Hoje (Referência):</span>
                  <input
                    type="date"
                    value={simulatedToday}
                    onChange={(e) => setSimulatedToday(e.target.value)}
                    className="bg-black text-white px-1.5 py-0.5 rounded border border-zinc-800 text-[10px] outline-none"
                  />
                </div>
                
                {/* Shortcuts */}
                <div className="flex flex-wrap gap-1.5">
                  <span className="text-[8px] font-mono text-zinc-500 flex items-center shrink-0">Simular:</span>
                  {[
                    { label: "11/Jun (OS)", date: "2026-06-11" },
                    { label: "18/Jun (OS)", date: "2026-06-18" },
                    { label: "14/Jul (Fat)", date: "2026-07-14" },
                    { label: "19/Jul (Fat)", date: "2026-07-19" },
                  ].map((preset) => (
                    <button
                      key={preset.date}
                      onClick={() => setSimulatedToday(preset.date)}
                      className={`text-[8.5px] font-mono font-bold px-1.5 py-0.5 rounded border transition-colors cursor-pointer ${
                        simulatedToday === preset.date
                          ? "bg-purple-900/30 text-purple-400 border-purple-500/40"
                          : "bg-zinc-950/40 text-zinc-400 border-zinc-900 hover:text-white"
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tomorrow notice indicator */}
              <div className="text-[10px] font-mono text-zinc-500 mb-3 flex items-center gap-1 bg-zinc-950/20 p-1.5 rounded border border-zinc-900/30">
                <Clock className="w-3.5 h-3.5 text-zinc-500" />
                <span>Analisando vencimentos em amanhã: <strong className="text-zinc-300 font-bold">{tomorrowStr}</strong></span>
              </div>

              {/* Reminders list */}
              <div className="space-y-2">
                {totalRemindersCount === 0 ? (
                  <div className="p-3 bg-emerald-950/10 border border-emerald-950/40 rounded-xl text-center">
                    <p className="text-[10.5px] text-emerald-450 font-sans flex items-center justify-center gap-1.5">
                      <ShieldCheck className="w-4 h-4" /> Sem pendências críticas em 24h!
                    </p>
                    <p className="text-[9px] text-zinc-500 mt-1 leading-normal font-sans">
                      Clique nos botões de simulação acima para testar o sistema de lembretes.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {/* Maintenance Reminders */}
                    {maintenanceReminders.map(os => (
                      <div key={os.id} className="p-2.5 bg-red-950/25 border border-red-500/25 rounded-xl space-y-1.5">
                        <div className="flex items-center justify-between text-[9px] font-mono font-bold text-red-400">
                          <span className="flex items-center gap-1">
                            <Wrench className="w-3 h-3" /> MANUTENÇÃO CRÍTICA (24h)
                          </span>
                          <span>{os.id}</span>
                        </div>
                        <p className="text-[11px] font-bold text-white uppercase truncate" title={os.equipment}>
                          {os.equipment}
                        </p>
                        <p className="text-[10px] text-zinc-400 line-clamp-2 leading-tight">
                          {os.description}
                        </p>
                        <div className="flex items-center justify-between pt-1 border-t border-red-500/10 text-[9px] font-mono">
                          <span className="text-zinc-500">Custo: R$ {os.cost}</span>
                          <button
                            onClick={() => {
                              exportOSToPDF(os);
                              addToast("Relatório Exportado", `O.S. ${os.id} exportada para PDF com sucesso!`, "success");
                            }}
                            className="flex items-center gap-1 text-red-400 hover:text-red-300 transition font-bold cursor-pointer"
                            title="Exportar OS para PDF"
                          >
                            <FileDown className="w-3.5 h-3.5" /> PDF
                          </button>
                        </div>
                      </div>
                    ))}

                    {/* Invoice Reminders */}
                    {invoiceReminders.map(inv => (
                      <div key={inv.id} className="p-2.5 bg-amber-950/25 border border-amber-500/25 rounded-xl space-y-1.5">
                        <div className="flex items-center justify-between text-[9px] font-mono font-bold text-amber-400">
                          <span className="flex items-center gap-1">
                            <FileText className="w-3 h-3" /> FATURA PENDENTE (24h)
                          </span>
                          <span>{inv.id}</span>
                        </div>
                        <p className="text-[11px] font-bold text-white uppercase truncate" title={inv.client}>
                          {inv.client}
                        </p>
                        <p className="text-[10px] text-zinc-400 leading-tight">
                          {inv.serviceType}
                        </p>
                        <div className="flex items-center justify-between pt-1 border-t border-amber-500/10 text-[9px] font-mono">
                          <span className="text-amber-400 font-bold">R$ {inv.value.toLocaleString("pt-BR")}</span>
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                onPayInvoice(inv.id);
                                addToast("Fatura Paga", `Fatura ${inv.id} foi liquidada diretamente pelo lembrete!`, "success");
                              }}
                              className="text-emerald-450 hover:text-emerald-400 transition font-bold uppercase text-[8.5px] cursor-pointer"
                            >
                              Liquidar
                            </button>
                            <button
                              onClick={() => {
                                exportInvoiceToPDF(inv);
                                addToast("Relatório Exportado", `Fatura ${inv.id} exportada para PDF com sucesso!`, "success");
                              }}
                              className="flex items-center gap-1 text-amber-400 hover:text-amber-300 transition font-bold cursor-pointer"
                              title="Exportar Fatura para PDF"
                            >
                              <FileDown className="w-3.5 h-3.5" /> PDF
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Header Details */}
            <div className="pb-3 border-b border-zinc-900/35 mb-4">
              <h3 className="text-xs uppercase font-mono font-bold tracking-widest text-zinc-400">
                Inspecionar Detalhes da Data
              </h3>
              {selectedDay ? (
                <div className="mt-1 flex items-center justify-between">
                  <span className="text-sm font-black font-display text-white">
                    {String(selectedDay).padStart(2, "0")} de {MONTHS[currentMonth]}
                  </span>
                  <button 
                    onClick={() => setSelectedDay(null)}
                    className="p-1 rounded-md hover:bg-zinc-800 text-zinc-400 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <p className="text-xs text-zinc-500 mt-2">
                  Clique em um dia do calendário para visualizar a listagem de faturas a vencer ou ordens de serviço agendadas.
                </p>
              )}
            </div>

            {selectedDay ? (
              <div className="space-y-4">
                {/* Tabs to toggle inside Day Details */}
                <div className="flex gap-1.5 p-1 bg-zinc-900/30 rounded-lg border border-zinc-950 text-[10.5px] font-mono">
                  <button
                    onClick={() => setActiveTab("all")}
                    className={`flex-1 py-1 rounded text-center transition cursor-pointer ${
                      activeTab === "all" ? "bg-purple-900/40 text-purple-400 border border-purple-500/20" : "text-zinc-400 hover:text-white"
                    }`}
                  >
                    Todos ({selectedEvents.dayOS.length + selectedEvents.dayInvoices.length})
                  </button>
                  <button
                    onClick={() => setActiveTab("os")}
                    className={`flex-1 py-1 rounded text-center transition cursor-pointer ${
                      activeTab === "os" ? "bg-emerald-900/40 text-emerald-450 border border-emerald-500/20" : "text-zinc-400 hover:text-white"
                    }`}
                  >
                    S.O. ({selectedEvents.dayOS.length})
                  </button>
                  <button
                    onClick={() => setActiveTab("invoice")}
                    className={`flex-1 py-1 rounded text-center transition cursor-pointer ${
                      activeTab === "invoice" ? "bg-amber-900/40 text-amber-500 border border-amber-500/20" : "text-zinc-400 hover:text-white"
                    }`}
                  >
                    Faturas ({selectedEvents.dayInvoices.length})
                  </button>
                </div>

                {/* Event lists */}
                <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
                  
                  {/* Empty state inside selected day */}
                  {(selectedEvents.dayOS.length + selectedEvents.dayInvoices.length) === 0 && (
                    <div className="text-center py-8 text-zinc-500 font-sans text-xs">
                      <Clock className="w-6 h-6 mx-auto text-zinc-600 mb-2" />
                      Não há ordens de serviço ou faturas com vencimento para este dia.
                    </div>
                  )}

                  {/* Render OS List */}
                  {(activeTab === "all" || activeTab === "os") && selectedEvents.dayOS.map(os => (
                    <div key={os.id} className="p-3 bg-zinc-900/40 border border-zinc-900 rounded-xl space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] bg-emerald-950 text-emerald-400 px-1.5 py-0.5 rounded-md font-mono font-bold uppercase flex items-center gap-1 border border-emerald-500/15">
                          <Wrench className="w-3 h-3" /> {os.id}
                        </span>
                        
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => {
                              exportOSToPDF(os);
                              addToast("Exportação Concluída", `Ordem de Serviço ${os.id} exportada para PDF com sucesso!`, "success");
                            }}
                            className="p-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition cursor-pointer"
                            title="Exportar OS para PDF"
                          >
                            <FileDown className="w-3.5 h-3.5" />
                          </button>
                          {/* Priority circle */}
                          <span className={`text-[9px] font-semibold px-2 py-0.2 rounded-full font-mono ${
                            os.priority === "Alta" ? "bg-red-950/35 text-red-400 border border-red-500/20" :
                            os.priority === "Média" ? "bg-amber-950/35 text-amber-400 border border-amber-500/20" :
                            "bg-zinc-800 text-zinc-400 border border-zinc-700"
                          }`}>
                            {os.priority}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-1 font-sans">
                        <h4 className="text-xs font-bold text-white uppercase">{os.equipment}</h4>
                        <p className="text-[10.5px] text-zinc-400 leading-normal">{os.description}</p>
                      </div>

                      <div className="flex items-center justify-between pt-1 border-t border-zinc-950/50 text-[10.5px] font-mono">
                        <span className="text-zinc-500">Reparo: <strong className="text-sky-400 font-bold">R$ {os.cost.toLocaleString("pt-BR")}</strong></span>
                        <span className="text-zinc-500">{os.area}</span>
                      </div>

                      {/* Quick action: Update OS Status */}
                      <div className="flex items-center justify-between pt-1 text-[10px] font-mono">
                        <span className="text-zinc-400 font-semibold">Status:</span>
                        <select
                          value={os.status}
                          onChange={(e) => {
                            onUpdateOSStatus(os.id, e.target.value as any);
                            addToast(
                              "Status Atualizado",
                              `Status da Ordem de Serviço ${os.id} foi alterado para: ${e.target.value}.`,
                              "success"
                            );
                          }}
                          className="bg-black text-zinc-300 border border-zinc-800 rounded px-1.5 py-0.5 outline-none hover:border-zinc-700 transition"
                        >
                          <option value="Pendente">Pendente</option>
                          <option value="Em Execução">Em Execução</option>
                          <option value="Concluído">Concluído</option>
                        </select>
                      </div>

                      {/* Sync Status Badge */}
                      {os.syncStatus === "Pendente" && (
                        <div className="text-[8.5px] font-mono bg-amber-900/25 border border-amber-500/10 text-amber-400 rounded p-1 text-center animate-pulse">
                          ⚠️ Modo Offline: Será sincronizado ao reestabelecer o sinal
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Render Invoices List */}
                  {(activeTab === "all" || activeTab === "invoice") && selectedEvents.dayInvoices.map(inv => (
                    <div key={inv.id} className="p-3 bg-zinc-900/40 border border-zinc-900 rounded-xl space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] bg-amber-950 text-amber-500 px-1.5 py-0.5 rounded-md font-mono font-bold uppercase flex items-center gap-1 border border-amber-500/15">
                          <FileText className="w-3 h-3" /> {inv.id}
                        </span>
                        
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => {
                              exportInvoiceToPDF(inv);
                              addToast("Exportação Concluída", `Fatura ${inv.id} exportada para PDF com sucesso!`, "success");
                            }}
                            className="p-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition cursor-pointer"
                            title="Exportar Fatura para PDF"
                          >
                            <FileDown className="w-3.5 h-3.5" />
                          </button>
                          <span className={`text-[9px] font-semibold px-2 py-0.2 rounded-full font-mono ${
                            inv.status === "Pago" ? "bg-emerald-950/20 text-emerald-400 border border-emerald-500/20" :
                            inv.status === "Pendente" ? "bg-blue-950/20 text-blue-400 border border-blue-500/20" :
                            "bg-red-950/20 text-red-400 border border-red-500/10 animate-pulse"
                          }`}>
                            {inv.status}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-1 font-sans">
                        <h4 className="text-xs font-bold text-white uppercase">{inv.client}</h4>
                        <p className="text-[10.5px] text-zinc-400 leading-normal">{inv.serviceType}</p>
                      </div>

                      <div className="flex items-center justify-between pt-1 border-t border-zinc-950/50 text-[10.5px] font-mono">
                        <span className="text-zinc-500">Valor: <strong className="text-emerald-400 font-bold">R$ {inv.value.toLocaleString("pt-BR")}</strong></span>
                        <span className="text-zinc-500">{inv.unit}</span>
                      </div>

                      {/* Quick action: pay invoice */}
                      {inv.status !== "Pago" ? (
                        <div className="pt-2 text-right">
                          <button
                            onClick={() => {
                              onPayInvoice(inv.id);
                              addToast(
                                "Fatura Conciliada",
                                `A fatura ${inv.id} de R$ ${inv.value.toLocaleString("pt-BR")} foi liquidada com sucesso!`,
                                "success"
                              );
                            }}
                            className="text-[9.5px] px-2.5 py-1 bg-emerald-500 text-black font-extrabold uppercase rounded hover:bg-emerald-450 transition tracking-wider flex items-center gap-1 ml-auto cursor-pointer"
                          >
                            <ShieldCheck className="w-3.5 h-3.5" /> Liquidar Fatura
                          </button>
                        </div>
                      ) : (
                        <div className="pt-2 flex justify-between items-center text-[10.5px] font-mono">
                          <span className="text-emerald-500 flex items-center gap-1 font-bold">
                            <Check className="w-3.5 h-3.5 text-emerald-450" /> Pago (OK)
                          </span>
                          <button
                            onClick={() => {
                              exportInvoiceToPDF(inv);
                              addToast("Exportação Concluída", `Recibo da Fatura ${inv.id} baixado como PDF!`, "success");
                            }}
                            className="text-amber-500 hover:text-amber-400 transition font-bold flex items-center gap-1 cursor-pointer text-[9.5px] uppercase"
                            title="Baixar Comprovante PDF"
                          >
                            <FileDown className="w-3.5 h-3.5" /> Comprovante
                          </button>
                        </div>
                      )}

                      {/* Sync Status Badge */}
                      {inv.syncStatus === "Pendente" && (
                        <div className="text-[8.5px] font-mono bg-amber-900/25 border border-amber-500/10 text-amber-400 rounded p-1 text-center animate-pulse">
                          ⚠️ Modo Offline: Será sincronizado ao reestabelecer o sinal
                        </div>
                      )}
                    </div>
                  ))}

                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center text-zinc-500">
                <Tag className="w-8 h-8 text-zinc-700 mb-2.5" />
                <span className="text-xs font-mono font-bold tracking-tight text-zinc-400">AGUARDANDO SELEÇÃO</span>
                <p className="text-[11px] text-zinc-500 max-w-[180px] mt-1">
                  Selecione qualquer data do calendário para ver e interagir com as transações daquele dia.
                </p>
              </div>
            )}
          </div>

          {/* Quick instructions / Help */}
          <div className="mt-4 pt-3 border-t border-zinc-900/35 text-[10px] text-zinc-400 flex items-center gap-1.5 font-sans leading-relaxed">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-500 shrink-0"></span>
            As faturas e ordens de serviço criadas nos respectivos módulos do painel aparecem e sincronizam aqui automaticamente.
          </div>

        </div>

      </div>

    </div>
  );
}