export interface MaintenanceTicket {
  id: string;
  equipment: string;
  area: string;
  priority: "Alta" | "Média" | "Baixa";
  requester: string;
  date: string;
  description: string;
  status: "Pendente" | "Em Execução" | "Concluído";
  cost: number;
  unit?: "SESI" | "SENAI" | string;
  product?: "Saúde" | "Segurança do Trabalho" | "Educação Básica" | "Educação Profissional" | string;
  syncStatus?: "Sincronizado" | "Pendente";
  executor?: string;
  classification?: string;
  conclusionDate?: string;
}

export interface ProjectTask {
  id: string;
  title: string;
  assignedTo: string;
  status: "Concluído" | "Em Andamento" | "Pendente" | string;
  priority: "Alta" | "Média" | "Baixa" | string;
  startDate: string;
  endDate: string;
}

export interface RiskItem {
  id: string;
  title: string;
  probability: "Alta" | "Média" | "Baixa" | string;
  impact: "Alto" | "Médio" | "Baixo" | string;
  mitigation: string;
}

export interface Stakeholder {
  id: string;
  name: string;
  role: string;
  engagement: "Ativo" | "Apoiador" | "Neutro" | string;
  unit: string;
}

export interface RACIEntry {
  activity: string;
  responsible: string;
  accountable: string;
  consulted: string;
  informed: string;
}

export interface Project {
  id: string;
  name: string;
  objective: string;
  manager: string;
  area: "Tecnologia" | "Educação" | "Infraestrutura" | "Inovação" | "Eventos" | string;
  unit: "Firjan" | "SENAI" | "SESI" | "IEL" | string;
  startDate: string;
  deadline: string;
  budget: number;
  spent: number;
  status: "Em Andamento" | "Em Atenção" | "Atrasado" | "Planejamento" | string;
  priority: "Média" | "Alta" | "Crítica" | string;
  progress: number;
  tasks?: ProjectTask[];
  risks?: RiskItem[];
  stakeholders?: Stakeholder[];
  raci?: RACIEntry[];
  lessonsLearned?: string[];
}

export interface Employee {
  id: string;
  name: string;
  role: string;
  department: string;
  unit: "Firjan" | "SENAI" | "SESI" | "IEL" | string;
  status: "Ativo" | "Férias" | "Desligado" | string;
  hiredDate: string;
  performanceScore: number;
  pdiGoal: string;
  pdiStatus: "Em Andamento" | "Concluído" | "Não Iniciado" | string;
  hoursBank: number;
  trainingsCompleted: number;
}

export interface AcademicCourse {
  id: string;
  name: string;
  type: string;
  unit: string;
  enrolled: number;
  evasionRate: number;
  status: string;
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
  costCenter: string;
  description: string;
  status: "Pago" | "Pendente" | string;
}

export interface CorporateDocument {
  id: string;
  name: string;
  format: string;
  size: string;
  version: string;
  uploadedBy: string;
  uploadedAt: string;
  status: "Aprovado" | "Em Revisão" | string;
}

export interface Contrato {
  id: string;
  title: string;
  supplier: string;
  value: number;
  status: "Ativo" | "Em Análise" | string;
  date: string;
}

export interface ServicoRequest {
  id: string;
  title: string;
  requester: string;
  department: string;
  date: string;
  priority: "Alta" | "Média" | "Baixa" | string;
  status: "Pendente" | "Aprovado" | "Em Atendimento" | string;
  value: number;
}

export interface AuditLog {
  id: string;
  userEmail: string;
  userName: string;
  role: string;
  action: string;
  module: string;
  timestamp: string;
  details: string;
}

export interface SystemNotification {
  id: string;
  title: string;
  body: string;
  type: "approve" | "alert" | "success" | string;
  timestamp: string;
  read: boolean;
}
