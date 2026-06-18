import React, { useState } from "react";
import { 
  Users, Layers, Award, Target, BookOpen, Clock, Calendar, 
  MapPin, CheckCircle2, AlertCircle, Plus 
} from "lucide-react";
import { Employee } from "../types";

interface RHModuleProps {
  employees: Employee[];
  setEmployees: React.Dispatch<React.SetStateAction<Employee[]>>;
  onAddAuditLog: (action: string, module: string, details: string) => void;
  role: string;
  theme: "dark" | "light";
}

type RHSubTab = "directory" | "organogram" | "pdi" | "vacations";

export default function RHModule({
  employees,
  setEmployees,
  onAddAuditLog,
  role,
  theme
}: RHModuleProps) {
  const [activeSubTab, setActiveSubTab] = useState<RHSubTab>("directory");
  const [selectedNodeId, setSelectedNodeId] = useState<string>("emp-1");
  
  // Registration Form
  const [empName, setEmpName] = useState("");
  const [empRole, setEmpRole] = useState("");
  const [empDept, setEmpDept] = useState("Planejamento");
  const [empUnit, setEmpUnit] = useState<"Firjan" | "SENAI" | "SESI" | "IEL">("SENAI");

  // PDI update states
  const [newGoalText, setNewGoalText] = useState("");
  const [pdiStatus, setPdiStatus] = useState<"Não Iniciado" | "Em Andamento" | "Concluído">("Em Andamento");

  const selectedNode = employees.find(e => e.id === selectedNodeId) || employees[0];

  const handleRegisterEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!empName.trim() || !empRole.trim()) return;

    if (role === "Colaborador") {
      alert("Apenas perfis Administrativos ou Gestores podem cadastrar colaboradores no banco.");
      return;
    }

    const newEmp: Employee = {
      id: `emp-${Date.now()}`,
      name: empName,
      role: empRole,
      department: empDept,
      unit: empUnit,
      status: "Ativo",
      hiredDate: new Date().toISOString().split("T")[0],
      performanceScore: 4.0,
      pdiGoal: "Completar ambientação do Firjan OneHub e governança regional.",
      pdiStatus: "Não Iniciado",
      hoursBank: 0,
      trainingsCompleted: 1
    };

    setEmployees((prev) => [...prev, newEmp]);
    setEmpName("");
    setEmpRole("");
    
    onAddAuditLog(
      "Cadastro de Colaborador", 
      "RECURSOS_HUMANOS", 
      `Cadastrado novo funcionário técnico "${newEmp.name}" como "${newEmp.role}".`
    );
  };

  const handleUpdatePDI = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoalText.trim() || !selectedNode) return;

    const updated = employees.map(emp => {
      if (emp.id === selectedNode.id) {
        return {
          ...emp,
          pdiGoal: newGoalText,
          pdiStatus: pdiStatus
        };
      }
      return emp;
    });

    setEmployees(updated);
    setNewGoalText("");
    
    onAddAuditLog(
      "Atualização de PDI", 
      "RECURSOS_HUMANOS", 
      `Meta de PDI atualizada para ${selectedNode.name}: "${newGoalText}" [Status: ${pdiStatus}].`
    );
  };

  const adjustHoursBank = (empId: string, amount: number) => {
    if (role === "Colaborador") return;
    
    const updated = employees.map(emp => {
      if (emp.id === empId) {
        return { ...emp, hoursBank: emp.hoursBank + amount };
      }
      return emp;
    });
    setEmployees(updated);
    
    const targetName = employees.find(e => e.id === empId)?.name || "Colaborador";
    onAddAuditLog(
      "Banco de Horas", 
      "RECURSOS_HUMANOS", 
      `Ajustado banco de horas de ${targetName} em ${amount > 0 ? "+" : ""}${amount} horas.`
    );
  };

  // Structured organogram node definition hierarchy
  const hierarchyNodes = [
    { id: "dir-1", name: "Dr. Eduardo Eugenio Gouvêa Vieira", title: "Presidente Executivo Conselho Firjan", level: "Diretoria-Geral", children: ["emp-1", "emp-3"] },
    { id: "emp-1", name: "Alessandra Silva Costa", title: "Presidente Regional de PMO", level: "Coordenação Estratégica", children: ["emp-2", "emp-5"] },
    { id: "emp-3", name: "Mariana Montenegro", title: "Gestora Geral de Programas SESI", level: "Coordenação SESI", children: ["emp-7"] },
    { id: "emp-2", name: "Carlos Henrique Souza", title: "Coordenador Geral de Automação SENAI", level: "Coordenador Técnico", children: ["emp-4", "emp-6"] }
  ];

  return (
    <div className="space-y-4">
      {/* Visual Sub Tabs */}
      <div className={`p-4 rounded-xl border flex flex-col md:flex-row gap-4 items-start md:items-center justify-between ${
        theme === "dark" ? "bg-zinc-900 border-zinc-800" : "bg-white border-slate-200"
      }`}>
        <div className="flex items-center gap-2.5">
          <Users className="w-5 h-5 text-neon-purple" />
          <div>
            <h4 className="font-display font-semibold text-sm">Painel do Ecossistema de Talentos</h4>
            <p className="text-[10px] text-zinc-400">Organização funcional, metas de PDI, banco de horas e capacitações corporativas.</p>
          </div>
        </div>

        {/* Action Toggle Toggles */}
        <div className="flex gap-1.5 self-end md:self-auto">
          {[
            { id: "directory", label: "Controle de Pessoal", icon: Users },
            { id: "organogram", label: "Organograma Dinâmico", icon: Layers },
            { id: "pdi", label: "Plano de Carreira & PDI", icon: Target },
            { id: "vacations", label: "Férias & Banco", icon: Clock }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id as RHSubTab)}
                className={`flex items-center gap-1.5 text-[10px] px-3 py-1.5 rounded-lg font-medium transition ${
                  activeSubTab === tab.id
                    ? "bg-purple-900/30 text-purple-300 border border-purple-500/50"
                    : theme === "dark"
                    ? "bg-zinc-950/40 border border-zinc-800 hover:border-zinc-700 text-zinc-400"
                    : "bg-slate-50 border border-slate-200 hover:border-slate-300 text-slate-600"
                }`}
              >
                <Icon className="w-3.5 h-3.5 text-neon-purple" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {activeSubTab === "directory" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* List framework on left */}
          <div className="lg:col-span-2 space-y-3">
            <div className={`p-4 rounded-xl border ${theme === "dark" ? "bg-zinc-900 border-zinc-800" : "bg-white border-slate-200"}`}>
              <h4 className="font-display font-semibold text-xs tracking-wide uppercase mb-3">
                Listagem Geral de Colaboradores Cadastrados
              </h4>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-[11px] border-collapse text-zinc-300">
                  <thead>
                    <tr className="border-b border-zinc-800/60 pb-1.5 text-neutral-400 font-mono">
                      <th className="p-2 pl-0">Nome do Integrante</th>
                      <th className="p-2">Cargo / Linha</th>
                      <th className="p-2">Unidade</th>
                      <th className="p-2">Metas Concluídas</th>
                      <th className="p-2 text-right">Banco Acumulado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {employees.map((emp) => (
                      <tr 
                        key={emp.id} 
                        onClick={() => setSelectedNodeId(emp.id)}
                        className={`border-b border-zinc-800/20 hover:bg-purple-950/5 cursor-pointer ${
                          selectedNodeId === emp.id ? "bg-purple-900/10 text-white" : ""
                        }`}
                      >
                        <td className="p-2 pl-0 font-medium">{emp.name}</td>
                        <td className="p-2">{emp.role}</td>
                        <td className="p-2">
                          <span className="text-[10px] font-bold px-1.5 py-0.5 bg-zinc-800 rounded">
                            {emp.unit}
                          </span>
                        </td>
                        <td className="p-2 text-center font-bold text-neon-green">{emp.trainingsCompleted} cursos</td>
                        <td className="p-2 text-right font-mono font-bold" style={{ color: emp.hoursBank >= 0 ? "#39ff14" : "#f87171" }}>
                          {emp.hoursBank > 0 ? "+" : ""}{emp.hoursBank}h
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Form and Quick registration on right */}
          <div className="lg:col-span-1 space-y-4">
            <form onSubmit={handleRegisterEmployee} className={`p-4 rounded-xl border space-y-3 ${
              theme === "dark" ? "bg-zinc-900 border-zinc-800" : "bg-white border-slate-200"
            }`}>
              <h4 className="font-display font-semibold text-xs tracking-wide uppercase pb-2 border-b border-zinc-800/30">
                Cadastrar Colaborador
              </h4>
              
              <div className="space-y-1">
                <label className="text-[8.5px] font-mono text-zinc-400 block">NOME INTEGRO</label>
                <input
                  type="text"
                  required
                  placeholder="Alessandra Alencar de Castro"
                  value={empName}
                  onChange={(e) => setEmpName(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded px-2 py-1.5 text-xs text-white outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[8.5px] font-mono text-zinc-400 block">CARGO / ESPECIALIDADE</label>
                <input
                  type="text"
                  required
                  placeholder="Técnico Instrutor Automotivo"
                  value={empRole}
                  onChange={(e) => setEmpRole(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded px-2 py-1.5 text-xs text-white outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[8.5px] font-mono text-zinc-400 block">SETOR</label>
                  <input
                    type="text"
                    required
                    placeholder="Pedagogia"
                    value={empDept}
                    onChange={(e) => setEmpDept(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded px-2 py-1.5 text-xs text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[8.5px] font-mono text-zinc-400 block">UNIDADE</label>
                  <select
                    value={empUnit}
                    onChange={(e) => setEmpUnit(e.target.value as any)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded px-1 py-1 text-xs text-white"
                  >
                    <option value="SENAI">SENAI (Técnico)</option>
                    <option value="SESI">SESI (Social)</option>
                    <option value="Firjan">Firjan (Sede)</option>
                    <option value="IEL">IEL (Carreiras)</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-purple-900/30 text-purple-300 border border-purple-800/40 hover:bg-neon-purple hover:text-white transition py-2 rounded-lg font-medium text-xs flex items-center justify-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                Matricular no Banco
              </button>
            </form>
          </div>
        </div>
      )}

      {activeSubTab === "organogram" && (
        <div className={`p-4 rounded-xl border ${theme === "dark" ? "bg-zinc-900 border-zinc-800" : "bg-white border-slate-200"}`}>
          <h4 className="font-display font-semibold text-xs tracking-wide uppercase mb-3">
            Estrutura de Liderança e Docência (Organograma Corporativo)
          </h4>
          <p className="text-[10px] text-zinc-400 mb-6">Explore a linha de prestação de contas. Clique em qualquer nó para inspecionar PDIs.</p>
          
          <div className="flex flex-col items-center justify-center space-y-6">
            {/* Level 1: Director */}
            <div 
              onClick={() => setSelectedNodeId("emp-1")}
              className={`p-3 rounded-lg border text-center transition cursor-pointer max-w-sm ${
                selectedNodeId === "emp-1" ? "border-purple-500 bg-purple-950/20" : "border-zinc-800 bg-zinc-950/50"
              }`}
            >
              <div className="text-[9px] font-mono text-neon-purple uppercase">Diretoria Regional</div>
              <h5 className="text-xs font-bold">Alessandra Silva Costa</h5>
              <p className="text-[9px] text-zinc-300 truncate">Sediada na Firjan Central Centro • Score 4.8</p>
            </div>

            {/* Connecting line */}
            <div className="w-0.5 h-6 bg-zinc-800" />

            {/* Level 2: Managers */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl">
              <div 
                onClick={() => setSelectedNodeId("emp-2")}
                className={`p-3 rounded-lg border text-center transition cursor-pointer ${
                  selectedNodeId === "emp-2" ? "border-purple-500 bg-purple-950/20" : "border-zinc-800 bg-zinc-950/50"
                }`}
              >
                <div className="text-[9px] font-mono text-neon-green uppercase">Coordenação SENAI</div>
                <h5 className="text-xs font-bold">Carlos Henrique Souza</h5>
                <p className="text-[9px] text-zinc-300">Maracanã Manufatura Avançada</p>
              </div>

              <div 
                onClick={() => setSelectedNodeId("emp-3")}
                className={`p-3 rounded-lg border text-center transition cursor-pointer ${
                  selectedNodeId === "emp-3" ? "border-purple-500 bg-purple-950/20" : "border-zinc-800 bg-zinc-950/50"
                }`}
              >
                <div className="text-[9px] font-mono text-amber-500 uppercase">Coordenação SESI</div>
                <h5 className="text-xs font-bold">Mariana Montenegro</h5>
                <p className="text-[9px] text-zinc-300">Sustentabilidade Alimentar</p>
              </div>
            </div>

            {/* Connection down */}
            <div className="w-0.5 h-6 bg-zinc-800" />

            {/* Level 3: Specialists / Teachers */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 w-full">
              {[
                { id: "emp-4", name: "Tânia Mendonça", tag: "Robótica SENAI" },
                { id: "emp-5", name: "Rodrigo Fonseca", tag: "Marketing Firjan" },
                { id: "emp-6", name: "Julio Cesar", tag: "Tutor SENAI" },
                { id: "emp-7", name: "Isadora Ramos", tag: "RH IEL" }
              ].map(item => (
                <div 
                  key={item.id}
                  onClick={() => setSelectedNodeId(item.id)}
                  className={`p-2 rounded-lg border text-center transition cursor-pointer ${
                    selectedNodeId === item.id ? "border-purple-500 bg-purple-950/20" : "border-zinc-850 bg-zinc-950/50"
                  }`}
                >
                  <div className="text-[7.5px] font-mono text-zinc-400">{item.tag}</div>
                  <h5 className="text-[10px] font-semibold">{item.name}</h5>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeSubTab === "pdi" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Node detail display on left */}
          <div className="lg:col-span-1 space-y-3">
            <div className={`p-4 rounded-xl border ${theme === "dark" ? "bg-zinc-900 border-zinc-800" : "bg-white border-slate-200"}`}>
              <span className="text-[8.5px] font-mono text-zinc-400 tracking-wider block">COLABORADOR SELECIONADO</span>
              <h4 className="font-display font-semibold text-sm mb-2 text-neon-purple">{selectedNode.name}</h4>
              <p className="text-[11px] text-zinc-300 font-mono italic mb-4">"{selectedNode.role}"</p>

              <div className="space-y-3.5 text-[11px]">
                <div className="border-t border-zinc-800/40 pt-2 flex justify-between">
                  <span className="text-zinc-400">Score de Desempenho:</span>
                  <span className="font-bold text-neon-green">{selectedNode.performanceScore} / 5.0</span>
                </div>
                <div className="border-t border-zinc-800/40 pt-2">
                  <span className="text-zinc-400 block mb-1">Meta de Carreira PDI Atual:</span>
                  <p className="text-[10.5px] p-2 bg-zinc-950/40 rounded italic border border-zinc-800/40 text-zinc-200">
                    {selectedNode.pdiGoal}
                  </p>
                </div>
                <div className="border-t border-zinc-800/40 pt-2 flex justify-between">
                  <span className="text-zinc-400">Status PDI:</span>
                  <span className={`font-mono font-bold ${
                    selectedNode.pdiStatus === "Concluído" ? "text-neon-green" : "text-amber-400"
                  }`}>{selectedNode.pdiStatus}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Form edit for Managers */}
          <div className="lg:col-span-2">
            <form onSubmit={handleUpdatePDI} className={`p-4 rounded-xl border space-y-3 ${
              theme === "dark" ? "bg-zinc-900 border-zinc-800" : "bg-white border-slate-200"
            }`}>
              <h4 className="font-display font-semibold text-xs uppercase pb-2 border-b border-zinc-800/30">
                Pactuação de Nova Meta / PDI para {selectedNode.name}
              </h4>
              
              <div className="space-y-1">
                <label className="text-[8.5px] font-mono text-zinc-400 block">DEFINIÇÃO DE OBJETIVO (META ANUAL)</label>
                <textarea
                  required
                  placeholder="Ex: Concluir Pos-Graduacao em IA Industrial pelo SENAI Cetiqt..."
                  value={newGoalText}
                  onChange={(e) => setNewGoalText(e.target.value)}
                  rows={3}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded px-2.5 py-1.5 text-xs text-white outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[8.5px] font-mono text-zinc-400 block">STATUS PACTUAÇÃO</label>
                  <select
                    value={pdiStatus}
                    onChange={(e) => setPdiStatus(e.target.value as any)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded px-1 py-1 text-xs text-white"
                  >
                    <option value="Não Iniciado">Não Iniciado</option>
                    <option value="Em Andamento">Em Andamento</option>
                    <option value="Concluído">Concluído</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="bg-purple-900/40 text-purple-200 hover:bg-neon-purple hover:text-white font-medium text-xs px-5 py-2 rounded-lg transition"
                >
                  Registrar Pactuação e Reprimir Histórico
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {activeSubTab === "vacations" && (
        <div className={`p-4 rounded-xl border ${theme === "dark" ? "bg-zinc-900 border-zinc-800" : "bg-white border-slate-200"}`}>
          <h4 className="font-display font-semibold text-xs uppercase mb-3">
            Agenda de Férias Planejadas e Ajuste de Horas Acumuladas
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Vacation program status list */}
            <div className="space-y-2">
              <span className="text-[9px] font-mono text-zinc-400 uppercase tracking-widest block">ESCALA ANUAL DE FÉRIAS</span>
              {employees.map(emp => (
                <div key={emp.id} className="flex items-center justify-between p-2 rounded bg-zinc-950/40 border border-zinc-900 leading-tight">
                  <div>
                    <h5 className="text-[11px] font-bold text-zinc-200">{emp.name}</h5>
                    <span className="text-[9px] text-zinc-400">{emp.unit} • Admissão {emp.hiredDate}</span>
                  </div>
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded ${
                    emp.status === "Férias" ? "bg-amber-950/40 text-amber-400" : "bg-zinc-800 text-zinc-400"
                  }`}>
                    {emp.status}
                  </span>
                </div>
              ))}
            </div>

            {/* Hours bank modifier action blocks */}
            <div className="space-y-3.5">
              <span className="text-[9px] font-mono text-zinc-400 uppercase tracking-widest block">AJUSTADOR DE BANCO DE HORAS (Geral)</span>
              <p className="text-[10px] text-zinc-400">Clique para compensar ou inserir horas extras ocorridas em treinamentos setoriais ou simpósios.</p>
              
              <div className="p-3 bg-zinc-950/20 border border-purple-900/20 rounded-xl space-y-3">
                <span className="text-[10px] font-bold text-zinc-300">Pessoa ativa: <span className="text-neon-purple">{selectedNode.name}</span></span>
                <div className="flex gap-2">
                  <button
                    onClick={() => adjustHoursBank(selectedNode.id, 8)}
                    className="flex-1 text-[10px] bg-emerald-950/40 hover:bg-emerald-900/40 text-emerald-400 py-1.5 rounded transition border border-emerald-500/20"
                  >
                    Creditar +8 Horas
                  </button>
                  <button
                    onClick={() => adjustHoursBank(selectedNode.id, -8)}
                    className="flex-1 text-[10px] bg-red-950/40 hover:bg-neutral-800 text-red-500 py-1.5 rounded transition border border-red-500/20"
                  >
                    Compensar -8 Horas
                  </button>
                </div>
                <div className="text-[9px] text-zinc-400 text-center">
                  Saldo Final Atualizado: <strong className="font-mono text-zinc-200">{selectedNode.hoursBank} horas</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
