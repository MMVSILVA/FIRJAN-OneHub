import { Project, Employee, AcademicCourse, AcademicClass, FinanceTransaction, CorporateDocument, AuditLog, SystemNotification } from "./types";

export const initialProjects: Project[] = [
  {
    id: "pj-1",
    name: "Projeto SENAI 4.0 - Laboratório de Manufatura Avançada",
    objective: "Implementar células de robótica móvel, sensores IoT e gêmeos digitais na unidade de Maracanã para simular indústrias modernas.",
    manager: "Carlos Henrique Souza",
    area: "Tecnologia",
    unit: "SENAI",
    startDate: "2026-02-15",
    deadline: "2026-09-30",
    budget: 450000,
    spent: 320000,
    status: "Em Andamento",
    priority: "Alta",
    progress: 72,
    tasks: [
      { id: "tk-1-1", title: "Aquisição dos braços robóticos industriais", assignedTo: "Carlos Souza", status: "Concluído", priority: "Alta", startDate: "2026-02-20", endDate: "2026-04-10" },
      { id: "tk-1-2", title: "Configuração do software de gêmeo digital", assignedTo: "Alana Rocha", status: "Em Andamento", priority: "Média", startDate: "2026-04-15", endDate: "2026-06-30" },
      { id: "tk-1-3", title: "Treinamento dos docentes da unidade", assignedTo: "Julio Cesar", status: "Pendente", priority: "Alta", startDate: "2026-07-01", endDate: "2026-08-15" }
    ],
    risks: [
      { id: "rk-1-1", title: "Atraso na liberação alfandegária dos braços robóticos", probability: "Média", impact: "Alto", mitigation: "Negociar faturamento FOB com distribuidor local reserva." }
    ],
    stakeholders: [
      { id: "sh-1-1", name: "Diretor Regional SENAI", role: "Patrocinador Executivo", engagement: "Ativo", unit: "SENAI" },
      { id: "sh-1-2", name: "Gerente de Infraestrutura", role: "Gestor Técnico", engagement: "Apoiador", unit: "Firjan" }
    ],
    raci: [
      { activity: "Especificação dos Sensores", responsible: "Alana Rocha", accountable: "Carlos Souza", consulted: "Docentes SENAI", informed: "Diretoria SENAI" },
      { activity: "Instalação Elétrica do Painel", responsible: "Técnico Terceirizado", accountable: "Carlos Souza", consulted: "Engenharia de Segurança", informed: "Alana Rocha" }
    ],
    lessonsLearned: [
      "Processos de importação devem ser iniciados com 6 meses de folga operacional.",
      "A homologação de fornecedores regionais acelerou a entrega de periféricos e conectores."
    ]
  },
  {
    id: "pj-2",
    name: "Cozinhas Sustentáveis - Modernização SESI Alimentação",
    objective: "Substituir equipamentos de refrigeração e cocção de 6 refeitórios industriais por modelos de consumo classificação Classe A Procel.",
    manager: "Mariana Montenegro",
    area: "Infraestrutura",
    unit: "SESI",
    startDate: "2026-01-10",
    deadline: "2026-06-30",
    budget: 280000,
    spent: 275000,
    status: "Em Atenção",
    priority: "Média",
    progress: 90,
    tasks: [
      { id: "tk-2-1", title: "Mapeamento térmico de consumo atual", assignedTo: "Mariana Montenegro", status: "Concluído", priority: "Baixa", startDate: "2026-01-15", endDate: "2026-02-15" },
      { id: "tk-2-2", title: "Instalação dos novos refrigeradores", assignedTo: "Robson Lima", status: "Concluído", priority: "Alta", startDate: "2026-03-01", endDate: "2026-05-10" },
      { id: "tk-2-3", title: "Ajuste na automação de exaustores", assignedTo: "Sérgio Vieira", status: "Em Andamento", priority: "Média", startDate: "2026-05-15", endDate: "2026-06-25" }
    ],
    risks: [
      { id: "rk-2-1", title: "Flutuação elétrica nos testes iniciais", probability: "Alta", impact: "Médio", mitigation: "Instalar estabilizadores estáticos trifásicos no barramento de alimentação." }
    ],
    stakeholders: [
      { id: "sh-2-1", name: "Sindicato Alimentício RJ", role: "Conselho Consultivo", engagement: "Neutro", unit: "Firjan" }
    ],
    raci: [
      { activity: "Descarte ecológico de refrigeradores antigos", responsible: "Empresa Renova Verde", accountable: "Mariana Montenegro", consulted: "Jurídico Firjan", informed: "Diretoria SESI" }
    ],
    lessonsLearned: []
  },
  {
    id: "pj-3",
    name: "Fórum de Competitividade Firjan - Retomada Industrial",
    objective: "Organizar um simpósio executivo com mais de 50 entidades setoriais e federações para debater as diretrizes macroeconômicas estaduais.",
    manager: "Rodrigo Fonseca",
    area: "Eventos",
    unit: "Firjan",
    startDate: "2026-04-01",
    deadline: "2026-08-15",
    budget: 180000,
    spent: 450000,
    status: "Atrasado",
    priority: "Crítica",
    progress: 45,
    tasks: [
      { id: "tk-3-1", title: "Fechamento da pauta de painelistas principais", assignedTo: "Rodrigo Fonseca", status: "Em Andamento", priority: "Alta", startDate: "2026-04-10", endDate: "2026-06-15" },
      { id: "tk-3-2", title: "Montagem da estrutura no Palácio Firjan Centro", assignedTo: "Equipe PromoEventos", status: "Pendente", priority: "Média", startDate: "2026-07-20", endDate: "2026-08-10" }
    ],
    risks: [
      { id: "rk-3-1", title: "Incompatibilidade de agendas internacionais", probability: "Alta", impact: "Alto", mitigation: "Estruturar painéis híbridos online para keynotes impossibilitados de viajar." }
    ],
    stakeholders: [
      { id: "sh-3-1", name: "Presidente Executivo da Firjan", role: "Anfitrião de Honra", engagement: "Ativo", unit: "Firjan" }
    ],
    raci: [
      { activity: "Disparo do Press Kit", responsible: "Assessoria Imprensa", accountable: "Rodrigo Fonseca", consulted: "Diretoria Geral", informed: "Todas as Unidades" }
    ]
  },
  {
    id: "pj-4",
    name: "Plataforma Educacional Integrada SESI/SENAI Tech",
    objective: "Migrar a infraestrutura de LMS para arquitetura centralizada na nuvem com IA para recomendação de trilhas e mentorias personalizadas.",
    manager: "Tânia Mendonça",
    area: "Educação",
    unit: "SENAI",
    startDate: "2026-03-01",
    deadline: "2026-11-20",
    budget: 620000,
    spent: 190000,
    status: "Planejamento",
    priority: "Alta",
    progress: 25,
    tasks: [
      { id: "tk-4-1", title: "Mapeamento das APIs de integração acadêmica", assignedTo: "Tânia Mendonça", status: "Concluído", priority: "Alta", startDate: "2026-03-01", endDate: "2026-04-30" },
      { id: "tk-4-2", title: "Desenvolvimento do motor de recomendação inteligente", assignedTo: "Klever Software", status: "Em Andamento", priority: "Média", startDate: "2026-05-01", endDate: "2026-08-30" }
    ],
    risks: [
      { id: "rk-4-1", title: "Resistência de docentes séniores ao novo layout", probability: "Baixa", impact: "Alto", mitigation: "Criar grupo focal de UX com docentes influentes para cocriação." }
    ],
    stakeholders: [
      { id: "sh-4-1", name: "Diretoria de Inovação Pedagógica", role: "Patrocinadora", engagement: "Ativo", unit: "SESI" }
    ],
    raci: [
      { activity: "Homologação de LGPD", responsible: "Encarregado DPO", accountable: "Tânia Mendonça", consulted: "Jurídico Regional", informed: "Diretoria Geral" }
    ]
  }
];

