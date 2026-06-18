import React, { useState, useRef, useEffect } from "react";
import { Bot, Send, Sparkles, AlertCircle, RefreshCw, X, HelpCircle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface AIPanelProps {
  systemState: any;
  isOpen: boolean;
  onClose: () => void;
}

export default function AIPanel({ systemState, isOpen, onClose }: AIPanelProps) {
  const [messages, setMessages] = useState<Array<{ id: string; text: string; sender: "user" | "ai"; timestamp: Date }>>([
    {
      id: "init",
      text: "Olá! Sou a **ONEHUB AI**, a inteligência artificial corporativa integrada ao ecossistema da FIRJAN. Estou pronta para analisar os indicadores em tempo real das unidades SESI, SENAI e IEL. Como posso auxiliar suas análises estratégicas hoje?",
      sender: "ai",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const suggestedQuestions = [
    "Quantos projetos estão atrasados ou críticos?",
    "Gerar relatório executivo do trimestre.",
    "Qual unidade teve melhor desempenho este mês?",
    "Quais os principais KPIs de Educação e Pessoas?",
  ];

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isLoading]);

  const handleSend = async (textToSend: string) => {
    if (!textToSend.trim() || isLoading) return;

    const userMsgId = `usr-${Date.now()}`;
    const userPrompt = textToSend.trim();
    
    // Add user message to thread
    setMessages((prev) => [
      ...prev,
      { id: userMsgId, text: userPrompt, sender: "user", timestamp: new Date() }
    ]);
    
    setInput("");
    setIsLoading(true);
    setErrorNotice(null);

    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: userPrompt,
          systemState: systemState
        }),
      });

      if (!response.ok) {
        throw new Error("Falha na comunicação com o servidor.");
      }

      const data = await response.json();
      
      setMessages((prev) => [
        ...prev,
        {
          id: `ai-${Date.now()}`,
          text: data.text || "Sem resposta retornada.",
          sender: "ai",
          timestamp: new Date()
        }
      ]);
    } catch (err: any) {
      console.error("AI Assistant Error:", err);
      setErrorNotice("Não foi possível acessar a rede da IA. Utilizando heurísticas locais.");
      
      // Fallback response generator if server fails
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            id: `ai-${Date.now()}`,
            text: `### Resposta Offiline Temporária (Heurística de Contingência)
Não conseguimos falar com a API remota do Gemini, mas com base no estado atual do sistema:
- **Colaboradores:** ${systemState.totalColaboradores} ativos.
- **Projetos Ativos:** ${systemState.projetosAtivos} cadastrados.
- **Inconformidades:** Há ${systemState.projetosAtrasados} projeto(s) com status atrasado.

*Recomendamos verificar a conectividade do servidor ou registrar uma chave de API válida no painel.*`,
            sender: "ai",
            timestamp: new Date()
          }
        ]);
      }, 800);
    } finally {
      setIsLoading(false);
    }
  };

  const parseMarkdown = (text: string) => {
    // Basic formatting for preview (headings, lists, bold)
    const lines = text.split("\n");
    return lines.map((line, i) => {
      let styled = line;
      // Bold
      styled = styled.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      styled = styled.replace(/\*(.*?)\*/g, '<em>$1</em>');
      
      if (line.startsWith("### ")) {
        return <h4 key={i} className="text-sm font-semibold text-purple-400 mt-3 mb-1 font-display">{line.replace("### ", "")}</h4>;
      }
      if (line.startsWith("## ")) {
        return <h3 key={i} className="text-base font-bold text-neon-purple mt-4 mb-2 font-display">{line.replace("## ", "")}</h3>;
      }
      if (line.startsWith("1. ") || line.startsWith("- ")) {
        return <p key={i} className="text-xs pl-3 py-0.5 border-l-2 border-purple-900/40 text-gray-300 ml-1">{styled.replace(/^(\d+\.|-)\s+/, "")}</p>;
      }
      return <p key={i} className="text-xs py-1 leading-relaxed text-gray-300" dangerouslySetInnerHTML={{ __html: styled }} />;
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 transition-opacity"
            onClick={onClose}
          />

          {/* Chat drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-[#121214] border-l border-purple-900/50 text-white shadow-2xl flex flex-col z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 bg-[#1a1a1f] border-b border-purple-900/40 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-gradient-to-tr from-purple-600 to-indigo-600 rounded-lg text-white">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display font-medium text-sm tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-neon-green">
                    ONEHUB AI
                  </h3>
                  <p className="text-[10px] text-zinc-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-neon-green animate-pulse"></span>
                    Gemini Active Integration
                  </p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="p-1 px-2 text-xs text-zinc-400 hover:text-white rounded-md hover:bg-zinc-800 transition"
                title="Fechar Painel"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick status widgets */}
            <div className="px-4 py-2 bg-purple-950/20 border-b border-purple-900/30 flex items-center justify-between">
              <span className="text-[10px] text-purple-300 font-mono">
                SLA Global: {(systemState.slaPercent || 92)}%
              </span>
              <span className="text-[10px] text-neon-green font-mono">
                Evasão Média: {(systemState.taxaEvasao || "2.8%")}
              </span>
              <span className="text-[10px] text-zinc-400 font-mono">
                Projetos: {systemState.projetosAtivos || 4}
              </span>
            </div>

            {/* Conversation Log */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4">
              {messages.map((msg) => (
                <div 
                  key={msg.id}
                  className={`flex gap-3 ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                >
                  {msg.sender === "ai" && (
                    <div className="w-7 h-7 rounded-lg bg-zinc-800 border border-purple-900/30 flex items-center justify-center shrink-0 self-start mt-1">
                      <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                    </div>
                  )}

                  <div 
                    className={`p-3 rounded-xl max-w-[85%] text-zinc-100 text-xs shadow-sm ${
                      msg.sender === "user" 
                        ? "bg-gradient-to-tr from-purple-600 to-indigo-600 rounded-tr-none text-white text-right" 
                        : "bg-[#1d1d23] border border-zinc-800/80 rounded-tl-none text-left"
                    }`}
                  >
                    {msg.sender === "ai" ? (
                      <div className="space-y-1">
                        {parseMarkdown(msg.text)}
                      </div>
                    ) : (
                      <p className="whitespace-pre-wrap">{msg.text}</p>
                    )}
                    <span className="block text-[8px] mt-1.5 opacity-50 text-right">
                      {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex gap-3 justify-start">
                  <div className="w-7 h-7 rounded-lg bg-zinc-800 border border-purple-900/40 flex items-center justify-center shrink-0 animate-spin">
                    <RefreshCw className="w-3.5 h-3.5 text-neon-purple" />
                  </div>
                  <div className="p-3 bg-[#1d1d23] border border-purple-900/20 rounded-xl rounded-tl-none">
                    <p className="text-xs text-zinc-400 flex items-center gap-1.5 animate-pulse">
                      Analisando métricas setoriais e gerando insights...
                    </p>
                  </div>
                </div>
              )}

              {errorNotice && (
                <div className="p-2.5 bg-amber-950/20 border border-amber-500/30 rounded-lg text-[10px] text-amber-300 flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{errorNotice}</span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Suggested prompts helper */}
            <div className="p-3 pb-1 bg-[#1a1a1f] border-t border-purple-900/30">
              <p className="text-[10px] text-zinc-400 font-medium mb-1.5 flex items-center gap-1">
                <HelpCircle className="w-3 h-3 text-purple-400" />
                Dúvidas recomendadas:
              </p>
              <div className="flex flex-wrap gap-1.5">
                {suggestedQuestions.map((q, i) => (
                  <button
                    key={i}
                    onClick={() => handleSend(q)}
                    disabled={isLoading}
                    className="text-[9px] bg-zinc-800 hover:bg-zinc-700 active:bg-zinc-900 border border-zinc-700/50 hover:border-purple-600 text-zinc-300 hover:text-white px-2 py-1 rounded-md text-left transition"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>

            {/* Input Bar */}
            <div className="p-4 bg-[#141417] border-t border-purple-900/30 flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend(input)}
                placeholder="Pergunte ao ONEHUB AI em tempo real..."
                disabled={isLoading}
                className="flex-1 bg-zinc-900 text-zinc-100 border border-purple-900/20 focus:border-purple-500 placeholder-zinc-500 text-xs rounded-lg px-3 py-2 outline-none transition"
              />
              <button
                onClick={() => handleSend(input)}
                disabled={!input.trim() || isLoading}
                className="p-2 bg-gradient-to-tr from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50 transition shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
