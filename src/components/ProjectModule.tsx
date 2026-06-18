import React, { useState } from "react";
import { 
  FolderKanban, Kanban, Calendar, Milestone, Users, AlertTriangle, 
  Plus, CheckCircle2, Play, ChevronRight, HelpCircle, FileText
} from "lucide-react";
import { Project, ProjectTask, RiskItem, Stakeholder, RACIEntry } from "../types";

interface ProjectModuleProps {
  projects: Project[];
  setProjects: React.Dispatch<React.SetStateAction<Project[]>>;
  onAddAuditLog: (action: string, module: string, details: string) => void;
  role: string;
  theme: "dark" | "light";
  selectedUnitFilter: string;
}

type SubTab = "kanban" | "gantt" | "roadmap" | "raci" | "risks" | "lessons" | "register";

export default function ProjectModule({
  projects,
  setProjects,
  onAddAuditLog,
  role,
  theme,
  selectedUnitFilter
}: ProjectModuleProps) {
  const [selectedProjectId, setSelectedProjectId] = useState<string>(projects[0]?.id || "");
  const [activeSubTab, setActiveSubTab] = useState<SubTab>("kanban");

  // Form states for new project
  const [newName, setNewName] = useState("");
  const [newObjective, setNewObjective] = useState("");
  const [newManager, setNewManager] = useState("");
  const [newArea, setNewArea] = useState<"Tecnologia" | "Educação" | "Infraestrutura" | "Inovação" | "Eventos">("Tecnologia");
  const [newUnit, setNewUnit] = useState<"Firjan" | "SENAI" | "SESI" | "IEL">("SENAI");
  const [newDeadline, setNewDeadline] = useState("2026-12-31");
  const [newBudget, setNewBudget] = useState(150000);
  const [newPriority, setNewPriority] = useState<"Média" | "Alta" | "Crítica">("Média");

  // Filter projects based on global unit filter
  const filteredProjects = projects.filter(
    (p) => selectedUnitFilter === "Todas" || p.unit.toUpperCase() === selectedUnitFilter.toUpperCase()
  );

  const curProject = projects.find((p) => p.id === selectedProjectId) || filteredProjects[0];

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newObjective.trim()) return;

    if (role === "Colaborador") {
      alert("Operação negada: Apenas Administrador, Gestora ou Coordenador podem criar iniciativas.");
      return;
    }

    const defaultRACI: RACIEntry[] = [
      { activity: "Mapeamento e Engenharia de Requisitos", responsible: newManager, accountable: "Diretor Setorial", consulted: "Docentes Firjan", informed: "Analista Financeiro" },
      { activity: "Deploy e Validação Homologada em Produção", responsible: "Consultoria Externa", accountable: newManager, consulted: "Gestão TI", informed: "Diretoria Geral" }
    ];

    const newProject: Project = {
      id: `pj-${Date.now()}`,
      name: newName,
      objective: newObjective,
      manager: newManager || "Especialista Não Atribuído",
      area: newArea,
      unit: newUnit,
      startDate: new Date().toISOString().split("T")[0],
      deadline: newDeadline,
      budget: Number(newBudget),
      spent: 0,
      status: "Planejamento",
      priority: newPriority,
      progress: 0,
      tasks: [
        { id: `tk-${Date.now()}-1`, title: "Elaborar escopo do Termo de Abertura (TAP)", assignedTo: newManager, status: "Pendente", priority: "Alta", startDate: new Date().toISOString().split("T")[0], endDate: newDeadline }
      ],
      risks: [
        { id: `rk-${Date.now()}-1`, title: "Oscilação de insumos industriais ou licenças", probability: "Média", impact: "Alto", mitigation: "Firmar pré-contrato de escopo fechado." }
      ],
      stakeholders: [
        { id: `st-${Date.now()}-1`, name: "Conselho de Tecnologia Regional", role: "Avalista de Governança", engagement: "Neutro", unit: newUnit }
      ],
      raci: defaultRACI
    };

    setProjects((prev) => [newProject, ...prev]);
    setSelectedProjectId(newProject.id);
    setActiveSubTab("kanban");
    
    // Reset form
    setNewName("");
    setNewObjective("");
    setNewManager("");
    
    onAddAuditLog(
      "Criação de Iniciativa", 
      "PROJETOS", 
      `Iniciativa PMO registrada: "${newProject.name}" com orçamento de R$ ${newProject.budget.toLocaleString("pt-BR")}.`
    );
  };

  // Move task status forward to simulate active PMO progress
  const advanceTaskStatus = (taskId: string) => {
    if (!curProject) return;

    const statusFlow: Record<string, "Pendente" | "Em Andamento" | "Revisão" | "Concluído"> = {
      Pendente: "Em Andamento",
      "Em Andamento": "Revisão",
      Revisão: "Concluído",
      Concluído: "Pendente" // cycle back
    };

    const updatedProjects = projects.map((proj) => {
      if (proj.id === curProject.id) {
        const updatedTasks = proj.tasks.map((tsk) => {
          if (tsk.id === taskId) {
            const nextStatus = statusFlow[tsk.status];
            return { ...tsk, status: nextStatus };
          }
          return tsk;
        });

        // Dynamic progress calculation! Math: percentage is based on tasks status weights
        // Pendente: 0%, Em Andamento: 40%, Revisão: 75%, Concluído: 100%
        const totalWeight = updatedTasks.length * 100;
        const currentWeight = updatedTasks.reduce((sum, t) => {
          if (t.status === "Concluído") return sum + 100;
          if (t.status === "Revisão") return sum + 75;
          if (t.status === "Em Andamento") return sum + 40;
          return sum;
        }, 0);

        const progressPercent = Math.round((currentWeight / (totalWeight || 1)) * 100);
        const overallStatus = progressPercent === 100 ? "Concluído" : progressPercent > 60 ? "Em Andamento" : "Planejamento";

        return { 
          ...proj, 
          tasks: updatedTasks, 
          progress: progressPercent,
          status: proj.status === "Atrasado" ? "Atrasado" : overallStatus 
        };
      }
      return proj;
    });

    setProjects(updatedProjects);
    
    const taskTitle = curProject.tasks.find(t => t.id === taskId)?.title || "Tarefa";
    onAddAuditLog(
      "Avanço de Cronograma", 
      "PROJETOS", 
      `Modificado progresso da tarefa "${taskTitle}" no projeto "${curProject.name}". Novo progresso global: ${curProject.progress}%.`
    );
  };

  return (
    <div className="space-y-4">
      {/* Select active project & Tab selectors */}
      <div className={`p-4 rounded-xl border flex flex-col md:flex-row gap-4 items-start md:items-center justify-between ${
        theme === "dark" ? "bg-zinc-900 border-zinc-800" : "bg-white border-slate-200"
      }`}>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <FolderKanban className="w-5 h-5 text-neon-purple shrink-0" />
          <div className="w-full">
            <span className="text-[10px] text-zinc-400 font-mono block">PROJETO OPERACIONAL ATIVO</span>
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className={`text-xs font-semibold rounded px-2.5 py-1 outline-none w-full md:w-80 ${
                theme === "dark" ? "bg-zinc-800 text-white border-zinc-700" : "bg-slate-100 text-slate-800 border-slate-200"
              }`}
            >
              {filteredProjects.map((p) => (
                <option key={p.id} value={p.id}>
                  [{p.unit}] {p.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Tab selection */}
        <div className="flex flex-wrap gap-1 md:self-end">
          {[
            { id: "kanban", label: "Quadro Kanban", icon: Kanban },
            { id: "gantt", label: "Cronograma Gantt", icon: Calendar },
            { id: "roadmap", label: "Roadmap Geral", icon: Milestone },
            { id: "raci", label: "Matriz RACI", icon: Users },
            { id: "risks", label: "Riscos e Stakeholders", icon: AlertTriangle },
            { id: "register", label: "Nova Iniciativa", icon: Plus }
          ].map((tab) => {
            const IconComponent = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id as SubTab)}
                className={`flex items-center gap-1 text-[10px] px-3 py-1.5 rounded-lg font-medium transition ${
                  activeSubTab === tab.id
                    ? "bg-purple-900/30 text-purple-300 border border-purple-500/50"
                    : theme === "dark"
                    ? "bg-zinc-950/40 border border-zinc-800 hover:border-zinc-700 text-zinc-400"
                    : "bg-slate-50 border border-slate-200 hover:border-slate-300 text-slate-600"
                }`}
              >
                <IconComponent className="w-3.5 h-3.5 text-neon-purple" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {curProject ? (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {/* Main Workspace Frame */}
          <div className="lg:col-span-3 space-y-4">
            {activeSubTab === "kanban" && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                {(["Pendente", "Em Andamento", "Revisão", "Concluído"] as const).map((colStatus) => {
                  const columnTasks = curProject.tasks.filter((t) => t.status === colStatus);
                  return (
                    <div 
                      key={colStatus} 
                      className={`p-3 rounded-xl border ${
                        theme === "dark" ? "bg-zinc-950/60 border-zinc-900" : "bg-slate-50 border-slate-100"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-3 border-b pb-1.5 border-zinc-800/50">
                        <span className="text-[11px] font-bold font-display uppercase tracking-wide flex items-center gap-1">
                          <span className={`w-2 h-2 rounded-full ${
                            colStatus === "Pendente" ? "bg-zinc-400" :
                            colStatus === "Em Andamento" ? "bg-blue-400" :
                            colStatus === "Revisão" ? "bg-amber-400" : "bg-neon-green"
                          }`}></span>
                          {colStatus}
                        </span>
                        <span className="text-[10px] font-mono opacity-60">
                          {columnTasks.length}
                        </span>
                      </div>

                      <div className="space-y-2">
                        {columnTasks.map((task) => (
                          <div
                            key={task.id}
                            className={`p-2.5 rounded-lg border transition duration-200 hover:scale-[1.02] ${
                              theme === "dark" ? "bg-zinc-900 border-zinc-800" : "bg-white border-slate-200"
                            }`}
                          >
                            <span className={`inline-block text-[8px] font-mono px-1.5 py-0.5 rounded uppercase font-semibold mb-1 ${
                              task.priority === "Alta" ? "bg-red-950/40 text-red-400" : "bg-zinc-800 text-zinc-400"
                            }`}>
                              {task.priority}
                            </span>
                            <h5 className="text-[11px] font-medium leading-tight mb-2 text-zinc-200 dark:text-zinc-100">
                              {task.title}
                            </h5>
                            <div className="flex items-center justify-between mt-2.5 text-[9px] text-zinc-400">
                              <span>Ass: {task.assignedTo || "Não Atribuído"}</span>
                              <button
                                onClick={() => advanceTaskStatus(task.id)}
                                title="Avançar Tarefa"
                                className="p-1 rounded bg-purple-900/30 text-purple-300 border border-purple-800/40 hover:bg-neon-purple hover:text-white transition flex items-center"
                              >
                                <ChevronRight className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        ))}
                        {columnTasks.length === 0 && (
                          <div className="text-center py-6 text-[10px] text-zinc-500 italic">
                            Sem tarefas aqui
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {activeSubTab === "gantt" && (
              <div className={`p-4 rounded-xl border ${theme === "dark" ? "bg-zinc-900 border-zinc-800" : "bg-white border-slate-200"}`}>
                <h4 className="font-display font-semibold text-xs tracking-wide uppercase mb-3">
                  Cronograma Gantt de Entregas (Mês Corrente)
                </h4>
                
                {/* Visual Gantt Bar representation */}
                <div className="space-y-4">
                  {curProject.tasks.map((task, idx) => {
                    // Position offset simulation
                    const offsetPct = idx * 15;
                    const widthPct = Math.max(30, 100 - offsetPct - (idx * 5));
                    return (
                      <div key={task.id} className="grid grid-cols-4 items-center gap-3">
                        <div className="text-[10px] font-mono text-zinc-400 truncate">
                          {task.title}
                        </div>
                        <div className="col-span-3">
                          <div className="relative h-6 bg-zinc-950/60 rounded-md overflow-hidden flex items-center px-1 border border-zinc-800">
                            {/* Gantt Bar */}
                            <div 
                              style={{ marginLeft: `${offsetPct}%`, width: `${widthPct}%` }}
                              className={`h-4 rounded-sm flex items-center justify-between px-2 text-[8px] font-bold text-white transition-all ${
                                task.status === "Concluído" 
                                  ? "bg-gradient-to-r from-emerald-600 to-green-500" 
                                  : "bg-gradient-to-r from-purple-700 to-neon-purple"
                              }`}
                            >
                              <span className="truncate">{task.assignedTo}</span>
                              <span className="opacity-95 text-[7px] font-mono">{task.status}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {activeSubTab === "roadmap" && (
              <div className={`p-4 rounded-xl border ${theme === "dark" ? "bg-zinc-900 border-zinc-800" : "bg-white border-slate-200"}`}>
                <h4 className="font-display font-semibold text-xs tracking-wide uppercase mb-3 text-neon-green">
                  Roadmap de Marcos Estratégicos
                </h4>
                <div className="relative pl-6 border-l border-purple-900/50 space-y-5 ml-2 py-2">
                  {curProject.tasks.map((task, i) => (
                    <div key={task.id} className="relative">
                      {/* Checkpoint Dot */}
                      <span className={`absolute -left-[30px] top-1 w-4 h-4 rounded-full flex items-center justify-center border-2 ${
                        task.status === "Concluído" 
                          ? "bg-neon-green border-green-400" 
                          : "bg-zinc-900 border-purple-600"
                      }`}>
                        {task.status === "Concluído" && <CheckCircle2 className="w-3 h-3 text-black" />}
                      </span>
                      <div>
                        <span className="text-[9px] font-mono text-zinc-400 block">{task.startDate} até {task.endDate}</span>
                        <h5 className="text-xs font-semibold text-zinc-200 dark:text-zinc-100">{task.title}</h5>
                        <p className="text-[10px] text-zinc-400 mt-0.5">Executado por {task.assignedTo} • Prioridade {task.priority}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeSubTab === "raci" && (
              <div className={`p-4 rounded-xl border overflow-x-auto ${theme === "dark" ? "bg-zinc-900 border-zinc-800" : "bg-white border-slate-200"}`}>
                <h4 className="font-display font-semibold text-xs tracking-wide uppercase mb-3">
                  RACI - Matriz de Atribuição de Responsabilidade
                </h4>
                <table className="w-full text-left text-[10px] font-mono border-collapse">
                  <thead>
                    <tr className="border-b border-zinc-800 bg-zinc-950/40 text-neutral-400">
                      <th className="p-2 w-1/3">Atividade / Entrega</th>
                      <th className="p-2 text-center text-red-400">Responsible (R)</th>
                      <th className="p-2 text-center text-blue-400">Accountable (A)</th>
                      <th className="p-2 text-center text-amber-400">Consulted (C)</th>
                      <th className="p-2 text-center text-green-400">Informed (I)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {curProject.raci?.map((item, idx) => (
                      <tr key={idx} className="border-b border-zinc-800/40 hover:bg-purple-950/5">
                        <td className="p-2 font-medium text-zinc-300">{item.activity}</td>
                        <td className="p-2 text-center text-zinc-100">{item.responsible}</td>
                        <td className="p-2 text-center text-zinc-100">{item.accountable}</td>
                        <td className="p-2 text-center text-zinc-100">{item.consulted}</td>
                        <td className="p-2 text-center text-zinc-100">{item.informed}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {activeSubTab === "risks" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Risks Manager */}
                <div className={`p-4 rounded-xl border ${theme === "dark" ? "bg-zinc-900 border-zinc-800" : "bg-white border-slate-200"}`}>
                  <h4 className="font-display font-semibold text-xs tracking-wide uppercase mb-3 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-500" />
                    Matriz de Gestão de Riscos (PMO)
                  </h4>
                  <div className="space-y-3">
                    {curProject.risks.map((risk) => (
                      <div key={risk.id} className="p-2.5 rounded-lg bg-zinc-950/40 border border-zinc-850">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[11px] font-semibold text-zinc-100">{risk.title}</span>
                          <span className={`text-[8px] font-mono px-1.5 py-0.5 rounded font-bold ${
                            risk.impact === "Alto" ? "bg-red-950/40 text-red-400" : "bg-amber-950/40 text-amber-400"
                          }`}>
                            Imp: {risk.impact} | Prob: {risk.probability}
                          </span>
                        </div>
                        <p className="text-[10px] text-zinc-400 italic">
                          <strong>Plano de Mitigação:</strong> {risk.mitigation}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Stakeholders Manager */}
                <div className={`p-4 rounded-xl border ${theme === "dark" ? "bg-zinc-900 border-zinc-800" : "bg-white border-slate-200"}`}>
                  <h4 className="font-display font-semibold text-xs tracking-wide uppercase mb-3 flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-purple-400" />
                    Mapeamento de Stakeholders / Partes Interessadas
                  </h4>
                  <div className="space-y-3">
                    {curProject.stakeholders?.map((st) => (
                      <div key={st.id} className="flex items-center justify-between p-2.5 rounded-lg bg-zinc-950/40 border border-zinc-850">
                        <div>
                          <h5 className="text-[11px] font-medium text-zinc-100">{st.name}</h5>
                          <span className="text-[9px] text-zinc-400">{st.role} • {st.unit}</span>
                        </div>
                        <span className={`text-[9.5px] font-mono px-2 py-0.5 rounded font-bold ${
                          st.engagement === "Ativo" ? "bg-green-950/40 text-neon-green" : "bg-zinc-800 text-zinc-400"
                        }`}>
                          {st.engagement}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeSubTab === "register" && (
              <form onSubmit={handleCreateProject} className={`p-4 rounded-xl border space-y-4 ${
                theme === "dark" ? "bg-zinc-900 border-zinc-800" : "bg-white border-slate-200"
              }`}>
                <div className="border-b pb-2 border-zinc-800/50">
                  <h4 className="font-display font-semibold text-xs tracking-wide uppercase">
                    Registrar Nova Iniciativa PMO Estratégica
                  </h4>
                  <p className="text-[10px] text-zinc-400">Cadastre novos investimentos regionais sob governança da diretoria técnica.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[9.5px] font-mono text-zinc-400 mb-1">CÓDIGO/NOME DA INICIATIVA</label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Ampliacao do Laboratorio SENAI Resende"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 focus:border-purple-500 rounded px-2.5 py-1.5 text-xs outline-none text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[9.5px] font-mono text-zinc-400 mb-1">COODENADOR / GESTOR</label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Marcos de Castro Albuquerque"
                      value={newManager}
                      onChange={(e) => setNewManager(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 focus:border-purple-500 rounded px-2.5 py-1.5 text-xs outline-none text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[9.5px] font-mono text-zinc-400 mb-1">OBJETIVO PRINCIPAL</label>
                  <textarea
                    required
                    placeholder="Descrição para controle de processos e auditoria..."
                    value={newObjective}
                    onChange={(e) => setNewObjective(e.target.value)}
                    rows={2}
                    className="w-full bg-zinc-950 border border-zinc-800 focus:border-purple-500 rounded px-2.5 py-1.5 text-xs outline-none text-white"
                  />
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  <div>
                    <label className="block text-[9.5px] font-mono text-zinc-400 mb-1">ÁREA FINALIDADE</label>
                    <select
                      value={newArea}
                      onChange={(e) => setNewArea(e.target.value as any)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded px-1.5 py-1 text-xs text-white"
                    >
                      <option value="Tecnologia">Tecnologia</option>
                      <option value="Educação">Educação</option>
                      <option value="Infraestrutura">Infraestrutura</option>
                      <option value="Inovação">Inovação</option>
                      <option value="Eventos">Eventos</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[9.5px] font-mono text-zinc-400 mb-1">UNIDADE FIRJAN</label>
                    <select
                      value={newUnit}
                      onChange={(e) => setNewUnit(e.target.value as any)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded px-1.5 py-1 text-xs text-white"
                    >
                      <option value="SENAI">SENAI</option>
                      <option value="SESI">SESI</option>
                      <option value="Firjan">Firjan</option>
                      <option value="IEL">IEL</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[9.5px] font-mono text-zinc-400 mb-1">LIMITE PREVISTO (R$)</label>
                    <input
                      type="number"
                      required
                      value={newBudget}
                      onChange={(e) => setNewBudget(Number(e.target.value))}
                      className="w-full bg-zinc-950 border border-zinc-800 focus:border-purple-500 rounded px-2.5 py-1 text-xs outline-none text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[9.5px] font-mono text-zinc-400 mb-1">GRAU PRIORIDADE</label>
                    <select
                      value={newPriority}
                      onChange={(e) => setNewPriority(e.target.value as any)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded px-1.5 py-1 text-xs text-white"
                    >
                      <option value="Média">Média</option>
                      <option value="Alta">Alta</option>
                      <option value="Crítica">Crítica</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <button
                    type="submit"
                    className="bg-gradient-to-tr from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-medium text-xs px-5 py-2 rounded-lg transition"
                  >
                    Confirmar Registro e Emitir Logs
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Quick PMO Status Report Sidebar */}
          <div className="lg:col-span-1 space-y-4">
            <div className={`p-4 rounded-xl border ${theme === "dark" ? "bg-zinc-900 border-zinc-800" : "bg-white border-slate-200"}`}>
              <h4 className="font-display font-semibold text-xs tracking-wide uppercase mb-3 text-neon-purple">
                Ficha Executiva PMO
              </h4>
              <div className="space-y-3.5 text-[11px]">
                <div className="border-b border-zinc-800/40 pb-2">
                  <span className="text-zinc-400 font-mono text-[9px] block">ÁREA RESPONSÁVEL</span>
                  <span className="font-bold text-zinc-200 dark:text-zinc-100">{curProject.area}</span>
                </div>

                <div className="border-b border-zinc-800/40 pb-2">
                  <span className="text-zinc-400 font-mono text-[9px] block">PROGRESSO E STATUS</span>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className={`w-2.5 h-2.5 rounded-full ${
                      curProject.status === "Atrasado" ? "bg-red-500" :
                      curProject.status === "Em Atenção" ? "bg-amber-400" : "bg-green-400"
                    }`}></span>
                    <span className="font-bold">{curProject.status} ({curProject.progress}%)</span>
                  </div>
                </div>

                <div className="border-b border-zinc-800/40 pb-2">
                  <span className="text-zinc-400 font-mono text-[9px] block">ORÇAMENTO INTEGRADO</span>
                  <div className="mt-1">
                    <div className="flex justify-between text-zinc-300 mb-1">
                      <span>Previsto:</span>
                      <strong>R$ {curProject.budget.toLocaleString("pt-BR")}</strong>
                    </div>
                    <div className="flex justify-between text-neon-purple">
                      <span>Realizado:</span>
                      <strong>R$ {curProject.spent.toLocaleString("pt-BR")}</strong>
                    </div>
                  </div>
                </div>

                <div>
                  <span className="text-zinc-400 font-mono text-[9px] block mb-1">LIÇÕES APRENDIDAS</span>
                  <div className="space-y-1">
                    {curProject.lessonsLearned?.map((lesson, index) => (
                      <p key={index} className="text-[9.5px] p-1.5 bg-zinc-950/40 rounded italic text-zinc-300">
                        "{lesson}"
                      </p>
                    )) || <p className="text-[9.5px] text-zinc-500 italic">Nenhuma lição registrada.</p>}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-10">Nenhum projeto cadastrado nesta regional.</div>
      )}
    </div>
  );
}