export const initialEmployees: Employee[] = [
  {
    id: "emp-1",
    name: "Alessandra Silva Costa",
    role: "Analista Sênior de PMO",
    department: "Planejamento Estratégico",
    unit: "Firjan",
    status: "Ativo",
    hiredDate: "2021-04-10",
    performanceScore: 4.8,
    pdiGoal: "Concluir Certificação PMO-CP de Inteligência Artificial aplicada a Projetos Públicos",
    pdiStatus: "Em Andamento",
    hoursBank: 34.5,
    trainingsCompleted: 6
  },
  {
    id: "emp-2",
    name: "Carlos Henrique Souza",
    role: "Coordenador de Laboratórios de Inovação",
    department: "Tecnologia Aplicada",
    unit: "SENAI",
    status: "Ativo",
    hiredDate: "2020-09-15",
    performanceScore: 4.6,
    pdiGoal: "Estruturar 6 novos laboratórios de Manufatura Integrada em conformidade com o SENAI Nacional",
    pdiStatus: "Em Andamento",
    hoursBank: -12.0,
    trainingsCompleted: 4
  },
  {
    id: "emp-3",
    name: "Mariana Montenegro",
    role: "Gestora de Projetos de Nutrição e Saúde",
    department: "Relações com Comunidade",
    unit: "SESI",
    status: "Ativo",
    hiredDate: "2018-11-22",
    performanceScore: 4.9,
    pdiGoal: "Implementar práticas internacionais de desperdício zero nos 10 maiores refeitórios industriais do estado",
    pdiStatus: "Concluído",
    hoursBank: 48.0,
    trainingsCompleted: 10
  },
  {
    id: "emp-4",
    name: "Tânia Mendonça",
    role: "Especialista em Robótica e IoT",
    department: "Ensino Profissional",
    unit: "SENAI",
    status: "Ativo",
    hiredDate: "2023-01-16",
    performanceScore: 4.5,
    pdiGoal: "Publicar artigo técnico sobre o uso do metaverso no ensino automotivo no Congresso Anual SENAI",
    pdiStatus: "Não Iniciado",
    hoursBank: 8.5,
    trainingsCompleted: 2
  },
  {
    id: "emp-5",
    name: "Rodrigo Fonseca",
    role: "Analista Pleno de Relações Institucionais",
    department: "Comunicação e Marketing",
    unit: "Firjan",
    status: "Ativo",
    hiredDate: "2022-07-01",
    performanceScore: 3.9,
    pdiGoal: "Concluir capacitação em Media Training e Relações Governamentais pela FGV",
    pdiStatus: "Em Andamento",
    hoursBank: 15.0,
    trainingsCompleted: 3
  },
  {
    id: "emp-6",
    name: "Julio Cesar Albuquerque",
    role: "Tutor Orientador de Cursos Técnicos",
    department: "Capacitação Tecnológica",
    unit: "SENAI",
    status: "Ativo",
    hiredDate: "2019-03-05",
    performanceScore: 4.7,
    pdiGoal: "Atualizar a grade de Programação de CLP na nuvem e treinar o grupo regional de docentes auxiliares",
    pdiStatus: "Concluído",
    hoursBank: 4.0,
    trainingsCompleted: 5
  },
  {
    id: "emp-7",
    name: "Isadora Ramos Nogueira",
    role: "Analista de Treinamento Técnico e Carreiras",
    department: "Recursos Humanos Centralizados",
    unit: "IEL",
    status: "Férias",
    hiredDate: "2024-05-12",
    performanceScore: 4.2,
    pdiGoal: "Expandir o programa de Jovem Aprendiz corporativo para outras 30 indústrias associadas",
    pdiStatus: "Em Andamento",
    hoursBank: 22.0,
    trainingsCompleted: 4
  }
];

