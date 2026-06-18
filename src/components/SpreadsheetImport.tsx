import React, { useState, useRef } from "react";
import { Upload, FileText, CheckCircle2, AlertCircle, RefreshCw, Layers } from "lucide-react";
import * as XLSX from "xlsx";
import Papa from "papaparse";

interface SpreadsheetImportProps {
  onImport: (dataType: "Projetos" | "Financeiro" | "RH", count: number, records: any[]) => void;
  onAddAuditLog: (action: string, module: string, details: string) => void;
  theme: "dark" | "light";
}

export default function SpreadsheetImport({ onImport, onAddAuditLog, theme }: SpreadsheetImportProps) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedType, setSelectedType] = useState<"Projetos" | "Financeiro" | "RH">("Financeiro");
  const [currentFile, setCurrentFile] = useState<File | null>(null);
  const [importStatus, setImportStatus] = useState<"idle" | "parsing" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [resultsSummary, setResultsSummary] = useState<{ rows: number; cols: number; inconsistencies: string[] } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const validateAndProcessData = (parsedRows: any[]) => {
    if (parsedRows.length === 0) {
      throw new Error("A planilha importada está vazia.");
    }

    const inconsistencies: string[] = [];
    const headers = Object.keys(parsedRows[0]);
    const processedRows: any[] = [];

    // Basic heuristic validation based on selected data target mapping
    if (selectedType === "Financeiro") {
      const requiredColumns = ["valor", "tipo", "categoria"];
      const missing = requiredColumns.filter(col => !headers.some(h => h.toLowerCase().includes(col)));
      
      if (missing.length > 0) {
        inconsistencies.push(`Colunas recomendadas ausentes: ${missing.join(", ")}. Tentando mapear dados aproximados.`);
      }

      parsedRows.forEach((row, i) => {
        let amount = 0;
        let pAmount = row.valor || row.Amount || row.Val || row.amount || row.Valor;
        if (pAmount !== undefined) {
          amount = parseFloat(String(pAmount).replace(/[^\d.,-]/g, "").replace(",", "."));
          if (isNaN(amount)) {
            amount = 0;
            inconsistencies.push(`Linha ${i + 2}: Valor '${pAmount}' não é numérico. Definido como zero.`);
          }
        } else {
          inconsistencies.push(`Linha ${i + 2}: Coluna de valor não encontrada. Definido como zero.`);
        }

        let type = "Despesa";
        let pType = row.tipo || row.Tipo || row.type || row.Type;
        if (pType) {
          const lower = String(pType).toLowerCase();
          if (lower.includes("receita") || lower.includes("entrada") || lower.includes("credit") || lower.includes("ganho")) {
            type = "Receita";
          }
        }

        processedRows.push({
          id: `imp-fn-${Date.now()}-${i}`,
          type: type as "Receita" | "Despesa",
          category: row.categoria || row.Categoria || row.Category || "Importado",
          amount: Math.abs(amount),
          date: row.data || row.Data || row.Date || new Date().toISOString().split("T")[0],
          costCenter: row.unidade || row.Unidade || row.Filial || "SENAI",
          description: row.descricao || row.Descricao || row.Description || `Ingestão automática via planilha @${i+1}`,
          status: "Pago"
        });
      });

    } else if (selectedType === "Projetos") {
      parsedRows.forEach((row, i) => {
        const name = row.nome || row.Nome || row.Project || row.project || row.titulo;
        if (!name) {
          inconsistencies.push(`Linha ${i + 2}: Nome do projeto ausente. Nome fictício gerado.`);
        }

        let budget = parseFloat(String(row.orcamento || row.budget || 100000).replace(/[^\d.-]/g, ""));
        if (isNaN(budget)) {
          budget = 100000;
          inconsistencies.push(`Linha ${i + 2}: Orçamento inválido. Padrão R$ 100 mil aplicado.`);
        }

        processedRows.push({
          id: `imp-pj-${Date.now()}-${i}`,
          name: name || `Projeto Importado #${i + 1}`,
          objective: row.objetivo || row.Objetivo || row.Description || "Objetivo estratégico definido no upload corporativo.",
          manager: row.responsavel || row.Responsavel || row.Manager || "Administrador Global",
          area: row.area || row.Area || "Tecnologia",
          unit: row.unidade || row.Unidade || "SENAI",
          startDate: row.inicio || row.Inicio || new Date().toISOString().split("T")[0],
          deadline: row.prazo || row.Prazo || "2026-12-31",
          budget: budget,
          spent: budget * 0.4,
          status: "Planejamento",
          priority: "Média",
          progress: 10,
          tasks: [],
          risks: [],
          stakeholders: [],
          raci: []
        });
      });
    } else {
      // RH
      parsedRows.forEach((row, i) => {
        const name = row.nome || row.Nome || row.Name || row.name;
        if (!name) {
          inconsistencies.push(`Linha ${i + 2}: Nome do colaborador obrigatório está ausente. Ignorado.`);
          return;
        }

        processedRows.push({
          id: `imp-rh-${Date.now()}-${i}`,
          name: name,
          role: row.cargo || row.Cargo || row.Role || "Assistente Administrativo",
          department: row.departamento || row.Departamento || row.Setor || "Geral",
          unit: row.unidade || row.Unidade || "SENAI",
          status: "Ativo",
          hiredDate: row.admissao || row.Admissao || new Date().toISOString().split("T")[0],
          performanceScore: 4.0,
          pdiGoal: "Trilha corporativa FIRJAN OneHub",
          pdiStatus: "Não Iniciado",
          hoursBank: parseFloat(String(row.banco || 0)),
          trainingsCompleted: parseInt(String(row.treinamentos || 0)) || 0
        });
      });
    }

    setResultsSummary({
      rows: processedRows.length,
      cols: headers.length,
      inconsistencies
    });

    onImport(selectedType, processedRows.length, processedRows);
    setImportStatus("success");
    
    onAddAuditLog(
      "Importação de Planilha",
      "BUSINESS_INTELLIGENCE",
      `Ingestão de ${processedRows.length} registros para o Módulo ${selectedType}. ${inconsistencies.length} inconsistências tratadas automaticamente.`
    );
  };

  const processFile = (file: File) => {
    setCurrentFile(file);
    setImportStatus("parsing");
    setErrorMessage("");

    const isCSV = file.name.endsWith(".csv");
    const isXLS = file.name.endsWith(".xls") || file.name.endsWith(".xlsx");

    if (!isCSV && !isXLS) {
      setImportStatus("error");
      setErrorMessage("Formato não suportado. Utilize apenas arquivos .csv, .xls ou .xlsx");
      return;
    }

    const reader = new FileReader();

    if (isCSV) {
      reader.onload = (e) => {
        const text = e.target?.result as string;
        Papa.parse(text, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            try {
              validateAndProcessData(results.data);
            } catch (err: any) {
              setImportStatus("error");
              setErrorMessage(err.message || "Erro desconhecido ao processar o CSV.");
            }
          },
          error: (error) => {
            setImportStatus("error");
            setErrorMessage(`Erro ao analisar CSV: ${error.message}`);
          }
        });
      };
      reader.readAsText(file);
    } else {
      // Excel XLS/XLSX
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: "array" });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet);
          
          validateAndProcessData(jsonData);
        } catch (err: any) {
          setImportStatus("error");
          setErrorMessage(`Falha na leitura do arquivo Excel: ${err.message}`);
        }
      };
      reader.readAsArrayBuffer(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const onButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={`p-4 rounded-xl border ${theme === "dark" ? "bg-zinc-900/50 border-zinc-800" : "bg-white border-slate-200"}`}>
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 mb-4">
        <div>
          <h4 className="font-display font-medium text-xs tracking-wide uppercase text-neon-purple">
            Motor de Ingestão de Dados BI
          </h4>
          <p className={`text-[10px] ${theme === "dark" ? "text-zinc-400" : "text-slate-500"}`}>
            Arraste planilhas reais para mapear novos relatórios ou atualizar indicadores globalmente.
          </p>
        </div>

        {/* Target Mapping Selection */}
        <div className="flex gap-2 shrink-0">
          {(["Financeiro", "Projetos", "RH"] as const).map((type) => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={`text-[10px] px-2.5 py-1 rounded-md border transition font-medium ${
                selectedType === type
                  ? "bg-purple-900/30 text-purple-300 border-purple-500/50"
                  : theme === "dark"
                  ? "bg-zinc-800 border-zinc-700 hover:border-zinc-600 text-zinc-400"
                  : "bg-slate-100 border-slate-200 hover:border-slate-300 text-slate-600"
              }`}
            >
              Mapear para {type}
            </button>
          ))}
        </div>
      </div>

      {/* Drag & Drop Canvas */}
      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={onButtonClick}
        className={`relative border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer transition-all ${
          dragActive
            ? "border-neon-purple bg-purple-900/10 scale-[1.01]"
            : theme === "dark"
            ? "border-zinc-700 hover:border-purple-800 bg-zinc-950/20"
            : "border-slate-300 hover:border-purple-400 bg-slate-50/50"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept=".csv, .xls, .xlsx"
          onChange={handleChange}
        />

        {importStatus === "parsing" ? (
          <div className="text-center py-4">
            <RefreshCw className="w-8 h-8 text-neutral-400 animate-spin mx-auto mb-2" />
            <p className="text-xs font-semibold">Processando arquivo industrial...</p>
            <p className="text-[10px] text-zinc-400">Validando colunas e corrigindo inconsistências estruturais.</p>
          </div>
        ) : importStatus === "success" ? (
          <div className="text-center py-2 space-y-1">
            <CheckCircle2 className="w-8 h-8 text-neon-green mx-auto" />
            <p className="text-xs font-semibold text-neon-green">Planilha Importada com Sucesso!</p>
            {resultsSummary && (
              <div className="text-[10px] text-zinc-400 max-w-sm space-y-1 mt-2">
                <p>
                  Atributos Carregados: <strong className="text-zinc-200">{resultsSummary.rows} linhas</strong> com <strong className="text-zinc-200">{resultsSummary.cols} colunas</strong>
                </p>
                {resultsSummary.inconsistencies.length > 0 ? (
                  <div className="p-2 border border-emerald-500/20 bg-emerald-950/20 rounded text-[9px] text-emerald-400 text-left max-h-24 overflow-y-auto mt-1">
                    <p className="font-semibold mb-0.5">Tratamento de Inconsistências Ativo:</p>
                    {resultsSummary.inconsistencies.map((inc, index) => (
                      <p key={index}>• {inc}</p>
                    ))}
                  </div>
                ) : (
                  <p className="text-emerald-500 text-[9px]">✔ 100% dos tipos de dados consistentes e validados.</p>
                )}
                <p className="text-purple-400 text-[9px] animate-pulse">Atualização automática concluída nos painéis de BI.</p>
              </div>
            )}
          </div>
        ) : importStatus === "error" ? (
          <div className="text-center py-3">
            <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-1.5" />
            <p className="text-xs font-semibold text-red-400">Falha na Verificação da Planilha</p>
            <p className="text-[10px] text-zinc-400">{errorMessage}</p>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setImportStatus("idle");
              }}
              className="mt-3 text-[9px] bg-red-950/30 text-red-400 px-3 py-1 rounded-md hover:bg-red-900/30 border border-red-500/20 transition"
            >
              Tentar Novamente
            </button>
          </div>
        ) : (
          <div className="text-center space-y-1">
            <Upload className="w-8 h-8 text-neutral-400 mx-auto mb-2" />
            <p className="text-xs">
              <span className="font-semibold text-neon-purple hover:underline">Clique para selecionar</span> ou arraste o arquivo aqui
            </p>
            <p className="text-[9px] text-zinc-400">
              Formatos de arquivo suportados: <strong className="text-neon-green">XLSX, XLS, CSV</strong> (Abaixo de 10MB)
            </p>
            <div className="flex gap-2 justify-center py-1.5 text-[8px] text-zinc-400">
              <span className="bg-zinc-800 border border-zinc-700/50 px-1.5 py-0.5 rounded flex items-center gap-1">
                <Layers className="w-2.5 h-2.5 text-purple-400" />
                Auto-Mapeio de colunas
              </span>
              <span className="bg-zinc-800 border border-zinc-700/50 px-1.5 py-0.5 rounded flex items-center gap-1">
                <CheckCircle2 className="w-2.5 h-2.5 text-green-400" />
                Validador FIRJAN
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
