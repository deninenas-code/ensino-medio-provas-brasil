'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Play, 
  Pause, 
  Flag, 
  Maximize2, 
  Minimize2, 
  CheckCircle, 
  ArrowLeft, 
  ArrowRight, 
  Strikethrough, 
  Edit3, 
  CloudCheck, 
  AlertTriangle, 
  X, 
  Sparkles,
  HelpCircle,
  Lightbulb,
  BookOpen,
  Eye,
  Check,
  Clock
} from 'lucide-react';
import { Simulado, Question } from '@/lib/types';
import { 
  saveActiveExamState, 
  getActiveExamState, 
  InProgressExamState 
} from '@/lib/storage';

interface ExamPlayerProps {
  simulado: Simulado;
  onFinishExam: (results: {
    answers: Record<number, 'A' | 'B' | 'C' | 'D' | 'E' | undefined>;
    flagged: number[];
    struck: Record<number, ('A' | 'B' | 'C' | 'D' | 'E')[]>;
    timeSpentSeconds: number;
  }) => void;
  onBackToCatalog: () => void;
}

export const ExamPlayer: React.FC<ExamPlayerProps> = ({
  simulado,
  onFinishExam,
  onBackToCatalog,
}) => {
  // Load initial state if in-progress matches
  const savedState = useMemo(() => {
    const s = getActiveExamState();
    return s && s.simuladoId === simulado.id ? s : null;
  }, [simulado.id]);

  const [currentIndex, setCurrentIndex] = useState<number>(
    savedState ? savedState.currentQuestionIndex : 0
  );
  const [answers, setAnswers] = useState<Record<number, 'A' | 'B' | 'C' | 'D' | 'E' | undefined>>(
    savedState ? savedState.answers : {}
  );
  const [flaggedQuestions, setFlaggedQuestions] = useState<number[]>(
    savedState ? savedState.flaggedForReview : []
  );
  const [struckAlternatives, setStruckAlternatives] = useState<
    Record<number, ('A' | 'B' | 'C' | 'D' | 'E')[]>
  >(savedState ? savedState.struckAlternatives : {});
  
  // Timer (seconds remaining)
  const initialSeconds = savedState 
    ? savedState.timeRemainingSeconds 
    : simulado.durationMinutes * 60;
  const [timeRemaining, setTimeRemaining] = useState<number>(initialSeconds);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [isZenMode, setIsZenMode] = useState<boolean>(false);
  
  // Modals & Tools
  const [showFinishModal, setShowFinishModal] = useState<boolean>(false);
  const [showScratchpad, setShowScratchpad] = useState<boolean>(false);
  const [scratchpadNotes, setScratchpadNotes] = useState<string>(
    savedState ? savedState.notes : ''
  );
  const [penStrikeMode, setPenStrikeMode] = useState<boolean>(false);
  const [fontSizeLevel, setFontSizeLevel] = useState<'normal' | 'large'>('normal');

  const totalQuestions = simulado.questions.length;
  const currentQuestion: Question | undefined = simulado.questions[currentIndex];

  const handleFinishConfirmed = React.useCallback(() => {
    setShowFinishModal(false);
    saveActiveExamState(null); // clear in-progress
    const totalSpent = simulado.durationMinutes * 60 - timeRemaining;
    onFinishExam({
      answers,
      flagged: flaggedQuestions,
      struck: struckAlternatives,
      timeSpentSeconds: Math.max(1, totalSpent),
    });
  }, [simulado.durationMinutes, timeRemaining, onFinishExam, answers, flaggedQuestions, struckAlternatives]);

  const finishRef = useRef(handleFinishConfirmed);
  useEffect(() => {
    finishRef.current = handleFinishConfirmed;
  }, [handleFinishConfirmed]);

  // Live timer interval
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          finishRef.current();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isPaused]);

  // Auto-save to localStorage every 4 seconds or on state change
  useEffect(() => {
    const state: InProgressExamState = {
      simuladoId: simulado.id,
      currentQuestionIndex: currentIndex,
      answers,
      flaggedForReview: flaggedQuestions,
      struckAlternatives,
      timeRemainingSeconds: timeRemaining,
      notes: scratchpadNotes,
    };
    saveActiveExamState(state);
  }, [
    simulado.id,
    currentIndex,
    answers,
    flaggedQuestions,
    struckAlternatives,
    timeRemaining,
    scratchpadNotes,
  ]);

  // Answer selection handler
  const handleSelectAnswer = (altId: 'A' | 'B' | 'C' | 'D' | 'E') => {
    if (penStrikeMode) {
      // Toggle strikeout instead
      toggleStrikeAlternative(currentIndex, altId);
      return;
    }
    setAnswers((prev) => ({
      ...prev,
      [currentIndex]: prev[currentIndex] === altId ? undefined : altId,
    }));
  };

  const toggleStrikeAlternative = (
    qIndex: number,
    altId: 'A' | 'B' | 'C' | 'D' | 'E'
  ) => {
    setStruckAlternatives((prev) => {
      const currentList = prev[qIndex] || [];
      const updated = currentList.includes(altId)
        ? currentList.filter((a) => a !== altId)
        : [...currentList, altId];
      return { ...prev, [qIndex]: updated };
    });
  };

  const toggleFlagQuestion = () => {
    setFlaggedQuestions((prev) =>
      prev.includes(currentIndex)
        ? prev.filter((i) => i !== currentIndex)
        : [...prev, currentIndex]
    );
  };

  // Metrics
  const answeredCount = Object.values(answers).filter(Boolean).length;
  const flaggedCount = flaggedQuestions.length;
  const pendingCount = totalQuestions - answeredCount;
  const progressPercent = Math.round((answeredCount / totalQuestions) * 100);

  // Time formatting
  const formatTime = (secs: number) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  if (!currentQuestion) return null;

  return (
    <div className={`min-h-screen bg-[#faf8ff] pb-16 ${isZenMode ? 'fixed inset-0 z-50 overflow-y-auto bg-[#faf8ff]' : ''}`}>
      {/* Top Exam HUD Bar (Sticky, focused, exact Stitch design) */}
      <div className="sticky top-0 z-30 w-full bg-[#ffffff]/95 backdrop-blur-md shadow-xs border-b border-[#eaedff] px-4 lg:px-8 py-3">
        <div className="max-w-[1400px] mx-auto flex flex-col xl:flex-row xl:items-center justify-between gap-3">
          {/* Simulado Info & Status */}
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={onBackToCatalog}
              className="w-10 h-10 rounded-xl bg-[#dbe1ff] hover:bg-[#b4c5ff] flex items-center justify-center shrink-0 text-[#004ac6] transition-colors"
              title="Voltar ao catálogo"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full bg-[#dae2fd] text-[#004ac6] font-label-sm text-[10px] uppercase tracking-wider font-bold">
                  {simulado.badge}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-[#85f8c4] text-[#002114] font-label-sm text-[10px] font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#006c4a] animate-pulse" />
                  Modo Prova Ativo
                </span>
              </div>
              <h1 className="font-headline-sm text-sm sm:text-base text-[#131b2e] truncate font-bold">
                {simulado.title}
              </h1>
            </div>
          </div>

          {/* Right Controls HUD */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 justify-between xl:justify-end shrink-0">
            {/* Live Countdown Timer Widget */}
            <div className="flex items-center gap-2.5 bg-[#f2f3ff] px-3.5 py-1.5 rounded-full shadow-xs border border-[#eaedff]">
              <div className="relative w-7 h-7 flex items-center justify-center text-[#006c4a]">
                <Clock className="w-4 h-4 text-[#006c4a]" />
              </div>
              <div className="flex flex-col">
                <span className="font-label-sm text-[9px] text-[#737686] leading-none uppercase">
                  Tempo Restante
                </span>
                <span className="font-headline-sm text-sm font-extrabold tracking-tight font-mono text-[#131b2e]">
                  {formatTime(timeRemaining)}
                </span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-[#82f5c1] text-[#00714e] font-label-sm text-[10px] font-bold hidden sm:inline">
                Ritmo Ótimo (~2m25s/q)
              </span>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex items-center gap-1.5">
              {/* Flag for Review */}
              <button
                onClick={toggleFlagQuestion}
                className={`flex items-center gap-1 px-3 py-2 rounded-xl transition-all shadow-xs text-xs font-bold ${
                  flaggedQuestions.includes(currentIndex)
                    ? 'bg-[#ffddb8] text-[#2a1700] ring-2 ring-[#996100]'
                    : 'bg-[#eaedff] text-[#434655] hover:bg-[#dae2fd]'
                }`}
                title="Marcar questão para revisar depois"
              >
                <Flag className="w-4 h-4 fill-current" />
                <span className="hidden sm:inline">Revisar</span>
              </button>

              {/* Pause simulation */}
              <button
                onClick={() => setIsPaused(!isPaused)}
                className={`p-2 rounded-xl transition-colors ${
                  isPaused ? 'bg-[#ffddb8] text-[#2a1700]' : 'text-[#434655] hover:bg-[#eaedff]'
                }`}
                title={isPaused ? 'Retomar Simulado' : 'Pausar Simulado'}
              >
                {isPaused ? <Play className="w-5 h-5 fill-current" /> : <Pause className="w-5 h-5" />}
              </button>

              {/* Zen / Focus mode */}
              <button
                onClick={() => setIsZenMode(!isZenMode)}
                className={`p-2 rounded-xl transition-colors ${
                  isZenMode ? 'bg-[#004ac6] text-white' : 'text-[#434655] hover:bg-[#eaedff]'
                }`}
                title={isZenMode ? 'Sair do Modo Foco' : 'Modo Foco Expandido'}
              >
                {isZenMode ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
              </button>

              {/* Finalizar Prova */}
              <button
                onClick={() => setShowFinishModal(true)}
                className="px-3.5 py-2 rounded-xl bg-[#ba1a1a] hover:bg-[#93000a] text-white font-label-md text-xs sm:text-sm font-bold shadow-xs flex items-center gap-1.5 transition-transform active:scale-95"
              >
                <CheckCircle className="w-4 h-4" />
                <span>Finalizar Prova</span>
              </button>
            </div>
          </div>
        </div>

        {/* Micro Progress Strip */}
        <div className="max-w-[1400px] mx-auto mt-2 pt-2 border-t border-[#eaedff] flex items-center justify-between gap-4 text-xs text-[#434655]">
          <div className="flex items-center gap-2">
            <span className="font-label-sm font-bold text-[#004ac6]">Progresso Geral:</span>
            <span className="font-label-sm font-bold text-[#131b2e]">
              {answeredCount} de {totalQuestions} respondidas ({progressPercent}% concluído)
            </span>
          </div>

          <div className="flex-1 max-w-md h-2 rounded-full bg-[#dae2fd] overflow-hidden hidden sm:block">
            <div
              className="h-full bg-gradient-to-r from-[#004ac6] to-[#006c4a] rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <div className="flex items-center gap-3 font-label-sm text-[11px]">
            <span className="flex items-center gap-1 text-[#006c4a] font-semibold">
              <span className="w-2 h-2 rounded-full bg-[#006c4a]" /> {answeredCount} Feitas
            </span>
            <span className="flex items-center gap-1 text-[#784b00] font-semibold">
              <span className="w-2 h-2 rounded-full bg-[#ffb95f]" /> {flaggedCount} Marcadas
            </span>
            <span className="flex items-center gap-1 text-[#737686] font-semibold">
              <span className="w-2 h-2 rounded-full bg-[#c3c6d7]" /> {pendingCount} Pendentes
            </span>
          </div>
        </div>
      </div>

      {/* Main Two-Column Canvas: Map on Left (4 cols) + Question Paper on Right (8 cols) */}
      <div className="max-w-[1400px] w-full mx-auto p-4 lg:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Panel: Dynamic Exam Map / Cartão-Resposta Digital */}
        <aside className="lg:col-span-4 xl:col-span-3 bg-white rounded-2xl p-5 shadow-xs border border-[#eaedff] sticky top-28 order-2 lg:order-1">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#eaedff]">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-[#004ac6]" />
              <span className="font-headline-sm text-sm font-bold text-[#131b2e]">Mapa da Prova</span>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-[#dbe1ff] text-[#00174b] font-label-sm text-[11px] font-bold">
              {totalQuestions} Questões
            </span>
          </div>

          {/* Quick Stats Badges */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            <div className="bg-[#85f8c4]/40 p-2 rounded-xl text-center border border-[#85f8c4]">
              <div className="font-headline-sm text-base text-[#002114] font-bold">{answeredCount}</div>
              <div className="font-label-sm text-[10px] text-[#006c4a] font-semibold">Respondidas</div>
            </div>
            <div className="bg-[#ffddb8] p-2 rounded-xl text-center border border-[#ffb95f]">
              <div className="font-headline-sm text-base text-[#2a1700] font-bold">{flaggedCount}</div>
              <div className="font-label-sm text-[10px] text-[#653e00] font-semibold">Dúvidas</div>
            </div>
            <div className="bg-[#f2f3ff] p-2 rounded-xl text-center border border-[#eaedff]">
              <div className="font-headline-sm text-base text-[#131b2e] font-bold">{pendingCount}</div>
              <div className="font-label-sm text-[10px] text-[#434655] font-semibold">Pendentes</div>
            </div>
          </div>

          {/* Matrix of Questions */}
          <div className="grid grid-cols-5 gap-2 max-h-[360px] overflow-y-auto pr-1">
            {simulado.questions.map((q, idx) => {
              const isCurrent = idx === currentIndex;
              const isAnswered = answers[idx] !== undefined;
              const isFlagged = flaggedQuestions.includes(idx);

              let buttonClass = 'bg-[#f2f3ff] text-[#434655] hover:bg-[#eaedff]';
              if (isAnswered) {
                buttonClass = 'bg-[#82f5c1] text-[#00714e] font-bold hover:opacity-90';
              }
              if (isFlagged) {
                buttonClass = 'bg-[#ffddb8] text-[#2a1700] font-bold hover:opacity-90';
              }
              if (isCurrent) {
                buttonClass = 'bg-[#004ac6] text-white font-extrabold shadow-md ring-2 ring-[#004ac6] scale-105';
              }

              return (
                <button
                  key={q.id}
                  onClick={() => setCurrentIndex(idx)}
                  className={`h-9 rounded-xl font-label-md text-xs font-bold transition-all relative flex items-center justify-center ${buttonClass}`}
                >
                  {String(idx + 1).padStart(2, '0')}
                  {isFlagged && !isCurrent && (
                    <span className="w-1.5 h-1.5 rounded-full bg-[#996100] absolute top-1 right-1" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div className="mt-4 pt-3 border-t border-[#eaedff] flex flex-col gap-1.5 font-label-sm text-[11px] text-[#434655]">
            <div className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 rounded-md bg-[#004ac6]" />
              <span>Questão Atual</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 rounded-md bg-[#82f5c1]" />
              <span>Respondida</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 rounded-md bg-[#ffddb8]" />
              <span>Marcada para Revisão</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 rounded-md bg-[#f2f3ff]" />
              <span>Não respondida</span>
            </div>
          </div>

          {/* Quick Tips Card */}
          <div className="mt-4 p-3 rounded-xl bg-[#f2f3ff] text-[#434655] flex items-start gap-2 border border-[#eaedff]">
            <Lightbulb className="w-4 h-4 text-[#004ac6] shrink-0 mt-0.5" />
            <p className="font-body-sm text-xs leading-relaxed">
              <strong>Dica TRI:</strong> Responda primeiro as questões fáceis e médias para calibrar sua pontuação com coerência pedagógica.
            </p>
          </div>
        </aside>

        {/* Right / Center Canvas: Focused Question Resolution Area */}
        <main className="lg:col-span-8 xl:col-span-9 flex flex-col gap-4 order-1 lg:order-2">
          {/* Question Paper Container */}
          <div className="bg-white rounded-2xl p-6 lg:p-8 shadow-xs border border-[#eaedff] flex flex-col">
            {/* Metadata Header */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[#eaedff]">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-headline-md text-xl sm:text-2xl text-[#004ac6] font-extrabold">
                  Questão {currentQuestion.number}
                </span>
                <span className="text-[#c3c6d7]">•</span>
                <span className="px-2.5 py-0.5 rounded-full bg-[#dbe1ff] text-[#00174b] font-label-sm text-xs font-semibold">
                  {currentQuestion.examOrigin}
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-[#f2f3ff] text-[#434655] font-label-sm text-xs font-medium">
                  {currentQuestion.subject}
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-[#f2f3ff] text-[#434655] font-label-sm text-xs font-medium">
                  {currentQuestion.subtopic}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-[#ffddb8] text-[#2a1700] font-label-sm text-xs font-bold flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-[#784b00]" />
                  {currentQuestion.difficultyLabel}
                </span>

                <button
                  onClick={() => setFontSizeLevel(fontSizeLevel === 'normal' ? 'large' : 'normal')}
                  className="p-2 rounded-xl text-[#434655] hover:bg-[#eaedff] transition-colors"
                  title="Aumentar ou diminuir tamanho do texto"
                >
                  <span className="text-xs font-bold">{fontSizeLevel === 'normal' ? 'A+' : 'A-'}</span>
                </button>
              </div>
            </div>

            {/* Supportive Text / Source Material (Texto de Apoio) */}
            {currentQuestion.supportText && (
              <article className="mt-4 p-5 rounded-2xl bg-[#f2f3ff] text-[#131b2e] leading-relaxed shadow-xs border border-[#eaedff]">
                <div className="flex items-center gap-2 mb-2 font-label-sm text-xs uppercase tracking-wider text-[#004ac6] font-bold">
                  <BookOpen className="w-4 h-4" />
                  <span>{currentQuestion.supportTextTitle || 'Texto de Apoio I'}</span>
                </div>
                <p className={`mb-3 italic text-[#434655] pl-3 border-l-2 border-[#004ac6] ${
                  fontSizeLevel === 'large' ? 'text-base sm:text-lg' : 'text-sm sm:text-base'
                }`}>
                  {currentQuestion.supportText}
                </p>
                {currentQuestion.supportSource && (
                  <footer className="font-label-sm text-xs text-[#737686] text-right">
                    {currentQuestion.supportSource}
                  </footer>
                )}
              </article>
            )}

            {/* Visual Supporting Context (Image or Iconographic Analysis) */}
            {currentQuestion.image && (
              <div className="mt-4 grid grid-cols-1 md:grid-cols-12 gap-4 bg-[#eaedff] p-4 rounded-2xl items-center border border-[#dae2fd]">
                <div className="md:col-span-5 h-44 rounded-xl overflow-hidden bg-[#dae2fd] relative">
                  <img
                    src={currentQuestion.image.src}
                    alt={currentQuestion.image.caption}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-0 inset-x-0 p-2 bg-gradient-to-t from-black/80 to-transparent text-white font-label-sm text-[11px]">
                    {currentQuestion.image.caption}
                  </div>
                </div>

                <div className="md:col-span-7 flex flex-col justify-center">
                  <div className="font-label-md text-xs text-[#004ac6] font-bold mb-1 flex items-center gap-1">
                    <Eye className="w-4 h-4" />
                    <span>{currentQuestion.image.analysisTitle}</span>
                  </div>
                  <p className="font-body-sm text-xs text-[#434655] leading-relaxed">
                    {currentQuestion.image.analysisText}
                  </p>
                </div>
              </div>
            )}

            {/* Question Prompt / Stem (Comando da Questão) */}
            <div className="mt-6 mb-4">
              <p className={`font-bold text-[#131b2e] leading-relaxed ${
                fontSizeLevel === 'large' ? 'text-lg sm:text-xl' : 'text-base sm:text-lg'
              }`}>
                {currentQuestion.prompt}
              </p>
            </div>

            {/* Alternatives (A - E) */}
            <div className="flex flex-col gap-2.5 mt-2">
              {currentQuestion.alternatives.map((alt) => {
                const isSelected = answers[currentIndex] === alt.id;
                const isStruck = (struckAlternatives[currentIndex] || []).includes(alt.id);

                return (
                  <button
                    key={alt.id}
                    onClick={() => handleSelectAnswer(alt.id)}
                    type="button"
                    className={`group w-full text-left p-4 rounded-xl transition-all duration-150 flex items-start gap-3.5 shadow-xs border relative ${
                      isSelected
                        ? 'bg-[#eaedff] text-[#131b2e] ring-2 ring-[#004ac6] border-[#004ac6]'
                        : isStruck
                        ? 'bg-[#f2f3ff] text-[#737686] opacity-60 border-[#eaedff]'
                        : 'bg-white hover:bg-[#f2f3ff] text-[#131b2e] border-[#eaedff]'
                    }`}
                  >
                    {/* Letter Badge */}
                    <div
                      className={`w-8 h-8 rounded-full font-headline-sm text-sm flex items-center justify-center shrink-0 font-bold transition-colors ${
                        isSelected
                          ? 'bg-[#004ac6] text-white shadow-xs'
                          : 'bg-[#eaedff] text-[#131b2e] group-hover:bg-[#dbe1ff] group-hover:text-[#004ac6]'
                      }`}
                    >
                      {alt.id}
                    </div>

                    {/* Alternative Text */}
                    <div className={`font-body-md pt-1 flex-1 leading-relaxed ${
                      isStruck ? 'line-through text-[#737686]' : 'text-[#131b2e]'
                    } ${fontSizeLevel === 'large' ? 'text-base' : 'text-sm'}`}>
                      {alt.text}
                    </div>

                    {/* Strikethrough action button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleStrikeAlternative(currentIndex, alt.id);
                      }}
                      className="p-1 rounded-md text-[#737686] hover:bg-[#dae2fd] opacity-0 group-hover:opacity-100 transition-opacity"
                      title={isStruck ? 'Desriscar alternativa' : 'Riscar alternativa incorreta'}
                    >
                      <Strikethrough className="w-4 h-4" />
                    </button>

                    {isSelected && (
                      <CheckCircle className="w-5 h-5 text-[#004ac6] shrink-0 mt-1" />
                    )}

                    {isStruck && !isSelected && (
                      <span className="px-2 py-0.5 rounded bg-[#dae2fd] text-[#434655] font-label-sm text-[10px] shrink-0 mt-1">
                        Riscada
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Action & Bottom Navigation Deck */}
          <div className="bg-white rounded-2xl p-4 shadow-xs border border-[#eaedff] flex flex-col sm:flex-row items-center justify-between gap-3">
            {/* Left Nav: Previous */}
            <button
              onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
              disabled={currentIndex === 0}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-[#f2f3ff] hover:bg-[#eaedff] disabled:opacity-40 disabled:hover:bg-[#f2f3ff] text-[#131b2e] font-label-lg text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-colors border border-[#eaedff]"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Questão Anterior ({Math.max(1, currentIndex)})</span>
            </button>

            {/* Middle Tools */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPenStrikeMode(!penStrikeMode)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-colors border ${
                  penStrikeMode
                    ? 'bg-[#ffddb8] text-[#2a1700] border-[#996100]'
                    : 'text-[#434655] hover:bg-[#f2f3ff] border-transparent'
                }`}
                title="Ativar modo de riscar alternativas"
              >
                <Strikethrough className="w-4 h-4" />
                <span>Risco com Caneta</span>
              </button>

              <button
                onClick={() => setShowScratchpad(true)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-[#434655] hover:bg-[#f2f3ff] transition-colors"
                title="Abrir folha de rascunho e anotações rápidas"
              >
                <Edit3 className="w-4 h-4" />
                <span>Rascunho</span>
              </button>
            </div>

            {/* Right Nav: Next or Finish */}
            {currentIndex < totalQuestions - 1 ? (
              <button
                onClick={() => setCurrentIndex((prev) => Math.min(totalQuestions - 1, prev + 1))}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#004ac6] hover:bg-[#003ea8] text-white font-label-lg text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-xs transition-transform active:scale-95"
              >
                <span>Próxima Questão ({currentIndex + 2})</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={() => setShowFinishModal(true)}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#006c4a] hover:bg-[#005137] text-white font-label-lg text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-xs transition-transform active:scale-95"
              >
                <span>Revisar e Finalizar</span>
                <CheckCircle className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Auto-save notification banner */}
          <div className="flex items-center justify-center gap-2 font-body-sm text-xs text-[#737686] py-1">
            <CloudCheck className="w-4 h-4 text-[#006c4a]" />
            <span>Resposta registrada localmente. Salvamento automático no navegador ativo.</span>
          </div>
        </main>
      </div>

      {/* Confirmation Modal: Finalizar Prova */}
      {showFinishModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full rounded-2xl p-6 shadow-2xl border border-[#eaedff] flex flex-col gap-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#ffdad6] text-[#ba1a1a] flex items-center justify-center font-bold">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-headline-sm text-base text-[#131b2e] font-bold">
                  Finalizar Simulado?
                </h3>
                <p className="text-xs text-[#737686]">
                  Confira seu cartão-resposta antes de gerar o gabarito.
                </p>
              </div>
            </div>

            <div className="bg-[#f2f3ff] p-4 rounded-xl flex flex-col gap-2 text-xs border border-[#eaedff]">
              <div className="flex justify-between text-[#131b2e]">
                <span>Total de Questões:</span>
                <strong className="font-bold">{totalQuestions}</strong>
              </div>
              <div className="flex justify-between text-[#006c4a]">
                <span>Questões Respondidas:</span>
                <strong className="font-bold">{answeredCount}</strong>
              </div>
              <div className="flex justify-between text-[#784b00]">
                <span>Marcadas para Revisão:</span>
                <strong className="font-bold">{flaggedCount}</strong>
              </div>
              <div className="flex justify-between text-[#ba1a1a]">
                <span>Questões Pendentes (em branco):</span>
                <strong className="font-bold">{pendingCount}</strong>
              </div>
            </div>

            {pendingCount > 0 && (
              <p className="text-xs text-[#784b00] bg-[#ffddb8]/40 p-2.5 rounded-lg border border-[#ffddb8]">
                Atenção: Você ainda tem {pendingCount} questão(ões) sem resposta. No ENEM e vestibulares, o chute calibrado pode pontuar na TRI!
              </p>
            )}

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#eaedff]">
              <button
                type="button"
                onClick={() => setShowFinishModal(false)}
                className="px-4 py-2 text-xs font-semibold text-[#434655] hover:bg-[#eaedff] rounded-xl"
              >
                Voltar à Prova
              </button>
              <button
                type="button"
                onClick={handleFinishConfirmed}
                className="px-5 py-2.5 bg-[#ba1a1a] hover:bg-[#93000a] text-white rounded-xl text-xs sm:text-sm font-bold shadow-xs hover:shadow-md"
              >
                Sim, Finalizar e Ver Gabarito
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Interactive Scratchpad Modal / Rascunho */}
      {showScratchpad && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white max-w-lg w-full rounded-2xl p-6 shadow-2xl border border-[#eaedff] flex flex-col gap-3 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-2 border-b border-[#eaedff]">
              <div className="flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-[#004ac6]" />
                <h3 className="font-headline-sm text-base text-[#131b2e] font-bold">
                  Folha de Rascunho Digital
                </h3>
              </div>
              <button
                onClick={() => setShowScratchpad(false)}
                className="p-1 rounded-lg text-[#737686] hover:bg-[#eaedff]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-[#737686]">
              Faça contas, anotações de ideias ou esquemas para a resolução desta questão. Fica salvo automaticamente.
            </p>

            <textarea
              value={scratchpadNotes}
              onChange={(e) => setScratchpadNotes(e.target.value)}
              placeholder="Digite aqui seus cálculos e rascunhos..."
              rows={8}
              className="w-full p-3 bg-[#f2f3ff] rounded-xl text-xs sm:text-sm font-mono text-[#131b2e] border border-[#eaedff] focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#004ac6]/30"
            />

            <div className="flex items-center justify-between pt-2 border-t border-[#eaedff]">
              <button
                type="button"
                onClick={() => setScratchpadNotes('')}
                className="text-xs text-[#ba1a1a] hover:underline"
              >
                Limpar Rascunho
              </button>
              <button
                type="button"
                onClick={() => setShowScratchpad(false)}
                className="px-4 py-2 bg-[#004ac6] text-white rounded-xl text-xs font-bold"
              >
                Concluir
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Paused Overlay */}
      {isPaused && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white max-w-sm w-full rounded-2xl p-6 text-center shadow-2xl border border-[#eaedff] flex flex-col items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#ffddb8] text-[#784b00] flex items-center justify-center">
              <Pause className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#131b2e]">Simulado Pausado</h3>
              <p className="text-xs text-[#737686] mt-1">
                O cronômetro está parado. Respire fundo, tome uma água e clique em retomar quando estiver pronto.
              </p>
            </div>
            <button
              onClick={() => setIsPaused(false)}
              className="w-full py-3 bg-[#004ac6] text-white font-bold rounded-xl text-xs sm:text-sm shadow-md hover:bg-[#003ea8] flex items-center justify-center gap-2"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Retomar Resolução</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
