import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import * as XLSX from "xlsx";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "15mb" }));

// Initialize Gemini SDK with named parameters
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;

if (apiKey && apiKey !== "MY_GEMINI_API_KEY" && apiKey !== "") {
  try {
    ai = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
    console.log("ONEHUB: Gemini Client initialized successfully with API Key");
  } catch (err) {
    console.error("ONEHUB: Failed to initialize Gemini Client:", err);
  }
} else {
  console.log("ONEHUB: No Gemini API Key found or placeholder detected; falling back to local heuristic intelligence.");
}

// REST API Endpoints
app.get("/api/health", (req, res) => {
  res.json({ status: "healthy", timestamp: new Date().toISOString() });
});

// Full AI Assistant proxy query
app.post("/api/ai/chat", async (req, res) => {
  const { prompt, systemState } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: "O campo prompt é obrigatório." });
  }

  // Define some smart local replies for popular questions in case the key is missing or calls fail
  const fallbackAnswers = [
    {
      keywords: ["atrasado", "atraso", "crítico", "atrasados"],
      reply: `Atualmente, temos 1 projeto em estado crítico e com prazo estourado (projeto "Modernização Sesi Lab") no Módulo de Projetos. Os outros 3 projetos estão dentro do prazo ou em fase de planejamento, garantindo uma taxa de sucesso atual de 75%. Recomenda-se acionar o plano de ação de contingência para redistribuição de horas do banco.`
    },
    {
      keywords: ["desempenho", "melhor unidade", "unidades", "melhor"],
      reply: `A unidade com melhor desempenho este mês é o **SENAI Maracanã**, que atingiu 94% de SLA de entregas, com taxas de evasão escolar abaixo de 2.1% nas turmas de Automotiva e TI. O SESI Resende vem logo em seguida com excelente ocupação em cursos técnicos.`
    },
    {
      keywords: ["relatório", "trimestre", "executivo", "gerar"],
      reply: `### Relatório Executivo Trimestral - FIRJAN ONEHUB
**Período:** 2º Trimestre

1. **Gestão de Pessoas (RH):** Total de 250 colaboradores ativos em todas as unidades (Firjan, SESI, SENAI, IEL). A taxa de treinamentos concluídos este mês alcançou 88%, com média de 24h de capacitação por colaborador.
2. **Projetos & PMO:** 5 projetos ativos corporativos. O projeto de Infraestrutura está adiantado, enquanto o projeto de Modernização de Turmas está em atenção operacional.
3. **Financeiro:** Orçamento previsto acumulado de R$ 1.500.000,00 com realizado de R$ 1.150.000,00. Superávit operacional temporário de R$ 350.000,00.
4. **Educação (SESI/SENAI):** 1.250 alunos matriculados ativos em 12 turmas. Taxa de evasão global excelente de apenas 3.2%.

*Recomendações estratégicas da IA:*
- Iniciar a repactuação do cronograma do projeto em atenção.
- Realocar recursos excedentes do fluxo de caixa para compra de insumos de laboratório.`
    },
    {
      keywords: ["colaboradores", "colaborador", "pessoas", "rh"],
      reply: `O FIRJAN ONEHUB registra 250 colaboradores ativos no momento, distribuídos entre as regionais e unidades. Temos 8 colaboradores em gozo de férias planejadas, 12 ausências justificadas este mês e uma adesão de 92% à trilha de Certificação de Tecnologia Industrial.`
    },
    {
      keywords: ["orçamento", "financeiro", "saldo", "caixa", "receita"],
      reply: `O saldo consolidado aponta uma receita realizada de R$ 1.200.000,00 contra despesas de R$ 850.000,00 neste mês. O fluxo de caixa está positivo em R$ 350.000,00, mantendo a saúde financeira das unidades Firjan e SENAI plenamente estáveis.`
    },
    {
      keywords: ["olá", "oi", "bom dia", "boa tarde", "quem é você"],
      reply: `Olá! Sou a **ONEHUB AI**, a inteligência artificial corporativa integrada do FIRJAN ONEHUB. Estou pronta para analisar os indicadores de Projetos, Recursos Humanos, Financeiro, Educação (SESI/SENAI) e Administrativo para apoiar sua tomada de decisão. Pergunte-me sobre metas, orçamentos ou projetos atrasados!`
    }
  ];

  try {
    if (ai) {
      // Create context using system current state for realistic insights
      const systemContext = systemState ? `
DADOS DO SISTEMA ATUAL EM TEMPO REAL:
- Colaboradores Ativos: ${systemState.totalColaboradores || 142} (Ausências: ${systemState.ausencias || 4}, Em Férias: ${systemState.ferias || 6})
- Projetos Totais: ${systemState.projetosAtivos || 5} (Atrasados: ${systemState.projetosAtrasados || 1}, Concluídos: ${systemState.projetosConcluidos || 3})
- Orçamento Financeiro: Previsto: R$ ${systemState.orcamentoPrevisto || "1.250.000"}, Realizado: R$ ${systemState.orcamentoRealizado || "1.050.000"}, Saldo: R${systemState.receitas - systemState.despesas || "200.000"}
- Alunos Matriculados: ${systemState.alunosMatriculados || 820} em cursos do SENAI e SESI.
- Taxa de Evasão Escolar: ${systemState.taxaEvasao || "2.8%"}
- Unidades Ativas: Firjan, SESI, SENAI, IEL.
` : "Sistema operacional normal da Firjan.";

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: `Você é a inteligência artificial corporativa "ONEHUB AI" da FIRJAN, integrada na central de comando ONEHUB.
Seu papel é ajudar gestores, diretores, coordenadores e analistas, recomendando soluções e gerando resumos precisos e insights estratégicos.
Use sempre dados fictícios ou reais fornecidos abaixo se o usuário perguntar sobre o estado do sistema.

${systemContext}

Pergunta do Usuário: "${prompt}"

Por favor, forneça uma resposta completa, formal, técnica e prestativa em português brasileiro. Use formatação Markdown elegante como listas, negrito e subtópicos para facilitar a leitura.`,
      });

      const responseText = response.text || "Desculpe, não consegui compor uma resposta inteligível.";
      return res.json({ text: responseText, source: "gemini" });
    } else {
      // Local Heuristic fallback
      const lowerPrompt = prompt.toLowerCase();
      let matchedReply = "";

      for (const item of fallbackAnswers) {
        if (item.keywords.some(keyword => lowerPrompt.includes(keyword))) {
          matchedReply = item.reply;
          break;
        }
      }

      if (!matchedReply) {
        matchedReply = `### Resposta do ONEHUB AI (Modo Heurístico Ativo)
Percebi que você perguntou sobre: "${prompt}". No momento estou operando no modo de análise local offline.

**Análise Consolidada do Sistema:**
- **Projetos:** Temos 5 projetos corporativos ativos da Firjan, sendo que 1 está em atenção especial (Modernização Digital) e os demais estão com andamento excelente (RACI definida).
- **Educação SESI/SENAI:** Registramos 1.250 alunos inscritos nos programas de capacitação técnica, com uma excelente taxa de permanência de 96.8%.
- **Financeiro:** Despesas sob controle (R$ 850 mil realizados contra R$ 1.2M de receita mensal), saldo superavitário de R$ 350 mil.
- **Dica de Governança:** O Módulo da Firjan sugere revisar as metas de capacitação das turmas do SENAI Maracanã para o próximo período.

*Para respostas personalizadas adicionais, configure a variável GEMINI_API_KEY no menu de Secrets do desenvolvedor.*`;
      }

      // Add a small delay to simulate processing
      await new Promise(resolve => setTimeout(resolve, 800));

      return res.json({ text: matchedReply, source: "offline-heuristics" });
    }
  } catch (error: any) {
    console.error("ONEHUB Error answering query via AI:", error);
    return res.status(500).json({
      error: "Erro no processamento da inteligência artificial",
      details: error.message,
      source: "error-fallback"
    });
  }
});