export const initialAcademicCourses: AcademicCourse[] = [
  { id: "crs-1", name: "Técnico em Automação Industrial e IoT", type: "Técnico", unit: "SENAI", enrolled: 240, evasionRate: 1.8, status: "Ativo", teacher: "Alana Rocha" },
  { id: "crs-2", name: "Ensino Médio SESI com Itinerário Profissional SENAI", type: "Socioeducativo", unit: "SESI", enrolled: 450, evasionRate: 2.1, status: "Ativo", teacher: "Sandra Mara" },
  { id: "crs-3", name: "Técnico em Programação de Jogos Digitais", type: "Técnico", unit: "SENAI", enrolled: 180, evasionRate: 4.5, status: "Ativo", teacher: "Rodrigo Amarante" },
  { id: "crs-4", name: "Desenvolvimento de Soluções Sustentáveis e ESG", type: "Qualificação Profissional", unit: "SENAI", enrolled: 120, evasionRate: 3.2, status: "Ativo", teacher: "Mariana Montenegro" },
  { id: "crs-5", name: "Pós-Graduação em Gestão Industrial Inteligente", type: "Graduação", unit: "SENAI", enrolled: 80, evasionRate: 1.2, status: "Ativo", teacher: "Dr. Helio Castelo" }
];

export const initialAcademicClasses: AcademicClass[] = [
  { id: "cl-1", courseName: "Técnico em Automação Industrial e IoT", code: "IND-AM-301", students: 35, progress: 85, period: "Noturno", room: "F-201 Robotica" },
  { id: "cl-2", courseName: "Ensino Médio SESI com Itinerário Profissional SENAI", code: "SESI-ITI-102", students: 42, progress: 40, period: "Integral", room: "Sala Google" },
  { id: "cl-3", courseName: "Técnico em Programação de Jogos Digitais", code: "SEN-TI-420", students: 28, progress: 60, period: "Vespertino", room: "Lab Mac 04" }
];

