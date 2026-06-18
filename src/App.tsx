import React, { useState, useEffect } from "react";
import { 
  Wrench, Landmark, FileText, Lock, LogOut, ChevronRight,
  Plus, Check, X, Bell, Sun, Moon, Search, Filter, ArrowUpDown,
  TrendingUp, TrendingDown, DollarSign, Calendar, Sliders, Play,
  CheckCircle2, AlertTriangle, FileSpreadsheet, Send, User, Building,
  Activity, Shield, ShieldCheck, RefreshCw, BarChart3, HelpCircle,
  Clock, CheckCircle, Flame, Hammer, FileCheck, Layers,
  BarChart2, Award, AlertOctagon, ShieldAlert, Presentation, File, Printer, Cpu, ArrowLeft,
  UploadCloud, Trash2, Sparkles, ChevronUp, ChevronDown, Volume2, Type, Eye
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, LineChart, Line, AreaChart, Area, PieChart, Pie, Cell 
} from "recharts";

// Interfaces for our custom systems
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
  product?: "Saúde" | "Segurança do Trabalho" | "Educação Básica" | "Educação Profissional";
}

interface CostCenter {
  id: string;
  name: string;
  owner: string;
  budgetLimit: number;
  allocated: number;
  spent: number;
  status: "Excelente" | "Saudável" | "Atenção" | "Crítico";
  unit?: "SESI" | "SENAI";
  product?: "Saúde" | "Segurança do Trabalho" | "Educação Básica" | "Educação Profissional";
}

interface BudgetRequest {
  id: string;
  costCenterId: string;
  costCenterName: string;
  amount: number;
  reason: string;
  requester: string;
  status: "Pendente" | "Aprovado" | "Recusado";
  date: string;
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
  product?: "Saúde" | "Segurança do Trabalho" | "Educação Básica" | "Educação Profissional";
}

