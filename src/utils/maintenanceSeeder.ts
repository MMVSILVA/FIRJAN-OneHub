import { MaintenanceTicket } from "../types";

export function generate448MaintenanceTickets(): MaintenanceTicket[] {
  const list: MaintenanceTicket[] = [];
  
  // Exactly 102 in Jan, 185 in Feb, 161 in Mar
  const months = [
    ...Array(102).fill("01"),
    ...Array(185).fill("02"),
    ...Array(161).fill("03")
  ];
  
  // Exactly 284 SESI, 152 SENAI, 8 Barreira, 2 RR, 2 Shopping 33
  const units = [
    ...Array(284).fill("SESI"),
    ...Array(152).fill("SENAI"),
    ...Array(8).fill("BARREIRA"),
    ...Array(2).fill("R R"),
    ...Array(2).fill("Shopping 33")
  ];
  
  // Exactly 40 Administração, 3 Barreira Cravo, 248 Educação Básica, 136 Educação Profissional, 19 Saúde, 1 Segurança do Trabalho, 1 Outros
  const areas = [
    ...Array(40).fill("Administração"),
    ...Array(3).fill("Barreira Cravo"),
    ...Array(248).fill("Educação Básica"),
    ...Array(136).fill("Educação Profissional"),
    ...Array(19).fill("Saúde"),
    ...Array(1).fill("Segurança do Trabalho"),
    ...Array(1).fill("Outros")
  ];
  
  // Exactly 132 Elétrica, 98 Ar-condicionado, 39 Hidráulica, 17 Alvenaria, 11 Instalações, 10 Pintura, 9 Marcenaria, 6 Manutenção, 5 Refrigeração, 1 Estrutura, 120 Outros
  const classifications = [
    ...Array(132).fill("Elétrica"),
    ...Array(98).fill("Ar-condicionado"),
    ...Array(39).fill("Hidráulica"),
    ...Array(17).fill("Alvenaria"),
    ...Array(11).fill("Instalações"),
    ...Array(10).fill("Pintura"),
    ...Array(9).fill("Marcenaria"),
    ...Array(6).fill("Manutenção"),
    ...Array(5).fill("Refrigeração"),
    ...Array(1).fill("Estrutura"),
    ...Array(120).fill("Outros")
  ];
  
  // Exactly 157 Alexandre principal, 74 João, 70 RPCI, 11 Wallace, 135 Welder, 1 Mateus (Welder e Mateus), etc.
  // To match Sesi x Senai and other filters nicely, let's specify the exact array of executors.
  // We want the primary executor (the first name) to sum to Alexandre: 157, João: 74, RPCI: 70, Wallace: 11, Welder: 135, Construservice: 1
  // Let's create an executors array of size 448:
  const executors = [
    ...Array(157).fill("Alexandre"),
    ...Array(74).fill("João"),
    ...Array(70).fill("RPCI"),
    ...Array(11).fill("Wallace"),
    ...Array(134).fill("Welder"), // 134 + 1 = 135
    ...Array(2).fill("Welder e Mateus"), // Welder is principal
    // Some combinations where other names are principal:
    "João e RPCI", // João is principal
    "João e Construservice", // João is principal
    "Wallace e Construservice", // Wallace is principal
    ...Array(11).fill("Alexandre, João e Welder"), // Alexandre is principal
    ...Array(12).fill("Alexandre e Welder"), // Alexandre is principal
    ...Array(11).fill("Alexandre e João"), // Alexandre is principal
    ...Array(9).fill("Alexandre e RPCI"), // Alexandre is principal
    "Welder e RPCI", // Welder is principal
    "Alexandre; Welder e RPCI" // Alexandre is principal
  ];

  // Fill up if length is less than 448
  while (executors.length < 448) {
    executors.push("Alexandre");
  }

  // Descriptions based on Classification to feel realistic
  const descTemplates: Record<string, string[]> = {
    "Elétrica": [
      "Substituição de disjuntor termomagnético e fiação de tomada.",
      "Troca de lâmpadas incandescentes por luminárias LED de alta eficiência.",
      "Identificação e correção de curto-circuito em quadro de distribuição.",
      "Manutenção preventiva em transformador e cabeamento de subestação.",
      "Troca de reatores e lâmpadas tubulares queimadas no galpão."
    ],
    "Ar-condicionado": [
      "Higienização de dutos de ar, limpeza de filtros e evaporadora.",
      "Carga de gás refrigerante R410a e correção de vazamento de fluído.",
      "Substituição preventiva de compressor do chiller e ventilador externo.",
      "Troca de contator elétrico e placa eletrônica de split de 12000 BTUs.",
      "Ajuste e balanceamento de dampers de ar em salas de conferência."
    ],
    "Hidráulica": [
      "Desobstrução de rede coletora de esgoto e tubulação de águas pluviais.",
      "Substituição de boia de caixa d'água e vedação de registros de pressão.",
      "Reparo de vazamento interno em barrilete de distribuição sanitária.",
      "Troca de torneira de pia de banheiro industrial e sifão flexível.",
      "Conserto de infiltração em parede de banheiro por junta rompida."
    ],
    "Alvenaria": [
      "Reparo em reboco de parede danificada com argamassa e gesso.",
      "Instalação de divisórias drywall e tratamento de juntas térmicas.",
      "Substituição de cerâmicas trincadas em refeitório e rampas de acesso.",
      "Reconstituição de calçada de concreto por rachaduras mecânicas.",
      "Nivelamento de solo e reposição de blocos intertravados de pátio."
    ],
    "Instalações": [
      "Lançamento de cabo de rede lógica CAT6 estruturado e conectorização RJ45.",
      "Fixação de calhas metálicas para passagem de fios de baixa tensão.",
      "Instalação de tomadas de dados adicionais em laboratório de informática.",
      "Organização de rack de TI central com patch panels e chicoteamento."
    ],
    "Pintura": [
      "Pintura acrílica fosca em paredes externas e teto de salas de aula.",
      "Pintura epóxi em piso de laboratório automotivo para alta resistência.",
      "Demarcação de faixas de trânsito e vagas de cadeirantes em pátio.",
      "Verniz marítimo em esquadrias e portas de madeira do bloco administrativo."
    ],
    "Marcenaria": [
      "Ajuste e plainagem em portas de salas de aula que estão emperrando.",
      "Instalação de fechaduras de segurança adicionais em armários centrais.",
      "Reparo estrutural em gaveteiros e mesas de escritório de salas.",
      "Substituição de dobradiças metálicas de armários de arquivo."
    ],
    "Manutenção": [
      "Fixação de quadros brancos de formica e suportes de TV em salas.",
      "Lubrificação de dobradiças de portões e fechaduras de portas externas.",
      "Aperto de parafusos de cadeiras escolares e cadeiras ergonômicas.",
      "Instalação de protetores de canto em paredes de áreas de circulação rápida."
    ],
    "Refrigeração": [
      "Substituição de termostato de controle térmico de geladeira industrial.",
      "Manutenção preventiva em balcão expositor de alimentos frios.",
      "Troca de borracha de vedação magnética de porta de freezer industrial.",
      "Reparo em motor ventilador de câmara fria de estocagem de insumos."
    ],
    "Estrutura": [
      "Inspeção e correção de fissuras estruturais em vigas metálicas.",
      "Tratamento de oxidação em pilares de aço expostos a umidade.",
      "Análise preventiva em lajes de blocos educacionais com fissuras."
    ],
    "Outros": [
      "Manutenção preventiva geral programada de rotina bimestral.",
      "Serviços diversos de suporte de infraestrutura predial interna.",
      "Limpeza e organização pós-obra ou reinstalação de equipamentos.",
      "Apoio técnico na montagem de eventos e exposições institucionais."
    ]
  };

  for (let i = 0; i < 448; i++) {
    const monthStr = months[i];
    const day = (i % 28) + 1;
    const dayStr = String(day).padStart(2, "0");
    const openDate = `2026-${monthStr}-${dayStr}`;
    const conclusionDate = `2026-${monthStr}-${dayStr}`; // All concluded in Q1

    const unitVal = units[i];
    const areaVal = areas[i];
    const classVal = classifications[i];
    const execVal = executors[i];

    const templates = descTemplates[classVal] || descTemplates["Outros"];
    const baseDesc = templates[i % templates.length];
    
    // Create realistic demands based on classification
    let demandTitle = "";
    if (classVal === "Elétrica") demandTitle = `Manutenção Elétrica - ${baseDesc.split(" ").slice(1, 4).join(" ")}`;
    else if (classVal === "Ar-condicionado") demandTitle = `Reparo de Climatização - ${baseDesc.split(" ").slice(1, 4).join(" ")}`;
    else if (classVal === "Hidráulica") demandTitle = `Conserto Hidráulico - ${baseDesc.split(" ").slice(1, 4).join(" ")}`;
    else if (classVal === "Alvenaria") demandTitle = `Serviço de Alvenaria - ${baseDesc.split(" ").slice(1, 4).join(" ")}`;
    else if (classVal === "Instalações") demandTitle = `Infraestrutura de Rede - ${baseDesc.split(" ").slice(1, 4).join(" ")}`;
    else if (classVal === "Pintura") demandTitle = `Pintura Predial - ${baseDesc.split(" ").slice(1, 4).join(" ")}`;
    else if (classVal === "Marcenaria") demandTitle = `Ajuste de Mobiliário - ${baseDesc.split(" ").slice(1, 4).join(" ")}`;
    else if (classVal === "Manutenção") demandTitle = `Reparo Predial - ${baseDesc.split(" ").slice(1, 4).join(" ")}`;
    else if (classVal === "Refrigeração") demandTitle = `Manutenção de Refrigeração - ${baseDesc.split(" ").slice(1, 4).join(" ")}`;
    else if (classVal === "Estrutura") demandTitle = `Reforço Estrutural - ${baseDesc.split(" ").slice(1, 4).join(" ")}`;
    else demandTitle = `Ordem Geral - ${baseDesc.split(" ").slice(1, 4).join(" ")}`;

    list.push({
      id: `OS-26-${String(i + 1).padStart(3, "0")}`,
      equipment: demandTitle,
      area: areaVal,
      priority: "Média",
      requester: execVal, // will double as executor
      date: openDate,
      description: baseDesc,
      status: "Concluído",
      cost: 150 + (i % 30) * 85,
      unit: unitVal,
      product: "Manutenção Predial",
      syncStatus: "Sincronizado",
      executor: execVal,
      classification: classVal,
      conclusionDate: conclusionDate
    });
  }

  return list;
}