export const initialTransactions: FinanceTransaction[] = [
  { id: "tr-1", type: "Receita", category: "Inscrições SENAI", amount: 650000, date: "2026-06-01", costCenter: "SENAI", description: "Matrículas e mensalidades dos cursos de especialização automotiva 2026.2", status: "Pago" },
  { id: "tr-2", type: "Receita", category: "Convênio SESI", amount: 480000, date: "2026-06-03", costCenter: "SESI", description: "Repasse de subsídio de Alimentação e Saúde das indústrias cadastradas", status: "Pago" },
  { id: "tr-3", type: "Despesa", category: "Infraestrutura", amount: 120000, date: "2026-06-05", costCenter: "SENAI", description: "Pagamento de faturamento de componentes robóticos Honeywell do plano PMO Maracanã", status: "Pago" },
  { id: "tr-4", type: "Despesa", category: "Sistemas Corporativos", amount: 45000, date: "2026-06-08", costCenter: "Firjan", description: "Licenciamento Microsoft Dynamics e Azure Web Service", status: "Pago" },
  { id: "tr-5", type: "Despesa", category: "Marketing", amount: 55000, date: "2026-06-12", costCenter: "Firjan", description: "Campanha em mídias sociais para captação de novas indústrias associadas", status: "Pago" },
  { id: "tr-6", type: "Receita", category: "Taxa Associativa", amount: 320000, date: "2026-06-14", costCenter: "Firjan", description: "Mensalidade do Conselho Regional de Contribuição Empresarial", status: "Pago" },
  { id: "tr-7", type: "Despesa", category: "Inspeções SESI", amount: 30000, date: "2026-06-15", costCenter: "SESI", description: "Inspeções e calibrações de segurança sanitária de cozinhas industriais", status: "Pago" },
  { id: "tr-8", type: "Despesa", category: "Salários do Setor", amount: 420000, date: "2026-06-16", costCenter: "IEL", description: "Folha de pagamento dos consultores e tutores técnicos de carreira", status: "Pago" }
];

export const initialDocuments: CorporateDocument[] = [
  { id: "doc-1", name: "Diretriz_Estratégica_Firjan_2026_2030.pdf", format: "pdf", size: "4.8 MB", version: "v2.1", uploadedBy: "Alessandra Costa", uploadedAt: "2026-04-05", status: "Aprovado" },
  { id: "doc-2", name: "Matriz_Orcamentaria_SESI_SENAI_Consolidado.xlsx", format: "xlsx", size: "12.3 MB", version: "v1.4", uploadedBy: "Carlos Souza", uploadedAt: "2026-05-12", status: "Aprovado" },
  { id: "doc-3", name: "Modelo_Contrato_Prestacao_Servico_IEL.docx", format: "docx", size: "2.1 MB", version: "v1.0", uploadedBy: "Isadora Ramos", uploadedAt: "2026-06-01", status: "Em Revisão" },
  { id: "doc-4", name: "Apresentacao_Simposio_Competitividade.pptx", format: "pptx", size: "24.5 MB", version: "v3.0", uploadedBy: "Rodrigo Fonseca", uploadedAt: "2026-05-20", status: "Aprovado" },
  { id: "doc-5", name: "Relatorio_Trigeminal_SLA_Atendimento.csv", format: "csv", size: "720 KB", version: "v1.1", uploadedBy: "Mariana Montenegro", uploadedAt: "2026-06-14", status: "Em Revisão" }
];

