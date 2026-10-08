import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Sparkles,
  Bot,
  User,
  ChevronDown,
  ChevronUp,
  Cpu,
  CheckCircle2,
  AlertCircle,
  Mic,
  Lightbulb,
} from 'lucide-react';
import { ApplicantProfile, ChatMessage, ReActStep } from '../types/index';
import { api } from '../services/api';

interface ChatInterfaceProps {
  applicant: ApplicantProfile;
  onProfileUpdated: () => void;
  onOpenOcrModal: () => void;
  onOpenVideoRecorder: () => void;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  applicant,
  onProfileUpdated,
  onOpenOcrModal,
  onOpenVideoRecorder,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [expandedSteps, setExpandedSteps] = useState<Record<number, boolean>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initial welcome message based on active persona
  useEffect(() => {
    const welcomeText = `Guten Tag & Welcome to AeroPath AI, **${applicant.fullName}**! 

I am your autonomous German Migration & Academic Counselor at Educaro. You are currently exploring the **${applicant.goalTrack}** pathway.

I specialize in Indian academic credential recognition (Anabin H+ verification, Indian CGPA/Percentage to German Bavarian GPA conversion, APS New Delhi protocols, and Educaro partner hospital & university placements).

Tell me about your educational qualifications, German/English language certifications, or ask any question about your German journey!`;

    setMessages([
      {
        role: 'assistant',
        content: welcomeText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  }, [applicant.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputText.trim();
    if (!text || isLoading) return;

    setInputText('');
    const userMsg: ChatMessage = {
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const data = await api.sendChatMessage(applicant.id, text);
      const assistantMsg: ChatMessage = {
        role: 'assistant',
        content: data.response,
        reactSteps: data.reactSteps,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, assistantMsg]);
      // Auto-expand latest reasoning trace
      setExpandedSteps((prev) => ({ ...prev, [messages.length + 1]: true }));
      // Trigger parent live profile refresh!
      onProfileUpdated();
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Sorry, I encountered an issue executing the ReAct agent loop. Please try again.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleStepExpand = (index: number) => {
    setExpandedSteps((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  const quickPrompts = [
    'I have an 8.4 CGPA in B.Tech Computer Engineering from Pune University.',
    'I passed Goethe-Zertifikat A2 German with 84/100.',
    'What is the APS Certificate requirement for Indian students?',
    'I am a GNM Nurse from Kerala looking for German Ausbildung.',
    'I want to check my eligibility for the Opportunity Card (Chancenkarte).',
  ];

  return (
    <div className="flex flex-col h-full bg-slate-900/60 rounded-2xl border border-slate-800 backdrop-blur-md overflow-hidden shadow-xl">
      {/* Header */}
      <div className="px-5 py-3.5 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-9 h-9 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Bot className="w-5 h-5" />
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-slate-950" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-white tracking-tight">
                AeroPath ReAct Counselor
              </h2>
              <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 rounded border border-emerald-500/20">
                Agentic Loop Active
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Transparent Thought ➔ Action ➔ Observation Reasoning Engine
            </p>
          </div>
        </div>

        {/* Quick action buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenOcrModal}
            className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-blue-400 border border-slate-700 transition flex items-center gap-1.5"
          >
            <span>📄 OCR Test</span>
          </button>
          <button
            onClick={onOpenVideoRecorder}
            className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 transition flex items-center gap-1.5"
          >
            <span>📹 Pitch Video</span>
          </button>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
        {messages.map((msg, idx) => {
          const isUser = msg.role === 'user';
          const hasSteps = msg.reactSteps && msg.reactSteps.length > 0;
          const isExpanded = !!expandedSteps[idx];

          return (
            <div
              key={idx}
              className={`flex gap-3 max-w-3xl ${isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
            >
              {/* Avatar */}
              <div
                className={`w-8 h-8 rounded-lg shrink-0 flex items-center justify-center text-xs font-bold ${
                  isUser
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                    : 'bg-slate-800 text-blue-400 border border-slate-700'
                }`}
              >
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              {/* Message Bubble */}
              <div className="space-y-2 max-w-[85%] sm:max-w-[80%]">
                <div
                  className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                    isUser
                      ? 'bg-blue-600 text-white rounded-tr-none shadow-lg shadow-blue-600/10'
                      : 'bg-slate-800/90 text-slate-100 border border-slate-700/80 rounded-tl-none'
                  }`}
                >
                  <div className="whitespace-pre-line font-normal">{msg.content}</div>

                  <div
                    className={`mt-2 text-[10px] flex items-center justify-end ${
                      isUser ? 'text-blue-200' : 'text-slate-400'
                    }`}
                  >
                    <span>{msg.timestamp}</span>
                  </div>
                </div>

                {/* ReAct Reasoning Trace Drawer */}
                {hasSteps && (
                  <div className="rounded-xl border border-blue-500/20 bg-blue-950/20 backdrop-blur-sm overflow-hidden">
                    <button
                      onClick={() => toggleStepExpand(idx)}
                      className="w-full px-3.5 py-2 flex items-center justify-between text-xs font-semibold text-blue-300 hover:text-blue-200 hover:bg-blue-900/30 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <Cpu className="w-3.5 h-3.5 text-blue-400" />
                        <span>ReAct Chain-of-Thought ({msg.reactSteps?.length} steps)</span>
                      </div>
                      {isExpanded ? (
                        <ChevronUp className="w-3.5 h-3.5" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5" />
                      )}
                    </button>

                    {isExpanded && (
                      <div className="p-3 border-t border-blue-500/15 space-y-3 bg-slate-950/40 text-xs">
                        {msg.reactSteps?.map((step: ReActStep, sIdx: number) => (
                          <div
                            key={sIdx}
                            className="p-2.5 rounded-lg bg-slate-900/90 border border-slate-800 space-y-2 font-mono text-[11px]"
                          >
                            {/* Thought */}
                            <div className="flex items-start gap-1.5 text-amber-300">
                              <span className="font-bold text-amber-400 shrink-0">💭 Thought:</span>
                              <span className="text-slate-300 font-sans">{step.thought}</span>
                            </div>

                            {/* Action */}
                            <div className="flex items-start gap-1.5 text-blue-300 bg-slate-950 p-1.5 rounded border border-slate-800">
                              <span className="font-bold text-blue-400 shrink-0">⚡ Action:</span>
                              <span className="font-mono text-purple-300">{step.action}</span>
                              <span className="text-slate-400">({JSON.stringify(step.actionInput)})</span>
                            </div>

                            {/* Observation */}
                            <div className="flex items-start gap-1.5 text-emerald-300 bg-slate-950/60 p-1.5 rounded border border-emerald-950/50">
                              <span className="font-bold text-emerald-400 shrink-0">👁️ Observation:</span>
                              <span className="text-slate-300 font-sans">
                                {typeof step.observation === 'object'
                                  ? JSON.stringify(step.observation, null, 1)
                                  : String(step.observation)}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Loading Spinner */}
        {isLoading && (
          <div className="flex gap-3 max-w-lg">
            <div className="w-8 h-8 rounded-lg bg-slate-800 text-blue-400 border border-slate-700 flex items-center justify-center">
              <Bot className="w-4 h-4 animate-spin" />
            </div>
            <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/80 text-xs text-slate-300 flex items-center gap-3">
              <Sparkles className="w-4 h-4 text-blue-400 animate-pulse" />
              <span>AeroPath Agent executing ReAct tool loop (Bavarian formula, Anabin check)...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts Bar */}
      <div className="px-4 py-2 border-t border-slate-800/80 bg-slate-950/40">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
          <Lightbulb className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span className="text-[11px] text-slate-400 shrink-0 font-medium mr-1">Suggested:</span>
          {quickPrompts.map((prompt, pIdx) => (
            <button
              key={pIdx}
              onClick={() => handleSendMessage(prompt)}
              disabled={isLoading}
              className="shrink-0 px-2.5 py-1 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-[11px] transition-colors whitespace-nowrap"
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>

      {/* Input Bar */}
      <div className="p-3 sm:p-4 border-t border-slate-800 bg-slate-950/80">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          <div className="relative flex-1">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="e.g. I have 8.4 CGPA in B.Tech from Pune University and Goethe A2 German..."
              disabled={isLoading}
              className="w-full bg-slate-900 border border-slate-700 focus:border-blue-500 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition"
            />
          </div>

          {/* Voice input simulator button */}
          <button
            type="button"
            onClick={() => {
              setInputText(
                'Hallo! I completed my degree with First Class Distinction in India and I am preparing for Goethe B1 German exam.',
              );
            }}
            title="Simulate Voice Input"
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition"
          >
            <Mic className="w-4 h-4 text-emerald-400" />
          </button>

          {/* Send Button */}
          <button
            type="submit"
            disabled={!inputText.trim() || isLoading}
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold text-xs sm:text-sm flex items-center gap-1.5 shadow-lg shadow-blue-600/30 transition"
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">Send</span>
          </button>
        </form>
      </div>
    </div>
  );
};
