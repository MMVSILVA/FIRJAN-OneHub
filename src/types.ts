export type UserRole = "Administrador Global" | "Gestora" | "Coordenador" | "Colaborador";

export interface UserSession {
  id: string;
  name: string;
  role: UserRole;
  avatar: string;
  email: string;
  unit: string;
  department: string;
}

export interface RACIEntry {
  activity: string;
  responsible: string; // R
  accountable: string; // A
  consulted: string;   // C
  informed: string;    // I
}

export interface RiskItem {
  id: string;
  title: string;
  probability: "Baixa" | "Média" | "Alta";
  impact: "Baixo" | "Médio" | "Alto";
  mitigation: string;
}

export interface Stakeholder {
  id: string;
  name: string;
  role: string;
  engagement: "Informativo" | "Ativo" | "Apoiador" | "Neutro";
  unit: string;
}

export interface ProjectTask {
  id: string;
  title: string;
  assignedTo: string;
  status: "Pendente" | "Em Andamento" | "Revisão" | "Concluído";
  priority: "Baixa" | "Média" | "Alta";
  startDate: string;
  endDate: string;
}

export interface Project {
  id: string;
  name: string;
  objective: string;
  manager: string;
  area: "Tecnologia" | "Educação" | "Infraestrutura" | "Inovação" | "Eventos";
  unit: "Firjan" | "SENAI" | "SESI" | "IEL";
  startDate: string;
  deadline: string;
  budget: number;
  spent: number;
  status: "Planejamento" | "Em Andamento" | "Em Atenção" | "Atrasado" | "Concluído";
  priority: "Média" | "Alta" | "Crítica";
  progress: number; // 0 to 100
  tasks: ProjectTask[];
  risks: RiskItem[];
  stakeholders: Stakeholder[];
  raci: RACIEntry[];
  lessonsLearned?: string[];
}

export interface Contrato {
  id: string;
  title: string;
  supplier: string;
  value: number;
  status: "Rascunho" | "Em Análise" | "Ativo" | "Encerrado";
  date: string;
}

export interface ServicoRequest {
  id: string;
  title: string;
  requester: string;
  department: string;
  date: string;
  priority: "Baixa" | "Média" | "Alta";
  status: "Pendente" | "Aprovado" | "Rejeitado" | "Em Atendimento";
  value?: number;
}

export interface Employee {
  id: string;
  name: string;
  role: string;
  department: string;
  unit: "Firjan" | "SENAI" | "SESI" | "IEL";
  status: "Ativo" | "Férias" | "Licença";
  hiredDate: string;
  performanceScore: number; // 1-5 star or percent
  pdiGoal: string;
  pdiStatus: "Não Iniciado" | "Em Andamento" | "Concluído";
  hoursBank: number; // plus or minus hours
  trainingsCompleted: number;
}

export interface AcademicCourse {
  id: string;
  name: string;
  type: "Técnico" | "Socioeducativo" | "Qualificação Profissional" | "Graduação";
  unit: "SENAI" | "SESI";
  enrolled: number;
  evasionRate: number; // percentage
  status: "Ativo" | "Pendente";
  teacher: string;
}

export interface AcademicClass {
  id: string;
  courseName: string;
  code: string;
  students: number;
  progress: number;
  period: string;
  room: string;
}

export interface FinanceTransaction {
  id: string;
  type: "Receita" | "Despesa";
  category: string;
  amount: number;
  date: string;
  costCenter: "Firjan" | "SENAI" | "SESI" | "IEL";
  description: string;
  status: "Pago" | "Pendente";
}

export interface CorporateDocument {
  id: string;
  name: string;
  format: "pdf" | "docx" | "xlsx" | "pptx" | "csv";
  size: string;
  version: string;
  uploadedBy: string;
  uploadedAt: string;
  status: "Aprovado" | "Em Revisão" | "Rascunho";
}

export interface AuditLog {
  id: string;
  userEmail: string;
  userName: string;
  role: UserRole;
  action: string;
  module: string;
  timestamp: string;
  details: string;
}

export interface SystemNotification {
  id: string;
  title: string;
  body: string;
  type: "approve" | "alert" | "info" | "success";
  timestamp: string;
  read: boolean;
}