export const initialContratos: import("./types").Contrato[] = [
  { id: "ct-1", title: "Contrato Fornecimento Tecnológico Robótica", supplier: "ABB Robotics Brasil", value: 380000, status: "Ativo", date: "2026-03-10" },
  { id: "ct-2", title: "Manutenção Cozinhas Industriais Unidades SESI", supplier: "ClimaTech Refrigeração Ltda", value: 120000, status: "Ativo", date: "2026-01-20" },
  { id: "ct-3", title: "Serviço de Licenciamento de Ambientes Virtuais de Aprendizado", supplier: "Google Enterprise Partner", value: 92000, status: "Ativo", date: "2026-04-15" },
  { id: "ct-4", title: "Prestação de Serviços Evento Simpósio Retomada", supplier: "PromoShow Montadoras de Estandes", value: 65000, status: "Em Análise", date: "2026-06-05" }
];

export const initialServicoRequests: import("./types").ServicoRequest[] = [
  { id: "srv-1", title: "Aquisição Extra de Componentes Lógicos de CLP", requester: "Carlos Henrique Souza", department: "Tecnologia Aplicada", date: "2026-06-10", priority: "Alta", status: "Pendente", value: 34000 },
  { id: "srv-2", title: "Contratação Emergencial de Instrutores Mecatrônica", requester: "Dr. Helio Castelo", department: "Ensino Profissional", date: "2026-06-12", priority: "Alta", status: "Aprovado", value: 18000 },
  { id: "srv-3", title: "Substituição de Condicionadores de Ar Maracanã", requester: "Vanessa Abreu", department: "Administrativo Unidades", date: "2026-06-14", priority: "Média", status: "Pendente", value: 45000 },
  { id: "srv-4", title: "Suporte Técnico para Firewall Fórum", requester: "Rodrigo Fonseca", department: "Eventos e Rede", date: "2026-06-15", priority: "Baixa", status: "Em Atendimento", value: 3500 }
];

export const initialAuditLogs: AuditLog[] = [
  { id: "log-1", userEmail: "ttrocha@firjan.com.br", userName: "Tatiane Teixeira Rocha", role: "Gestora", action: "Aprovação de Contrato", module: "ADMINISTRATIVO", timestamp: "2026-06-17T08:15:00", details: "Contrato ' ct-2' foi formalizado e assinado via Docusign Firjan de Auditoria." },
  { id: "log-2", userEmail: "ttrocha@firjan.com.br", userName: "Tatiane Teixeira Rocha", role: "Gestora", action: "Upload de Arquivo", module: "DOCUMENTOS", timestamp: "2026-06-17T09:02:00", details: "Enviou 'Diretriz_Estratégica_Firjan_2026_2030.pdf' v2.1 para repositório." },
  { id: "log-3", userEmail: "coordenador@firjan.org.br", userName: "Sérgio Vieira", role: "Coordenador", action: "Modificação de Tarefa", module: "PROJETOS", timestamp: "2026-06-17T09:41:00", details: "Item de Gantt 'Ajuste na automação de exaustores' marcado como 'Em Andamento'." },
  { id: "log-4", userEmail: "gestora@sesi.org.br", userName: "Mariana Montenegro", role: "Gestora", action: "Login no Sistema", module: "AUTENTICAÇÃO", timestamp: "2026-06-17T10:10:00", details: "Usuário autenticado sob rede Firjan VPN corporativa." }
];

export const initialNotifications: SystemNotification[] = [
  { id: "nt-1", title: "Nova Aprovação Requerida", body: "A solicitação de serviço srv-1 tem valor de R$34.000,00 e requer verificação técnica imediata da Gestora de Unidade.", type: "approve", timestamp: "2026-06-17T09:30:00", read: false },
  { id: "nt-2", title: "Alerta de Prazo do Simpósio", body: "O projeto 'Simpósio Retomada Industrial' está com andamento de 45% com prazo expirando em agosto. Status Crítico.", type: "alert", timestamp: "2026-06-17T08:00:00", read: false },
  { id: "nt-3", title: "Documento Aprovado", body: "A matriz consolidada orçamentária de custeio SESI/SENAI foi liberada pela Controladoria Estratégica.", type: "success", timestamp: "2026-06-16T17:00:00", read: true }
];