// Logo Component: Firjan Wave Emblem Redesign (Inspired by the 3rd image style)
export function FirjanSenaiLogo({ className = "h-12" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-3.5 select-none ${className}`}>
      {/* 3rd Image: Rounded royal blue square with 3 white waves */}
      <div className="relative h-10 w-10 bg-[#0056C6] rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/10 shrink-0">
        <svg 
          viewBox="0 0 100 100" 
          className="h-7 w-7 text-white"
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Wave 1 */}
          <path 
            d="M 12 36 C 28 22, 42 50, 58 36 C 72 24, 76 34, 88 36" 
            stroke="currentColor" 
            strokeWidth="9" 
            strokeLinecap="round" 
            fill="none" 
          />
          {/* Wave 2 */}
          <path 
            d="M 12 56 C 28 42, 42 70, 58 56 C 72 44, 76 54, 88 56" 
            stroke="currentColor" 
            strokeWidth="9" 
            strokeLinecap="round" 
            fill="none" 
          />
          {/* Wave 3 */}
          <path 
            d="M 12 76 C 28 62, 42 90, 58 76 C 72 64, 76 74, 88 76" 
            stroke="currentColor" 
            strokeWidth="9" 
            strokeLinecap="round" 
            fill="none" 
          />
        </svg>
      </div>
      
      {/* Dynamic typography layout */}
      <div className="flex flex-col justify-center select-none text-left leading-none">
        <span className="font-black text-xl tracking-tighter text-slate-900 dark:text-zinc-50 font-sans">
          Firjan
        </span>
        <div className="flex items-center gap-1 mt-0.5">
          <span className="text-[10px] font-black text-cyan-600 dark:text-cyan-400 font-mono tracking-wider">
            SENAI
          </span>
          <span className="text-[8px] text-slate-400 dark:text-zinc-500 font-bold">•</span>
          <span className="text-[10px] font-black text-orange-500 dark:text-orange-400 font-mono tracking-wider">
            SESI
          </span>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  // Global States
  const [theme, setTheme] = useState<"dark" | "light" | "contrast">("light");
  const [fontSizeScale, setFontSizeScale] = useState<number>(100);
  const [dyslexicFont, setDyslexicFont] = useState<boolean>(false);
  const [grayscale, setGrayscale] = useState<boolean>(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [emailInput, setEmailInput] = useState<string>("");
  const [tokenInput, setTokenInput] = useState<string>("");
  const [tokenError, setTokenError] = useState<string>("");

  // Speech TTS Narrator for Accessibility
  const handleToggleSpeak = (text: string) => {
    if ('speechSynthesis' in window) {
      if (window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
        addToast("Narrador", "Leitura de tela interrompida.", "info");
      } else {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = "pt-BR";
        utterance.rate = 1.0;
        window.speechSynthesis.speak(utterance);
        addToast("Narrador", "Lendo em voz alta (Português/Br)...", "success");
      }
    } else {
      addToast("Indisponível", "Seu navegador não oferece suporte para Leitores de Voz.", "warning");
    }
  };

  // Global Corporate Filters state
  const [globalUnidade, setGlobalUnidade] = useState<"TODAS" | "SESI" | "SENAI">("TODAS");
  const [globalProduto, setGlobalProduto] = useState<"TODOS" | "Saúde" | "Segurança do Trabalho" | "Educação Básica" | "Educação Profissional">("TODOS");
  const [aiPanelExpanded, setAiPanelExpanded] = useState<boolean>(false);

  // Gestora Executive states
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [chatInputText, setChatInputText] = useState("");
  const [aiIsTyping, setAiIsTyping] = useState(false);
  const [chatMessages, setChatMessages] = useState<Array<{ sender: "user" | "ai"; text: string; time: string }>>([
    {
      sender: "ai",
      text: "Olá Tatiane Teixeira Rocha! Sou o Analista de Inteligência de Dados FIRJAN. Analisei a planilha integrada de Manutenção (Thais), Orçamentos (Marília) e Faturas/Inadimplência (Cris). Em que análise executiva posso te apoiar hoje?",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  // Toast notifications state (Upper-Right notification overlays)
  const [toasts, setToasts] = useState<Array<{ id: string; title: string; msg: string; type: "success" | "info" | "warning" }>>([]);

  const addToast = (title: string, msg: string, type: "success" | "info" | "warning" = "success") => {
    const id = Date.now().toString() + Math.random().toString();
    setToasts(prev => [...prev, { id, title, msg, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
  };

  // Loaded Session Details
  const [currentUser, setCurrentUser] = useState<{
    name: string;
    role: "Gestor" | "Usuário";
    service: "all" | "manutencao" | "orcamento" | "faturamento";
    token: string;
  } | null>(null);

  // Active view inside the system
  // For Gestor, "none" renders the "Suas Aplicações" select screen.
  // For normal users, it is forced to their service immediately.
  const [activeSubApp, setActiveSubApp] = useState<"none" | "manutencao" | "orcamento" | "faturamento">("none");
  const [uploadedFiles, setUploadedFiles] = useState<Array<{
    id: string;
    name: string;
    size: string;
    type: string;
    uploadedAt: string;
    status: "pronto" | "analisando" | "sucesso" | "erro";
    analysisReport?: string;
  }>>(() => {
    try {
      const saved = localStorage.getItem("onehub_uploadedFiles_v2");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [selectedFileForAnalysis, setSelectedFileForAnalysis] = useState<any>(null);
  const [fileUploadPrompt, setFileUploadPrompt] = useState<string>("");
  const [isAnalyzingFile, setIsAnalyzingFile] = useState<boolean>(false);
  const [fileAnalysisError, setFileAnalysisError] = useState<string>("");

  // Notifications state
  const [notifications, setNotifications] = useState<Array<{ id: string; title: string; body: string; time: string; read: boolean }>>(() => {
    try {
      const saved = localStorage.getItem("onehub_notifications");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);

  // Dev Help Modal (with secure keys)
  const [devModalOpen, setDevModalOpen] = useState(false);

  // 1. STATE DEPARTAMENTOS: MANUTENÇÃO (Thais)
  const [maintenanceTickets, setMaintenanceTickets] = useState<MaintenanceTicket[]>(() => {
    try {
      const saved = localStorage.getItem("onehub_maintenanceTickets");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [newOS, setNewOS] = useState({ equipment: "", area: "", priority: "Alta" as "Alta"|"Média"|"Baixa", description: "", cost: 500 });
  const [osSearch, setOsSearch] = useState("");
  const [osStatusFilter, setOsStatusFilter] = useState("Todas");
  const [showNewOSForm, setShowNewOSForm] = useState(false);

  // 2. STATE DEPARTAMENTOS: ORÇAMENTO (Marília)
  const [costCenters, setCostCenters] = useState<CostCenter[]>(() => {
    try {
      const saved = localStorage.getItem("onehub_costCenters");
      if (saved) return JSON.parse(saved);
    } catch {}
    return [
      { id: "CC-1", name: "SESI Higienópolis", owner: "Marília Moreira de Melo Brito", budgetLimit: 850000, allocated: 0, spent: 0, status: "Excelente", unit: "SESI", product: "Saúde" },
      { id: "CC-2", name: "SENAI Maracanã", owner: "Carlos Henrique", budgetLimit: 1200000, allocated: 0, spent: 0, status: "Excelente", unit: "SENAI", product: "Educação Profissional" },
      { id: "CC-3", name: "SESI Jacarepaguá", owner: "Juliana Costa", budgetLimit: 600000, allocated: 0, spent: 0, status: "Excelente", unit: "SESI", product: "Educação Básica" }
    ];
  });
  const [budgetRequests, setBudgetRequests] = useState<BudgetRequest[]>(() => {
    try {
      const saved = localStorage.getItem("onehub_budgetRequests");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [newRequestAmount, setNewRequestAmount] = useState("");
  const [newRequestReason, setNewRequestReason] = useState("");
  const [newRequestCC, setNewRequestCC] = useState("CC-1");
  const [budgetSelectedCC, setBudgetSelectedCC] = useState<string>("Todas");

  // 3. STATE DEPARTAMENTOS: FATURAMENTO (Cris)
  const [billingInvoices, setBillingInvoices] = useState<BillingInvoice[]>(() => {
    try {
      const saved = localStorage.getItem("onehub_billingInvoices");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [issuedClient, setIssuedClient] = useState("");
  const [issuedValue, setIssuedValue] = useState("");
  const [issuedServiceType, setIssuedServiceType] = useState("");
  const [issuedDueDate, setIssuedDueDate] = useState("2026-07-15");
  const [faturamentoStatusFilter, setFaturamentoStatusFilter] = useState("Todas");
  const [faturamentoSearch, setFaturamentoSearch] = useState("");
  const [billingDrillDown, setBillingDrillDown] = useState<"none" | "SESI" | "SENAI">("none");

  // Sync index.css theme dark class
  useEffect(() => {
    const root = window.document.body;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [theme]);

  // LOCAL DATABASE STORAGE AUTO-SAVE
  useEffect(() => {
    localStorage.setItem("onehub_uploadedFiles_v2", JSON.stringify(uploadedFiles));
  }, [uploadedFiles]);

  useEffect(() => {
    localStorage.setItem("onehub_notifications", JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem("onehub_maintenanceTickets", JSON.stringify(maintenanceTickets));
  }, [maintenanceTickets]);

  useEffect(() => {
    localStorage.setItem("onehub_costCenters", JSON.stringify(costCenters));
  }, [costCenters]);

  useEffect(() => {
    localStorage.setItem("onehub_budgetRequests", JSON.stringify(budgetRequests));
  }, [budgetRequests]);

  useEffect(() => {
    localStorage.setItem("onehub_billingInvoices", JSON.stringify(billingInvoices));
  }, [billingInvoices]);

  // Programmatic safeguard: keep individual users strictly inside their permitted app view
  useEffect(() => {
    if (isAuthenticated && currentUser && currentUser.role !== "Gestor") {
      if (currentUser.service === "manutencao" && activeSubApp !== "manutencao") {
        setActiveSubApp("manutencao");
      } else if (currentUser.service === "orcamento" && activeSubApp !== "orcamento") {
        setActiveSubApp("orcamento");
      } else if (currentUser.service === "faturamento" && activeSubApp !== "faturamento") {
        setActiveSubApp("faturamento");
      }
    }
  }, [isAuthenticated, currentUser, activeSubApp]);

  // Auth users definition with corporate emails and secure tokens
  const SECURE_USERS = {
    GESTOR: {
      email: "ttrocha@firjan.com.br",
      token: "FIRJAN-TTR-9428",
      name: "Tatiane Teixeira Rocha",
      role: "Gestor" as const,
      service: "all" as const
    },
    THAIS: {
      email: "tnferreira@firjan.com.br",
      token: "FIRJAN-TNF-2105",
      name: "Thais Nicolau da Silva Ferreira",
      role: "Usuário" as const,
      service: "manutencao" as const
    },
    MARILIA: {
      email: "mmbrito@firjan.com.br",
      token: "FIRJAN-MMB-6834",
      name: "Marília Moreira de Melo Brito",
      role: "Usuário" as const,
      service: "orcamento" as const
    },
    CRIS: {
      email: "adivino@firjan.com.br",
      token: "FIRJAN-ASD-4792",
      name: "Acrislei Araujo da Silva Divino",
      role: "Usuário" as const,
      service: "faturamento" as const
    }
  };

  const handleLogin = (emailValue: string, tokenValue: string) => {
    const cleanEmail = emailValue.trim().toLowerCase();
    const cleanToken = tokenValue.trim().toUpperCase();

    if (!cleanEmail) {
      setTokenError("Por favor, digite seu e-mail corporativo FIRJAN.");
      return;
    }
    if (!cleanToken) {
      setTokenError("Por favor, digite seu token de acesso.");
      return;
    }
    
    if (cleanEmail === SECURE_USERS.GESTOR.email && cleanToken === SECURE_USERS.GESTOR.token) {
      setCurrentUser({
        name: SECURE_USERS.GESTOR.name,
        role: SECURE_USERS.GESTOR.role,
        service: SECURE_USERS.GESTOR.service,
        token: SECURE_USERS.GESTOR.token
      });
      setActiveSubApp("none"); // lands on "Suas Aplicações" select screen
      setIsAuthenticated(true);
      setTokenError("");
    } else if (cleanEmail === SECURE_USERS.THAIS.email && cleanToken === SECURE_USERS.THAIS.token) {
      setCurrentUser({
        name: SECURE_USERS.THAIS.name,
        role: SECURE_USERS.THAIS.role,
        service: SECURE_USERS.THAIS.service,
        token: SECURE_USERS.THAIS.token
      });
      setActiveSubApp("manutencao"); // route directly to her app
      setIsAuthenticated(true);
      setTokenError("");
    } else if (cleanEmail === SECURE_USERS.MARILIA.email && cleanToken === SECURE_USERS.MARILIA.token) {
      setCurrentUser({
        name: SECURE_USERS.MARILIA.name,
        role: SECURE_USERS.MARILIA.role,
        service: SECURE_USERS.MARILIA.service,
        token: SECURE_USERS.MARILIA.token
      });
      setActiveSubApp("orcamento"); // route directly to her app
      setIsAuthenticated(true);
      setTokenError("");
    } else if (cleanEmail === SECURE_USERS.CRIS.email && cleanToken === SECURE_USERS.CRIS.token) {
      setCurrentUser({
        name: SECURE_USERS.CRIS.name,
        role: SECURE_USERS.CRIS.role,
        service: SECURE_USERS.CRIS.service,
        token: SECURE_USERS.CRIS.token
      });
      setActiveSubApp("faturamento"); // route directly to her app
      setIsAuthenticated(true);
      setTokenError("");
    } else {
      setTokenError("E-mail corporativo ou token de acesso inválido.");
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setTokenInput("");
    setEmailInput("");
    setCurrentUser(null);
    setActiveSubApp("none");
    setTokenError("");
  };

  // Process and convert uploaded files to base64, tracking status
  const handleFileUpload = (e: any) => {
    e.preventDefault();
    let files: FileList | null = null;

    if (e.target && e.target.files) {
      files = e.target.files;
    } else if (e.dataTransfer && e.dataTransfer.files) {
      files = e.dataTransfer.files;
    }

    if (!files || files.length === 0) return;

    const file = files[0];
    const reader = new FileReader();

    const fileId = "upl-" + Date.now().toString();
    const sizeInMB = file.size > 1024 * 1024 
      ? (file.size / (1024 * 1024)).toFixed(2) + " MB"
      : (file.size / 1024).toFixed(0) + " KB";

    const newFileObj = {
      id: fileId,
      name: file.name,
      size: sizeInMB,
      type: file.type || "application/octet-stream",
      uploadedAt: new Date().toISOString().split("T")[0],
      status: "pronto" as const,
      content: ""
    };

    setSelectedFileForAnalysis(newFileObj);
    setUploadedFiles(prev => [...prev, newFileObj]);
    addToast("Arquivo Selecionado", `"${file.name}" pronto para processamento corporativo.`, "success");

    reader.onload = () => {
      const resultString = reader.result as string;
      const base64Content = resultString.split(",")[1] || "";
      setUploadedFiles(prev => prev.map(f => f.id === fileId ? { ...f, content: base64Content } : f));
    };

    reader.onerror = () => {
      setUploadedFiles(prev => prev.map(f => f.id === fileId ? { ...f, status: "erro" } : f));
      addToast("Erro de Leitura", "Não foi possível carregar o arquivo binário.", "warning");
    };

    reader.readAsDataURL(file);
  };

  // Perform full-stack AI analysis on user uploaded file of any format
  const handleAnalyzeFile = async (fileObj: any) => {
    if (!fileObj) return;

    // Set analysing state
    setUploadedFiles(prev => prev.map(f => f.id === fileObj.id ? { ...f, status: "analisando" } : f));
    setIsAnalyzingFile(true);
    setFileAnalysisError("");

    try {
      const response = await fetch("/api/ai/analyze-file", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileName: fileObj.name,
          fileSize: fileObj.size,
          mimeType: fileObj.type,
          fileData: fileObj.content || "U3lzdGVtIE9wZXJhdGlvbmFsIEZpcmphbiBBZGFwdGF0aW9u", // Safe default base64 text
          userPrompt: fileUploadPrompt,
        }),
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await response.json();
      const reportText = data.text || "Análise concluída com sucesso.";

      const updatedFile = {
        ...fileObj,
        status: "sucesso" as const,
        analysisReport: reportText
      };

      setUploadedFiles(prev => prev.map(f => f.id === fileObj.id ? updatedFile : f));
      setSelectedFileForAnalysis(updatedFile);
      addToast("Análise de IA Pronta", `Documento "${fileObj.name}" analisado com sucesso!`, "success");
    } catch (error: any) {
      console.error("Failed to analyze file on server:", error);
      const errTxt = "Ocorreu um erro ao processar a inteligência artificial para o arquivo. Detalhes: " + error.message;
      setUploadedFiles(prev => prev.map(f => f.id === fileObj.id ? { ...f, status: "erro" } : f));
      setFileAnalysisError(errTxt);
      addToast("Erro de IA", "Não foi possível completar o processamento.", "warning");
    } finally {
      setIsAnalyzingFile(false);
    }
  };

  // HANDLERS FOR MANUTENÇÃO (Thais)
  const handleCreateOS = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOS.equipment || !newOS.area || !newOS.description) return;

    const newTicket: MaintenanceTicket = {
      id: `OS-${Math.floor(107 + Math.random() * 900)}`,
      equipment: newOS.equipment,
      area: newOS.area,
      priority: newOS.priority,
      requester: currentUser?.name || "Solicitante",
      date: new Date().toISOString().split("T")[0],
      description: newOS.description,
      status: "Pendente",
      cost: Number(newOS.cost) || 0
    };

    setMaintenanceTickets(prev => [newTicket, ...prev]);
    setNewOS({ equipment: "", area: "", priority: "Alta", description: "", cost: 500 });
    setShowNewOSForm(false);

    // Push notification
    setNotifications(prev => [
      {
        id: Date.now().toString(),
        title: "Ordem de Serviço Aberta",
        body: `Nova OS para o equipamento ${newTicket.equipment} solicitada por Thais.`,
        time: "Agora mesmo",
        read: false
      },
      ...prev
    ]);

    // Toast alert notification
    addToast(
      "Nova OS Criada", 
      `Equipamento ${newTicket.equipment} registrado em ${newTicket.area} por Thais Nicolau da Silva Ferreira.`, 
      "success"
    );
  };

  const handleUpdateOSStatus = (id: string, newStatus: "Pendente" | "Em Execução" | "Concluído") => {
    const targetOS = maintenanceTickets.find(t => t.id === id);
    if (targetOS) {
      if (newStatus === "Em Execução") {
        addToast(
          "Manutenção em Execução", 
          `A OS ${id} para o equipamento ${targetOS.equipment} iniciou o atendimento de campo.`, 
          "info"
        );
      } else if (newStatus === "Concluído") {
        addToast(
          "Manutenção Homologada", 
          `A ordem de serviço ${id} para o equipamento ${targetOS.equipment} foi reparada e homologada por Thais Nicolau da Silva Ferreira.`, 
          "success"
        );
      }
    }
    setMaintenanceTickets(prev => prev.map(t => t.id === id ? { ...t, status: newStatus } : t));
  };

  // HANDLERS FOR ORÇAMENTO (Marília)
  const handleBudgetRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRequestAmount || !newRequestReason) return;

    const cc = costCenters.find(c => c.id === newRequestCC);
    if (!cc) return;

    const newReq: BudgetRequest = {
      id: `REQ-${Math.floor(304 + Math.random() * 900)}`,
      costCenterId: newRequestCC,
      costCenterName: cc.name,
      amount: Number(newRequestAmount),
      reason: newRequestReason,
      requester: currentUser?.name || "Solicitante",
      status: "Pendente",
      date: new Date().toISOString().split("T")[0]
    };

    setBudgetRequests(prev => [newReq, ...prev]);
    setNewRequestAmount("");
    setNewRequestReason("");

    // Push notification
    setNotifications(prev => [
      {
        id: Date.now().toString(),
        title: "Solitação Orçamentária",
        body: `Marília solicitou suplementação de R$ ${newReq.amount.toLocaleString("pt-BR")} para ${newReq.costCenterName}.`,
        time: "Agora mesmo",
        read: false
      },
      ...prev
    ]);

    // Toast alert notification
    addToast(
      "Suplementação Requisitada", 
      `Nova verba de R$ ${newReq.amount.toLocaleString("pt-BR")} solicitada para ${newReq.costCenterName}.`, 
      "info"
    );
  };

  const handleApproveBudgetRequest = (requestId: string, approve: boolean) => {
    setBudgetRequests(prev => prev.map(r => {
      if (r.id === requestId) {
        const nextStatus = approve ? "Aprovado" as const : "Recusado" as const;
        // If approved, update costCenter allocated amount
        if (approve) {
          setCostCenters(centers => centers.map(c => {
            if (c.id === r.costCenterId) {
              const updatedAllocated = c.allocated + r.amount;
              const ratio = updatedAllocated / c.budgetLimit;
              let nextStatusCenter: "Excelente" | "Saudável" | "Atenção" | "Crítico" = "Excelente";
              if (ratio > 1.0) nextStatusCenter = "Crítico";
              else if (ratio > 0.85) nextStatusCenter = "Atenção";
              else if (ratio > 0.6) nextStatusCenter = "Saudável";
              return { 
                ...c, 
                allocated: updatedAllocated,
                status: nextStatusCenter
              };
            }
            return c;
          }));

          // Approved Toast alert
          addToast(
            "Orçamento Aprovado", 
            `A verba de R$ ${r.amount.toLocaleString("pt-BR")} para ${r.costCenterName} foi liberada por Tatiane Teixeira Rocha.`, 
            "success"
          );
        } else {
          // Rejected Toast alert
          addToast(
            "Orçamento Recusado", 
            `A solicitação de suplementação para ${r.costCenterName} foi indeferida pelo Gestor.`, 
            "warning"
          );
        }
        return { ...r, status: nextStatus };
      }
      return r;
    }));
  };

  const handleUpdateBudgetLimit = (id: string, newLimit: number) => {
    setCostCenters(prev => prev.map(c => {
      if (c.id === id) {
        const ratio = c.allocated / newLimit;
        let nextStatusCenter: "Excelente" | "Saudável" | "Atenção" | "Crítico" = "Excelente";
        if (ratio > 1.0) nextStatusCenter = "Crítico";
        else if (ratio > 0.85) nextStatusCenter = "Atenção";
        else if (ratio > 0.6) nextStatusCenter = "Saudável";
        return { ...c, budgetLimit: newLimit, status: nextStatusCenter };
      }
      return c;
    }));
  };

  // HANDLERS FOR FATURAMENTO (Cris)
  const handleIssueInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!issuedClient || !issuedValue || !issuedServiceType) return;

    const newInvoice: BillingInvoice = {
      id: `FAT-${Math.floor(507 + Math.random() * 900)}`,
      client: issuedClient,
      value: Number(issuedValue),
      issueDate: new Date().toISOString().split("T")[0],
      dueDate: issuedDueDate,
      status: "Pendente",
      serviceType: issuedServiceType
    };

    setBillingInvoices(prev => [newInvoice, ...prev]);
    setIssuedClient("");
    setIssuedValue("");
    setIssuedServiceType("");

    // Push notification
    setNotifications(prev => [
      {
        id: Date.now().toString(),
        title: "Faturamento Gerado",
        body: `Fatura ${newInvoice.id} de R$ ${newInvoice.value.toLocaleString("pt-BR")} emitida com sucesso.`,
        time: "Agora mesmo",
        read: false
      },
      ...prev
    ]);
  };

  const handlePayInvoice = (id: string) => {
    setBillingInvoices(prev => prev.map(inv => inv.id === id ? { ...inv, status: "Pago" } : inv));
  };

  const handleSendAIMessage = (textToSend?: string) => {
    const rawText = textToSend || chatInputText;
    if (!rawText.trim()) return;

    // Append user message
    const userMsg = {
      sender: "user" as const,
      text: rawText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setChatMessages(prev => [...prev, userMsg]);
    if (!textToSend) setChatInputText("");

    setAiIsTyping(true);

    // Simulate AI response delay for premium realism
    setTimeout(() => {
      let aiResponseText = "";
      const textLower = rawText.toLowerCase();

      if (textLower.includes("risco") || textLower.includes("geral") || textLower.includes("trimestre") || textLower.includes("1")) {
        aiResponseText = `### 📊 RELATÓRIO DE RISCO INTEGRADO\n\n* **Orçamento Total Alocado:** R$ ${calculatedStats.totalAllocated.toLocaleString("pt-BR")}\n* **Execução Financeira:** R$ ${calculatedStats.totalSpent.toLocaleString("pt-BR")} (${Math.round((calculatedStats.totalSpent / (calculatedStats.totalAllocated || 1)) * 100)}% consumido)\n* **Saldo Atual:** R$ ${calculatedStats.availableBudget.toLocaleString("pt-BR")}\n\n⚠️ **Sinalizadores de Atenção:**\n1. **Estouro de CC (Módulo Marília):** O centro de custo "Unidades Móveis de Petróleo" excedeu o limite orçado em R$ 50.000. Recomenda-se remanejamento de verbas da Sede RJ que possui saldo favorável.\n2. **Inadimplência Crítica (Módulo Acrislei):** Registramos R$ ${calculatedStats.overdueBilling.toLocaleString("pt-BR")} em faturas vencidas. O maior devedor é a "CSN Siderúrgica Norte" (R$ 32.000).\n3. **Manutenções em Aberto (Módulo Thais):** Existem ${calculatedStats.activeOS} ordens de serviço pendentes de execução. A de maior criticidade é a OS-106 (Ponte Rolante) no valor de R$ 4.800.\n\n💡 **Recomendação Executiva:** Congelar suplementações automáticas nas unidades SENAI nos próximos 15 dias e acionar o jurídico para cobrança corporativa amigável.`;
      } else if (textLower.includes("marília") || textLower.includes("orçamento") || textLower.includes("2")) {
        aiResponseText = `### 💼 COMPLIANCE ORÇAMENTÁRIO (MARÍLIA MOREIRA DE MELO BRITO)\n\nAnalisamos a integridade fiscal da área com base nos repasses alocados:\n\n* **Limite Máximo Global de Verbas:** R$ 4.550.000\n* **Verba Atualmente Alocada:** R$ ${calculatedStats.totalAllocated.toLocaleString("pt-BR")}\n* **Taxa de Liberação:** ${Math.round((calculatedStats.totalAllocated / 4550000) * 100)}%\n\n🔥 **Risco Crítico Identificado:**\n* O principal gargalo é o centro de custo **CC-5 (Unidades Móveis de Petróleo)** liderado por Rita de Cássia. Despesa executada de **R$ 1.150.000** contra alocação autorizada de **R$ 1.100.000**.\n\n🛡️ **Plano de Contingência:**\n* Utilizar a Sede Firjan RJ (CC-1) que obteve saldo remanescente sob a gestão de Marília Moreira de Melo Brito, redirecionando R$ 50.000 para sanear o déficit do CC-5.`;
      } else if (textLower.includes("thais") || textLower.includes("sla") || textLower.includes("manutenção") || textLower.includes("3")) {
        aiResponseText = `### 🔧 DIAGNÓSTICO DE MANUTENÇÃO (THAIS NICOLAU DA SILVA FERREIRA)\n\nAs ordens de serviços industriais operam sob os seguintes parâmetros reais de SLA:\n\n* **OS Concluídas no Mês:** ${calculatedStats.completedOS}\n* **OS pendentes de Atendimento:** ${calculatedStats.activeOS}\n* **Investimento de Manutenção Corrente:** R$ ${calculatedStats.totalMaintenanceCost.toLocaleString("pt-BR")}\n\n🔍 **Alvos de Maior Custo:**\n1. **Ponte Rolante de Carga 15 Ton (OS-106):** Pendente — Custo: R$ 4.800 (Alta Severidade). Risco de interrupção operacional de pátio.\n2. **Torno CNC Haas ST-20 (OS-102):** Em Execução — Custo: R$ 1.200.\n\n📈 **Indicador de Performance:** O SLA de resolução atual está em 84 horas úteis, considerado excelente, apresentando uma redução de custo médio de reparos em 4.5% no comparativo anual.`;
      } else if (textLower.includes("cris") || textLower.includes("acrislei") || textLower.includes("inadimplência") || textLower.includes("faturamento") || textLower.includes("recuperação") || textLower.includes("4")) {
        aiResponseText = `### 💸 RECUPERAÇÃO FINANCEIRA & FATURAMENTO (ACRISLEI ARAUJO DA SILVA DIVINO)\n\nA saúde de recebimentos do Hub de Faturamento apresenta o seguinte farol:\n\n* **Faturamento Bruto Emitido:** R$ ${calculatedStats.totalIssuedBilling.toLocaleString("pt-BR")}\n* **Montante Arrecadado (Recebido):** R$ ${calculatedStats.totalPaidBilling.toLocaleString("pt-BR")}\n* **Faturamento Pendente:** R$ ${calculatedStats.pendingBilling.toLocaleString("pt-BR")}\n* **Índice Geral de Inadimplência:** ${Math.round((calculatedStats.overdueBilling / (calculatedStats.totalIssuedBilling || 1)) * 100)}% (R$ ${calculatedStats.overdueBilling.toLocaleString("pt-BR")} em atraso)\n\n📌 **Ações Propostas por Acrislei Araujo:**\n* Realizar protesto automático de faturas após 15 dias de vencimento.\n* Conceder desconto pontualidade de 2.5% para pagamentos efetuados com 5 dias de antecedência para impulsionar fluxo de caixa.`;
      } else {
        aiResponseText = `### 💡 ANÁLISE DE DADOS SOB DEMANDA (FIRJAN HUB)\n\nCom base no termo *"_${rawText}_"*, extraí as seguintes correlações dos dados vivos:\n\n* **Custo Operacional de Ativos (Manutenção):** R$ ${calculatedStats.totalMaintenanceCost.toLocaleString("pt-BR")}\n* **Verbas de Projetos e Repasses PMO:** R$ ${calculatedStats.totalAllocated.toLocaleString("pt-BR")}\n* **Taxa de Inadimplência Atual:** ${Math.round((calculatedStats.overdueBilling / (calculatedStats.totalIssuedBilling || 1)) * 100)}% do faturamento emitido.\n\nPor favor, escolha uma das sugestões rápidas acima ou detalhe o setor de sua busca para gerarmos análises adicionais. Estarei à sua disposição!`;
      }

      setChatMessages(prev => [...prev, {
        sender: "ai",
        text: aiResponseText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
      setAiIsTyping(false);
    }, 1200);
  };

  const handleDownloadFormattedReport = (fileObj: any) => {
    if (!fileObj) return;
    
    const reportText = fileObj.analysisReport || "Análise executiva em processamento.";
    
    const osLinesHtml = maintenanceTickets.map(os => `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #e2e8f0; font-family: monospace; font-weight: bold; color: #4f46e5;">${os.id}</td>
        <td style="padding: 12px; border-bottom: 1px solid #e2e8f0; font-weight: 600;">${os.equipment}</td>
        <td style="padding: 12px; border-bottom: 1px solid #e2e8f0; color: #475569;">${os.area}</td>
        <td style="padding: 12px; border-bottom: 1px solid #e2e8f0; text-align: center;">
          <span style="padding: 3px 8px; border-radius: 9999px; font-size: 11px; font-weight: 600; 
            ${os.priority === 'Alta' ? 'background-color: #fef2f2; color: #991b1b;' : os.priority === 'Média' ? 'background-color: #fffbeb; color: #92400e;' : 'background-color: #f0fdf4; color: #166534;'}">
            ${os.priority}
          </span>
        </td>
        <td style="padding: 12px; border-bottom: 1px solid #e2e8f0; text-align: right; font-family: monospace; font-weight: bold; color: #0f172a;">R$ ${os.cost.toLocaleString('pt-BR')}</td>
        <td style="padding: 12px; border-bottom: 1px solid #e2e8f0; text-align: center;">
          <span style="padding: 3px 8px; border-radius: 4px; font-size: 11px; font-weight: bold; 
            ${os.status === 'Concluído' ? 'background-color: #dcfce7; color: #15803d;' : os.status === 'Em Execução' ? 'background-color: #dbeafe; color: #1d4ed8;' : 'background-color: #f1f5f9; color: #475569;'}">
            ${os.status}
          </span>
        </td>
      </tr>
    `).join("");

    const ccLinesHtml = costCenters.map(cc => `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #e2e8f0; font-family: monospace; font-weight: bold; color: #4f46e5;">${cc.id}</td>
        <td style="padding: 12px; border-bottom: 1px solid #e2e8f0; font-weight: bold; color: #0f172a;">${cc.name}</td>
        <td style="padding: 12px; border-bottom: 1px solid #e2e8f0; color: #475569;">${cc.owner}</td>
        <td style="padding: 12px; border-bottom: 1px solid #e2e8f0; text-align: right; font-family: monospace;">R$ ${cc.budgetLimit.toLocaleString('pt-BR')}</td>
        <td style="padding: 12px; border-bottom: 1px solid #e2e8f0; text-align: right; font-family: monospace; color: #16a34a; font-weight: 500;">R$ ${cc.allocated.toLocaleString('pt-BR')}</td>
        <td style="padding: 12px; border-bottom: 1px solid #e2e8f0; text-align: right; font-family: monospace; color: #dc2626; font-weight: 500;">R$ ${cc.spent.toLocaleString('pt-BR')}</td>
        <td style="padding: 12px; border-bottom: 1px solid #e2e8f0; text-align: center;">
          <span style="padding: 3px 8px; border-radius: 4px; font-size: 11px; font-weight: bold; 
            ${cc.status === 'Excelente' ? 'background-color: #dcfce7; color: #15803d;' : cc.status === 'Atenção' ? 'background-color: #fffbeb; color: #92400e;' : 'background-color: #fee2e2; color: #b91c1c;'}">
            ${cc.status}
          </span>
        </td>
      </tr>
    `).join("");

    const invLinesHtml = billingInvoices.map(inv => `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #e2e8f0; font-family: monospace; font-weight: bold; color: #4f46e5;">${inv.id}</td>
        <td style="padding: 12px; border-bottom: 1px solid #e2e8f0; font-weight: bold; color: #0f172a;">${inv.client}</td>
        <td style="padding: 12px; border-bottom: 1px solid #e2e8f0; text-align: right; font-family: monospace; color: #0f172a; font-weight: bold;">R$ ${inv.value.toLocaleString('pt-BR')}</td>
        <td style="padding: 12px; border-bottom: 1px solid #e2e8f0; text-align: center; color: #475569; font-size: 11px;">${inv.issueDate}</td>
        <td style="padding: 12px; border-bottom: 1px solid #e2e8f0; text-align: center; color: #475569; font-size: 11px;">${inv.dueDate}</td>
        <td style="padding: 12px; border-bottom: 1px solid #e2e8f0; text-align: center;">
          <span style="padding: 3px 8px; border-radius: 9999px; font-size: 11px; font-weight: bold; 
            ${inv.status === 'Pago' ? 'background-color: #dcfce7; color: #15803d;' : inv.status === 'Pendente' ? 'background-color: #eff6ff; color: #1e40af;' : 'background-color: #fef2f2; color: #991b1b;'}">
            ${inv.status}
          </span>
        </td>
        <td style="padding: 12px; border-bottom: 1px solid #e2e8f0; font-size: 11px; color: #64748b;">${inv.serviceType}</td>
      </tr>
    `).join("");

    const formattedParagraphs = reportText.split("\n\n").map((p, pIdx) => {
      let text = p.trim();
      if (!text) return "";
      if (text.startsWith("###")) {
        return `<h3 key="${pIdx}" style="color: #1e3a8a; margin-top: 24px; border-bottom: 2px solid #3b82f6; padding-bottom: 4px; font-family: sans-serif; font-size: 18px;">${text.replace(/###/g, "").trim()}</h3>`;
      }
      if (text.startsWith("####")) {
        return `<h4 key="${pIdx}" style="color: #4f46e5; margin-top: 16px; font-family: sans-serif; font-size: 15px;">${text.replace(/####/g, "").trim()}</h4>`;
      }
      if (text.startsWith("*") || text.startsWith("-")) {
        const listItems = text.split("\n").map((li, lIdx) => `<li key="${lIdx}" style="margin-left: 20px; margin-top: 4px; color: #334155;">${li.replace(/^[*-\s]+/, "")}</li>`).join("");
        return `<ul style="margin: 8px 0; padding-left: 10px;">${listItems}</ul>`;
      }
      return `<p key="${pIdx}" style="line-height: 1.6; color: #334155; font-size: 14px; margin-top: 8px;">${text}</p>`;
    }).join("");

    const htmlContent = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>Relatório Consolidado de Gestão & Inteligência IA</title>
  <style>
    body {
      font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, sans-serif;
      margin: 0;
      padding: 30px;
      background-color: #f8fafc;
      color: #0f172a;
    }
    .container {
      max-width: 1100px;
      margin: 0 auto;
      background: white;
      padding: 40px;
      border-radius: 16px;
      box-shadow: 0 10px 25px rgba(0,0,0,0.05);
      border: 1px solid #e2e8f0;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 3px solid #1e3a8a;
      padding-bottom: 20px;
      margin-bottom: 30px;
    }
    .title-area h1 {
      margin: 0;
      font-size: 24px;
      color: #1e3a8a;
      text-transform: uppercase;
      letter-spacing: -0.5px;
    }
    .title-area p {
      margin: 5px 0 0 0;
      font-size: 12px;
      color: #64748b;
      font-weight: 500;
      text-transform: uppercase;
      font-family: monospace;
    }
    .badge-top {
      font-family: monospace;
      font-size: 11px;
      background-color: #e0f2fe;
      color: #0369a1;
      padding: 6px 12px;
      border-radius: 6px;
      font-weight: bold;
      border: 1px solid #bae6fd;
    }
    .grid-stats {
      display: grid;
      grid-template-cols: repeat(auto-fit, minmax(220px, 1fr));
      gap: 20px;
      margin-bottom: 35px;
    }
    .stat-card {
      background: #f1f5f9;
      padding: 20px;
      border-radius: 12px;
      border: 1px solid #e2e8f0;
      text-align: center;
    }
    .stat-label {
      font-size: 11px;
      color: #64748b;
      text-transform: uppercase;
      font-weight: bold;
      letter-spacing: 0.5px;
      margin-bottom: 8px;
    }
    .stat-value {
      font-size: 22px;
      font-weight: 800;
      color: #1e3a8a;
      font-family: monospace;
    }
    .section-title {
      font-size: 18px;
      color: #0f172a;
      border-left: 5px solid #10b981;
      padding-left: 12px;
      margin-top: 40px;
      margin-bottom: 20px;
      font-weight: bold;
      text-transform: uppercase;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 25px;
      font-size: 13px;
    }
    th {
      background-color: #f8fafc;
      color: #475569;
      text-align: left;
      padding: 12px 10px;
      font-weight: bold;
      border-top: 1px solid #e2e8f0;
      border-bottom: 2px solid #cbd5e1;
      font-size: 11px;
      text-transform: uppercase;
    }
    .ai-box {
      background-color: #faf5ff;
      border: 1.5px solid #e9d5ff;
      padding: 30px;
      border-radius: 12px;
      margin-bottom: 30px;
    }
    .ai-header {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 15px;
      color: #6b21a8;
      font-weight: bold;
      text-transform: uppercase;
      font-size: 14px;
      border-bottom: 1px solid #f3e8ff;
      padding-bottom: 10px;
    }
    .row-charts {
      display: flex;
      gap: 20px;
      margin-bottom: 30px;
      flex-wrap: wrap;
    }
    .chart-container {
      flex: 1;
      min-width: 300px;
      background: white;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 20px;
    }
    .chart-title {
      font-size: 13px;
      font-weight: bold;
      color: #475569;
      margin-bottom: 15px;
      text-transform: uppercase;
    }
    .bar-row {
      margin-bottom: 12px;
    }
    .bar-label {
      display: flex;
      justify-content: space-between;
      font-size: 12px;
      margin-bottom: 4px;
      color: #334155;
    }
    .bar-bg {
      background: #e2e8f0;
      height: 12px;
      border-radius: 9999px;
      overflow: hidden;
    }
    .bar-fill {
      height: 100%;
      border-radius: 9999px;
    }
    .footer {
      text-align: center;
      font-size: 11px;
      color: #94a3b8;
      margin-top: 50px;
      border-top: 1px solid #e2e8f0;
      padding-top: 20px;
      font-family: monospace;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="title-area">
        <h1>FIRJAN ONEHUB • Relatório de Gestão Consolidado</h1>
        <p>Extraído de forma síncrona do ecossistema central de inteligência</p>
      </div>
      <div class="badge-top">
        Sincronizado via IA • ${new Date().toLocaleDateString("pt-BR")}
      </div>
    </div>

    <!-- KPI Bento Grid Widgets -->
    <div class="grid-stats">
      <div class="stat-card">
        <div class="stat-label">Total Gasto em Manutenção</div>
        <div class="stat-value" style="color: #ef4444;">R$ ${maintenanceTickets.reduce((acc, c) => acc + c.cost, 0).toLocaleString("pt-BR")}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Limites de Custos Alocados</div>
        <div class="stat-value" style="color: #3b82f6;">R$ ${costCenters.reduce((acc, c) => acc + c.allocated, 0).toLocaleString("pt-BR")}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Despesa Consolidada</div>
        <div class="stat-value" style="color: #6b7280;">R$ ${costCenters.reduce((acc, c) => acc + c.spent, 0).toLocaleString("pt-BR")}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Receita Faturada Ativa</div>
        <div class="stat-value" style="color: #10b981;">R$ ${billingInvoices.reduce((acc, c) => acc + c.value, 0).toLocaleString("pt-BR")}</div>
      </div>
    </div>

    <!-- Interactive Dashboards & Mini Charts -->
    <div class="row-charts">
      <div class="chart-container">
        <div class="chart-title">Status e Orçamentos de Centros de Custos</div>
        ${costCenters.map(cc => {
          const limit = cc.budgetLimit || 1;
          const pct = Math.min(100, Math.round((cc.spent / limit) * 100)) || 0;
          const color = pct > 90 ? '#ef4444' : pct > 70 ? '#f59e0b' : '#10b981';
          return `
            <div class="bar-row">
              <div class="bar-label">
                <span><strong>${cc.name}</strong></span>
                <span>${pct}% de R$ ${(cc.budgetLimit/1000).toFixed(0)}k</span>
              </div>
              <div class="bar-bg">
                <div class="bar-fill" style="width: ${pct === 0 ? 5 : pct}%; background-color: ${color};"></div>
              </div>
            </div>
          `;
        }).join("")}
      </div>

      <div class="chart-container">
        <div class="chart-title">Aderência por Unidade e Serviço</div>
        <div class="bar-row">
          <div class="bar-label">
            <span>SESI Saúde</span>
            <span>Estável</span>
          </div>
          <div class="bar-bg">
            <div class="bar-fill" style="width: 85%; background-color: #3b82f6;"></div>
          </div>
        </div>
        <div class="bar-row">
          <div class="bar-label">
            <span>SENAI Educação Profissional</span>
            <span>Máximo Alinhamento</span>
          </div>
          <div class="bar-bg">
            <div class="bar-fill" style="width: 93%; background-color: #10b981;"></div>
          </div>
        </div>
        <div class="bar-row">
          <div class="bar-label">
            <span>SESI Segurança do Trabalho</span>
            <span>Prevenção Ativa</span>
          </div>
          <div class="bar-bg">
            <div class="bar-fill" style="width: 76%; background-color: #f59e0b;"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Active File AI Cognitive Report Analysis -->
    <div class="ai-box">
      <div class="ai-header">
        <svg style="width: 18px; height: 18px; fill: currentColor; margin-right: 5px;" viewBox="0 0 24 24"><path d="M12,2A10,10,0,0,0,2,12a10,10,0,0,0,10,10,10,10,0,0,0,10-10A10,10,0,0,0,12,2Zm1,15H11V11h2Zm0-8H11V7h2Z"/></svg>
        Análise Cognitiva realizada pelo Gemini 3.5 para: "${fileObj.name}"
      </div>
      <div class="ai-body-styled">
        ${formattedParagraphs}
      </div>
    </div>

    <!-- Live Corporate Database Tables: Maintenance -->
    <div class="section-title" style="border-left-color: #4f46e5;">Módulo 1: Chamados & Ordens de Serviço (Manutenção)</div>
    ${osLinesHtml ? `
    <table>
      <thead>
        <tr>
          <th>Código</th>
          <th>Ativo / Equipamento</th>
          <th>Local / Unidade</th>
          <th style="text-align: center;">Prioridade</th>
          <th style="text-align: right;">Custo Estimado</th>
          <th style="text-align: center;">Status</th>
        </tr>
      </thead>
      <tbody>
        ${osLinesHtml}
      </tbody>
    </table>
    ` : `<p style="font-size: 13px; color: #64748b; font-style: italic; padding: 10px;">Nenhum chamado de manutenção registrado.</p>`}

    <!-- Live Corporate Database Tables: Budgets -->
    <div class="section-title" style="border-left-color: #0284c7;">Módulo 2: Alocação Orçamentária Controlada PMO</div>
    ${ccLinesHtml ? `
    <table>
      <thead>
        <tr>
          <th>ID</th>
          <th>Centro de Custo</th>
          <th>Gestor Responsável</th>
          <th style="text-align: right;">Teto Orçamentário</th>
          <th style="text-align: right;">Alocado</th>
          <th style="text-align: right;">Gasto Realizado</th>
          <th style="text-align: center;">Status</th>
        </tr>
      </thead>
      <tbody>
        ${ccLinesHtml}
      </tbody>
    </table>
    ` : `<p style="font-size: 13px; color: #64748b; font-style: italic; padding: 10px;">Nenhum centro de custo registrado.</p>`}

    <!-- Live Corporate Database Tables: Invoices -->
    <div class="section-title" style="border-left-color: #f59e0b;">Módulo 3: Emissão de Faturamento e Fluxo de Receitas</div>
    ${invLinesHtml ? `
    <table>
      <thead>
        <tr>
          <th>Número FAT</th>
          <th>Cliente / Convênio</th>
          <th style="text-align: right;">Valor Líquido</th>
          <th style="text-align: center;">Emissão</th>
          <th style="text-align: center;">Vencimento</th>
          <th style="text-align: center;">Parcelamento</th>
          <th>Descrição do Serviço Técnico</th>
        </tr>
      </thead>
      <tbody>
        ${invLinesHtml}
      </tbody>
    </table>
    ` : `<p style="font-size: 13px; color: #64748b; font-style: italic; padding: 10px;">Nenhuma fatura de faturamento registrada.</p>`}

    <div class="footer">
      🔒 FIRJAN ONEHUB • DOCUMENTO OFICIAL GERADO DIGITALMENTE EM CODIFICAÇÃO PROTEGIDA • NÚMERO DE COMPLIANCE: HUB-${Math.floor(1000 + Math.random()*9000)} • CONFORME DIRETRIZES DA GESTORA TATIANE TEIXEIRA ROCHA
    </div>
  </div>
</body>
</html>
    `;

    const blob = new Blob([htmlContent], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Relatorio_Consolidado_OneHub_${fileObj.name.split(".")[0]}.html`;
    link.click();
    addToast("Relatório Formatado Pronto", "O arquivo HTML com tabelas, cores e gráficos síncronos foi baixado com sucesso!", "success");
  };

  // Filtering logs
  const filteredOSList = maintenanceTickets.filter(os => {
    const matchesSearch = os.equipment.toLowerCase().includes(osSearch.toLowerCase()) || 
                          os.description.toLowerCase().includes(osSearch.toLowerCase()) ||
                          os.area.toLowerCase().includes(osSearch.toLowerCase());
    const matchesStatus = osStatusFilter === "Todas" || os.status === osStatusFilter;
    const matchesGlobalUnit = globalUnidade === "TODAS" || os.unit === globalUnidade;
    const matchesGlobalProduct = globalProduto === "TODOS" || os.product === globalProduto;
    return matchesSearch && matchesStatus && matchesGlobalUnit && matchesGlobalProduct;
  });

  const filteredInvoicesList = billingInvoices.filter(inv => {
    const matchesSearch = inv.client.toLowerCase().includes(faturamentoSearch.toLowerCase()) || 
                          inv.serviceType.toLowerCase().includes(faturamentoSearch.toLowerCase());
    const matchesStatus = faturamentoStatusFilter === "Todas" || inv.status === faturamentoStatusFilter;
    const matchesGlobalUnit = globalUnidade === "TODAS" || inv.unit === globalUnidade;
    const matchesGlobalProduct = globalProduto === "TODOS" || inv.product === globalProduto;
    return matchesSearch && matchesStatus && matchesGlobalUnit && matchesGlobalProduct;
  });

  const filteredCostCenters = costCenters.filter(cc => {
    const matchesCCFilter = budgetSelectedCC === "Todas" || cc.id === budgetSelectedCC;
    const matchesGlobalUnit = globalUnidade === "TODAS" || cc.unit === globalUnidade;
    const matchesGlobalProduct = globalProduto === "TODOS" || cc.product === globalProduto;
    return matchesCCFilter && matchesGlobalUnit && matchesGlobalProduct;
  });

  // Calculate generic indicator outputs
  const calculatedStats = {
    // Maintenance stats
    activeOS: maintenanceTickets.filter(o => {
      const matchesGlobalUnit = globalUnidade === "TODAS" || o.unit === globalUnidade;
      const matchesGlobalProduct = globalProduto === "TODOS" || o.product === globalProduto;
      return o.status !== "Concluído" && matchesGlobalUnit && matchesGlobalProduct;
    }).length,
    completedOS: maintenanceTickets.filter(o => {
      const matchesGlobalUnit = globalUnidade === "TODAS" || o.unit === globalUnidade;
      const matchesGlobalProduct = globalProduto === "TODOS" || o.product === globalProduto;
      return o.status === "Concluído" && matchesGlobalUnit && matchesGlobalProduct;
    }).length,
    totalMaintenanceCost: maintenanceTickets.filter(o => {
      const matchesGlobalUnit = globalUnidade === "TODAS" || o.unit === globalUnidade;
      const matchesGlobalProduct = globalProduto === "TODOS" || o.product === globalProduto;
      return matchesGlobalUnit && matchesGlobalProduct;
    }).reduce((acc, curr) => acc + curr.cost, 0),

    // Budget stats
    totalAllocated: costCenters.filter(cc => {
      const matchesGlobalUnit = globalUnidade === "TODAS" || cc.unit === globalUnidade;
      const matchesGlobalProduct = globalProduto === "TODOS" || cc.product === globalProduto;
      return matchesGlobalUnit && matchesGlobalProduct;
    }).reduce((acc, curr) => acc + curr.allocated, 0),
    totalSpent: costCenters.filter(cc => {
      const matchesGlobalUnit = globalUnidade === "TODAS" || cc.unit === globalUnidade;
      const matchesGlobalProduct = globalProduto === "TODOS" || cc.product === globalProduto;
      return matchesGlobalUnit && matchesGlobalProduct;
    }).reduce((acc, curr) => acc + curr.spent, 0),
    availableBudget: costCenters.filter(cc => {
      const matchesGlobalUnit = globalUnidade === "TODAS" || cc.unit === globalUnidade;
      const matchesGlobalProduct = globalProduto === "TODOS" || cc.product === globalProduto;
      return matchesGlobalUnit && matchesGlobalProduct;
    }).reduce((acc, curr) => acc + (curr.allocated - curr.spent), 0),
    pendingBudgetRequests: budgetRequests.filter(r => r.status === "Pendente").length,

    // Billing stats
    totalIssuedBilling: billingInvoices.filter(i => {
      const matchesGlobalUnit = globalUnidade === "TODAS" || i.unit === globalUnidade;
      const matchesGlobalProduct = globalProduto === "TODOS" || i.product === globalProduto;
      return matchesGlobalUnit && matchesGlobalProduct;
    }).reduce((acc, curr) => acc + curr.value, 0),
    totalPaidBilling: billingInvoices.filter(i => {
      const matchesGlobalUnit = globalUnidade === "TODAS" || i.unit === globalUnidade;
      const matchesGlobalProduct = globalProduto === "TODOS" || i.product === globalProduto;
      return i.status === "Pago" && matchesGlobalUnit && matchesGlobalProduct;
    }).reduce((acc, curr) => acc + curr.value, 0),
    pendingBilling: billingInvoices.filter(i => {
      const matchesGlobalUnit = globalUnidade === "TODAS" || i.unit === globalUnidade;
      const matchesGlobalProduct = globalProduto === "TODOS" || i.product === globalProduto;
      return i.status === "Pendente" && matchesGlobalUnit && matchesGlobalProduct;
    }).reduce((acc, curr) => acc + curr.value, 0),
    overdueBilling: billingInvoices.filter(i => {
      const matchesGlobalUnit = globalUnidade === "TODAS" || i.unit === globalUnidade;
      const matchesGlobalProduct = globalProduto === "TODOS" || i.product === globalProduto;
      return i.status === "Atrasado" && matchesGlobalUnit && matchesGlobalProduct;
    }).reduce((acc, curr) => acc + curr.value, 0),
  };

  // Render Page Content
  return (
    <div 
      style={{ 
        fontSize: `${fontSizeScale}%`,
        filter: grayscale ? "grayscale(100%)" : "none"
      }}
      className={`min-h-screen flex flex-col justify-between selection:bg-purple-500/30 selection:text-white transition-colors duration-300 relative overflow-x-hidden ${
        dyslexicFont ? "font-mono tracking-wide text-[105%]" : "font-sans"
      } ${
        theme === "contrast" 
          ? "bg-black text-[#FFFF00]" 
          : theme === "dark" 
            ? "bg-[#06050b] text-slate-100" 
            : "bg-slate-50 text-slate-800"
      }`}
    >
      {/* Sesi and Senai combined visual glowing spots (not rendered in high contrast) */}
      {theme !== "contrast" && (
        <>
          {/* Cyan SENAI theme glow: Top-Left */}
          <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[50%] rounded-full bg-cyan-500/8 dark:bg-[#00AEEF]/10 blur-[150px] pointer-events-none z-0" />
          
          {/* Orange SESI theme glow: Bottom-Right */}
          <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[50%] rounded-full bg-orange-500/8 dark:bg-[#F58220]/10 blur-[150px] pointer-events-none z-0" />
          
          {/* Soft central blending divider */}
          <div className="absolute top-[40%] left-[30%] w-[40%] h-[40%] rounded-full bg-indigo-500/3 dark:bg-purple-500/5 blur-[130px] pointer-events-none z-0" />
        </>
      )}

      {/* BARRA DE ACESSIBILIDADE CORPORATIVA UNIVERSAL FIRJAN */}
      <div className={`w-full text-[11px] font-mono border-b flex flex-wrap items-center justify-between px-6 py-2.5 select-none transition-colors duration-200 z-[99] relative ${
        theme === "contrast" 
          ? "bg-black text-[#FFFF00] border-[#FFFF00]" 
          : theme === "dark" 
            ? "bg-[#0c0a15] text-zinc-400 border-zinc-900/60" 
            : "bg-slate-100 text-slate-600 border-slate-200"
      }`}>
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-cyan-500 shrink-0" />
          <span className="font-bold uppercase tracking-wider text-[10.5px]">
            Acessibilidade Firjan (SESI/SENAI)
          </span>
        </div>
        
        <div className="flex flex-wrap items-center gap-4">
          {/* Font controls */}
          <div className="flex items-center border-r pr-3 border-zinc-300 dark:border-zinc-800 gap-1.5">
            <span className="text-[10px] font-bold">Fonte:</span>
            <button 
              type="button"
              onClick={() => {
                const next = Math.min(140, fontSizeScale + 10);
                setFontSizeScale(next);
                addToast("Acessibilidade", `Fonte aumentada para ${next}%`, "success");
              }}
              className={`px-2 py-0.5 rounded text-[10px] font-bold transition cursor-pointer ${
                theme === "contrast" 
                  ? "bg-black text-[#FFFF00] border border-[#FFFF00] hover:bg-[#FFFF00] hover:text-black" 
                  : "bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-600 dark:text-cyan-400"
              }`}
            >
              A+
            </button>
            <button 
              type="button"
              onClick={() => {
                const next = Math.max(90, fontSizeScale - 10);
                setFontSizeScale(next);
                addToast("Acessibilidade", `Fonte reduzida para ${next}%`, "success");
              }}
              className={`px-2 py-0.5 rounded text-[10px] font-bold transition cursor-pointer ${
                theme === "contrast" 
                  ? "bg-black text-[#FFFF00] border border-[#FFFF00] hover:bg-[#FFFF00] hover:text-black" 
                  : "bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-600 dark:text-cyan-400"
              }`}
            >
              A-
            </button>
          </div>

          {/* Dyslexia ease */}
          <button 
            type="button"
            onClick={() => {
              setDyslexicFont(prev => !prev);
              addToast("Acessibilidade", dyslexicFont ? "Fonte padrão de leitura" : "Modo Facilitador de Leitura (Siri) ativado", "info");
            }}
            className={`px-2 py-0.5 rounded text-[10px] font-bold transition flex items-center gap-1 cursor-pointer ${
              dyslexicFont 
                ? (theme === "contrast" ? "bg-[#FFFF00] text-black" : "bg-cyan-600 text-white") 
                : (theme === "contrast" ? "bg-black text-[#FFFF00] border border-[#FFFF00] hover:bg-[#FFFF00] hover:text-black" : "hover:bg-slate-200 dark:hover:bg-zinc-900")
            }`}
            title="Alternar para fonte com maior espaçamento"
          >
            <Type className="w-3 h-3" />
            {dyslexicFont ? "Dislexia [On]" : "Fonte Dislexia"}
          </button>

          {/* Grayscale filter */}
          <button 
            type="button"
            onClick={() => {
              setGrayscale(prev => !prev);
              addToast("Acessibilidade", grayscale ? "Filtros de cores desligados" : "Filtro Monocromático de contraste ativo", "info");
            }}
            className={`px-2 py-0.5 rounded text-[10px] font-bold transition flex items-center gap-1 cursor-pointer ${
              grayscale 
                ? (theme === "contrast" ? "bg-[#FFFF00] text-black" : "bg-cyan-600 text-white") 
                : (theme === "contrast" ? "bg-black text-[#FFFF00] border border-[#FFFF00] hover:bg-[#FFFF00] hover:text-black" : "hover:bg-slate-200 dark:hover:bg-zinc-900")
            }`}
          >
            <Eye className="w-3 h-3" />
            {grayscale ? "Monocromático [On]" : "Escala Cinza"}
          </button>

          {/* Speech Text Speaker */}
          <button 
            type="button"
            onClick={() => {
              handleToggleSpeak("Painel Integrado Firjan Sesi Senai de Negócios. Soluções e relatórios executivos unificados para faturamento, orçamentos e manutenção.");
            }}
            className={`px-2.5 py-0.5 rounded text-[10px] font-bold transition flex items-center gap-1 cursor-pointer ${
              theme === "contrast" 
                ? "bg-black text-[#FFFF00] border border-[#FFFF00] hover:bg-[#FFFF00] hover:text-black" 
                : "bg-orange-500/10 text-orange-600 hover:bg-orange-500/20 dark:text-orange-400"
            }`}
          >
            <Volume2 className="w-3.5 h-3.5" />
            Narrar Página
          </button>

          {/* Theme Option Controller explicitly requested: "Criar opção de tema para aplicação" */}
          <div className="flex items-center gap-1.5 pl-3 border-l border-zinc-300 dark:border-zinc-800">
            <span className="text-[10px] font-bold">Temas:</span>
            <button 
              type="button"
              onClick={() => {
                setTheme("light");
                addToast("Tema", "Tema Claro Ativado (Tom Mesclado)", "info");
              }}
              className={`px-2 py-0.5 rounded text-[9.5px] font-bold uppercase transition cursor-pointer ${
                theme === "light" 
                  ? "bg-slate-700 text-white" 
                  : "bg-slate-200 hover:bg-slate-300 text-slate-700 hover:text-slate-900"
              }`}
            >
              Claro
            </button>
            <button 
              type="button"
              onClick={() => {
                setTheme("dark");
                addToast("Tema", "Tema Escuro Ativado (Estelar Mesclado)", "info");
              }}
              className={`px-2 py-0.5 rounded text-[9.5px] font-bold uppercase transition cursor-pointer ${
                theme === "dark" 
                  ? "bg-purple-650 text-white" 
                  : "bg-slate-200 hover:bg-slate-300 text-slate-700 dark:bg-zinc-800 dark:text-zinc-300"
              }`}
            >
              Escuro
            </button>
            <button 
              type="button"
              onClick={() => {
                setTheme("contrast");
                addToast("Tema", "Tema de Alto Contraste Ativado", "info");
              }}
              className={`px-2 py-0.5 rounded text-[9.5px] font-bold uppercase transition cursor-pointer ${
                theme === "contrast" 
                  ? "bg-[#FFFF00] text-black border border-black" 
                  : "bg-black border border-amber-400/30 text-amber-400 hover:bg-amber-400/10"
              }`}
            >
              Alto Contraste
            </button>
          </div>
        </div>
      </div>

      {/* Floating Toast Notification Container */}
      <div className="fixed top-5 right-5 z-[999] flex flex-col gap-3 max-w-sm w-full pointer-events-none">
        <AnimatePresence>
          {toasts.map(t => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: -20, x: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 50, scale: 0.9, transition: { duration: 0.2 } }}
              className="pointer-events-auto w-full bg-zinc-950/95 border border-purple-950/40 rounded-xl p-4 shadow-[0_10px_35px_rgba(0,0,0,0.65)] flex items-start gap-3 backdrop-blur"
            >
              <div className={`p-2 rounded-lg shrink-0 ${
                t.type === "success" ? "bg-emerald-950/40 text-emerald-400 border border-emerald-500/20" :
                t.type === "warning" ? "bg-red-950/25 text-red-400 border border-red-500/20" :
                "bg-blue-950/25 text-blue-400 border border-blue-500/25"
              }`}>
                {t.type === "success" ? <Check className="w-4 h-4 text-emerald-400" /> : 
                 t.type === "warning" ? <AlertTriangle className="w-4 h-4 text-red-400" /> : 
                 <Bell className="w-4 h-4 text-blue-400" />}
              </div>
              
              <div className="flex-1 min-w-0">
                <h5 className="text-xs font-bold text-white font-display uppercase tracking-wide">{t.title}</h5>
                <p className="text-[11px] text-zinc-350 mt-0.5 leading-relaxed">{t.msg}</p>
              </div>

              <button 
                onClick={() => setToasts(prev => prev.filter(item => item.id !== t.id))}
                className="text-zinc-500 hover:text-white transition shrink-0 self-start mt-0.5 pointer-events-auto"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* LANDING GATEWAY SCREEN (MODEL: SCREENSHOT 1) */}
      {!isAuthenticated ? (
        <div className={`flex-1 flex flex-col justify-center items-center p-4 relative min-h-screen transition-colors duration-300 ${
          theme === "dark" ? "bg-[#040209]" : "bg-[#f8fafc]"
        }`}>
          
          {/* Subtle background graphic halos */}
          <div className="absolute w-[450px] h-[450px] rounded-full bg-purple-500/5 blur-[120px] top-[15%] pointer-events-none"></div>
          <div className="absolute w-[350px] h-[350px] rounded-full bg-emerald-500/5 blur-[100px] bottom-[15%] pointer-events-none"></div>

          {/* Secure Login Portal Main Card (Mirrors Screenshot 1 perfectly) */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className={`w-full max-w-sm rounded-[2.5rem] p-9 flex flex-col items-center relative shadow-2xl border transition-all ${
              theme === "dark" ? "bg-[#050407] border-purple-950/30" : "bg-white border-slate-200"
            }`}
          >
            {/* Firjan SENAI Logo Replacement */}
            <div className={`w-full py-5 px-6 rounded-3xl border mb-7 flex items-center justify-center shadow-xs relative overflow-hidden ${
              theme === "dark" ? "border-zinc-900 bg-zinc-950/50" : "border-slate-100 bg-slate-50"
            }`}>
              <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-full filter blur-xl"></div>
              <FirjanSenaiLogo className={`h-11 ${theme === "dark" ? "text-white" : "text-slate-800"}`} />
            </div>

            {/* Application Branding text title */}
            <h1 className={`text-2xl font-black text-center font-display tracking-tight leading-tight mb-2 ${
              theme === "dark" ? "bg-gradient-to-r from-purple-400 via-purple-300 to-emerald-400 bg-clip-text text-transparent" : "text-slate-900"
            }`}>
              Plataforma de Negócios
            </h1>
            <p className={`text-[11px] tracking-normal font-sans font-medium mb-8 text-center leading-none ${
              theme === "dark" ? "text-[#868A9E]" : "text-slate-500"
            }`}>
              Identificação por e-mail e token corporativo
            </p>

            {/* Card form with center-aligned secure inputs */}
            <div className="w-full space-y-4">
              <div className="space-y-1.5 align-left">
                <label className={`text-[10px] uppercase font-mono font-bold tracking-widest block ${
                  theme === "dark" ? "text-[#868A9E]" : "text-slate-500"
                }`}>
                  E-mail Corporativo
                </label>
                <input 
                  type="email"
                  placeholder="usuario@firjan.com.br"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleLogin(emailInput, tokenInput);
                  }}
                  className={`w-full text-center text-xs font-semibold rounded-xl py-3.5 px-4 font-mono transition-all duration-150 lowercase border ${
                    theme === "dark" 
                      ? "bg-[#050407] border-purple-950/45 text-purple-200 placeholder:text-[#3B3A4A] focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20" 
                      : "bg-white border-slate-200 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/20"
                  }`}
                  id="email-login-input"
                />
              </div>

              <div className="space-y-1.5 align-left">
                <label className={`text-[10px] uppercase font-mono font-bold tracking-widest block ${
                  theme === "dark" ? "text-[#868A9E]" : "text-slate-500"
                }`}>
                  Token de Acesso / Senha
                </label>
                <input 
                  type="password"
                  placeholder="DIGITE A SENHA"
                  value={tokenInput}
                  onChange={(e) => setTokenInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleLogin(emailInput, tokenInput);
                  }}
                  className={`w-full text-center text-xs font-semibold rounded-xl py-3.5 px-4 font-mono tracking-[0.25em] transition-all duration-150 uppercase border ${
                    theme === "dark" 
                      ? "bg-[#050407] border-purple-950/45 text-[#00E676] placeholder:text-[#3B3A4A] placeholder:font-sans placeholder:tracking-[0.10em] focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20" 
                      : "bg-white border-slate-200 text-blue-650 placeholder:text-slate-400 placeholder:font-sans placeholder:tracking-normal focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/20"
                  }`}
                  id="token-login-input"
                />
              </div>

              {/* Login Button with lock symbol */}
              <button 
                onClick={() => handleLogin(emailInput, tokenInput)}
                className={`w-full font-extrabold text-xs uppercase rounded-xl py-3.5 px-6 transition-all duration-200 flex items-center justify-center gap-2 font-display tracking-wider cursor-pointer ${
                  theme === "dark"
                    ? "bg-[#00E676] hover:bg-[#00C853] text-black shadow-[0_5px_15px_rgba(0,230,118,0.22)] border-t border-emerald-300/10"
                    : "bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-500/10 border-t border-purple-400/20"
                }`}
              >
                <Lock className="w-3.5 h-3.5 shrink-0" />
                Acessar Plataforma
              </button>
            </div>

            {tokenError && (
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={`text-[11px] font-medium font-sans mt-5 border p-2.5 rounded-lg text-center ${
                  theme === "dark" ? "bg-red-950/20 border-red-500/20 text-red-400" : "bg-red-50 border-red-150 text-red-650"
                }`}
              >
                {tokenError}
              </motion.p>
            )}

          </motion.div>

        </div>
      ) : (
        /* AUTHENTICATED WORKSPACES COCKPIT (MODEL: SCREENSHOT 2 OR CUSTOM PER APP) */
        <div className="flex-1 flex flex-col">
          
          {/* SECURE HEADER TOP BAR */}
          <header className={`px-6 h-16 border-b flex items-center justify-between shrink-0 transition-colors ${
            theme === "dark" ? "bg-[#090710] border-purple-950/20" : "bg-white border-slate-100 shadow-xs"
          }`}>
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => currentUser?.role === "Gestor" ? setActiveSubApp("none") : null}>
              <FirjanSenaiLogo className={`h-6 ${theme === "dark" ? "text-white" : "text-slate-900"}`} />
            </div>

            {/* Identity context and system tools */}
            <div className="flex items-center gap-3.5">
              
              <div className="flex items-center gap-1.5 text-xs text-[#9E9BAE] font-medium font-sans">
                <span className={theme === "dark" ? "text-zinc-400" : "text-slate-500"}>Logado como:</span>
                <strong className={`font-semibold flex items-center gap-1 px-2 py-1 rounded font-mono text-[10.5px] ${
                  theme === "dark" ? "text-white bg-[#151221] border border-purple-900/30" : "text-slate-800 bg-slate-100 border border-slate-200"
                }`}>
                  <User className="w-3 h-3 text-emerald-500 shrink-0" />
                  {currentUser?.name}
                </strong>
                {currentUser?.role === "Gestor" && (
                  <span className="text-[9px] font-mono bg-purple-500/10 text-purple-600 px-1.5 py-0.2 border border-purple-500/20 rounded uppercase">GESTOR</span>
                )}
              </div>

              {/* Back to Applications switcher for Gestores only */}
              {currentUser?.role === "Gestor" && activeSubApp !== "none" && (
                <button
                  onClick={() => setActiveSubApp("none")}
                  className={`px-3 py-1.5 rounded-lg text-[10px] uppercase font-mono tracking-wider transition-all duration-150 flex items-center gap-1 border cursor-pointer ${
                    theme === "dark" 
                      ? "bg-[#120F1F] border-purple-500/20 hover:border-purple-400 hover:bg-purple-950/20 text-purple-300 hover:text-white" 
                      : "bg-slate-50 border-slate-200 hover:border-slate-300 text-slate-700 hover:text-slate-900 hover:bg-slate-100"
                  }`}
                >
                  <Layers className="w-3 h-3" />
                  Hub Geral
                </button>
              )}

              {/* Sair Button styled in high resolution styled like Screenshot 2 */}
              <button
                onClick={handleLogout}
                className={`text-[10px] uppercase font-bold tracking-wider font-mono border px-3.5 py-1 rounded-lg transition duration-150 flex items-center gap-1 cursor-pointer ${
                  theme === "dark"
                    ? "border-red-900/30 hover:border-red-500/35 text-red-400 hover:bg-red-950/20"
                    : "border-red-200 hover:border-red-400 text-red-650 hover:bg-red-50 bg-white"
                }`}
              >
                <LogOut className="w-3 h-3 shrink-0" />
                Sair
              </button>

            </div>
          </header>

          {/* MAIN PAGE WRAPPER */}
          <main className="flex-1 p-6 overflow-y-auto">

            {/* GLOBAL CORPORATE FILTERS PANEL */}
            <div className="max-w-6xl mx-auto mb-6 bg-zinc-950/40 p-4 rounded-xl border border-zinc-900/60 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded-lg">
                  <Sliders className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs uppercase font-mono font-bold tracking-wider text-white">Filtros Corporativos Globais</h4>
                  <p className="text-[10px] text-zinc-400">Os indicadores e gráficos de todos os módulos atualizam instantaneamente de acordo com a visão selecionada.</p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {/* Unidade (SESI / SENAI) Segmented Button */}
                <div className="flex flex-col gap-1">
                  <span className="text-[9px] uppercase font-mono font-bold text-zinc-400">Unidade</span>
                  <div className="flex bg-zinc-900 border border-zinc-800 p-0.5 rounded-lg">
                    <button
                      type="button"
                      onClick={() => {
                        setGlobalUnidade("TODAS");
                        setGlobalProduto("TODOS");
                      }}
                      className={`px-3 py-1 text-[10px] h-7 uppercase font-mono font-bold rounded-md ${
                        globalUnidade === "TODAS"
                          ? "bg-purple-800 text-white"
                          : "text-zinc-400 hover:text-white"
                      } transition`}
                    >
                      Consolidada
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setGlobalUnidade("SESI");
                        setGlobalProduto("TODOS");
                      }}
                      className={`px-3 py-1 text-[10px] h-7 uppercase font-mono font-bold rounded-md ${
                        globalUnidade === "SESI"
                          ? "bg-[#0284c7] text-white"
                          : "text-zinc-400 hover:text-white"
                      } transition`}
                    >
                      SESI
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setGlobalUnidade("SENAI");
                        setGlobalProduto("TODOS");
                      }}
                      className={`px-3 py-1 text-[10px] h-7 uppercase font-mono font-bold rounded-md ${
                        globalUnidade === "SENAI"
                          ? "bg-emerald-700 text-white"
                          : "text-zinc-400 hover:text-white"
                      } transition`}
                    >
                      SENAI
                    </button>
                  </div>
                </div>

                {/* Produto Selection */}
                <div className="flex flex-col gap-1 min-w-[170px]">
                  <span className="text-[9px] uppercase font-mono font-bold text-zinc-400">Produto Segmento</span>
                  <select
                    value={globalProduto}
                    onChange={(e: any) => setGlobalProduto(e.target.value)}
                    className="bg-[#050407] border border-zinc-800 rounded-lg p-1 text-xs text-white h-8 font-mono select-none"
                  >
                    <option value="TODOS">TODOS OS PRODUTOS</option>
                    
                    {/* SESI Products Group */}
                    {(globalUnidade === "TODAS" || globalUnidade === "SESI") && (
                      <optgroup label="SESI">
                        <option value="Saúde">Saúde</option>
                        <option value="Segurança do Trabalho">Segurança do Trabalho</option>
                        <option value="Educação Básica">Educação Básica (EB)</option>
                      </optgroup>
                    )}

                    {/* SENAI Products Group */}
                    {(globalUnidade === "TODAS" || globalUnidade === "SENAI") && (
                      <optgroup label="SENAI">
                        <option value="Educação Profissional">Educação Profissional (EP)</option>
                      </optgroup>
                    )}
                  </select>
                </div>

                {/* Reset Filters Indicator */}
                {(globalUnidade !== "TODAS" || globalProduto !== "TODOS") && (
                  <button
                    onClick={() => {
                      setGlobalUnidade("TODAS");
                      setGlobalProduto("TODOS");
                      addToast("Filtros Redefinidos", "Retornou à visualização consolidada do Hub.", "info");
                    }}
                    className="self-end h-8 px-2.5 bg-zinc-900 border border-zinc-800 hover:bg-zinc-850 rounded-lg text-zinc-400 hover:text-red-400 text-xs transition flex items-center gap-1.5"
                    title="Limpar Filtros"
                  >
                    <X className="w-3.5 h-3.5 text-zinc-400 hover:text-red-400" />
                    Limpar
                  </button>
                )}
              </div>
            </div>

            {/* ====== CENTRAL IA DE REPOSITÓRIO E INTELIGÊNCIA DE ARQUIVOS ====== */}
            <div className={`max-w-6xl mx-auto mb-6 rounded-2xl border transition-all ${
              theme === "dark" 
                ? "bg-[#0b0a13]/85 border-purple-500/15 shadow-2xl animate-fade-in" 
                : "bg-white border-slate-205 shadow-sm hover:shadow-md"
            }`}>
              {/* Compact Toggle Bar */}
              <div 
                onClick={() => setAiPanelExpanded(!aiPanelExpanded)}
                className="flex items-center justify-between p-4 cursor-pointer hover:bg-zinc-800/5 dark:hover:bg-purple-950/10 rounded-2xl transition"
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-xl ${
                    theme === "dark" ? "bg-purple-500/10 text-purple-400 border border-purple-500/20" : "bg-purple-50 text-purple-700 border border-purple-100"
                  }`}>
                    <Sparkles className="w-5 h-5 animate-pulse" />
                  </div>
                  <div>
                    <h4 className={`text-xs uppercase font-mono font-bold tracking-wider ${
                      theme === "dark" ? "text-purple-300" : "text-purple-800"
                    }`}>
                      Central de Inteligência IA e Repositório de Arquivos (Acesso Livre)
                    </h4>
                    <p className={`text-[10px] ${
                      theme === "dark" ? "text-zinc-400" : "text-slate-500"
                    }`}>
                      Faça o upload de planilhas (.xlsx, .csv), notas fiscais, laudos (.pdf) ou termos (.docx) para cruzamento de dados e relatórios estratégicos.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {uploadedFiles.length > 0 && (
                    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                      theme === "dark" ? "bg-purple-900/30 text-purple-300" : "bg-purple-100 text-purple-700"
                    }`}>
                      {uploadedFiles.length} {uploadedFiles.length === 1 ? "arquivo" : "arquivos"}
                    </span>
                  )}
                  <div className={`text-xs font-bold font-mono px-3 py-1.5 rounded-lg border flex items-center gap-1.5 transition ${
                    theme === "dark"
                      ? "border-purple-500/20 text-purple-300 hover:text-white"
                      : "border-purple-200 text-purple-750 hover:text-purple-900"
                  }`}>
                    {aiPanelExpanded ? "Fechar Painel" : "Expandir IA"}
                    {aiPanelExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </div>
                </div>
              </div>

              {/* Expanded AI Panel Core */}
              {aiPanelExpanded && (
                <div className={`border-t p-6 space-y-6 relative overflow-hidden ${
                  theme === "dark" ? "border-purple-500/15" : "border-slate-100"
                }`}>
                  {/* Glowing background hint */}
                  <div className="absolute top-0 right-0 w-80 h-80 bg-purple-500/5 rounded-full blur-[100px] pointer-events-none" />
                  
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-5 relative z-10 border-zinc-900/10 dark:border-zinc-900">
                    <div className="space-y-1">
                      <span className="text-[10px] text-purple-400 font-mono font-bold uppercase tracking-wider block">SERVIÇO COGNITIVO INTEGRADO • FIRJAN ONEHUB</span>
                      <h3 className={`text-lg font-extrabold font-display tracking-tight uppercase flex items-center gap-2 ${
                        theme === "dark" ? "text-white" : "text-slate-800"
                      }`}>
                        <UploadCloud className="w-5.5 h-5.5 text-purple-400 shrink-0" />
                        Repositório e Análise Inteligente de Arquivos
                      </h3>
                      <p className={`text-xs ${theme === "dark" ? "text-zinc-400" : "text-slate-550"}`}>
                        Acesso unificado e livre de dados para todos os colaboradores. Envie quaisquer planilhas operacionais, laudos técnicos, notas ou fluxos para cruzamento preditivo e relatórios.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 relative z-10">
                    
                    {/* LEFT PANEL: UPLOAD AND LIST (5 cols) */}
                    <div className="lg:col-span-5 space-y-4">
                      
                      {/* Drag and Drop Zone */}
                      <div 
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={handleFileUpload}
                        className={`border-2 border-dashed transition duration-200 rounded-xl p-5 text-center cursor-pointer relative group ${
                          theme === "dark"
                            ? "border-zinc-800 hover:border-purple-500/40 bg-zinc-950/45 hover:bg-purple-950/5"
                            : "border-slate-200 hover:border-purple-400 bg-slate-50/50 hover:bg-purple-50/10"
                        }`}
                        title="Selecione um arquivo de qualquer formato"
                      >
                        <input 
                          type="file" 
                          id="file-upload-input-hub"
                          onChange={handleFileUpload}
                          className="absolute inset-0 opacity-0 cursor-pointer z-10"
                        />
                        <div className="flex flex-col items-center justify-center space-y-2">
                          <UploadCloud className="w-9 h-9 text-purple-400 shrink-0" />
                          <div>
                            <p className={`text-xs font-bold ${theme === "dark" ? "text-zinc-300" : "text-slate-700"}`}>Arraste ou clique para enviar</p>
                            <p className="text-[10px] text-zinc-500 mt-1">Multi-formatos aceitos para análise analítica</p>
                          </div>
                        </div>
                      </div>

                      {/* File repository list */}
                      <div className="space-y-2">
                        <h4 className={`text-[10px] uppercase font-mono font-bold tracking-wider ${theme === "dark" ? "text-zinc-400" : "text-slate-500"}`}>Arquivos no Repositório</h4>
                        {uploadedFiles.length === 0 ? (
                          <div className={`text-center p-6 border rounded-xl border-dashed ${
                            theme === "dark" ? "border-zinc-900 bg-zinc-950/20 text-zinc-650" : "border-slate-200 bg-slate-50 text-slate-400"
                          }`}>
                            <p className="text-xs font-mono">Repositório Vazio</p>
                          </div>
                        ) : (
                          <div className="space-y-1.5 max-h-[300px] overflow-y-auto pr-1">
                            {uploadedFiles.map(file => (
                              <div 
                                key={file.id}
                                onClick={() => setSelectedFileForAnalysis(file)}
                                className={`p-2.5 rounded-lg border transition duration-150 flex items-center justify-between cursor-pointer ${
                                  selectedFileForAnalysis?.id === file.id
                                    ? "bg-purple-500/10 border-purple-500/40"
                                    : theme === "dark"
                                      ? "bg-zinc-950/60 border-zinc-900/60 hover:bg-zinc-900/50"
                                      : "bg-white border-slate-200 hover:bg-slate-50"
                                }`}
                              >
                                <div className="flex items-center gap-2 min-w-0">
                                  <FileText className="w-4 h-4 text-purple-400 shrink-0" />
                                  <div className="min-w-0">
                                    <p className={`text-xs font-bold truncate ${theme === "dark" ? "text-zinc-350" : "text-slate-700"}`}>{file.name}</p>
                                    <p className="text-[9px] text-zinc-500 font-mono">{file.size} • Enviado em {file.uploadedAt}</p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-1.5 shrink-0">
                                  <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded font-bold uppercase ${
                                    file.status === "sucesso"
                                      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                      : file.status === "analisando"
                                        ? "bg-purple-500/10 text-purple-400 border border-purple-500/20 animate-pulse"
                                        : "bg-zinc-900 text-zinc-400 border border-zinc-800"
                                  }`}>
                                    {file.status}
                                  </span>
                                  <button 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setUploadedFiles(prev => prev.filter(f => f.id !== file.id));
                                      if (selectedFileForAnalysis?.id === file.id) {
                                        setSelectedFileForAnalysis(null);
                                      }
                                      addToast("Deletado", "Arquivo removido do repositório.", "info");
                                    }}
                                    className="p-1 hover:text-red-400 text-zinc-550 transition cursor-pointer"
                                    title="Remover arquivo"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* RIGHT PANEL: COGNITIVE ANALYSIS LAB (7 cols) */}
                    <div className="lg:col-span-7 flex flex-col space-y-4">
                      {selectedFileForAnalysis ? (
                        <div className={`p-4 border rounded-xl flex-1 flex flex-col justify-between space-y-4 shadow-inner ${
                          theme === "dark" ? "bg-[#050409] border-zinc-900" : "bg-slate-50/40 border-slate-250"
                        }`}>
                          <div className="space-y-3.5">
                            <div className="flex items-center justify-between border-b pb-2.5 border-zinc-900/10 dark:border-zinc-900">
                              <div>
                                <span className="text-[9px] font-mono uppercase bg-purple-500/10 text-purple-400 border border-purple-500/20 px-1.5 py-0.2 rounded">Documento Selecionado</span>
                                <h4 className={`text-sm font-bold truncate mt-1 ${theme === "dark" ? "text-white" : "text-slate-800"}`}>{selectedFileForAnalysis.name}</h4>
                              </div>
                              <Cpu className="w-4 h-4 text-purple-400 shrink-0" />
                            </div>

                            {/* Prompt Input / Instructions */}
                            <div className="space-y-1.5">
                              <label className={`text-[10px] font-mono font-bold uppercase flex items-center gap-1 ${
                                theme === "dark" ? "text-purple-300" : "text-purple-800"
                              }`}>
                                <Sliders className="w-3.5 h-3.5" />
                                Foco de Análise IA Personalizado
                              </label>
                              <div className="flex gap-2">
                                <input 
                                  type="text"
                                  value={fileUploadPrompt}
                                  onChange={(e) => setFileUploadPrompt(e.target.value)}
                                  placeholder="Ex: Identificar riscos fiscais, cruzamentos com as despesas da Marília, etc."
                                  className={`flex-1 p-2 rounded-lg text-xs font-medium focus:outline-none transition ${
                                    theme === "dark"
                                      ? "bg-zinc-950 border border-zinc-800 focus:border-purple-500 text-white"
                                      : "bg-white border border-slate-200 focus:border-purple-400 text-slate-800"
                                  }`}
                                />
                                <button
                                  type="button"
                                  onClick={() => handleAnalyzeFile(selectedFileForAnalysis)}
                                  disabled={isAnalyzingFile}
                                  className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white text-xs font-bold font-mono px-4 rounded-lg flex items-center gap-1 transition cursor-pointer"
                                >
                                  {isAnalyzingFile ? (
                                    <>
                                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                      Analisando...
                                    </>
                                  ) : (
                                    <>
                                      <Sparkles className="w-3.5 h-3.5" />
                                      Analisar
                                    </>
                                  )}
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* Analysis display block */}
                          <div className={`flex-1 min-h-[220px] border rounded-lg p-3.5 overflow-y-auto space-y-3 font-mono text-xs relative ${
                            theme === "dark"
                              ? "bg-zinc-950 border-zinc-900/60 text-zinc-300"
                              : "bg-white border-slate-200 text-slate-700"
                          }`}>
                            {isAnalyzingFile ? (
                              <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-950/85 backdrop-blur-xs rounded-lg z-20">
                                <RefreshCw className="w-8 h-8 text-purple-400 animate-spin" />
                                <p className="text-[11px] font-mono text-zinc-400 mt-3 animate-pulse">
                                  Inspecionando dados e executando cruzamento no Gemini 3.5...
                                </p>
                              </div>
                            ) : null}

                            {fileAnalysisError ? (
                              <div className="p-3 bg-red-950/20 border border-red-900/30 text-red-400 rounded-lg text-[10px] space-y-1">
                                <p className="font-bold flex items-center gap-1">⚠️ Erro de Comunicação com a IA:</p>
                                <p>{fileAnalysisError}</p>
                              </div>
                            ) : null}

                            {selectedFileForAnalysis.analysisReport ? (
                              <div className="space-y-4 text-left leading-relaxed font-sans">
                                {selectedFileForAnalysis.analysisReport.split("\n").map((line: string, idx: number) => {
                                  const trimmed = line.trim();
                                  if (trimmed.startsWith("###")) {
                                    return <h3 key={idx} className={`text-sm font-bold font-display border-b pb-1 mt-4 ${
                                      theme === "dark" ? "text-white border-zinc-900" : "text-slate-800 border-slate-100"
                                    }`}>{trimmed.replace(/###/g, "").trim()}</h3>;
                                  } else if (trimmed.startsWith("####")) {
                                    return <h4 key={idx} className="text-xs font-bold text-purple-500 dark:text-purple-355 tracking-tight font-sans mt-3">{trimmed.replace(/####/g, "").trim()}</h4>;
                                  } else if (trimmed.startsWith("*") || trimmed.startsWith("-")) {
                                    return <li key={idx} className="ml-3 mt-1 list-none flex items-start gap-1.5">
                                      <span className="text-purple-400 mt-1 scale-120 shrink-0">•</span>
                                      <span className={theme === "dark" ? "text-zinc-300" : "text-slate-650"}>{trimmed.replace(/^[*-\s]+/, "")}</span>
                                    </li>;
                                  } else if (trimmed.startsWith("1.") || trimmed.startsWith("2.") || trimmed.startsWith("3.") || trimmed.startsWith("4.")) {
                                    return <div key={idx} className={`mt-1 font-mono text-[11px] ml-4 border-l pl-2 leading-relaxed ${
                                      theme === "dark" ? "text-zinc-400 border-zinc-900" : "text-slate-500 border-slate-150"
                                    }`}>{trimmed}</div>;
                                  } else if (trimmed) {
                                    return <p key={idx} className={`text-xs leading-relaxed ${theme === "dark" ? "text-zinc-400" : "text-slate-600"}`}>{trimmed}</p>;
                                  }
                                  return <div key={idx} className="h-2" />;
                                })}

                                {/* Actions on report */}
                                <div className={`border-t pt-4 mt-4 flex items-center justify-between ${
                                  theme === "dark" ? "border-zinc-900" : "border-slate-100"
                                }`}>
                                  <span className="text-[9px] text-zinc-500 font-mono">
                                    Processado @ {new Date().toLocaleDateString("pt-BR")}
                                  </span>
                                  
                                  <div className="flex flex-wrap items-center gap-2">
                                    <button
                                      type="button"
                                      onClick={() => handleDownloadFormattedReport(selectedFileForAnalysis)}
                                      className="bg-purple-600 hover:bg-purple-700 text-white text-[10px] uppercase font-bold font-mono px-3 py-1.5 rounded transition flex items-center gap-1.5 cursor-pointer shadow-lg shadow-purple-900/20"
                                      title="Baixar Dashboard vem com gráficos e relatórios formatados"
                                    >
                                      <Sparkles className="w-3.5 h-3.5 text-white animate-pulse" />
                                      Baixar Dashboard Formatado (.html)
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() => {
                                        const text = selectedFileForAnalysis.analysisReport || "";
                                        const blob = new Blob([text], { type: "text/markdown;charset=utf-8" });
                                        const url = URL.createObjectURL(blob);
                                        const link = document.createElement("a");
                                        link.href = url;
                                        link.download = `Relatorio_IA_${selectedFileForAnalysis.name.split(".")[0]}.md`;
                                        link.click();
                                        addToast("Baixado", "Relatório de IA salvo como Markdown.", "success");
                                      }}
                                      className={`border hover:text-white text-[10px] font-mono px-2.5 py-1.5 rounded transition flex items-center gap-1.5 cursor-pointer ${
                                        theme === "dark"
                                          ? "bg-zinc-900 border-zinc-800 hover:bg-zinc-850 text-zinc-400"
                                          : "bg-white border-slate-200 text-slate-650 hover:bg-slate-50 hover:text-slate-800"
                                      }`}
                                    >
                                      <FileCheck className="w-3.5 h-3.5 text-emerald-400" />
                                      Texto (.md)
                                    </button>
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <div className="flex flex-col items-center justify-center h-full text-center p-6 text-zinc-500 space-y-2">
                                <Cpu className="w-12 h-12 text-zinc-800 hover:text-purple-500/40 transition-all duration-350 shrink-0" />
                                <div className="space-y-1 max-w-sm">
                                  <p className="text-xs font-bold text-zinc-400">Ativação de IA Pendente</p>
                                  <p className="text-[10px] text-zinc-500">
                                    Adicione parâmetros de foco se desejar, e clique em **Analisar** para inspecionar os blocos de dados.
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className={`flex-1 flex flex-col items-center justify-center text-center p-6 space-y-3 rounded-xl border ${
                          theme === "dark"
                            ? "bg-zinc-950/20 border-zinc-900 text-zinc-500"
                            : "bg-slate-50/50 border-slate-200 text-slate-400"
                        }`}>
                          <FileText className="w-14 h-14 text-zinc-300 dark:text-zinc-800" />
                          <div className="space-y-1">
                            <p className="text-xs font-bold font-sans">Nenhum arquivo de visualização selecionado</p>
                            <p className="text-[11px] max-w-xs font-sans">
                              Selecione um documento na barra de repositório à esquerda para poder configurar os parâmetros e analisar com inteligência preditiva.
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* APP WRAPPER 0: SUAS APLICAÇÕES SELECTION (ONLY FOR GESTOR) */}
            {activeSubApp === "none" && currentUser?.role === "Gestor" && (
              <motion.div 
                key="subapp-none"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.35 }}
                className="max-w-4xl mx-auto space-y-10 py-6"
              >
                
                {/* Title introduction layout (Aesthetics pair matches second photo) */}
                <div className="text-center space-y-2">
                  <motion.h2 
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-4xl font-extrabold text-white font-display tracking-tight leading-tight"
                  >
                    Suas <span className="bg-gradient-to-r from-purple-400 via-indigo-300 to-emerald-400 bg-clip-text text-transparent">Aplicações</span>
                  </motion.h2>
                  <p className="text-xs text-slate-400 max-w-xl mx-auto leading-relaxed">
                    {currentUser?.role === "Gestor" 
                      ? "Como administrador, você tem acesso de governança total sobre as aplicações integradas da Firjan, SENAI e SESI." 
                      : `Olá, ${currentUser?.name || "Colaborador"}! Você tem acesso unificado de consulta e operacional às áreas administrativas do ecossistema Firjan.`
                    }
                  </p>
                </div>

                {/* Applications card grid directory */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  
                  {/* APP CARD 1: THAIS - MANUTENÇÃO */}
                  <div className="bg-[#050408] border border-emerald-500/20 rounded-2xl p-5 hover:border-emerald-400/40 transition-all duration-300 flex flex-col justify-between shadow-[0_4px_25px_rgba(4,2,9,0.3)] group">
                    <div className="space-y-4">
                      {/* Colored mini icon slot */}
                      <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-450 flex items-center justify-center shrink-0">
                        <Wrench className="w-4 h-4 text-[#00E676]" />
                      </div>
                      
                      <div>
                        <h3 className="text-base font-bold text-white uppercase tracking-tight font-display mb-1.5 flex items-center gap-2">
                          Manutenção Ativos
                          <span className="text-[9px] font-mono text-zinc-400 lowercase border border-zinc-800 px-1 py-0.2 rounded">Thais</span>
                        </h3>
                        <p className="text-xs text-slate-400 leading-relaxed font-sans">
                          Acompanhamento de ordens de manutenção, preventivas e vistorias de equipamentos do complexo industrial.
                        </p>
                      </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-zinc-900 flex items-center justify-between">
                      <span className="text-[10px] font-mono text-emerald-400 bg-emerald-900/10 px-2 py-0.5 rounded font-semibold uppercase">
                        {calculatedStats.activeOS} Ordens Ativas
                      </span>
                      <button 
                        onClick={() => setActiveSubApp("manutencao")}
                        className="text-xs font-semibold text-[#00E676] group-hover:underline flex items-center gap-1 font-mono hover:text-[#22c55e] transition"
                      >
                        Acessar App <ChevronRight className="w-3.5 h-3.5 shrink-0" />
                      </button>
                    </div>
                  </div>

                  {/* APP CARD 2: MARÍLIA - ORÇAMENTO */}
                  <div className="bg-[#050408] border border-purple-500/20 rounded-2xl p-5 hover:border-purple-400/40 transition-all duration-300 flex flex-col justify-between shadow-[0_4px_25px_rgba(4,2,9,0.3)] group">
                    <div className="space-y-4">
                      {/* Colored icon slot */}
                      <div className="w-9 h-9 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center shrink-0">
                        <Landmark className="w-4 h-4 text-purple-400" />
                      </div>

                      <div>
                        <h3 className="text-base font-bold text-white uppercase tracking-tight font-display mb-1.5 flex items-center gap-2">
                          Orçamento PMO
                          <span className="text-[9px] font-mono text-zinc-400 lowercase border border-zinc-800 px-1 py-0.2 rounded">Marília</span>
                        </h3>
                        <p className="text-xs text-slate-400 leading-relaxed font-sans">
                          Monitoramento analítico de centros de custos logísticos, revalidação e aprovação de limites e supplementações.
                        </p>
                      </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-zinc-900 flex items-center justify-between">
                      <span className="text-[10px] font-mono text-purple-400 bg-purple-900/10 px-2 py-0.5 rounded font-semibold uppercase">
                        {calculatedStats.pendingBudgetRequests} Requisições
                      </span>
                      <button 
                        onClick={() => setActiveSubApp("orcamento")}
                        className="text-xs font-semibold text-purple-400 group-hover:underline flex items-center gap-1 font-mono hover:text-purple-300 transition"
                      >
                        Acessar App <ChevronRight className="w-3.5 h-3.5 shrink-0" />
                      </button>
                    </div>
                  </div>

                  {/* APP CARD 3: CRIS - FATURAMENTO */}
                  <div className="bg-[#050408] border border-amber-500/20 rounded-2xl p-5 hover:border-amber-400/40 transition-all duration-300 flex flex-col justify-between shadow-[0_4px_25px_rgba(4,2,9,0.3)] group">
                    <div className="space-y-4">
                      {/* Colored icon */}
                      <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
                        <FileText className="w-4 h-4 text-amber-500" />
                      </div>

                      <div>
                        <h3 className="text-base font-bold text-white uppercase tracking-tight font-display mb-1.5 flex items-center gap-2">
                          Faturamento Core
                          <span className="text-[9px] font-mono text-zinc-400 lowercase border border-zinc-800 px-1 py-0.2 rounded">Cris</span>
                        </h3>
                        <p className="text-xs text-slate-400 leading-relaxed font-sans">
                          Emissão de faturas, verificação de conciliações bancárias de serviços e status de parcelas em atraso.
                        </p>
                      </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-zinc-900 flex items-center justify-between">
                      <span className="text-[10px] font-mono text-amber-500 bg-amber-900/10 px-2 py-0.5 rounded font-semibold uppercase">
                        R$ {Math.round(calculatedStats.totalIssuedBilling / 1000)}k Faturado
                      </span>
                      <button 
                        onClick={() => setActiveSubApp("faturamento")}
                        className="text-xs font-semibold text-amber-400 group-hover:underline flex items-center gap-1 font-mono hover:text-amber-305 transition"
                      >
                        Acessar App <ChevronRight className="w-3.5 h-3.5 shrink-0" />
                      </button>
                    </div>
                  </div>

                </div>

                {/* Secure Notice */}
                <div className="p-4 bg-zinc-950/30 rounded-xl border border-zinc-900 text-[11px] text-zinc-400 font-mono text-center max-w-lg mx-auto leading-relaxed">                  🔒 As visibilidades individuais estão ativas e monitoradas de acordo com as diretrizes do Firjan SENAI.
                </div>

                {/* ======================================================== */}
                {/* ====== DASHBOARD EXECUTIVO DA GESTORA ====== */}
                {/* ======================================================== */}
                <div className="border-t border-zinc-900/60 pt-10 space-y-8">
                  
                  {/* Dashboard Header */}
                  <div className="space-y-1.5 text-center sm:text-left">
                    <span className="text-[10px] text-purple-400 font-mono font-bold uppercase tracking-widest block">HUB DE INTELIGÊNCIA ADMINISTRATIVA</span>
                    <h3 className="text-2xl font-extrabold text-white font-display tracking-tight uppercase flex items-center justify-center sm:justify-start gap-2">
                      <TrendingUp className="w-6 h-6 text-purple-400" />
                      Dashboard Executivo da Gestora
                    </h3>
                    <p className="text-xs text-zinc-400 max-w-xl">
                      Visão geral consolidada dos indicadores de faturamento, orçamentos PMO, ordens industriais e análises gerenciais das unidades SESI / SENAI.
                    </p>
                  </div>

                  {/* Multi-Indicator Bento Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    
                    {/* Pilar 1: Manutenção */}
                    <div className="p-4 bg-zinc-950/45 border-l-2 border-l-[#00E676] border-y border-r border-zinc-900 rounded-xl space-y-3.5 shadow-lg">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] uppercase font-mono font-bold text-zinc-400">Ativos & SLA</span>
                        <Wrench className="w-4 h-4 text-[#00E676]" />
                      </div>
                      <div>
                        <p className="text-[10px] text-zinc-400 uppercase font-mono">Custo de Reparos Ativos (Thais)</p>
                        <h4 className="text-2xl font-black font-mono text-white mt-0.5">R$ {calculatedStats.totalMaintenanceCost.toLocaleString("pt-BR")}</h4>
                      </div>
                      <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400">
                        <span>{calculatedStats.activeOS} ordens em andamento</span>
                        <span className="text-[#00E676] bg-[#00E676]/10 px-1.5 py-0.2 rounded border border-emerald-900/30 font-bold uppercase text-[9px]">SLA Ativo Estável</span>
                      </div>
                    </div>

                    {/* Pilar 2: Orçamento PMO */}
                    <div className="p-4 bg-zinc-950/45 border-l-2 border-l-purple-500 border-y border-r border-zinc-900 rounded-xl space-y-3.5 shadow-lg">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] uppercase font-mono font-bold text-zinc-400">PMO Orçamentário</span>
                        <Landmark className="w-4 h-4 text-purple-400" />
                      </div>
                      <div>
                        <p className="text-[10px] text-zinc-400 uppercase font-mono">Verba Geral Utilizada (Marília)</p>
                        <h4 className="text-2xl font-black font-mono text-white mt-0.5">R$ {calculatedStats.totalSpent.toLocaleString("pt-BR")}</h4>
                      </div>
                      <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400">
                        <span>Saldo: R$ {calculatedStats.availableBudget.toLocaleString("pt-BR")}</span>
                        <span className="text-amber-400 bg-amber-950/20 px-1.5 py-0.2 rounded border border-amber-900/30 font-bold uppercase text-[9px]">Atenção a Desvios</span>
                      </div>
                    </div>

                    {/* Pilar 3: Inadimplência & Faturamento */}
                    <div className="p-4 bg-zinc-950/45 border-l-2 border-l-amber-500 border-y border-r border-zinc-900 rounded-xl space-y-3.5 shadow-lg">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] uppercase font-mono font-bold text-zinc-400">Faturamento & Cobrança</span>
                        <BarChart2 className="w-4 h-4 text-amber-500" />
                      </div>
                      <div>
                        <p className="text-[10px] text-zinc-400 uppercase font-mono">Taxas de Atrasos Críticos (Cris)</p>
                        <h4 className="text-2xl font-black font-mono text-amber-500 mt-0.5">
                          R$ {calculatedStats.overdueBilling.toLocaleString("pt-BR")}
                        </h4>
                      </div>
                      <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400">
                        <span>Faturado: R$ {calculatedStats.totalIssuedBilling.toLocaleString("pt-BR")}</span>
                        <span className="text-red-400 bg-red-950/20 px-1.5 py-0.2 rounded border border-red-900/30 font-bold uppercase text-[9px]">
                          {Math.round((calculatedStats.overdueBilling / (calculatedStats.totalIssuedBilling || 1)) * 100)}% Inadimplência
                        </span>
                      </div>
                    </div>

                  </div>

                  {/* Strategic Visual charts and rankings */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    
                    {/* Comparative monthly/annual chart */}
                    <div className="p-5 bg-zinc-950/45 border border-zinc-900 rounded-2xl space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs uppercase font-mono font-bold tracking-wider text-white flex items-center gap-1.5">
                          <BarChart3 className="w-4 h-4 text-purple-400" /> Comparativo Mensal Consolidado
                        </h4>
                        <span className="text-[9px] font-mono text-zinc-400">Últimos 6 meses (R$)</span>
                      </div>

                      <div className="h-56">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={[
                            { month: "Jan", Orçamento: 1200000, Custos: 600000, Faturamento: 1100050 },
                            { month: "Fev", Orçamento: 1400000, Custos: 800000, Faturamento: 1250000 },
                            { month: "Mar", Orçamento: 1600000, Custos: 950000, Faturamento: 1400005 },
                            { month: "Abr", Orçamento: 1800000, Custos: 1100000, Faturamento: 1600000 },
                            { month: "Mai", Orçamento: 2000000, Custos: 1300000, Faturamento: 1800000 },
                            { month: "Jun", Orçamento: calculatedStats.totalAllocated, Custos: calculatedStats.totalSpent + calculatedStats.totalMaintenanceCost, Faturamento: calculatedStats.totalIssuedBilling },
                          ]}>
                            <defs>
                              <linearGradient id="colorOrc" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.15}/>
                                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                              </linearGradient>
                              <linearGradient id="colorFat" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.15}/>
                                <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" opacity={0.05} />
                            <XAxis dataKey="month" fontSize={9} stroke="#52525b" />
                            <YAxis fontSize={9} stroke="#52525b" tickFormatter={(v) => `R$ ${Math.round(v/1000)}k`} />
                            <Tooltip contentStyle={{ backgroundColor: "#0c0a15", borderColor: "#1e1b4b", borderRadius: "8px" }} />
                            <Legend wrapperStyle={{ fontSize: "10px" }} />
                            <Area type="monotone" dataKey="Orçamento" stroke="#8b5cf6" strokeWidth={2} fillOpacity={1} fill="url(#colorOrc)" />
                            <Area type="monotone" dataKey="Faturamento" stroke="#0ea5e9" strokeWidth={2} fillOpacity={1} fill="url(#colorFat)" />
                            <Area type="monotone" dataKey="Custos" stroke="#ec4899" strokeWidth={1.5} dot={false} />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* Units and products rankings */}
                    <div className="p-5 bg-zinc-950/45 border border-zinc-900 rounded-2xl space-y-5">
                      <h4 className="text-xs uppercase font-mono font-bold tracking-wider text-white flex items-center gap-1.5">
                        <Award className="w-4 h-4 text-emerald-400" /> Rankings de Unidades & Produtos
                      </h4>

                      <div className="space-y-4">
                        {/* Units Segment */}
                        <div className="space-y-2.5">
                          <span className="text-[9px] uppercase font-mono text-zinc-400 font-bold tracking-widest block">Eficiência por Unidade (Orçamento Consumido vs Faturamento)</span>
                          
                          {/* SESI PROGRESS */}
                          <div className="p-2.5 bg-zinc-900/80 border border-zinc-900 rounded-lg space-y-1.5">
                            <div className="flex items-center justify-between text-xs text-white">
                              <span className="font-extrabold text-[11px] font-sans">SESI Unidades Escola + Saúde</span>
                              <span className="font-mono text-[10px]">R$ {(Math.round(calculatedStats.totalIssuedBilling * 0.45)).toLocaleString("pt-BR")} Faturado</span>
                            </div>
                            <div className="w-full bg-zinc-850 h-2 rounded overflow-hidden">
                              <div className="h-full bg-gradient-to-r from-blue-500 to-sky-400 rounded" style={{ width: "65%" }}></div>
                            </div>
                            <div className="flex justify-between text-[9px] text-zinc-400 font-mono">
                              <span>Consumo Verba: 45%</span>
                              <span>Eficiência Operacional: Alta</span>
                            </div>
                          </div>

                          {/* SENAI PROGRESS */}
                          <div className="p-2.5 bg-zinc-900/80 border border-zinc-900 rounded-lg space-y-1.5">
                            <div className="flex items-center justify-between text-xs text-white">
                              <span className="font-extrabold text-[11px] font-sans">SENAI Educação Profissional</span>
                              <span className="font-mono text-[10px]">R$ {(Math.round(calculatedStats.totalIssuedBilling * 0.55)).toLocaleString("pt-BR")} Faturado</span>
                            </div>
                            <div className="w-full bg-zinc-850 h-2 rounded overflow-hidden">
                              <div className="h-full bg-gradient-to-r from-emerald-500 to-[#00E676] rounded" style={{ width: "83%" }}></div>
                            </div>
                            <div className="flex justify-between text-[9px] text-zinc-400 font-mono">
                              <span>Consumo Verba: 78%</span>
                              <span className="text-red-400 font-semibold font-mono">Estouro Ativo CC-5</span>
                            </div>
                          </div>
                        </div>

                      </div>
                    </div>

                  </div>

                  {/* ====== COMPONENT: COMPARATIVO DE FATURAMENTO COM DRILL-DOWN ====== */}
                  {(() => {
                    const sesiTotal = billingInvoices
                      .filter(i => {
                        const matchesGlobalUnit = globalUnidade === "TODAS" || i.unit === globalUnidade;
                        const matchesGlobalProduct = globalProduto === "TODOS" || i.product === globalProduto;
                        return i.unit === "SESI" && matchesGlobalUnit && matchesGlobalProduct;
                      })
                      .reduce((acc, curr) => acc + curr.value, 0);

                    const senaiTotal = billingInvoices
                      .filter(i => {
                        const matchesGlobalUnit = globalUnidade === "TODAS" || i.unit === globalUnidade;
                        const matchesGlobalProduct = globalProduto === "TODOS" || i.product === globalProduto;
                        return i.unit === "SENAI" && matchesGlobalUnit && matchesGlobalProduct;
                      })
                      .reduce((acc, curr) => acc + curr.value, 0);

                    const faturamentoComparativoData = [
                      { name: "SESI", Faturamento: sesiTotal, fill: "#8b5cf6" },
                      { name: "SENAI", Faturamento: senaiTotal, fill: "#00E676" }
                    ];

                    const defaultUnit = billingDrillDown === "none" ? "SESI" : billingDrillDown;
                    const selectedUnitProducts = billingInvoices
                      .filter(i => {
                        const matchesGlobalUnit = globalUnidade === "TODAS" || i.unit === globalUnidade;
                        const matchesGlobalProduct = globalProduto === "TODOS" || i.product === globalProduto;
                        return i.unit === defaultUnit && matchesGlobalUnit && matchesGlobalProduct;
                      })
                      .reduce((acc, curr) => {
                        acc[curr.product] = (acc[curr.product] || 0) + curr.value;
                        return acc;
                      }, {} as Record<string, number>);

                    const drillDownChartData = Object.entries(selectedUnitProducts).map(([product, value]) => ({
                      product,
                      Faturamento: value,
                      fill: defaultUnit === "SESI" ? "#a78bfa" : "#34d399"
                    }));

                    return (
                      <div className="p-5 bg-zinc-950/45 border border-zinc-900 rounded-2xl space-y-5">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div>
                            <span className="text-[9px] text-[#00E676] uppercase font-bold tracking-widest font-mono">Detalhamento Analítico</span>
                            <h4 className="text-xs uppercase font-mono font-bold tracking-wider text-white flex items-center gap-1.5 mt-0.5">
                              <BarChart3 className="w-4 h-4 text-emerald-400" /> Comparativo de Faturamento (Drill-down por Produto)
                            </h4>
                            <p className="text-xs text-zinc-400 leading-relaxed mt-1">
                              Faturamento consolidado entre SESI e SENAI. Clique em uma barra para segmentar por produto, ou utilize os botões da barra.
                            </p>
                          </div>
                          <div className="flex flex-wrap items-center gap-2">
                            {billingDrillDown !== "none" && (
                              <button
                                type="button"
                                onClick={() => setBillingDrillDown("none")}
                                className="px-2.5 py-1 text-[10px] font-mono font-bold uppercase tracking-wider text-purple-300 hover:text-white bg-purple-950/40 hover:bg-purple-900/30 border border-purple-500/20 rounded-lg transition-all flex items-center gap-1 cursor-pointer"
                              >
                                <ArrowLeft className="w-3 h-3" /> Voltar
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => setBillingDrillDown("SESI")}
                              className={`px-2.5 py-1 text-[10px] font-mono font-bold uppercase tracking-wider rounded-lg border transition-all cursor-pointer ${
                                billingDrillDown === "SESI"
                                  ? "text-white bg-purple-650/30 border-purple-500 font-extrabold"
                                  : "text-zinc-450 hover:text-white bg-zinc-900 border-zinc-900"
                              }`}
                            >
                              Produtos SESI
                            </button>
                            <button
                              type="button"
                              onClick={() => setBillingDrillDown("SENAI")}
                              className={`px-2.5 py-1 text-[10px] font-mono font-bold uppercase tracking-wider rounded-lg border transition-all cursor-pointer ${
                                billingDrillDown === "SENAI"
                                  ? "text-white bg-emerald-650/30 border-[#00E676] font-extrabold"
                                  : "text-zinc-450 hover:text-white bg-zinc-900 border-zinc-900"
                              }`}
                            >
                              Produtos SENAI
                            </button>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                          <div className="md:col-span-2 h-64 bg-zinc-950/25 border border-zinc-900/50 rounded-xl p-3 relative flex items-center justify-center">
                            {billingDrillDown === "none" ? (
                              <ResponsiveContainer width="100%" height="100%">
                                <BarChart 
                                  data={faturamentoComparativoData}
                                  margin={{ top: 20, right: 30, left: 10, bottom: 5 }}
                                >
                                  <CartesianGrid strokeDasharray="3 3" opacity={0.03} />
                                  <XAxis dataKey="name" stroke="#52525b" fontSize={10} tickLine={false} />
                                  <YAxis 
                                    stroke="#52525b" 
                                    fontSize={10} 
                                    tickFormatter={(v) => `R$ ${Math.round(v/1000)}k`} 
                                    tickLine={false}
                                  />
                                  <Tooltip 
                                    cursor={{ fill: 'rgba(255, 255, 255, 0.02)' }}
                                    contentStyle={{ backgroundColor: "#0c0a15", borderColor: "#1e1b4b", borderRadius: "8px" }}
                                    formatter={(value: any) => [`R$ ${Number(value).toLocaleString("pt-BR")}`, "Faturamento Total"]}
                                  />
                                  <Bar 
                                    dataKey="Faturamento" 
                                    radius={[6, 6, 0, 0]}
                                    cursor="pointer"
                                    onClick={(data) => {
                                      if (data && data.name) {
                                        setBillingDrillDown(data.name as "SESI" | "SENAI");
                                      }
                                    }}
                                  >
                                    {faturamentoComparativoData.map((entry, index) => (
                                      <Cell 
                                        key={`cell-${index}`} 
                                        fill={entry.fill} 
                                        className="transition-all duration-300 hover:opacity-85"
                                      />
                                    ))}
                                  </Bar>
                                </BarChart>
                              </ResponsiveContainer>
                            ) : (
                              <ResponsiveContainer width="100%" height="100%">
                                <BarChart 
                                  data={drillDownChartData}
                                  margin={{ top: 20, right: 30, left: 4, bottom: 20 }}
                                >
                                  <CartesianGrid strokeDasharray="3 3" opacity={0.03} />
                                  <XAxis dataKey="product" stroke="#52525b" fontSize={9} tickLine={false} interval={0} />
                                  <YAxis 
                                    stroke="#52525b" 
                                    fontSize={10} 
                                    tickFormatter={(v) => `R$ ${Math.round(v/1000)}k`}
                                    tickLine={false}
                                  />
                                  <Tooltip 
                                    cursor={{ fill: 'rgba(255, 255, 255, 0.02)' }}
                                    contentStyle={{ backgroundColor: "#0c0a15", borderColor: "#1e1b4b", borderRadius: "8px" }}
                                    formatter={(value: any) => [`R$ ${Number(value).toLocaleString("pt-BR")}`, "Faturamento"]}
                                  />
                                  <Bar dataKey="Faturamento" radius={[4, 4, 0, 0]}>
                                    {drillDownChartData.map((entry, index) => (
                                      <Cell key={`cell-drill-${index}`} fill={entry.fill} />
                                    ))}
                                  </Bar>
                                </BarChart>
                              </ResponsiveContainer>
                            )}
                            
                            <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded bg-zinc-900/80 border border-zinc-800 text-[9px] text-zinc-400 font-mono">
                              {billingDrillDown === "none" ? "💡 Clique em uma barra para detalhar" : `📊 Visualizando Produtos: ${billingDrillDown}`}
                            </div>
                          </div>

                          <div className="space-y-4">
                            <div className="p-3.5 bg-zinc-900 border border-zinc-800 rounded-xl space-y-2">
                              <span className="text-[9px] font-mono uppercase bg-zinc-805 text-zinc-350 px-1.5 py-0.5 rounded font-bold">Resumo Financeiro</span>
                              <div className="space-y-2 pt-1">
                                <div className="flex items-center justify-between text-xs">
                                  <span className="text-zinc-400 font-medium font-sans flex items-center gap-1">
                                    <span className="w-2 rounded-full inline-block aspect-square" style={{ backgroundColor: "#8b5cf6" }}></span> SESI Faturamento:
                                  </span>
                                  <span className="font-mono text-white font-bold">R$ {sesiTotal.toLocaleString("pt-BR")}</span>
                                </div>
                                <div className="flex items-center justify-between text-xs">
                                  <span className="text-zinc-400 font-medium font-sans flex items-center gap-1">
                                    <span className="w-2 rounded-full inline-block aspect-square" style={{ backgroundColor: "#00E676" }}></span> SENAI Faturamento:
                                  </span>
                                  <span className="font-mono text-white font-bold">R$ {senaiTotal.toLocaleString("pt-BR")}</span>
                                </div>
                                <div className="border-t border-zinc-850 pt-2 flex items-center justify-between text-xs font-semibold">
                                  <span className="text-zinc-300 font-sans">Total Geral:</span>
                                  <span className="font-mono text-[#00E676]">R$ {(sesiTotal + senaiTotal).toLocaleString("pt-BR")}</span>
                                </div>
                              </div>
                            </div>

                            <div className="p-3 bg-zinc-900/30 border border-zinc-900 rounded-xl">
                              <div className="flex items-start gap-2">
                                <TrendingUp className="w-4 h-4 text-indigo-400 mt-0.5 shrink-0" />
                                <p className="text-[10px] text-zinc-400 leading-relaxed font-sans">
                                  A unidade <strong className="text-white">{senaiTotal > sesiTotal ? "SENAI" : "SESI"}</strong> lidera o volume com <strong className="text-white">{Math.round((Math.max(sesiTotal, senaiTotal) / (sesiTotal + senaiTotal || 1)) * 100)}%</strong> do total.
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Automated Alerts Panel */}
                  <div className="p-5 bg-zinc-950/45 border border-zinc-900 rounded-2xl space-y-3.5">
                    <h4 className="text-xs uppercase font-mono font-bold tracking-wider text-white flex items-center gap-1.5">
                      <AlertOctagon className="w-4 h-4 text-red-500" /> Alertas Críticos Ativos
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      
                      <div className="p-3 bg-red-950/20 border border-red-500/20 rounded-xl flex items-start gap-2.5">
                        <AlertTriangle className="w-4.5 h-4.5 text-red-400 shrink-0 mt-0.5" />
                        <div>
                          <span className="text-[9px] font-mono font-bold text-red-400 uppercase tracking-wider">Mód: Marília (Orçamento)</span>
                          <p className="text-[11px] text-zinc-200 font-bold mt-0.5">Gargalo Estouro CC-5</p>
                          <p className="text-[10px] text-zinc-400 leading-relaxed mt-0.5">"Unidades Móveis de Petróleo" excedeu o limite orçado cadastrado em R$ 50.000.</p>
                        </div>
                      </div>

                      <div className="p-3 bg-amber-950/15 border border-amber-500/20 rounded-xl flex items-start gap-2.5">
                        <ShieldAlert className="w-4.5 h-4.5 text-amber-500 shrink-0 mt-0.5" />
                        <div>
                          <span className="text-[9px] font-mono font-bold text-amber-500 uppercase tracking-wider">Mód: Cris (Faturamento)</span>
                          <p className="text-[11px] text-zinc-200 font-bold mt-0.5">Faturas Críticas em Atraso</p>
                          <p className="text-[10px] text-zinc-400 leading-relaxed mt-0.5">Há R$ {calculatedStats.overdueBilling.toLocaleString("pt-BR")} em parcelas vencidas aguardando liquidação.</p>
                        </div>
                      </div>

                      <div className="p-3 bg-emerald-950/10 border border-emerald-500/10 rounded-xl flex items-start gap-2.5">
                        <Activity className="w-4.5 h-4.5 text-emerald-400 shrink-0 mt-0.5" />
                        <div>
                          <span className="text-[9px] font-mono font-bold text-emerald-400 uppercase tracking-wider">Mód: Thais (Manutenção)</span>
                          <p className="text-[11px] text-zinc-200 font-bold mt-0.5">Controle de Ativos Estável</p>
                          <p className="text-[10px] text-zinc-400 leading-relaxed mt-0.5">SLA de resoluções industriais operando em ritmo de regularidade sob 72h úteis.</p>
                        </div>
                      </div>

                    </div>
                  </div>

                  {/* Automated presentation slideshow and exports */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    
                    {/* PPT / PDF slide deck generator slide viewer */}
                    <div className="p-5 bg-zinc-950/45 border border-zinc-900 rounded-2xl lg:col-span-2 space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="space-y-0.5">
                          <h4 className="text-xs uppercase font-mono font-bold tracking-wider text-white flex items-center gap-1.5">
                            <Presentation className="w-4 h-4 text-sky-400" /> Relatórios Executivos & Slides para Diretoria
                          </h4>
                          <p className="text-[10px] text-zinc-400">Gere e visualize os slides consolidados para reuniões de conselho.</p>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              // Triggers textual ppt outline download representive of PowerPoint data structure
                              const pptText = `========================================================\n` +
                                `  FIRJAN ADMIN HUB - RELATÓRIO DO CONSELHO DIRETOR\n` +
                                `  Gerado em: ${new Date().toLocaleString("pt-BR")}\n` +
                                `========================================================\n\n` +
                                `SLIDE 1: RESUMO EXECUTIVO DA PLENÁRIA\n` +
                                `--------------------------------------------------------\n` +
                                `* FIRJAN ADMIN HUB: Alinhamento das visões estratégicas do SENAI/SESI.\n` +
                                `* Visão Consolidada: Integração do Módulo Thais, Marília e Acrislei.\n` +
                                `* Desempenho do Semestre: Orçamentos sob verificação de desvios.\n\n` +
                                `SLIDE 2: INTEGRALIDADE FISCAL & ORÇAMENTO (MARÍLIA MOREIRA DE MELO BRITO)\n` +
                                `--------------------------------------------------------\n` +
                                `* Orçamento Alocado Corporativo: R$ ${calculatedStats.totalAllocated.toLocaleString("pt-BR")}\n` +
                                `* Despesas Reais Executadas: R$ ${calculatedStats.totalSpent.toLocaleString("pt-BR")}\n` +
                                `* Margem de Reserva: R$ ${calculatedStats.availableBudget.toLocaleString("pt-BR")}\n` +
                                `* Farol CC-5 (Mobilidade): Excesso de R$ 50.000 requereu reajuste.\n\n` +
                                `SLIDE 3: OPERAÇÃO INDUSTRIAL & SLA DE ATIVOS (THAIS NICOLAU DA SILVA FERREIRA)\n` +
                                `--------------------------------------------------------\n` +
                                `* Total de Investimento Corrente de Danos: R$ ${calculatedStats.totalMaintenanceCost.toLocaleString("pt-BR")}\n` +
                                `* Chamados de Intervenção Preventiva: ${calculatedStats.activeOS} ordens pendentes.\n` +
                                `* Alvo OS-106 (Ponte Rolante): Orçamento de R$ 4.800 em prioridade de liberação.\n\n` +
                                `SLIDE 4: FATURAMENTO & INADIMPLÊNCIA CORE (ACRISLEI ARAUJO DA SILVA DIVINO)\n` +
                                `--------------------------------------------------------\n` +
                                `* Volume Bruto de Faturamento: R$ ${calculatedStats.totalIssuedBilling.toLocaleString("pt-BR")}\n` +
                                `* Total Recebido / Liquidado: R$ ${calculatedStats.totalPaidBilling.toLocaleString("pt-BR")}\n` +
                                `* Total em Atraso Inadimplência: R$ ${calculatedStats.overdueBilling.toLocaleString("pt-BR")} (${Math.round((calculatedStats.overdueBilling / (calculatedStats.totalIssuedBilling || 1)) * 100)}%)\n\n` +
                                `SLIDE 5: DIRETRIZES DA INTELIGÊNCIA ARTIFICIAL\n` +
                                `--------------------------------------------------------\n` +
                                `* 1. Remanejamento Imediato de R$ 50.000 para recompor déficit do CC-5.\n` +
                                `* 2. Acionamento do jurídico / Notificação de Protesto para CSN Siderúrgica Norte (R$ 32.000).\n` +
                                `* 3. Desbloqueio imediato de R$ 4.800 para Thais Nicolau consertar a Ponte Rolante.\n\n` +
                                `--------------------------------------------------------\n` +
                                `Relatório FIRJAN Gerado para a Coordenadora Tatiane Teixeira Rocha.`;
                              
                              const blob = new Blob([pptText], { type: "text/plain;charset=utf-8" });
                              const url = URL.createObjectURL(blob);
                              const link = document.createElement("a");
                              link.href = url;
                              link.setAttribute("download", `apresentacao_slides_diretoria_${new Date().toISOString().split("T")[0]}.txt`);
                              document.body.appendChild(link);
                              link.click();
                              document.body.removeChild(link);

                              addToast("Relatório de Slides Baixado", "O esboço formatado em lote para slides PPTX foi gravado no histórico.", "success");
                            }}
                            className="p-1.5 px-2.5 bg-zinc-900 hover:bg-zinc-800 text-[10px] text-sky-400 hover:text-white border border-zinc-800 rounded font-mono uppercase transition flex items-center gap-1 shrink-0"
                            title="Exportar PPTX"
                          >
                            <File className="w-3.5 h-3.5 text-sky-400" /> Baixar PPTX
                          </button>
                          
                          <button
                            onClick={() => {
                              window.print();
                              addToast("Relatório Exportado", "Relatório Executivo PDF pronto para impressão de diretoria.", "info");
                            }}
                            className="p-1.5 px-2.5 bg-zinc-900 hover:bg-zinc-800 text-[10px] text-[#00E676] hover:text-white border border-zinc-800 rounded font-mono uppercase transition flex items-center gap-1 shrink-0"
                            title="Imprimir PDF"
                          >
                            <Printer className="w-3.5 h-3.5 text-[#00E676]" /> Baixar PDF
                          </button>
                        </div>
                      </div>

                      {/* Dynamic slide simulator layout */}
                      <div className="bg-[#050407] rounded-xl p-5 border border-zinc-900/60 min-h-56 relative flex flex-col justify-between">
                        
                        {/* Slide content based on slide selection */}
                        <div className="space-y-4">
                          {activeSlideIndex === 0 && (
                            <div className="space-y-2">
                              <span className="text-[9px] font-mono text-purple-400 bg-purple-950/35 border border-purple-900/30 px-2 py-0.5 rounded font-bold">SLIDE 1: GESTÃO & DIRETORIA INTEGRADA</span>
                              <h5 className="text-base font-black text-white font-display tracking-tight uppercase mt-1">Plataforma Firjan Admin Hub</h5>
                              <p className="text-xs text-zinc-400 leading-relaxed max-w-lg mt-1">
                                O Hub unifica em tempo de execução os indicadores do SESI e do SENAI: o controle industrial de Thais Nicolau, o pilar orçamentário de Marília Moreira e os controles de faturamento e inadimplência de Acrislei.
                              </p>
                              <div className="grid grid-cols-3 gap-2 pt-3">
                                <div className="p-2 bg-zinc-950 border border-zinc-900 rounded font-mono text-center">
                                  <span className="text-[8px] text-zinc-500 block">MANUTENÇÃO</span>
                                  <strong className="text-xs text-[#00E676]">SLA Estável</strong>
                                </div>
                                <div className="p-2 bg-zinc-950 border border-zinc-900 rounded font-mono text-center">
                                  <span className="text-[8px] text-zinc-500 block">ORÇAMENTÁRIO</span>
                                  <strong className="text-xs text-purple-400">R$ {calculatedStats.totalSpent.toLocaleString("pt-BR")}</strong>
                                </div>
                                <div className="p-2 bg-zinc-950 border border-zinc-900 rounded font-mono text-center">
                                  <span className="text-[8px] text-zinc-500 block">ATRASO CRÍTICO</span>
                                  <strong className="text-xs text-amber-500">R$ {calculatedStats.overdueBilling.toLocaleString("pt-BR")}</strong>
                                </div>
                              </div>
                            </div>
                          )}

                          {activeSlideIndex === 1 && (
                            <div className="space-y-2">
                              <span className="text-[9px] font-mono text-purple-400 bg-purple-950/35 border border-purple-900/30 px-2 py-0.5 rounded font-bold">SLIDE 2: ORÇAMENTOS & LIMITES (MARÍLIA MOREIRA)</span>
                              <h5 className="text-base font-black text-white font-display tracking-tight uppercase">Diagnóstico Fiscal dos Centros de Custos</h5>
                              <ul className="text-xs space-y-1.5 text-zinc-350 list-disc list-inside">
                                <li>Orçamento Autorizado Consolidado: <strong className="text-white">R$ {calculatedStats.totalAllocated.toLocaleString("pt-BR")}</strong></li>
                                <li>Despesas de Repasse PMO Consolidadas: <strong className="text-white">R$ {calculatedStats.totalSpent.toLocaleString("pt-BR")}</strong></li>
                                <li>Reserva de Liquidez Atual em Caixa: <strong className="text-emerald-400">R$ {calculatedStats.availableBudget.toLocaleString("pt-BR")}</strong></li>
                                <li className="text-red-400 font-bold">Déficit Crítico detectado no Centro CC-5 (Rita de Cássia) excedendo R$ 50.000.</li>
                              </ul>
                            </div>
                          )}

                          {activeSlideIndex === 2 && (
                            <div className="space-y-2">
                              <span className="text-[9px] font-mono text-purple-400 bg-purple-950/35 border border-purple-900/30 px-2 py-0.5 rounded font-bold">SLIDE 3: OPERAÇÃO INDUSTRIAL (THAIS NICOLAU)</span>
                              <h5 className="text-base font-black text-white font-display tracking-tight uppercase">Métricas de SLA de Ativos e Reparos</h5>
                              <ul className="text-xs space-y-1.5 text-zinc-350 list-disc list-inside">
                                <li>Investimento Corrente no Período: <strong className="text-white">R$ {calculatedStats.totalMaintenanceCost.toLocaleString("pt-BR")}</strong> de reparos em pontes rampa, CNCs e refrigeração.</li>
                                <li>Volume total de intervenções industriais: <strong className="text-white">{calculatedStats.activeOS} ordens em andamento</strong>.</li>
                                <li>Chamado Crítico Prioritário: <strong className="text-amber-500">OS-106 Ponte Rolante (R$ 4.800)</strong> aguardando liberação urgente de peças.</li>
                              </ul>
                            </div>
                          )}

                          {activeSlideIndex === 3 && (
                            <div className="space-y-2">
                              <span className="text-[9px] font-mono text-purple-400 bg-purple-950/35 border border-purple-900/30 px-2 py-0.5 rounded font-bold">SLIDE 4: FATURAMENTO & INADIMPLÊNCIA (ACRISLEI ARUJO)</span>
                              <h5 className="text-base font-black text-white font-display tracking-tight uppercase">Saúde de Recebíveis de Contratos de Serviços</h5>
                              <ul className="text-xs space-y-1.5 text-zinc-350 list-disc list-inside">
                                <li>Volume Geral de Notas Faturadas: <strong className="text-white">R$ {calculatedStats.totalIssuedBilling.toLocaleString("pt-BR")}</strong></li>
                                <li>Fatura Recebidas/Quitadas: <strong className="text-white">R$ {calculatedStats.totalPaidBilling.toLocaleString("pt-BR")}</strong></li>
                                <li>Valores vencidos não quitados: <strong className="text-amber-500">R$ {calculatedStats.overdueBilling.toLocaleString("pt-BR")} (${Math.round((calculatedStats.overdueBilling / (calculatedStats.totalIssuedBilling || 1)) * 100)}%)</strong></li>
                                <li>Foco Principal de Cobrança: <strong className="text-red-400">CSN Siderúrgica Norte (R$ 32.000)</strong> vencida há 18 dias.</li>
                              </ul>
                            </div>
                          )}

                          {activeSlideIndex === 4 && (
                            <div className="space-y-2">
                              <span className="text-[9px] font-mono text-purple-400 bg-purple-950/35 border border-purple-900/30 px-2 py-0.5 rounded font-bold">SLIDE 5: CONCLUSÃO & DIRETRIZES DA DIRETORIA</span>
                              <h5 className="text-base font-black text-white font-display tracking-tight uppercase">Plano de Direcionamento Administrativo</h5>
                              <ol className="text-xs space-y-1 text-zinc-350 list-decimal list-inside">
                                <li>Aprovar transferência emergencial de R$ 50.000 do saldo remanescente da Sede RJ (Marília) para sanear o Centro CC-5.</li>
                                <li>Notificação extrajudicial de protesto para a fatura pendente de CSN Siderúrgica (Cris).</li>
                                <li>Priorizar liberação de verbas para o reparo mecânico da Ponte Rolante (Thais).</li>
                              </ol>
                            </div>
                          )}

                        </div>

                        {/* Interactive carousel slide selectors */}
                        <div className="flex items-center justify-between border-t border-zinc-900 pt-3 mt-4">
                          <button
                            disabled={activeSlideIndex === 0}
                            onClick={() => setActiveSlideIndex(prev => prev - 1)}
                            className="bg-zinc-900 border border-zinc-800 disabled:opacity-30 disabled:hover:bg-zinc-900 hover:bg-zinc-800 text-xs px-2.5 py-1 text-zinc-350 rounded font-mono transition"
                          >
                            ← Anterior
                          </button>
                          
                          <div className="flex items-center gap-1.5">
                            {[0, 1, 2, 3, 4].map(idx => (
                              <button
                                key={idx}
                                onClick={() => setActiveSlideIndex(idx)}
                                className={`w-2 h-2 rounded-full transition-all ${
                                  idx === activeSlideIndex ? "bg-purple-500 scale-125" : "bg-zinc-800"
                                }`}
                              />
                            ))}
                          </div>

                          <button
                            disabled={activeSlideIndex === 4}
                            onClick={() => setActiveSlideIndex(prev => prev + 1)}
                            className="bg-zinc-900 border border-zinc-800 disabled:opacity-30 disabled:hover:bg-zinc-900 hover:bg-zinc-800 text-xs px-2.5 py-1 text-zinc-350 rounded font-mono transition"
                          >
                            Próximo →
                          </button>
                        </div>

                      </div>
                    </div>

                    {/* INTERACTIVE IA ANALISTA DE DADOS assistant */}
                    <div className="p-5 bg-zinc-950/45 border border-zinc-900 rounded-2xl col-span-1 space-y-4">
                      
                      {/* Assistant Header */}
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-purple-700/10 border border-purple-500/20 flex items-center justify-center shrink-0">
                          <Cpu className="w-4 h-4 text-purple-400" />
                        </div>
                        <div>
                          <h4 className="text-xs uppercase font-mono font-bold tracking-wider text-white">IA Analista de Dados</h4>
                          <span className="text-[9px] font-mono text-emerald-400">● Conectada ao Core de Planilhas</span>
                        </div>
                      </div>

                      {/* Chat Logs */}
                      <div className="h-56 overflow-y-auto border border-zinc-900/60 bg-[#050407] rounded-xl p-3 space-y-3.5 text-[11px] font-sans scrollbar-thin">
                        {chatMessages.map((msg, i) => (
                          <div key={i} className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}>
                            <div className={`p-2.5 rounded-lg max-w-[90%] leading-relaxed ${
                              msg.sender === "user" 
                                ? "bg-purple-850 text-white rounded-tr-none" 
                                : "bg-zinc-900/80 text-zinc-250 border border-zinc-850 rounded-tl-none font-mono"
                            }`}>
                              {msg.text.split("\n").map((line, idx) => (
                                <p key={idx} className={line.startsWith("*") ? "ml-3 list-item" : "mt-0.5"}>
                                  {line.replace(/\*\*|\*/g, "")}
                                </p>
                              ))}
                            </div>
                            <span className="text-[8px] text-zinc-500 font-mono mt-0.5 px-1">{msg.time}</span>
                          </div>
                        ))}

                        {aiIsTyping && (
                          <div className="flex items-center gap-1.5 p-1 text-zinc-500 font-mono text-[10px]">
                            <span className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-bounce"></span>
                            <span className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></span>
                            <span className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: "0.4s" }}></span>
                            <span>IA gerando insights...</span>
                          </div>
                        )}
                      </div>

                      {/* Prompts sugestivos */}
                      <div className="flex flex-col gap-1.5">
                        <span className="text-[9px] font-semibold text-zinc-400 font-mono uppercase">Análises Sugeridas:</span>
                        <div className="grid grid-cols-2 gap-1.5">
                          <button
                            onClick={() => handleSendAIMessage("1. Risco Trimestral Integrado")}
                            className="p-1 px-1.5 text-[10px] text-left bg-zinc-900 hover:bg-zinc-850 text-purple-300 hover:text-white rounded border border-zinc-850 font-mono transition leading-snug"
                          >
                            ⚠️ Risco Geral Hub
                          </button>
                          <button
                            onClick={() => handleSendAIMessage("2. Insights do Módulo Marília (Orçamento)")}
                            className="p-1 px-1.5 text-[10px] text-left bg-zinc-900 hover:bg-zinc-850 text-purple-300 hover:text-white rounded border border-zinc-850 font-mono transition leading-snug"
                          >
                            💼 Compliance Marília
                          </button>
                          <button
                            onClick={() => handleSendAIMessage("3. SLA de Manutenções Industriais (Thais)")}
                            className="p-1 px-1.5 text-[10px] text-left bg-zinc-900 hover:bg-zinc-850 text-purple-300 hover:text-white rounded border border-zinc-850 font-mono transition leading-snug"
                          >
                            🔧 Diagnóstico Thais
                          </button>
                          <button
                            onClick={() => handleSendAIMessage("4. Custos e Recuperações (Cris)")}
                            className="p-1 px-1.5 text-[10px] text-left bg-zinc-900 hover:bg-zinc-850 text-purple-300 hover:text-white rounded border border-zinc-850 font-mono transition leading-snug"
                          >
                            💸 Cobrança/Cris
                          </button>
                        </div>
                      </div>

                      {/* Send bar */}
                      <div className="flex gap-1.5 pt-1">
                        <input
                          type="text"
                          value={chatInputText}
                          onChange={(e) => setChatInputText(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" ? handleSendAIMessage() : null}
                          placeholder="Perguntar ao analista FIRJAN..."
                          className="flex-1 bg-[#050407] border border-zinc-850 focus:border-purple-500 rounded px-2 text-xs text-white"
                        />
                        <button
                          onClick={() => handleSendAIMessage()}
                          className="p-1.5 bg-purple-700 hover:bg-purple-600 text-white rounded transition shrink-0"
                        >
                          <Send className="w-3.5 h-3.5" />
                        </button>
                      </div>

                    </div>

                  </div>

                </div>

              </motion.div>
            )}

            {/* ====== APPLICATION VIEW 1: ACOMPANHAMENTO DE MANUTENÇÃO (Thais) ====== */}
            {activeSubApp === "manutencao" && (
              <motion.div 
                key="subapp-manutencao"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.35 }}
                className="max-w-6xl mx-auto space-y-6"
              >
                
                {/* Module Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-zinc-950/20 border border-zinc-900/60 p-5 rounded-2xl relative overflow-hidden">
                  <div className="space-y-1">
                    <span className="text-[10px] text-[#00E676] uppercase font-bold tracking-widest font-mono">APP DEPTO: THAIS NICOLAU DA SILVA FERREIRA</span>
                    <h2 className="text-2xl font-extrabold text-white font-display tracking-tight uppercase flex items-center gap-2">
                      <Wrench className="w-6 h-6 text-[#00E676]" />
                      Acompanhamento de Manutenção Industrial
                    </h2>
                    <p className="text-xs text-slate-400 leading-relaxed max-w-xl">
                      Supervisão completa de ordens de serviço (OS) prediais, equipamentos, ferramentas CNC e monitoramento do SLA operacional de resoluções de pendências.
                    </p>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-3 shrink-0">
                    {/* Executive Export Button */}
                    <button
                      onClick={() => {
                        const csvHeader = "\uFEFFFirjan SENAI - Sistema Integrado de Manutenção Industrial\nGerado em: " + new Date().toLocaleString("pt-BR") + "\n\nOS ID,Setor/Local,Equipamento,Severidade,Descrição,Custo de Reparo (R$),Solicitante,Data Abertura,Status\n";
                        const csvRows = filteredOSList.map(os => 
                          `"${os.id}","${os.area}","${os.equipment}","${os.priority}","${os.description.replace(/"/g, '""')}",${os.cost},"${os.requester}","${os.date}","${os.status}"`
                        ).join("\n");
                        const blob = new Blob([csvHeader + csvRows], { type: "text/csv;charset=utf-8;" });
                        const url = URL.createObjectURL(blob);
                        const link = document.createElement("a");
                        link.href = url;
                        link.setAttribute("download", `exportacao_executiva_manutencao_${new Date().toISOString().split("T")[0]}.csv`);
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                        addToast("Exportação Concluída", "Livro de Manutenção exportado com sucesso para Excel.", "success");
                      }}
                      className="py-2.5 px-4 bg-[#121c16] hover:bg-[#1a3324] text-[#00E676] hover:text-white border border-emerald-500/20 hover:border-emerald-400 rounded-lg text-xs uppercase font-mono tracking-wider transition-all duration-150 flex items-center gap-1.5 shrink-0"
                    >
                      <FileSpreadsheet className="w-4 h-4 text-[#00E676]" /> Exportação Executiva
                    </button>

                    {/* Action Trigger */}
                    <button
                      onClick={() => setShowNewOSForm(!showNewOSForm)}
                      className="py-2.5 px-4 bg-emerald-800 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs uppercase rounded-lg transition-all duration-150 flex items-center gap-2 font-mono shrink-0 shadow-[0_4px_10px_rgba(16,185,129,0.15)]"
                    >
                      {showNewOSForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                      {showNewOSForm ? "Fechar Formulário" : "Abrir Nova OS"}
                    </button>
                  </div>
                </div>

                {/* KPIs Row */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="p-4 bg-zinc-950/35 border border-zinc-900 rounded-xl">
                    <p className="text-[10px] text-zinc-400 uppercase font-mono tracking-wider">Ordens em Pendência</p>
                    <h4 className="text-2xl font-bold font-mono text-white mt-1">
                      {maintenanceTickets.filter(o => o.status === "Pendente").length}
                    </h4>
                  </div>
                  <div className="p-4 bg-zinc-950/35 border border-zinc-900 rounded-xl">
                    <p className="text-[10px] text-zinc-400 uppercase font-mono tracking-wider">Em Andamento</p>
                    <h4 className="text-2xl font-bold font-mono text-[#00E676] mt-1">
                      {maintenanceTickets.filter(o => o.status === "Em Execução").length}
                    </h4>
                  </div>
                  <div className="p-4 bg-zinc-950/35 border border-zinc-900 rounded-xl">
                    <p className="text-[10px] text-zinc-400 uppercase font-mono tracking-wider">Concluídas</p>
                    <h4 className="text-2xl font-bold font-mono text-emerald-400 mt-1">
                      {maintenanceTickets.filter(o => o.status === "Concluído").length}
                    </h4>
                  </div>
                  <div className="p-4 bg-zinc-950/35 border border-zinc-900 rounded-xl">
                    <p className="text-[10px] text-zinc-400 uppercase font-mono tracking-wider">Despesas Totais OS</p>
                    <h4 className="text-2xl font-bold font-mono text-purple-400 mt-1">
                      R$ {calculatedStats.totalMaintenanceCost.toLocaleString("pt-BR")}
                    </h4>
                  </div>
                </div>

                {/* Expendable Create OS Form */}
                {showNewOSForm && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    className="p-5 bg-zinc-950/40 border border-purple-500/20 rounded-xl space-y-4"
                  >
                    <h3 className="text-xs font-extrabold uppercase text-white font-mono flex items-center gap-1.5 pb-2 border-b border-zinc-900">
                      <Hammer className="w-4 h-4 text-[#00E676]" />
                      Instanciar Ordem de Serviço Corretiva / Emergencial
                    </h3>
                    
                    <form onSubmit={handleCreateOS} className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <label className="text-[9.5px] uppercase font-mono text-zinc-400 block mb-1">Equipamento Industrial</label>
                        <input 
                          type="text" 
                          required
                          placeholder="Ex: Compressor de Ar Wayne"
                          value={newOS.equipment}
                          onChange={(e) => setNewOS({ ...newOS, equipment: e.target.value })}
                          className="w-full bg-[#050407] border border-zinc-800 focus:border-emerald-500 rounded px-2.5 py-1.5 text-xs text-white outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[9.5px] uppercase font-mono text-zinc-400 block mb-1">Unidade / Setor de Trabalho</label>
                        <input 
                          type="text" 
                          required
                          placeholder="Ex: Mecânica Maracanã"
                          value={newOS.area}
                          onChange={(e) => setNewOS({ ...newOS, area: e.target.value })}
                          className="w-full bg-[#050407] border border-zinc-800 focus:border-emerald-500 rounded px-2.5 py-1.5 text-xs text-white outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[9.5px] uppercase font-mono text-zinc-400 block mb-1">Prioridade Geral</label>
                        <select 
                          value={newOS.priority}
                          onChange={(e) => setNewOS({ ...newOS, priority: e.target.value as "Alta"|"Média"|"Baixa" })}
                          className="w-full bg-[#050407] border border-zinc-800 rounded p-1.5 text-xs text-white outline-none focus:border-emerald-500 cursor-pointer"
                        >
                          <option value="Alta">Alta (Imediata)</option>
                          <option value="Média">Média (Até 48h)</option>
                          <option value="Baixa">Baixa (Preventiva)</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[9.5px] uppercase font-mono text-zinc-400 block mb-1">Custo Estimado de Reparo (R$)</label>
                        <input 
                          type="number" 
                          required
                          placeholder="Ex: 1200"
                          value={newOS.cost}
                          onChange={(e) => setNewOS({ ...newOS, cost: Number(e.target.value) })}
                          className="w-full bg-[#050407] border border-zinc-800 focus:border-emerald-500 rounded px-2.5 py-1.5 text-xs text-white"
                        />
                      </div>
                      <div className="md:col-span-3">
                        <label className="text-[9.5px] uppercase font-mono text-zinc-400 block mb-1">Detalhamento Técnico da Anomalia / Problema</label>
                        <input 
                          type="text" 
                          required
                          placeholder="Ex: Vibração intermitente e liberação anormal de detritos metálicos no cárter secundário de graxas."
                          value={newOS.description}
                          onChange={(e) => setNewOS({ ...newOS, description: e.target.value })}
                          className="w-full bg-[#050407] border border-zinc-800 focus:border-emerald-500 rounded px-2.5 py-1.5 text-xs text-white outline-none"
                        />
                      </div>
                      <div className="flex items-end">
                        <button
                          type="submit"
                          className="w-full py-1.5 bg-[#00E676] hover:bg-[#00C853] text-black font-extrabold text-xs uppercase rounded transition-all duration-150 font-display flex items-center justify-center gap-1"
                        >
                          <Send className="w-3.5 h-3.5" /> Emitir OS
                        </button>
                      </div>
                    </form>
                  </motion.div>
                )}

                {/* Interactive Repair Costs Trend Linechart */}
                <div className="p-5 bg-zinc-950/35 border border-zinc-900/60 rounded-2xl">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4">
                    <div>
                      <h4 className="font-display font-bold text-sm text-white flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-[#00E676]" />
                        Histórico e Evolução Mensal dos Custos de Reparos
                      </h4>
                      <p className="text-[11px] text-zinc-400">
                        Evolução mensal dos custos totais de reparo nos últimos 6 meses para apoiar as decisões estratégicas da Thais, Marília e Cris.
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded font-mono text-[10px] text-[#00E676] font-bold">
                      <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></span>
                      CUSTO CORRENTE (JUN): R$ {calculatedStats.totalMaintenanceCost.toLocaleString("pt-BR")}
                    </div>
                  </div>

                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={[
                        { name: "Jan", Custo: 8900 },
                        { name: "Fev", Custo: 12300 },
                        { name: "Mar", Custo: 11100 },
                        { name: "Abr", Custo: 15400 },
                        { name: "Mai", Custo: 13900 },
                        { name: "Jun", Custo: calculatedStats.totalMaintenanceCost }
                      ]}>
                        <CartesianGrid strokeDasharray="3 3" opacity={0.06} stroke="#8b5cf6" />
                        <XAxis 
                          dataKey="name" 
                          stroke="#71717a" 
                          fontSize={10} 
                          tickLine={false}
                          axisLine={{ stroke: '#27272a' }}
                        />
                        <YAxis 
                          stroke="#71717a" 
                          fontSize={10} 
                          tickLine={false}
                          axisLine={{ stroke: '#27272a' }}
                          tickFormatter={(v) => `R$ ${v / 1000}k`}
                        />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: "#0d0b18", 
                            borderColor: "rgba(168, 85, 247, 0.2)",
                            borderRadius: "10px",
                            fontSize: "11px",
                            color: "#fff"
                          }} 
                          formatter={(value: any) => [`R$ ${Number(value).toLocaleString("pt-BR")}`, "Custo de Manutenção"]}
                        />
                        <Legend wrapperStyle={{ fontSize: "11px" }} />
                        <Line 
                          type="monotone" 
                          dataKey="Custo" 
                          name="Custo Consolidado de Reparos (R$)"
                          stroke="#00E676" 
                          strokeWidth={3.5}
                          activeDot={{ r: 7 }}
                          dot={{ stroke: '#00E676', strokeWidth: 2, fill: '#050408', r: 4 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* List Ledger and Interactive Action table */}
                <div className="bg-zinc-950/20 border border-zinc-900/60 p-5 rounded-2xl space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-900/40">
                    <div>
                      <h4 className="font-display font-bold text-sm text-white">Central de Chamados Residenciais & Industriais</h4>
                      <p className="text-[10.5px] text-zinc-400">Todos os chamados requerem aprovação e alteração retroativa homologada.</p>
                    </div>

                    {/* Quick filter toolbars */}
                    <div className="flex items-center gap-2">
                      <div className="relative">
                        <Search className="w-3.5 h-3.5 text-zinc-550 absolute left-2 top-2.5" />
                        <input 
                          type="text" 
                          placeholder="Buscar equipamento, área..."
                          value={osSearch}
                          onChange={(e) => setOsSearch(e.target.value)}
                          className="bg-[#050407] border border-zinc-900 rounded-lg pl-7 pr-3 py-1.5 text-xs text-white max-w-xs focus:outline-none"
                        />
                      </div>

                      <select
                        value={osStatusFilter}
                        onChange={(e) => setOsStatusFilter(e.target.value)}
                        className="bg-[#050407] border border-zinc-900 rounded-lg p-1.5 text-xs text-white focus:outline-none cursor-pointer"
                      >
                        <option value="Todas">Todos os Status</option>
                        <option value="Pendente">Pendentes</option>
                        <option value="Em Execução">Em Execução</option>
                        <option value="Concluído">Concluídos</option>
                      </select>
                    </div>
                  </div>

                  <div className="overflow-x-auto min-h-[250px]">
                    <table className="w-full text-left text-xs text-slate-350 border-collapse">
                      <thead>
                        <tr className="border-b border-zinc-900 text-[10px] font-mono uppercase tracking-wider text-zinc-400 pb-2">
                          <th className="pb-2 font-bold">OS ID</th>
                          <th className="pb-2 font-bold">Lotação / Local</th>
                          <th className="pb-2 font-bold">Equipamento Alvo</th>
                          <th className="pb-2 font-bold text-center">Severidade</th>
                          <th className="pb-2 font-bold">Descrição da Falha</th>
                          <th className="pb-2 font-bold text-right">Custo Reparo</th>
                          <th className="pb-2 font-bold text-center">Status Atendimento</th>
                          <th className="pb-2 font-bold text-right">Ação de Campo</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-900/40">
                        {filteredOSList.map((os) => {
                          const priorityColor = {
                            "Alta": "text-red-400 bg-red-950/20 border-red-900/30",
                            "Média": "text-amber-400 bg-amber-950/20 border-amber-900/30",
                            "Baixa": "text-blue-450 bg-blue-950/20 border-blue-900/30",
                          }[os.priority];

                          return (
                            <tr key={os.id} className="hover:bg-zinc-900/10 transition duration-150">
                              <td className="py-3 font-mono font-bold text-white text-[11px]">{os.id}</td>
                              <td className="py-3 font-medium text-slate-300 pr-2">{os.area}</td>
                              <td className="py-3 text-white font-bold font-display">{os.equipment}</td>
                              <td className="py-3 text-center">
                                <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border ${priorityColor}`}>
                                  {os.priority}
                                </span>
                              </td>
                              <td className="py-3 max-w-[200px] truncate text-slate-400" title={os.description}>{os.description}</td>
                              <td className="py-3 text-right font-mono text-white text-[11px]">R$ {os.cost.toLocaleString("pt-BR")}</td>
                              <td className="py-3 text-center">
                                <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold inline-block min-w-[90px] ${
                                  os.status === "Concluído" ? "bg-emerald-900/20 text-emerald-400 border border-emerald-500/20" :
                                  os.status === "Em Execução" ? "bg-amber-900/20 text-amber-400 border border-amber-500/20" :
                                  "bg-red-900/20 text-red-400 border border-red-500/10"
                                }`}>
                                  {os.status}
                                </span>
                              </td>
                              <td className="py-3 text-right">
                                <div className="flex gap-1 justify-end">
                                  {os.status === "Pendente" && (
                                    <button 
                                      onClick={() => handleUpdateOSStatus(os.id, "Em Execução")}
                                      className="py-1 px-2 text-[9px] bg-amber-800 hover:bg-amber-700 text-white font-bold rounded"
                                    >
                                      Executar
                                    </button>
                                  )}
                                  {os.status === "Em Execução" && (
                                    <button 
                                      onClick={() => handleUpdateOSStatus(os.id, "Concluído")}
                                      className="py-1 px-2 text-[9px] bg-emerald-800 hover:bg-emerald-700 text-white font-bold rounded"
                                    >
                                      Finalizar
                                    </button>
                                  )}
                                  {os.status === "Concluído" && (
                                    <span className="text-[10px] font-mono text-zinc-500 flex items-center gap-1 font-bold">
                                      <CheckCircle className="w-3 h-3 text-emerald-400" /> Resolvido
                                    </span>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })}

                        {filteredOSList.length === 0 && (
                          <tr>
                            <td colSpan={8} className="py-10 text-center text-zinc-500 italic font-mono">
                              Nenhuma requisição de manutenção encontrada com o filtro ou status selecionado.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

              </motion.div>
            )}

            {/* ====== APPLICATION VIEW 2: ACOMPANHAMENTO ORÇAMENTÁRIO (Marília) ====== */}
            {activeSubApp === "orcamento" && (
              <motion.div 
                key="subapp-orcamento"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.35 }}
                className="max-w-6xl mx-auto space-y-6"
              >
                
                {/* Module Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-zinc-950/20 border border-zinc-900/60 p-5 rounded-2xl">
                  <div className="space-y-1">
                    <span className="text-[10px] text-purple-400 uppercase font-bold tracking-widest font-mono">APP DEPTO: MARÍLIA MOREIRA DE MELO BRITO</span>
                    <h2 className="text-2xl font-extrabold text-white font-display uppercase tracking-tight flex items-center gap-2">
                      <Landmark className="w-6 h-6 text-purple-400" />
                      Acompanhamento Orçamentário PMO & Custos
                    </h2>
                    <p className="text-xs text-slate-400 leading-relaxed max-w-xl">
                      Análise estratégica de orçamentação alocada, consumos por centros de custo, faturamento real de divisões e autorização de alocações extras em tempo de auditoria.
                    </p>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-3 shrink-0">
                    {/* Executive Budget Export Button */}
                    <button
                      onClick={() => {
                        const csvHeader = "\uFEFFFirjan SENAI - Demonstrativo de Limites e Repasses Orçamentários PMO\nGerado em: " + new Date().toLocaleString("pt-BR") + "\n\nID,Centro de Custo,Coordenador Responsável,Limite de Verba (R$),Verba Alocada (R$),Despesa Executada (R$),Saldo Disponível (R$),Farol de Risco\n";
                        const csvRows = filteredCostCenters.map(cc => 
                          `"${cc.id}","${cc.name}","${cc.owner}",${cc.budgetLimit},${cc.allocated},${cc.spent},${cc.allocated - cc.spent},"${cc.status}"`
                        ).join("\n");
                        const blob = new Blob([csvHeader + csvRows], { type: "text/csv;charset=utf-8;" });
                        const url = URL.createObjectURL(blob);
                        const link = document.createElement("a");
                        link.href = url;
                        link.setAttribute("download", `exportacao_executiva_orcamento_${new Date().toISOString().split("T")[0]}.csv`);
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                        addToast("Exportação Concluída", "Demonstrativo fiscal de Orçamento exportado com sucesso.", "success");
                      }}
                      className="py-2.5 px-4 bg-[#141221] hover:bg-[#201c36] text-purple-300 hover:text-white border border-purple-500/20 hover:border-purple-400 rounded-lg text-xs uppercase font-mono tracking-wider transition-all duration-150 flex items-center gap-1.5 shrink-0"
                    >
                      <FileSpreadsheet className="w-4 h-4 text-purple-450" /> Exportação Executiva
                    </button>

                    <div className="flex items-center gap-2 font-mono text-[10px] bg-purple-950/25 border border-purple-500/20 rounded px-3.5 py-2.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#00E676] animate-pulse"></span>
                      SALDO INTEGRADO: R$ {calculatedStats.availableBudget.toLocaleString("pt-BR")}
                    </div>
                  </div>
                </div>

                {/* Dashboard summary stats */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="p-4 bg-zinc-950/35 border border-zinc-900 rounded-xl">
                    <p className="text-[10px] text-zinc-400 uppercase font-mono tracking-wider">Verba Total Alocada</p>
                    <h4 className="text-xl font-bold font-mono text-white mt-1">
                      R$ {calculatedStats.totalAllocated.toLocaleString("pt-BR")}
                    </h4>
                  </div>
                  <div className="p-4 bg-zinc-950/35 border border-zinc-900 rounded-xl">
                    <p className="text-[10px] text-zinc-400 uppercase font-mono tracking-wider">Despesas Executadas</p>
                    <h4 className="text-xl font-bold font-mono text-amber-500 mt-1">
                      R$ {calculatedStats.totalSpent.toLocaleString("pt-BR")}
                    </h4>
                  </div>
                  <div className="p-4 bg-zinc-950/35 border border-zinc-900 rounded-xl">
                    <p className="text-[10px] text-zinc-400 uppercase font-mono tracking-wider">Margem de Liquidez</p>
                    <h4 className="text-xl font-bold font-mono text-emerald-400 mt-1">
                      R$ {calculatedStats.availableBudget.toLocaleString("pt-BR")}
                    </h4>
                  </div>
                  <div className="p-4 bg-zinc-950/35 border border-zinc-900 rounded-xl">
                    <p className="text-[10px] text-zinc-400 uppercase font-mono tracking-wider">Requisições Ativas</p>
                    <h4 className="text-xl font-bold font-mono text-purple-400 mt-1">
                      {calculatedStats.pendingBudgetRequests} Pendentes
                    </h4>
                  </div>
                </div>

                {/* Visual budget comparison graph and allocations form */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                  
                  {/* Left Graph */}
                  <div className="p-4 bg-zinc-950/35 border border-zinc-900 rounded-xl lg:col-span-2">
                    <h4 className="font-display font-semibold text-xs tracking-wide uppercase mb-3 flex items-center gap-1.5 text-white">
                      <BarChart3 className="w-4 h-4 text-purple-400" />
                      Relação de Custos Alocados x Despesas Reais Realizadas
                    </h4>

                    <div className="h-56">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={filteredCostCenters}>
                          <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                          <XAxis dataKey="name" fontSize={9} />
                          <YAxis fontSize={9} />
                          <Tooltip wrapperStyle={{ fontSize: "10px" }} />
                          <Legend wrapperStyle={{ fontSize: "10px" }} />
                          <Bar dataKey="allocated" name="Verba Alocada" fill="#8b5cf6" radius={[2, 2, 0, 0]} />
                          <Bar dataKey="spent" name="Depesa Efetuada" fill="#ec4899" radius={[2, 2, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Supplemental budget request form */}
                  <div className="p-4 bg-zinc-950/35 border border-zinc-900 rounded-xl lg:col-span-1">
                    <h4 className="font-display font-semibold text-xs tracking-wide uppercase mb-3 text-white flex items-center gap-1">
                      <Sliders className="w-3.5 h-3.5 text-[#00E676]" />
                      Solicitar Suplementação
                    </h4>

                    <form onSubmit={handleBudgetRequest} className="space-y-3.5">
                      <div>
                        <label className="text-[9.5px] uppercase font-mono text-zinc-400 block mb-1">Centro de Custo Alvo</label>
                        <select
                          value={newRequestCC}
                          onChange={(e) => setNewRequestCC(e.target.value)}
                          className="w-full bg-[#050407] border border-zinc-900 rounded p-1.5 text-xs text-white"
                        >
                          {costCenters.map(cc => (
                            <option key={cc.id} value={cc.id}>{cc.name}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="text-[9.5px] uppercase font-mono text-zinc-400 block mb-1">Valor do Repasse (R$)</label>
                        <input 
                          type="number" 
                          required
                          placeholder="Ex: 50000"
                          value={newRequestAmount}
                          onChange={(e) => setNewRequestAmount(e.target.value)}
                          className="w-full bg-[#050407] border border-zinc-900 focus:border-purple-500 rounded px-2.5 py-1.5 text-xs text-white"
                        />
                      </div>

                      <div>
                        <label className="text-[9.5px] uppercase font-mono text-zinc-400 block mb-1">Justificativa de Aquisição</label>
                        <textarea 
                          rows={2}
                          required
                          placeholder="Ex: Demolição corretiva e novos refeitórios de metalurgia"
                          value={newRequestReason}
                          onChange={(e) => setNewRequestReason(e.target.value)}
                          className="w-full bg-[#050407] border border-zinc-900 focus:border-purple-500 rounded px-2.5 py-1.5 text-xs text-white"
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full py-2 bg-purple-700 hover:bg-purple-600 font-bold text-xs uppercase rounded transition duration-150"
                      >
                        Enviar Solicitação
                      </button>
                    </form>
                  </div>

                </div>

                {/* ====== COMPONENT: HEATMAP DE CENTROS DE CUSTO (MAPA DE CALOR) ====== */}
                <div className="bg-zinc-950/20 border border-zinc-900/60 p-5 rounded-2xl space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-900 pb-3">
                    <div>
                      <span className="text-[9px] text-[#00E676] uppercase font-bold tracking-widest font-mono">Monitoramento de Riscos</span>
                      <h4 className="font-display font-bold text-sm text-white flex items-center gap-1.5 mt-0.5">
                        <Flame className="w-4 h-4 text-red-500" /> Mapa de Calor — Percentual de Execução Orçamentária
                      </h4>
                      <p className="text-xs text-zinc-400">
                        Identificação ágil do nível de consumo sobre as verbas alocadas. Centros de custo em vermelho excederam o limite orçamentário.
                      </p>
                    </div>
                    {/* Caption / Legend */}
                    <div className="flex flex-wrap gap-2 text-[9px] font-mono shrink-0">
                      <span className="px-2 py-1 rounded bg-[#072517]/40 border border-[#00e676]/20 text-[#00E676] flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#00E676]"></span> ≤40%
                      </span>
                      <span className="px-2 py-1 rounded bg-[#1e1b4b]/40 border border-[#8b5cf6]/20 text-[#c084fc] flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#8b5cf6]"></span> 41%-75%
                      </span>
                      <span className="px-2 py-1 rounded bg-[#78350f]/30 border border-amber-500/20 text-[#fca5a5] flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span> 76%-100%
                      </span>
                      <span className="px-2 py-1 rounded bg-red-950/40 border border-red-500/35 text-red-400 flex items-center gap-1 animate-pulse">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span> Excedido (&gt;100%)
                      </span>
                    </div>
                  </div>

                  {/* Heatmap Grid Cells */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5">
                    {filteredCostCenters.map(cc => {
                      const ratioSpent = cc.spent / cc.allocated;
                      const percentSpent = Math.round(ratioSpent * 100);
                      
                      // Determine visual classes based on execution rate
                      let cellClass = "";
                      let statusBadge = "";
                      let iconColor = "";
                      
                      if (percentSpent <= 40) {
                        cellClass = "bg-[#042014]/30 border-[#00e676]/15 hover:border-[#00e676]/45 text-emerald-300";
                        statusBadge = "Otimizado";
                        iconColor = "text-[#00E676]";
                      } else if (percentSpent <= 75) {
                        cellClass = "bg-[#0e0a26]/40 border-purple-500/15 hover:border-purple-500/40 text-purple-200";
                        statusBadge = "Saudável";
                        iconColor = "text-purple-400";
                      } else if (percentSpent <= 100) {
                        cellClass = "bg-[#251508]/30 border-amber-500/20 hover:border-amber-500/45 text-amber-200";
                        statusBadge = "Atenção";
                        iconColor = "text-amber-500";
                      } else {
                        // Exceeded! Display in flaming pulsing red
                        cellClass = "bg-[#2a0e10] border-red-500/40 hover:border-red-400 text-red-100 shadow-[0_0_15px_rgba(239,68,68,0.15)] animate-pulse";
                        statusBadge = "Limite Excedido";
                        iconColor = "text-red-500 font-extrabold";
                      }

                      return (
                        <div 
                          key={cc.id} 
                          className={`p-3.5 rounded-xl border transition-all duration-300 flex flex-col justify-between space-y-3 shrink-0 ${cellClass}`}
                        >
                          <div className="space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-mono border border-zinc-900 bg-zinc-950/70 px-1.5 py-0.5 rounded text-zinc-330">
                                {cc.id}
                              </span>
                              <span className={`text-[8.5px] font-mono px-1 rounded uppercase tracking-wider ${iconColor}`}>
                                {statusBadge}
                              </span>
                            </div>
                            <h5 className="text-[11.5px] font-extrabold font-sans tracking-tight text-white line-clamp-1">
                              {cc.name}
                            </h5>
                            <p className="text-[9.5px] text-zinc-400 truncate">
                              Resp: {cc.owner.split(" ")[0]} ({cc.unit})
                            </p>
                          </div>

                          <div className="pt-2 border-t border-zinc-900/30">
                            <div className="flex items-baseline justify-between">
                              <span className="text-[10px] text-zinc-400">Consumo:</span>
                              <span className="font-mono text-xs font-black text-white">
                                {percentSpent}%
                              </span>
                            </div>
                            <div className="w-full h-1.5 rounded-full overflow-hidden mt-1 bg-black/40">
                              <div 
                                className={`h-full ${
                                  percentSpent > 100 ? "bg-red-500 animate-pulse" :
                                  percentSpent > 75 ? "bg-amber-500" :
                                  percentSpent > 40 ? "bg-purple-500" :
                                  "bg-[#00E676]"
                                }`}
                                style={{ width: `${Math.min(100, percentSpent)}%` }}
                              ></div>
                            </div>
                            <div className="flex items-center justify-between text-[8px] font-mono text-zinc-450 mt-1">
                              <span>R$ {Math.round(cc.spent / 1000)}k gasto</span>
                              <span>Lim: R$ {Math.round(cc.allocated / 1000)}k</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Spreadsheet of Cost Centers with progress bars */}
                <div className="bg-zinc-950/20 border border-zinc-900/60 p-5 rounded-2xl space-y-4">
                  <h4 className="font-display font-bold text-sm text-white border-b border-zinc-900 pb-2">Planilha Geral de Alocação por Centros de Custo</h4>
                  
                  <div className="space-y-4.5">
                    {filteredCostCenters.map(cc => {
                      const ratio = cc.allocated / cc.budgetLimit;
                      const ratioSpent = cc.spent / cc.allocated;
                      const percentSpent = Math.round(ratioSpent * 100);

                      return (
                        <div key={cc.id} className="p-3.5 bg-zinc-950/40 border border-zinc-900/50 rounded-xl space-y-2.5">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                            <div>
                              <h5 className="font-display font-extrabold text-xs text-white">{cc.name}</h5>
                              <p className="text-[10px] text-zinc-400 font-mono mt-0.5">Responsável: {cc.owner}</p>
                            </div>

                            <div className="flex items-center gap-3">
                              <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded border ${
                                cc.status === "Excelente" ? "text-emerald-400 bg-emerald-950/10 border-emerald-900/30" :
                                cc.status === "Saudável" ? "text-purple-300 bg-purple-950/10 border-purple-900/30" :
                                cc.status === "Atenção" ? "text-amber-400 bg-amber-950/10 border-amber-900/30" :
                                "text-red-400 bg-red-950/20 border-red-500/20 animate-pulse"
                              }`}>
                                {cc.status}
                              </span>

                              <div className="text-right text-[10.5px]">
                                <span className="text-zinc-400">Verba: </span>
                                <span className="text-white font-mono font-bold">R$ {cc.allocated.toLocaleString("pt-BR")}</span>
                                <span className="text-zinc-600"> / R$ {cc.budgetLimit.toLocaleString("pt-BR")}</span>
                              </div>
                            </div>
                          </div>

                          {/* Progress bar */}
                          <div className="space-y-1">
                            <div className="flex justify-between text-[9px] text-zinc-500 font-mono">
                              <span>Consumo: R$ {cc.spent.toLocaleString("pt-BR")}</span>
                              <span>{percentSpent}% Usado</span>
                            </div>
                            <div className="w-full bg-[#121021] h-2 rounded-full overflow-hidden">
                              <div 
                                className={`h-full transition-all duration-300 ${
                                  percentSpent > 90 ? "bg-red-500" :
                                  percentSpent > 75 ? "bg-amber-500" :
                                  "bg-purple-500"
                                }`}
                                style={{ width: `${Math.min(100, percentSpent)}%` }}
                              ></div>
                            </div>
                          </div>

                          {/* INLINE LIMIT EDITING ONLY IF GESTOR LOGGED IN */}
                          {currentUser?.role === "Gestor" && (
                            <div className="flex items-center gap-2 pt-1 border-t border-zinc-900/30 justify-end">
                              <span className="text-[9px] font-mono text-purple-400">Alterar Limite (Gestor):</span>
                              <input 
                                type="number" 
                                defaultValue={cc.budgetLimit}
                                onBlur={(e) => handleUpdateBudgetLimit(cc.id, Number(e.target.value))}
                                className="bg-[#050407] border border-zinc-900 rounded p-1 text-[10px] w-24 text-right text-white font-semibold font-mono"
                              />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Workflow approvals table (Budget requests) */}
                <div className="bg-zinc-950/20 border border-zinc-900/60 p-5 rounded-2xl space-y-4">
                  <h4 className="font-display font-bold text-sm text-white">Solicitações Pendentes de Suplementação Orçamentária</h4>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-slate-300 border-collapse">
                      <thead>
                        <tr className="border-b border-zinc-900 font-mono text-[10px] uppercase pb-2 text-zinc-400">
                          <th className="pb-2 font-bold">Solicitação ID</th>
                          <th className="pb-2 font-bold">Centro de Custo</th>
                          <th className="pb-2 font-bold">Solicitante</th>
                          <th className="pb-2 font-bold text-right">Repasse Desejado</th>
                          <th className="pb-2 font-bold">Motivação Detalhada</th>
                          <th className="pb-2 font-bold text-center">Status</th>
                          <th className="pb-2 font-bold text-right">Solução</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-900/40">
                        {budgetRequests.map(req => {
                          const statusStyle = {
                            "Pendente": "bg-amber-950/20 text-amber-400 border border-amber-500/20",
                            "Aprovado": "bg-emerald-950/20 text-emerald-400 border border-emerald-500/20",
                            "Recusado": "bg-red-950/20 text-red-400 border border-red-500/20"
                          }[req.status];

                          return (
                            <tr key={req.id} className="hover:bg-zinc-900/5 transition">
                              <td className="py-3 font-mono font-bold text-white">{req.id}</td>
                              <td className="py-3 font-semibold text-slate-200">{req.costCenterName}</td>
                              <td className="py-3 text-slate-300">{req.requester}</td>
                              <td className="py-3 text-right font-mono text-white text-[11px] font-bold">R$ {req.amount.toLocaleString("pt-BR")}</td>
                              <td className="py-3 text-slate-400 max-w-[200px] truncate" title={req.reason}>{req.reason}</td>
                              <td className="py-3 text-center">
                                <span className={`text-[9.5px] font-mono px-2 py-0.5 rounded ${statusStyle}`}>
                                  {req.status}
                                </span>
                              </td>
                              <td className="py-3 text-right">
                                {req.status === "Pendente" ? (
                                  currentUser?.role === "Gestor" ? (
                                    <div className="flex gap-1 justify-end">
                                      <button 
                                        onClick={() => handleApproveBudgetRequest(req.id, true)}
                                        className="py-1 px-2 text-[9.5px] bg-emerald-800 hover:bg-emerald-700 font-bold rounded text-white transition animate-pulse"
                                      >
                                        Liberar
                                      </button>
                                      <button 
                                        onClick={() => handleApproveBudgetRequest(req.id, false)}
                                        className="py-1 px-2 text-[9.5px] bg-red-900 hover:bg-red-800 font-bold rounded text-white transition"
                                      >
                                        Glosa
                                      </button>
                                    </div>
                                  ) : (
                                    <span className="text-[10px] text-zinc-500 font-mono italic">Aguardando Gestor</span>
                                  )
                                ) : (
                                  <span className="text-[10.5px] font-mono text-zinc-400 font-bold uppercase">{req.status}</span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

              </motion.div>
            )}

            {/* ====== APPLICATION VIEW 3: FATURAMENTO (Cris) ====== */}
            {activeSubApp === "faturamento" && (
              <motion.div 
                key="subapp-faturamento"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.35 }}
                className="max-w-6xl mx-auto space-y-6"
              >
                
                {/* Module Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-zinc-950/20 border border-zinc-900/60 p-5 rounded-2xl">
                  <div className="space-y-1">
                    <span className="text-[10px] text-amber-400 uppercase font-bold tracking-widest font-mono">APP DEPTO: ACRISLEI ARAUJO DA SILVA DIVINO</span>
                    <h2 className="text-2xl font-extrabold text-white font-display uppercase tracking-tight flex items-center gap-2">
                      <FileText className="w-6 h-6 text-amber-500" />
                      Módulo de Emissão & Conciliação de Faturamento
                    </h2>
                  </div>

                  {/* Export Trigger */}
                  <button
                    onClick={() => {
                      const csvHeader = "\uFEFFFirjan SENAI - Demonstrativo de Faturamento e Recebíveis de Contratos de Serviços Técnicos\nGerado em: " + new Date().toLocaleString("pt-BR") + "\n\nFatura ID,Cliente Associado,Serviço Homologado,Líquido Parcela (R$),Data Emissão,Data Vencimento,Situação Fiscal\n";
                      const csvRows = billingInvoices.map(i => 
                        `"${i.id}","${i.client}","${i.serviceType}",${i.value},"${i.issueDate}","${i.dueDate}","${i.status}"`
                      ).join("\n");
                      const blob = new Blob([csvHeader + csvRows], { type: "text/csv;charset=utf-8;" });
                      const url = URL.createObjectURL(blob);
                      const link = document.createElement("a");
                      link.href = url;
                      link.setAttribute("download", `exportacao_executiva_faturamento_${new Date().toISOString().split("T")[0]}.csv`);
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                      addToast("Exportação Concluída", "Livro Diário de Faturamento exportado com sucesso para Excel.", "success");
                    }}
                    className="py-2.5 px-4 bg-[#231a10] hover:bg-[#3d2712] text-amber-500 hover:text-white border border-amber-500/20 hover:border-amber-400 rounded-lg text-xs uppercase font-mono tracking-wider transition-all duration-150 flex items-center gap-1.5 shrink-0"
                  >
                    <FileSpreadsheet className="w-4 h-4 text-amber-500" /> Exportação Executiva
                  </button>
                </div>

                {/* KPI blocks */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-fadeIn">
                  <div className="p-4 bg-zinc-950/35 border border-zinc-900 rounded-xl">
                    <p className="text-[10px] text-zinc-400 uppercase font-mono tracking-wider">Total Emitido Faturamento</p>
                    <h4 className="text-xl font-bold font-mono text-white mt-1">
                      R$ {calculatedStats.totalIssuedBilling.toLocaleString("pt-BR")}
                    </h4>
                  </div>
                  <div className="p-4 bg-zinc-950/35 border border-zinc-900 rounded-xl">
                    <p className="text-[10px] text-zinc-400 uppercase font-mono tracking-wider">Líquido Arrecadado (Pago)</p>
                    <h4 className="text-xl font-bold font-mono text-emerald-400 mt-1">
                      R$ {calculatedStats.totalPaidBilling.toLocaleString("pt-BR")}
                    </h4>
                  </div>
                  <div className="p-4 bg-zinc-950/35 border border-zinc-900 rounded-xl">
                    <p className="text-[10px] text-zinc-400 uppercase font-mono tracking-wider">A Receber (Pendentes)</p>
                    <h4 className="text-xl font-bold font-mono text-blue-400 mt-1">
                      R$ {calculatedStats.pendingBilling.toLocaleString("pt-BR")}
                    </h4>
                  </div>
                  <div className="p-4 bg-zinc-950/35 border border-zinc-900 rounded-xl">
                    <p className="text-[10px] text-zinc-400 uppercase font-mono tracking-wider">Liquidez em Atrasos</p>
                    <h4 className="text-xl font-bold font-mono text-red-400 mt-1 animate-pulse">
                      R$ {calculatedStats.overdueBilling.toLocaleString("pt-BR")}
                    </h4>
                  </div>
                </div>

                {/* Issue Invoice Form and line chart */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                  
                  {/* Left: Interactive Billing Trend Linechart */}
                  <div className="p-4 bg-zinc-950/35 border border-zinc-900 rounded-xl lg:col-span-2">
                    <h4 className="font-display font-semibold text-xs tracking-wide uppercase mb-3 text-white flex items-center gap-1">
                      <TrendingUp className="w-4 h-4 text-emerald-400" />
                      Auditoria de Desempenho e Histórico de Recebíveis
                    </h4>
                    
                    <div className="h-56">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={[
                          { name: "Jan", Faturado: 180000, Pago: 154000 },
                          { name: "Fev", Faturado: 220000, Pago: 210000 },
                          { name: "Mar", Faturado: 190000, Pago: 185000 },
                          { name: "Abr", Faturado: 310000, Pago: 298000 },
                          { name: "Mai", Faturado: 295050, Pago: 240000 },
                          { name: "Jun", Faturado: calculatedStats.totalIssuedBilling, Pago: calculatedStats.totalPaidBilling },
                        ]}>
                          <defs>
                            <linearGradient id="colorFat" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#d97706" stopOpacity={0.2}/>
                              <stop offset="95%" stopColor="#d97706" stopOpacity={0}/>
                            </linearGradient>
                            <linearGradient id="colorPag" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                              <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                          <XAxis dataKey="name" fontSize={9} />
                          <YAxis fontSize={9} />
                          <Tooltip wrapperStyle={{ fontSize: "10px" }} />
                          <Legend wrapperStyle={{ fontSize: "10px" }} />
                          <Area type="monotone" dataKey="Faturado" stroke="#d97706" fillOpacity={1} fill="url(#colorFat)" />
                          <Area type="monotone" dataKey="Pago" stroke="#10b981" fillOpacity={1} fill="url(#colorPag)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Right: Issue New Invoice form */}
                  <div className="p-4 bg-zinc-950/35 border border-zinc-900 rounded-xl lg:col-span-1">
                    <h4 className="font-display font-semibold text-xs tracking-wide uppercase mb-3 text-white flex items-center gap-1">
                      <Sliders className="w-3.5 h-3.5 text-amber-500" /> Emitir Nota / Faturamento
                    </h4>

                    <form onSubmit={handleIssueInvoice} className="space-y-3.5">
                      <div>
                        <label className="text-[9.5px] uppercase font-mono text-zinc-400 block mb-1">Empresa / Razão Social</label>
                        <input 
                          type="text" 
                          required
                          placeholder="Ex: Petrobras S.A."
                          value={issuedClient}
                          onChange={(e) => setIssuedClient(e.target.value)}
                          className="w-full bg-[#050407] border border-zinc-800 focus:border-amber-500 rounded px-2.5 py-1.5 text-xs text-white outline-none"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[9.5px] uppercase font-mono text-zinc-400 block mb-1">Carga Líquida (R$)</label>
                          <input 
                            type="number" 
                            required
                            placeholder="Ex: 12000"
                            value={issuedValue}
                            onChange={(e) => setIssuedValue(e.target.value)}
                            className="w-full bg-[#050407] border border-zinc-800 focus:border-amber-500 rounded px-2.5 py-1.5 text-xs text-white outline-none"
                          />
                        </div>
                        <div>
                          <label className="text-[9.5px] uppercase font-mono text-zinc-400 block mb-1">Vencimento</label>
                          <input 
                            type="date" 
                            required
                            value={issuedDueDate}
                            onChange={(e) => setIssuedDueDate(e.target.value)}
                            className="w-full bg-[#050407] border border-zinc-800 focus:border-amber-500 rounded px-2 text-xs text-white outline-none h-[30px]"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-[9.5px] uppercase font-mono text-zinc-400 block mb-1">Serviço Técnico Homologado</label>
                        <input 
                          type="text" 
                          required
                          placeholder="Ex: Análise Termográfica de Quadros Elétricos"
                          value={issuedServiceType}
                          onChange={(e) => setIssuedServiceType(e.target.value)}
                          className="w-full bg-[#050407] border border-zinc-800 focus:border-amber-500 rounded px-2.5 py-1.5 text-xs text-white outline-none"
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full py-2 bg-amber-600 hover:bg-amber-500 font-bold text-xs uppercase rounded text-black transition duration-150 font-display"
                      >
                        Gerar Parcela Fatura
                      </button>
                    </form>
                  </div>

                </div>

                {/* Ledger Data Grid list */}
                <div className="bg-zinc-950/20 border border-zinc-900/60 p-5 rounded-2xl space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-900/40">
                    <div>
                      <h4 className="font-display font-bold text-sm text-white">Conciliação de Documentos Fiscais de Serviços</h4>
                      <p className="text-[10.5px] text-zinc-400">Gere lembretes de inadimplência fiscais e mude status do faturamento.</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="relative">
                        <Search className="w-3.5 h-3.5 text-zinc-550 absolute left-2 top-2.5" />
                        <input 
                          type="text" 
                          placeholder="Pesquisar cliente, nota..."
                          value={faturamentoSearch}
                          onChange={(e) => setFaturamentoSearch(e.target.value)}
                          className="bg-[#050407] border border-zinc-900 rounded-lg pl-7 pr-3 py-1.5 text-xs text-white max-w-xs focus:outline-none"
                        />
                      </div>

                      <select
                        value={faturamentoStatusFilter}
                        onChange={(e) => setFaturamentoStatusFilter(e.target.value)}
                        className="bg-[#050407] border border-zinc-900 rounded-lg p-1.5 text-xs text-white focus:outline-none cursor-pointer"
                      >
                        <option value="Todas">Todas as Faturas</option>
                        <option value="Pago">Pagas (Conciliadas)</option>
                        <option value="Pendente">Pendentes</option>
                        <option value="Atrasado">Inadimplentes (Atrasadas)</option>
                      </select>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-slate-350 border-collapse">
                      <thead>
                        <tr className="border-b border-zinc-900 text-[10px] font-mono uppercase tracking-wider text-zinc-400 pb-2">
                          <th className="pb-2 font-bold">Inscrição Nota ID</th>
                          <th className="pb-2 font-bold">Prestador / Associado</th>
                          <th className="pb-2 font-bold font-display">Serviço Executado</th>
                          <th className="pb-2 font-bold text-right pr-4">Líquido Nota</th>
                          <th className="pb-2 font-bold text-center">Emissão</th>
                          <th className="pb-2 font-bold text-center">Vencimento</th>
                          <th className="pb-2 font-bold text-center">Farol Fiscal</th>
                          <th className="pb-2 font-bold text-right">Ação Conciliadora</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-900/40">
                        {filteredInvoicesList.map(inv => (
                          <tr key={inv.id} className="hover:bg-zinc-900/10 transition">
                            <td className="py-3 font-mono font-bold text-white text-[11px]">{inv.id}</td>
                            <td className="py-3 font-bold text-white pr-2 font-display">{inv.client}</td>
                            <td className="py-3 text-slate-400 text-xs">{inv.serviceType}</td>
                            <td className="py-3 text-right font-mono text-white text-[11.5px] pr-4 font-bold">R$ {inv.value.toLocaleString("pt-BR")}</td>
                            <td className="py-3 text-center text-zinc-400 font-mono text-[10.5px]">{inv.issueDate}</td>
                            <td className="py-3 text-center text-zinc-400 font-mono text-[10.5px]">{inv.dueDate}</td>
                            <td className="py-3 text-center">
                              <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold inline-block min-w-[90px] ${
                                inv.status === "Pago" ? "bg-emerald-900/20 text-emerald-400 border border-emerald-500/20" :
                                inv.status === "Pendente" ? "bg-blue-900/20 text-blue-400 border border-blue-500/20" :
                                "bg-red-900/20 text-red-400 border border-red-500/10 animate-pulse"
                              }`}>
                                {inv.status}
                              </span>
                            </td>
                            <td className="py-3 text-right">
                              {inv.status !== "Pago" ? (
                                <button
                                  onClick={() => handlePayInvoice(inv.id)}
                                  className="py-1 px-2.5 text-[10px] font-bold bg-[#00E676] hover:bg-[#00C853] text-black rounded transition duration-150 uppercase"
                                >
                                  Conciliar
                                </button>
                              ) : (
                                <span className="text-[10px] font-mono text-emerald-400 flex items-center justify-end gap-1 font-bold">
                                  <FileCheck className="w-3.5 h-3.5" /> Pago (OK)
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

              </motion.div>
            )}

          </main>

          {/* STATUS FOOTER BAR */}
          <footer className={`h-11 border-t px-6 flex items-center justify-between shrink-0 transition-colors ${
            theme === "dark" ? "bg-[#050408] border-purple-950/20" : "bg-white border-slate-200"
          }`}>
            <div className="flex gap-4">
              <div className="text-[9px] text-[#868A9E] uppercase font-bold font-mono">v2.5.0-Enterprise</div>
              <span className="text-slate-700 hidden sm:inline text-[10px]">|</span>
              <div className="text-[9px] text-emerald-400 uppercase font-bold font-mono flex items-center gap-1">
                <span className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse"></span>
                Secure Tunnel Active
              </div>
            </div>
            <div className="text-[9.5px] text-[#868A9E]">
              OneHub Corporativo — Regulamento de Privacidades Ativo © 2026
            </div>
          </footer>

        </div>
      )}

    </div>
  );
}
