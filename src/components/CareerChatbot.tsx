import React, { useState, useEffect, useRef } from "react";
import { MessageSquare, Send, X, Sparkles, Brain, Trash2, Bot, User, HelpCircle, Loader2 } from "lucide-react";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  modelUsed?: string;
  wasThinking?: boolean;
}

interface CareerChatbotProps {
  currentProfile?: {
    name?: string;
    degree?: string;
    year?: string;
    skills?: string;
    interests?: string;
    preferredDomain?: string;
    careerGoal?: string;
  };
}

export const CareerChatbot: React.FC<CareerChatbotProps> = ({ currentProfile }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [selectedModel, setSelectedModel] = useState("gemini-3.5-flash");
  const [enableThinking, setEnableThinking] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Suggested quick prompts
  const suggestedQuestions = [
    "What are the best entry-level job roles for me?",
    "Suggest a high-impact technical portfolio project",
    "How should I prepare for a web developer interview?",
    "What certifications do you recommend?"
  ];

  // Initialize with greeting message when first opened
  useEffect(() => {
    if (messages.length === 0) {
      const studentName = currentProfile?.name || "Student";
      const welcomeMsg: ChatMessage = {
        id: "welcome",
        role: "assistant",
        content: `Hi ${studentName}! I am your AI Career Advisor. I have analyzed your study details and career ambitions. 

I can help you build custom skill paths, draft project architectures, or prepare for technical interviews. What would you like to discuss today?`,
        timestamp: new Date(),
        modelUsed: "Advisor AI"
      };
      setMessages([welcomeMsg]);
    }
  }, [currentProfile, messages.length]);

  // Handle auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isSending]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text || isSending) return;

    if (!textToSend) {
      setInputText("");
    }

    const newUserMessage: ChatMessage = {
      id: `msg-${Date.now()}-user`,
      role: "user",
      content: text,
      timestamp: new Date()
    };

    const updatedMessages = [...messages, newUserMessage];
    setMessages(updatedMessages);
    setIsSending(true);

    try {
      // Map to request body standard format
      const payloadMessages = updatedMessages.map(m => ({
        role: m.role,
        content: m.content
      }));

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: payloadMessages,
          model: selectedModel,
          useThinking: selectedModel === "gemini-3.1-pro-preview" && enableThinking
        })
      });

      if (!res.ok) {
        throw new Error("Chat request failed");
      }

      const data = await res.json();
      
      const responseMessage: ChatMessage = {
        id: `msg-${Date.now()}-assistant`,
        role: "assistant",
        content: data.text || "I was unable to formulate a response. Please check your network or try again.",
        timestamp: new Date(),
        modelUsed: selectedModel,
        wasThinking: selectedModel === "gemini-3.1-pro-preview" && enableThinking
      };

      setMessages(prev => [...prev, responseMessage]);

    } catch (err: any) {
      console.error("Chat error:", err);
      const errorMessage: ChatMessage = {
        id: `msg-${Date.now()}-error`,
        role: "assistant",
        content: "Oops! I encountered an error. This might be due to a brief API connection issue. Please feel free to try again.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsSending(false);
    }
  };

  const handleClearChat = () => {
    setShowConfirmDelete(true);
  };

  const confirmDelete = () => {
    const studentName = currentProfile?.name || "Student";
    setMessages([
      {
        id: "welcome-reset",
        role: "assistant",
        content: `Chat history cleared. Hi ${studentName}, how else can I help guide your career path?`,
        timestamp: new Date(),
        modelUsed: "Advisor AI"
      }
    ]);
    setShowConfirmDelete(false);
  };

  // Adjust thinking mode selection automatically depending on the selected model
  const handleModelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setSelectedModel(val);
    if (val === "gemini-3.1-pro-preview") {
      setEnableThinking(true);
    } else {
      setEnableThinking(false);
    }
  };

  return (
    <>
      {/* Floating Chat Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 p-4 bg-[var(--accent-primary)] text-[var(--primary-btn-text)] hover:bg-[var(--accent-primary-hover)] rounded-none shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1 active:translate-y-0 flex items-center justify-center gap-2 border border-transparent cursor-pointer print:hidden group"
        id="career-chat-trigger"
      >
        <Bot className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" />
        <span className="text-xs font-bold uppercase tracking-wider hidden sm:inline">Ask Career AI</span>
        {messages.length > 1 && (
          <span className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white font-mono font-bold text-[9px] w-5 h-5 flex items-center justify-center border border-white dark:border-zinc-900 rounded-none animate-pulse">
            {messages.length - 1}
          </span>
        )}
      </button>

      {/* Floating Chat Drawer / Panel */}
      {isOpen && (
        <div
          className="fixed bottom-24 right-4 sm:right-6 z-50 w-[92vw] sm:w-[420px] h-[550px] bg-[var(--bg-card)] border-2 border-[var(--color-border)] shadow-2xl flex flex-col rounded-none overflow-hidden transition-all duration-300 print:hidden animate-in slide-in-from-bottom-5 duration-300"
          id="career-chat-panel"
        >
          {/* Header Panel */}
          <div className="bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)] px-4 py-3 text-[var(--primary-btn-text)] flex justify-between items-center border-b border-[var(--color-border)]/20">
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5 text-[var(--primary-btn-text)] animate-pulse" />
              <div>
                <h3 className="text-xs font-black uppercase tracking-wider">Advisor AI Counselor</h3>
                <p className="text-[9px] font-mono opacity-80 uppercase tracking-widest">Active Academic Guard</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={handleClearChat}
                className="p-1.5 hover:bg-white/10 text-[var(--primary-btn-text)]/80 hover:text-white transition-colors cursor-pointer"
                title="Clear Chat History"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 hover:bg-white/10 text-[var(--primary-btn-text)]/80 hover:text-white transition-colors cursor-pointer"
                title="Minimize Panel"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Model Config & Parameter Rail */}
          <div className="px-3 py-2 bg-[var(--bg-input)] border-b border-[var(--color-border)] flex flex-wrap items-center justify-between gap-2 text-[10px] font-mono text-[var(--text-muted)] uppercase">
            <div className="flex items-center gap-1 w-full sm:w-auto">
              <span className="shrink-0 font-bold">Model:</span>
              <select
                value={selectedModel}
                onChange={handleModelChange}
                className="bg-[var(--bg-card)] text-[var(--text-main)] border border-[var(--color-border)] px-1 py-0.5 outline-none rounded-none w-full sm:w-auto font-mono"
              >
                <option value="gemini-3.1-flash-lite">Speed Mode (3.1-lite)</option>
                <option value="gemini-3.5-flash">Standard Advisor (3.5-flash)</option>
                <option value="gemini-3.1-pro-preview">Deep Reasoner (3.1-pro)</option>
              </select>
            </div>

            {selectedModel === "gemini-3.1-pro-preview" && (
              <div className="flex items-center gap-1.5">
                <Brain className="w-3.5 h-3.5 text-purple-500 animate-pulse" />
                <span className="font-bold text-purple-600 dark:text-purple-400">High Thinking:</span>
                <input
                  type="checkbox"
                  checked={enableThinking}
                  onChange={(e) => setEnableThinking(e.target.checked)}
                  className="rounded-none border-[var(--color-border)] accent-purple-600"
                />
              </div>
            )}
          </div>

          {/* Inline confirmation for clearing chat history */}
          {showConfirmDelete && (
            <div className="bg-rose-500/10 border-b border-rose-500/20 px-4 py-2.5 flex items-center justify-between text-xs text-[var(--text-main)] animate-in fade-in duration-200">
              <span className="font-semibold text-rose-600 dark:text-rose-400">Clear chat history?</span>
              <div className="flex gap-2">
                <button
                  onClick={confirmDelete}
                  className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-[var(--primary-btn-text)] text-[10px] font-bold uppercase rounded-none cursor-pointer"
                >
                  Yes, Clear
                </button>
                <button
                  onClick={() => setShowConfirmDelete(false)}
                  className="px-2.5 py-1 bg-[var(--bg-card)] border border-[var(--color-border)] hover:bg-[var(--bg-input)] text-[var(--text-muted)] text-[10px] font-bold uppercase rounded-none cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Message Thread Area */}
          <div
            ref={chatContainerRef}
            className="flex-1 p-4 overflow-y-auto space-y-4 bg-[var(--bg-card)] text-[var(--text-main)] scrollbar-thin"
          >
            {messages.map((m) => {
              const isAssistant = m.role === "assistant";
              return (
                <div key={m.id} className={`flex gap-2.5 ${isAssistant ? "justify-start" : "justify-end"}`}>
                  {isAssistant && (
                    <div className="w-6 h-6 rounded-none bg-[var(--accent-light)] border border-[var(--accent-light-border)] text-[var(--accent-primary)] flex items-center justify-center shrink-0">
                      <Bot className="w-3.5 h-3.5" />
                    </div>
                  )}
                  
                  <div className="max-w-[82%] flex flex-col gap-1">
                    <div
                      className={`px-3.5 py-2.5 border text-xs leading-relaxed rounded-none shadow-xs whitespace-pre-wrap ${
                        isAssistant
                          ? "bg-[var(--bg-input)] border-[var(--color-border)] text-[var(--text-main)]"
                          : "bg-[var(--accent-primary)] border-transparent text-[var(--primary-btn-text)] font-medium"
                      }`}
                    >
                      {m.content}
                    </div>
                    
                    {/* Meta Indicators */}
                    <div className={`flex items-center gap-2 text-[8px] font-mono uppercase tracking-wider text-[var(--text-muted)] opacity-80 ${!isAssistant ? "justify-end" : "justify-start"}`}>
                      <span>
                        {m.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                      {isAssistant && m.modelUsed && (
                        <span className="flex items-center gap-1 font-bold">
                          • {m.modelUsed.replace("-preview", "").replace("gemini-", "")}
                          {m.wasThinking && (
                            <span className="bg-purple-100 dark:bg-purple-950/40 text-purple-600 px-1 py-0.2 select-none font-sans lowercase">
                              (thinking: high)
                            </span>
                          )}
                        </span>
                      )}
                    </div>
                  </div>

                  {!isAssistant && (
                    <div className="w-6 h-6 rounded-none bg-[var(--accent-secondary)] text-[var(--primary-btn-text)] flex items-center justify-center shrink-0">
                      <User className="w-3.5 h-3.5" />
                    </div>
                  )}
                </div>
              );
            })}

            {isSending && (
              <div className="flex gap-2.5 justify-start">
                <div className="w-6 h-6 rounded-none bg-[var(--accent-light)] border border-[var(--accent-light-border)] text-[var(--accent-primary)] flex items-center justify-center shrink-0">
                  <Bot className="w-3.5 h-3.5 animate-bounce" />
                </div>
                <div className="max-w-[80%] px-3.5 py-2.5 border bg-[var(--bg-input)] border-[var(--color-border)] rounded-none shadow-xs text-xs flex items-center gap-2 text-[var(--text-muted)]">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-[var(--accent-primary)]" />
                  <span>
                    {selectedModel === "gemini-3.1-pro-preview" && enableThinking
                      ? "Formulating solution with deep thinking..."
                      : "Consulting advisor network..."}
                  </span>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Questions Helper Rail */}
          {messages.length <= 2 && !isSending && (
            <div className="px-3 py-2 bg-[var(--bg-input)] border-t border-[var(--color-border)] flex flex-col gap-1">
              <span className="text-[9px] font-mono uppercase text-[var(--text-muted)] font-bold">Suggested counseling topics:</span>
              <div className="flex flex-wrap gap-1.5 max-h-[80px] overflow-y-auto">
                {suggestedQuestions.map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(q)}
                    className="text-[10px] text-left px-2 py-1 border border-[var(--color-border)] hover:border-[var(--accent-primary)] hover:bg-[var(--bg-card)] text-[var(--text-main)] transition-all rounded-none cursor-pointer bg-[var(--bg-card)] truncate max-w-full"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* User Input controls */}
          <div className="p-3 bg-[var(--bg-card)] border-t border-[var(--color-border)] flex gap-2 items-center">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder="Ask me to detail a cert, map tools, review resume tips..."
              className="flex-1 bg-[var(--bg-input)] border border-[var(--color-border)] text-[var(--text-main)] text-xs px-3 py-2.5 outline-none rounded-none focus:border-[var(--accent-primary)] font-sans"
              disabled={isSending}
            />
            <button
              onClick={() => handleSendMessage()}
              disabled={isSending || !inputText.trim()}
              className="p-2.5 bg-[var(--accent-primary)] text-[var(--primary-btn-text)] hover:bg-[var(--accent-primary-hover)] rounded-none transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed border border-transparent shadow-xs"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
};