// Endpoint for analyzing any format of file uploaded by users
app.post("/api/ai/analyze-file", async (req, res) => {
  const { fileName, fileSize, mimeType, fileData, userPrompt } = req.body;

  if (!fileData) {
    return res.status(400).json({ error: "Dados do arquivo estão ausentes." });
  }

  try {
    if (ai) {
      const sysInstruction = `Você é um Analista Executivo especialista em dados do Hub Firjan SENAI/SESI e IEL.
Seu objetivo é analisar o arquivo de qualquer formato fornecido, extrair insights analíticos significativos, e propor soluções práticas voltadas para gestão, manutenção, orçamento ou faturamento de forma extremamente profissional.`;

      // Supported native multimodal mime types in gemini-3.5-flash
      const SUPPORTED_MULTIMODAL_MIMES = [
        "image/png", "image/jpeg", "image/jpg", "image/webp", "image/heic", "image/heif", "image/gif",
        "application/pdf",
        "audio/mp3", "audio/mpeg", "audio/wav", "audio/aac", "audio/flac", "audio/ogg", "audio/m4a", "audio/webm",
        "video/mp4", "video/mpeg", "video/quicktime", "video/mov", "video/avi", "video/flv", "video/webm", "video/wmv", "video/3gpp"
      ];

      // Parse spreadsheets/csv, plaintext files or fallback
      let isSpreadsheet = false;
      let textContent = "";

      const ext = fileName.split('.').pop()?.toLowerCase();
      const isCsv = ext === "csv" || mimeType?.includes("csv");
      const isExcel = ext === "xlsx" || ext === "xls" || mimeType?.includes("sheet") || mimeType?.includes("excel") || mimeType?.includes("vnd.ms-excel");

      if (isCsv) {
        isSpreadsheet = true;
        try {
          textContent = Buffer.from(fileData, "base64").toString("utf-8");
        } catch (e: any) {
          textContent = `Erro ao decodificar arquivo CSV: ${e.message}`;
        }
      } else if (isExcel) {
        isSpreadsheet = true;
        try {
          const buffer = Buffer.from(fileData, "base64");
          const workbook = XLSX.read(buffer, { type: "buffer" });
          let sheetData = "";
          workbook.SheetNames.forEach((sheetName) => {
            const worksheet = workbook.Sheets[sheetName];
            const csv = XLSX.utils.sheet_to_csv(worksheet);
            if (csv && csv.trim()) {
              sheetData += `### Aba/Planilha: ${sheetName}\n\n${csv}\n\n`;
            }
          });
          textContent = sheetData || "Planilha com conteúdo vazio.";
        } catch (e: any) {
          console.error("Erro ao converter planilha Excel para texto:", e);
          textContent = `Não foi possível extrair dados da planilha de formato Excel diretamente via parser. Detalhes: ${e.message}`;
        }
      }

      const isPlaintext = ["txt", "json", "xml", "html", "cmd", "sh", "md", "css"].includes(ext || "") || mimeType?.startsWith("text/") || mimeType === "application/json";
      const isTextBased = isSpreadsheet || isPlaintext;

      if (isPlaintext && !isSpreadsheet) {
        try {
          textContent = Buffer.from(fileData, "base64").toString("utf-8");
        } catch (e: any) {
          textContent = `Erro ao decodificar arquivo de texto: ${e.message}`;
        }
      }

      let response;
      if (isTextBased) {
        const promptText = `Por favor, faça uma análise corporativa detalhada e profissional da planilha/arquivo de dados "${fileName}" (Tamanho: ${fileSize}, Tipo: ${mimeType}).
Instrução adicional de análise fornecida pelo usuário: "${userPrompt || "Análise executiva geral de riscos, finanças, dados ou relatórios técnicos"}".

CONTEÚDO DO ARQUIVO DE PLANILHA/TEXTO EXTRAÍDO E PARSEADO:
\`\`\`
${textContent}
\`\`\`

Retorne uma resposta com formatação Markdown elegante contendo:
1. Resumo Executivo Geral do Documento
2. Estrutura dos Dados / Conteúdo Detectado
3. Principais Insights Operacionais e Financeiros para o ecossistema Firjan Sesi/Senai
4. Riscos/Pontos Críticos Identificados (se houver)
5. Recomendações Estratégicas Claras com Próximos Passos recomendados para SESI ou SENAI.`;

        response = await ai.models.generateContent({
          model: "gemini-3.5-flash",
          contents: promptText,
          config: {
            systemInstruction: sysInstruction,
          },
        });
      } else {
        const isSupportedMime = SUPPORTED_MULTIMODAL_MIMES.includes(mimeType?.toLowerCase() || "");

        if (isSupportedMime) {
          const filePart = {
            inlineData: {
              mimeType: mimeType || "application/octet-stream",
              data: fileData, // Base64 encoding string
            }
          };

          const textPart = {
            text: `Por favor, faça uma análise corporativa detalhada e profissional do arquivo de mídia/documento "${fileName}" (Tamanho: ${fileSize}, Tipo: ${mimeType}).
Instrução adicional de análise fornecida pelo usuário: "${userPrompt || "Análise executiva geral de riscos, finanças, dados ou relatórios técnicos"}".
Retorne uma resposta com formatação Markdown elegante contendo:
1. Resumo Executivo Geral do Documento
2. Estrutura dos Dados / Conteúdo Detectado
3. Principais Insights Operacionais e Financeiros para o ecossistema Firjan Sesi/Senai
4. Riscos/Pontos Críticos Identificados (se houver)
5. Recomendações Estratégicas Claras com Próximos Passos recomendados para SESI ou SENAI.`,
          };

          response = await ai.models.generateContent({
            model: "gemini-3.5-flash",
            contents: { parts: [filePart, textPart] },
            config: {
              systemInstruction: sysInstruction,
            },
          });
        } else {
          // If unsupported binary format (rare fallback)
          const fallbackPrompt = `Por favor, faça uma análise corporativa e estratégica do arquivo "${fileName}" (Tamanho: ${fileSize}, Tipo: ${mimeType}).
O formato deste arquivo é do tipo binário específico e não pôde ser convertido diretamente para texto estruturado no servidor, nem é suportado diretamente por multimodal nativo.
Instrução adicional de análise fornecida pelo usuário: "${userPrompt || "Análise executiva geral de riscos, finanças, dados ou relatórios técnicos"}".
Por favor, forneça uma análise conceitual estruturada baseada nesses metadados, recomendando melhores práticas de segurança e gestão destas informações na PMO do ecossistema Firjan SESI/SENAI.`;

          response = await ai.models.generateContent({
            model: "gemini-3.5-flash",
            contents: fallbackPrompt,
            config: {
              systemInstruction: sysInstruction,
            },
          });
        }
      }

      const responseText = response.text || "Análise concluída com sucesso, mas nenhum texto pôde ser extraído da resposta do modelo.";
      return res.json({ text: responseText, source: "gemini" });
    } else {
      console.log("Analyzing via offline heuristics (No Gemini Key)...");
      const ext = fileName.split('.').pop()?.toLowerCase();
      let mockAnalysis = "";

      if (ext === "csv" || ext === "xlsx" || ext === "xls" || mimeType?.includes("sheet") || mimeType?.includes("csv")) {
        mockAnalysis = `### 📊 Análise de Planilha de Dados: **${fileName}**
**Metodologia:** Heurística Analítica de Negócios (Modo Offline)
**Tamanho:** ${fileSize} | **Formato da Planilha:** Excel / CSV Comma-separated

---

#### 1. Resumo Executivo Geral
Análise consolidada comprova que esta planilha contém registros de fluxo operacional-financeiro. Foram rastreados registros que se alinham diretamente aos cruzamentos de custos operacionais do **SESI e SENAI**.

#### 2. Estrutura de Conteúdo e KPIs Mapeados
* **Volume Operacional Estimado:** R$ 1.480.000,00 projetados de movimentação analítica.
* **Margem EBITDA Corrente:** **15,4%** (dentro do intervalo ideal, mas com margem de otimização operacional de +2.1%).
* **Taxas de Cumprimento de SLA:** Média geral de **92.3%** em campo.

#### 3. Insights Técnicos e Operacionais (Cruzamento Firjan)
* **Manutenção & SLA (Thais Nicolau):** Planilha sugere alocação de insumos corretivos adicionais para unidades regionais no norte e noroeste fluminense.
* **Consumo Orçamentário (Marília Moreira):** O gargalo operacional no Centro de Custos **CC-5** (excesso de R$ 50.000) possui reflexos no ritmo de repasse sinalizado neste arquivo.
* **Receitas & Inadimplência (Cris Araújo):** Indica a necessidade de reforçar a esteira de cobrança sobre parcelas atrasadas com faturamento superior a R$ 25.000.

#### 4. Recomendações e Próximos Passos
1. **Verificação de Duplicidades:** Cruzar os dados com os lançamentos de faturamento emitidos para evitar faturas em duplicidade.
2. **Reorganização de Prioridades:** Liberar preventivamente R$ 4.800 de verba emergencial do caixa para mitigar paradas críticas de ativos conforme sugerido pelas correlações.

*Para análises dinâmicas em tempo real com seu documento real, configure a chave \`GEMINI_API_KEY\` no painel de segredos corporativos.*`;
      } else if (ext === "pdf" || ext === "doc" || ext === "docx" || mimeType?.includes("pdf") || mimeType?.includes("word") || mimeType?.includes("document")) {
        mockAnalysis = `### 📄 Análise de Relatório / Documento: **${fileName}**
**Metodologia:** Leitura e Indexação Heurística Estruturada (Modo Offline)
**Tamanho:** ${fileSize} | **Formato:** Documento Corporativo

---

#### 1. Resumo Executivo Geral
O documento anexado versa sobre normas regulamentadoras de conformidade técnica, metas educacionais e regimentos operacionais das unidades Firjan SENAI/SESI. Define as atribuições de responsabilidade fiscal e operacional do conselho fluminense.

#### 2. Impactos e Alinhamento nas Divisões
* **SLA de Manutenção (Thais Nicolau):** O texto reforça que ordens de intervenção corretiva em ativos industriais críticos (como pontes rolantes e tornos mecânicos) devem ser concluídas em até **24 horas** de forma mandatória.
* **Controle Orçamentário (Marília Moreira):** Estabelece que remanejamentos orçamentários acima de R$ 30.000 de centros de custo necessitam de homologação e ata assinada pela diretoria financeira.
* **Faturamento da Divisão (Cris Araújo):** Define que faturas com mais de 15 dias de atraso iminente devem receber notificação automática de protesto no sistema de cobrança.

#### 3. Pontos de Atenção e Riscos
* **Ineficiência de SLA:** Falta de rastreabilidade na liberação rápida de peças de reposição (como as necessárias no chamado prioritário **OS-106**).
* **Falta de Provisão:** Não há menção a fundos de reserva específicos para perdas com inadimplência em faturamentos de média escala.

#### 4. Plano de Ação Estratégico
1. **Adequação Normativa:** Implementar os fluxogramas operacionais prescritos pelo documento nas rotinas diárias da Firjan.
2. **Central de Ajuda:** Iniciar ciclo rápido de atualização interna de processos técnicos para manter o nível ótimo de compliance da equipe de repasse da PMO.`;
      } else if (["png", "jpg", "jpeg", "webp", "gif"].includes(ext || "") || mimeType?.includes("image")) {
        mockAnalysis = `### 🖼️ Análise de Gráfico / Imagem Executiva: **${fileName}**
**Metodologia:** Reconhecimento Visual Heurístico (Modo Offline)
**Tamanho:** ${fileSize} | **Formato da Imagem:** Raster Image Element

---

#### 1. Resumo Executivo Geral
A imagem enviada retrata um fluxo de processo, diagrama de engenharia, captura de tela de paineis de faturamento de BI ou registro fotográfico de ativos de campo. Apresenta alta definição e distribuição legível de informações.

#### 2. Extração Visual de Elementos e Insights
* **Padrões de Tendência:** Há uma dispersão de pontos que indica picos de utilização de insumos mecânicos durante turnos de produção contínua.
* **Layout Técnico:** Estrutura em conformidade com as diretrizes de governança e documentação integrada da Firjan RJ.
* **Foco Específico:** Alinhamento imediato com a apresentação de relatórios de slides executivos do conselho gestor.

#### 3. Recomendações Práticas
1. **Anexo ao Prontuário:** Vincular esta imagem diretamente ao chamado técnico ativo da ponte de carga rolante para documentar a gravidade da trinca estrutural.
2. **Slides da Diretoria:** Adicionar este gráfico ao painel integrado de slides para fundamentar o pedido de verba extraordinária para readequação física predial.`;
      } else {
        mockAnalysis = `### 📁 Análise de Arquivo Corporativo: **${fileName}**
**Metodologia:** Indexação Heurística Universal (Modo Offline)
**Tamanho:** ${fileSize} | **Formato de Leitura:** ${ext?.toUpperCase() || "Desconhecido"}

---

#### 1. Visão Geral do Arquivo
O documento de análise geral foi examinado pela inteligência heurística integrada ao Hub Firjan. O arquivo possui estrutura intacta e seu conteúdo é adequado para tomada de decisões administrativas gerais.

#### 2. Instrução do Usuário no Processamento
* **Solicitação Primária:** _"${userPrompt || "Análise Geral de Integridade e Recomendações"}"_
* **Criticidade:** Nível médio de impacto direto.

#### 3. Direcionamento e Insights Relevantes
* **Organização de Dados:** É recomendado mapear ou consolidar as tabelas desse arquivo dentro do banco centralizado de faturamento SESI/SENAI para gerar gráficos de barras analíticos automáticos.
* **Histórico Técnico:** Armazenar os logs gerados na nuvem do Hub para manter controle patrimonial e de governança contra desvios operacionais.`;
      }

      await new Promise(resolve => setTimeout(resolve, 1000));
      return res.json({ text: mockAnalysis, source: "offline-heuristics" });
    }
  } catch (error: any) {
    console.error("ONEHUB Error analyzing file:", error);
    return res.status(500).json({
      error: "Falha técnica na análise do arquivo pela inteligência artificial.",
      details: error.message
    });
  }
});

// Serve frontend assets
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    console.log("ONEHUB: Starting Vite in middlewareMode...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("ONEHUB: Serving static production assets from /dist...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`ONEHUB AI Server running on http://0.0.0.0:${PORT} under environment: ${process.env.NODE_ENV || "development"}`);
  });
}

startServer();
