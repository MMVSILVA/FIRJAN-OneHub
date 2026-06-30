import React, { useState } from "react";
import { 
  BarChart3, LineChart, PieChart as PieIcon, AreaChart as AreaIcon, Table, 
  MapPin, CheckSquare, Sparkles, Filter, RefreshCw
} from "lucide-react";
import { 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, LineChart as RechartsLineChart, Line, 
  PieChart as RechartsPieChart, Pie, Cell, AreaChart as RechartsAreaChart, Area 
} from "recharts";
import { Project, FinanceTransaction, Employee } from "../types";
import SpreadsheetImport from "./SpreadsheetImport";

interface BIModuleProps {
  projects: Project[];
  transactions: FinanceTransaction[];
  employees: Employee[];
  onImportData: (dataType: "Projetos" | "Financeiro" | "RH", count: number, records: any[]) => void;
  onAddAuditLog: (action: string, module: string, details: string) => void;
  theme: "dark" | "light";
}

type DataSetType = "finance" | "projects" | "hr";
type ChartType = "bars" | "lines" | "pizza" | "area" | "table";

export default function BIModule({
  projects,
  transactions,
  employees,
  onImportData,
  onAddAuditLog,
  theme
}: BIModuleProps) {
  const [selectedDataSet, setSelectedDataSet] = useState<DataSetType>("finance");
  const [selectedChart, setSelectedChart] = useState<ChartType>("bars");

  // Filters state
  const [unitFilter, setUnitFilter] = useState("Todas");
  const [areaFilter, setAreaFilter] = useState("Todas");

  // Filter calculations in real-time
  const getFilteredFinance = () => {
    return transactions.filter(t => {
      const matchUnit = unitFilter === "Todas" || t.costCenter.toUpperCase() === unitFilter.toUpperCase();
      return matchUnit;
    });
  };

  const getFilteredProjects = () => {
    return projects.filter(p => {
      const matchUnit = unitFilter === "Todas" || p.unit.toUpperCase() === unitFilter.toUpperCase();
      const matchArea = areaFilter === "Todas" || p.area.toUpperCase() === areaFilter.toUpperCase();
      return matchUnit && matchArea;
    });
  };

  const getFilteredEmployees = () => {
    return employees.filter(e => {
      const matchUnit = unitFilter === "Todas" || e.unit.toUpperCase() === unitFilter.toUpperCase();
      return matchUnit;
    });
  };

  // Compile Chart-Ready datasets based on active selections
  const getChartData = () => {
    if (selectedDataSet === "finance") {
      const data = getFilteredFinance();
      // Aggregate by category
      const agg: Record<string, { name: string; Receita: number; Despesa: number }> = {};
      data.forEach(t => {
        if (!agg[t.category]) {
          agg[t.category] = { name: t.category, Receita: 0, Despesa: 0 };
        }
        if (t.type === "Receita") {
          agg[t.category].Receita += t.amount;
        } else {
          agg[t.category].Despesa += t.amount;
        }
      });
      return Object.values(agg);
    } else if (selectedDataSet === "projects") {
      const data = getFilteredProjects();
      return data.map(p => ({
        name: (p.name || "").substring(0, 15) + "...",
        Previsto: p.budget,
        Realizado: p.spent
      }));
    } else {
      // HR
      const data = getFilteredEmployees();
      // Aggregate trainings by name
      return data.map(e => ({
        name: e.name.split(" ")[0] + " " + (e.name.split(" ")[1] || ""),
        "Cursos Concluídos": e.trainingsCompleted,
        "Banco de Horas": e.hoursBank
      }));
    }
  };

  const chartData = getChartData();
  const COLORS = ["#9d4edd", "#39ff14", "#e0aaff", "#ccff33", "#ffff3f", "#4cc9f0"];

  return (
    <div className="space-y-4">
      {/* CSV/Excel drag uploader integration */}
      <SpreadsheetImport 
        onImport={onImportData} 
        onAddAuditLog={onAddAuditLog} 
        theme={theme} 
      />

      {/* BI Control Deck */}
      <div className={`p-4 rounded-xl border ${theme === "dark" ? "bg-zinc-900 border-zinc-800" : "bg-white border-slate-200"}`}>
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          
          {/* Dataset Toggles */}
          <div className="flex flex-col space-y-1.5 w-full lg:w-auto">
            <span className="text-[9px] font-mono text-zinc-400 uppercase tracking-widest block">CONJUNTO DE DADOS ATIVO</span>
            <div className="flex flex-wrap gap-2">
              {[
                { id: "finance", label: "Contabilidade (Transactions)" },
                { id: "projects", label: "Inves. PMO (Budget/Spent)" },
                { id: "hr", label: "Performance & Capacitações" }
              ].map(ds => (
                <button
                  key={ds.id}
                  onClick={() => setSelectedDataSet(ds.id as DataSetType)}
                  className={`text-[10px] font-semibold px-3 py-1.5 rounded-lg border transition ${
                    selectedDataSet === ds.id
                      ? "bg-purple-900/30 text-purple-300 border-purple-500/50"
                      : theme === "dark"
                      ? "bg-zinc-800 border-zinc-700 text-zinc-400 hover:border-zinc-600"
                      : "bg-slate-100 border-slate-200 text-slate-600 hover:border-slate-300"
                  }`}
                >
                  {ds.label}
                </button>
              ))}
            </div>
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap gap-2 w-full lg:w-auto self-end">
            <div className="flex items-center gap-1.5 text-[10px]">
              <span className="text-zinc-400 font-mono text-[9px]">SLA UNIDADE:</span>
              <select
                value={unitFilter}
                onChange={(e) => setUnitFilter(e.target.value)}
                className={`text-[10px] rounded px-2 py-1 outline-none ${
                  theme === "dark" ? "bg-zinc-800 text-white border-zinc-700" : "bg-slate-100 border-slate-200 text-slate-700"
                }`}
              >
                <option value="Todas">Todas Unidades</option>
                <option value="Firjan">Firjan (Sede)</option>
                <option value="SENAI">SENAI</option>
                <option value="SESI">SESI</option>
                <option value="IEL">IEL</option>
              </select>
            </div>

            {selectedDataSet === "projects" && (
              <div className="flex items-center gap-1.5 text-[10px]">
                <span className="text-zinc-400 font-mono text-[9px]">ÁREA:</span>
                <select
                  value={areaFilter}
                  onChange={(e) => setAreaFilter(e.target.value)}
                  className={`text-[10px] rounded px-2 py-1 outline-none ${
                    theme === "dark" ? "bg-zinc-800 text-white border-zinc-700" : "bg-slate-100 border-slate-200"
                  }`}
                >
                  <option value="Todas">Todas Áreas</option>
                  <option value="Tecnologia">Tecnologia</option>
                  <option value="Educação">Educação</option>
                  <option value="Infraestrutura">Infraestrutura</option>
                  <option value="Inovação">Inovação</option>
                  <option value="Eventos">Eventos</option>
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Visual Chart Toggles bar */}
        <div className="flex justify-between items-center mt-5 border-t border-zinc-800/40 pt-3">
          <span className="text-[10px] text-zinc-400 font-mono flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-neon-green" />
            Exibição Gráfica de Negócios
          </span>

          <div className="flex gap-1">
            {[
              { id: "bars", icon: BarChart3, title: "Barras" },
              { id: "lines", icon: LineChart, title: "Linhas" },
              { id: "pizza", icon: PieIcon, title: "Pizza" },
              { id: "area", icon: AreaIcon, title: "Área" },
              { id: "table", icon: Table, title: "Tabela" }
            ].map(ch => {
              const Icon = ch.icon;
              return (
                <button
                  key={ch.id}
                  onClick={() => setSelectedChart(ch.id as ChartType)}
                  title={ch.title}
                  className={`p-1.5 px-2.5 rounded transition ${
                    selectedChart === ch.id
                      ? "bg-purple-900/40 text-purple-300 border border-purple-500/30"
                      : "text-zinc-400 hover:text-white"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Render Workspace Chart Section */}
      <div className={`p-4 rounded-xl border ${
        theme === "dark" ? "bg-zinc-900 border-zinc-800" : "bg-white border-slate-200"
      }`}>
        {chartData.length > 0 ? (
          <div className="h-80 w-full overflow-hidden flex items-center justify-center">
            {selectedChart === "table" ? (
              <div className="w-full h-full overflow-y-auto">
                <table className="w-full text-left text-[11px] font-mono border-collapse text-zinc-300">
                  <thead>
                    <tr className="border-b border-zinc-800 bg-zinc-950/40 text-neutral-400">
                      <th className="p-2">Item Analisado</th>
                      {Object.keys(chartData[0]).filter(k => k !== "name").map((key, i) => (
                        <th key={i} className="p-2 text-right">{key}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {chartData.map((row: any, idx) => (
                      <tr key={idx} className="border-b border-zinc-850 hover:bg-zinc-800/10">
                        <td className="p-2 font-medium text-zinc-100">{row.name}</td>
                        {Object.keys(row).filter(k => k !== "name").map((key, i) => (
                          <td key={i} className="p-2 text-right font-bold text-neon-green">
                            {typeof row[key] === "number" && key.includes("orço") || key.includes("valor") || key.includes("Previsto") || key.includes("Realizado") || key.includes("Receita") || key.includes("Despesa") 
                              ? `R$ ${row[key].toLocaleString("pt-BR")}`
                              : row[key]}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : selectedChart === "bars" ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData as any} margin={{ top: 10, right: 10, left: 0, bottom: 5 }}>
                  <CartesianGrid stroke="#27272a" strokeDasharray="3 3" opacity={0.2} />
                  <XAxis dataKey="name" stroke="#71717a" fontSize={9} tickLine={false} />
                  <YAxis stroke="#71717a" fontSize={9} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: "#18181b", borderColor: "#3f3f46", borderRadius: "8px", fontSize: "11px" }}
                    itemStyle={{ color: "#f4f4f5" }}
                  />
                  <Legend wrapperStyle={{ fontSize: "10px" }} />
                  {Object.keys(chartData[0]).filter(k => k !== "name").map((key, i) => (
                    <Bar key={i} dataKey={key} fill={COLORS[i % COLORS.length]} radius={[4, 4, 0, 0]} />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            ) : selectedChart === "lines" ? (
              <ResponsiveContainer width="100%" height="100%">
                <RechartsLineChart data={chartData as any} margin={{ top: 10, right: 10, left: 0, bottom: 5 }}>
                  <CartesianGrid stroke="#27272a" strokeDasharray="3 3" opacity={0.2} />
                  <XAxis dataKey="name" stroke="#71717a" fontSize={9} tickLine={false} />
                  <YAxis stroke="#71717a" fontSize={9} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: "#18181b", borderColor: "#3f3f46", borderRadius: "8px", fontSize: "11px" }}
                  />
                  <Legend wrapperStyle={{ fontSize: "10px" }} />
                  {Object.keys(chartData[0]).filter(k => k !== "name").map((key, i) => (
                    <Line key={i} type="monotone" dataKey={key} stroke={COLORS[i % COLORS.length]} strokeWidth={2.5} activeDot={{ r: 6 }} />
                  ))}
                </RechartsLineChart>
              </ResponsiveContainer>
            ) : selectedChart === "area" ? (
              <ResponsiveContainer width="100%" height="100%">
                <RechartsAreaChart data={chartData as any} margin={{ top: 10, right: 10, left: 0, bottom: 5 }}>
                  <defs>
                    <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#9d4edd" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#9d4edd" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="#27272a" strokeDasharray="3 3" opacity={0.2} />
                  <XAxis dataKey="name" stroke="#71717a" fontSize={9} tickLine={false} />
                  <YAxis stroke="#71717a" fontSize={9} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: "#18181b", borderColor: "#3f3f46", borderRadius: "8px", fontSize: "11px" }}
                  />
                  <Legend wrapperStyle={{ fontSize: "10px" }} />
                  {Object.keys(chartData[0]).filter(k => k !== "name").map((key, i) => (
                    <Area key={i} type="monotone" dataKey={key} stroke={COLORS[i % COLORS.length]} fillOpacity={0.15} fill={COLORS[i % COLORS.length]} />
                  ))}
                </RechartsAreaChart>
              </ResponsiveContainer>
            ) : (
              // Pizza Pie Chart
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie
                    data={chartData as any}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    outerRadius={95}
                    fill="#8884d8"
                    dataKey={Object.keys(chartData[0]).find(k => k !== "name") || "value"}
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </RechartsPieChart>
              </ResponsiveContainer>
            )}
          </div>
        ) : (
          <div className="text-center py-12 text-xs text-zinc-500 italic">
            Sem dados correspondentes aos filtros selecionados. Realize uma importação de planilha acima!
          </div>
        )}
      </div>
    </div>
  );
}
