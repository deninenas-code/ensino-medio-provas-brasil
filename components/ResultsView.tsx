'use client';

import React, { useState, useMemo } from 'react';
import { 
  Trophy, 
  CheckCircle, 
  XCircle, 
  HelpCircle, 
  Clock, 
  TrendingUp, 
  RotateCcw, 
  BookOpen, 
  Share2, 
  Printer, 
  Sparkles,
  Award,
  ChevronDown,
  ChevronUp,
  Check,
  Flag,
  ArrowLeft
} from 'lucide-react';
import { Simulado, ExamAttempt, Question } from '@/lib/types';

interface ResultsViewProps {
  simulado: Simulado;
  attempt: ExamAttempt;
  onRetry: () => void;
  onBackToCatalog: () => void;
}

export const ResultsView: React.FC<ResultsViewProps> = ({
  simulado,
  attempt,
  onRetry,
  onBackToCatalog,
}) => {
  const [filterMode, setFilterMode] = useState<'all' | 'errors' | 'hits' | 'flagged'>('all');
  const [expandedExplanations, setExpandedExplanations] = useState<Record<string, boolean>>({});
  const [copiedToast, setCopiedToast] = useState(false);

  const totalQuestions = simulado.questions.length;

  const { questionResults, correctHits, wrongHits, blankHits } = useMemo(() => {
    let correct = 0;
    let wrong = 0;
    let blank = 0;

    const results = simulado.questions.map((q, idx) => {
      const studentAnswer = attempt.answers[idx];
      const isBlank = studentAnswer === undefined;
      const isCorrect = studentAnswer === q.correctAnswer;
      const isFlagged = attempt.flaggedForReview.includes(idx);

      if (isBlank) blank++;
      else if (isCorrect) correct++;
      else wrong++;

      return {
        question: q,
        index: idx,
        studentAnswer,
        isCorrect,
        isBlank,
        isFlagged,
      };
    });

    return {
      questionResults: results,
      correctHits: correct,
      wrongHits: wrong,
      blankHits: blank,
    };
  }, [simulado, attempt]);

  const percentage = Math.round((correctHits / totalQuestions) * 100);

  // Format time
  const formatTime = (secs: number) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    if (h > 0) return `${h}h ${m}min ${s}s`;
    return `${m}min ${s}s`;
  };

  // Toggle explanation expansion
  const toggleExplanation = (qId: string) => {
    setExpandedExplanations(prev => ({
      ...prev,
      [qId]: !prev[qId]
    }));
  };

  // Filtered question items
  const filteredQuestions = useMemo(() => {
    return questionResults.filter((item) => {
      if (filterMode === 'errors') return !item.isCorrect && !item.isBlank;
      if (filterMode === 'hits') return item.isCorrect;
      if (filterMode === 'flagged') return item.isFlagged;
      return true;
    });
  }, [questionResults, filterMode]);

  const handleShare = () => {
    const text = `🎯 Concluí o simulado "${simulado.title}" no ESCSimulados com ${percentage}% de acertos (TRI estimada: ${attempt.triScore} pontos)!`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedToast(true);
      setTimeout(() => setCopiedToast(false), 2500);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="w-full flex flex-col gap-6 p-4 lg:p-8 max-w-[1200px] mx-auto print:p-0">
      {/* Top Breadcrumb & Back */}
      <div className="flex items-center justify-between print:hidden">
        <button
          onClick={onBackToCatalog}
          className="flex items-center gap-2 text-xs font-bold text-[#004ac6] hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar ao Catálogo de Simulados</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#eaedff] hover:bg-[#dae2fd] text-xs font-bold text-[#131b2e] transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimir Gabarito</span>
          </button>
          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#004ac6] hover:bg-[#003ea8] text-xs font-bold text-white transition-colors"
          >
            <Share2 className="w-4 h-4" />
            <span>Compartilhar</span>
          </button>
        </div>
      </div>

      {copiedToast && (
        <div className="bg-[#85f8c4] text-[#002114] p-3 rounded-xl text-xs font-bold text-center animate-in fade-in">
          Resultado copiado para a área de transferência!
        </div>
      )}

      {/* Hero Performance Card */}
      <div className="bg-gradient-to-r from-[#004ac6] via-[#2563eb] to-[#006c4a] rounded-3xl p-6 lg:p-8 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4 text-center lg:text-left">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shrink-0">
              <Trophy className="w-10 h-10 text-[#ffddb8]" />
            </div>

            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-xs font-bold uppercase tracking-wider mb-2">
                <Sparkles className="w-3.5 h-3.5 text-[#ffddb8]" />
                <span>Simulado Concluído com Sucesso</span>
              </div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold leading-tight">
                {simulado.title}
              </h1>
              <p className="text-xs sm:text-sm text-white/80 mt-1">
                Avaliação processada com gabarito oficial comentado item a item.
              </p>
            </div>
          </div>

          {/* Large Score Pill */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-5 text-center shrink-0 min-w-[200px]">
            <div className="text-xs uppercase tracking-wider text-white/80 font-bold">
              Desempenho Geral
            </div>
            <div className="text-4xl sm:text-5xl font-extrabold text-white my-1">
              {percentage}%
            </div>
            <div className="text-xs font-semibold text-[#85f8c4]">
              {correctHits} de {totalQuestions} Acertos
            </div>
          </div>
        </div>

        {/* Ambient subtle glow */}
        <div className="absolute -right-20 -bottom-20 w-80 h-80 rounded-full bg-white/10 blur-3xl pointer-events-none" />
      </div>

      {/* Diagnostic Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#eaedff] shadow-xs flex flex-col justify-between">
          <div className="flex items-center gap-2 text-[#006c4a]">
            <CheckCircle className="w-5 h-5" />
            <span className="text-xs font-bold uppercase">Acertos</span>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-[#131b2e] mt-2">
            {correctHits} <span className="text-sm font-normal text-[#737686]">/ {totalQuestions}</span>
          </div>
          <span className="text-xs text-[#006c4a] font-semibold mt-1">
            {percentage}% de aproveitamento
          </span>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#eaedff] shadow-xs flex flex-col justify-between">
          <div className="flex items-center gap-2 text-[#004ac6]">
            <Award className="w-5 h-5" />
            <span className="text-xs font-bold uppercase">TRI Estimada</span>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-[#004ac6] mt-2">
            {attempt.triScore}
          </div>
          <span className="text-xs text-[#737686] font-semibold mt-1">
            Escala Inep 0-1000
          </span>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#eaedff] shadow-xs flex flex-col justify-between">
          <div className="flex items-center gap-2 text-[#784b00]">
            <Clock className="w-5 h-5" />
            <span className="text-xs font-bold uppercase">Tempo Utilizado</span>
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-[#131b2e] mt-2">
            {formatTime(attempt.timeSpentSeconds)}
          </div>
          <span className="text-xs text-[#784b00] font-semibold mt-1">
            Média: ~{Math.round(attempt.timeSpentSeconds / totalQuestions)}s por questão
          </span>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#eaedff] shadow-xs flex flex-col justify-between">
          <div className="flex items-center gap-2 text-[#ba1a1a]">
            <XCircle className="w-5 h-5" />
            <span className="text-xs font-bold uppercase">Erros &amp; Branco</span>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-[#131b2e] mt-2">
            {wrongHits + blankHits}
          </div>
          <span className="text-xs text-[#737686] font-semibold mt-1">
            {wrongHits} erradas • {blankHits} em branco
          </span>
        </div>
      </div>

      {/* Filterable Gabarito Section */}
      <div className="bg-white rounded-3xl p-6 lg:p-8 border border-[#eaedff] shadow-xs flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#eaedff]">
          <div>
            <h2 className="font-headline-md text-lg sm:text-xl font-bold text-[#131b2e]">
              Gabarito Oficial &amp; Resolução Comentada
            </h2>
            <p className="font-body-sm text-xs sm:text-sm text-[#737686] mt-0.5">
              Revise item a item as explicações dos professores com identificação de erros e acertos.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            <button
              onClick={() => setFilterMode('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                filterMode === 'all'
                  ? 'bg-[#004ac6] text-white'
                  : 'bg-[#f2f3ff] text-[#434655] hover:bg-[#eaedff]'
              }`}
            >
              Todas ({totalQuestions})
            </button>
            <button
              onClick={() => setFilterMode('hits')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                filterMode === 'hits'
                  ? 'bg-[#006c4a] text-white'
                  : 'bg-[#85f8c4]/30 text-[#006c4a] hover:bg-[#85f8c4]'
              }`}
            >
              Acertos ({correctHits})
            </button>
            <button
              onClick={() => setFilterMode('errors')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                filterMode === 'errors'
                  ? 'bg-[#ba1a1a] text-white'
                  : 'bg-[#ffdad6] text-[#ba1a1a] hover:bg-[#ffdad6]/80'
              }`}
            >
              Erros ({wrongHits})
            </button>
            <button
              onClick={() => setFilterMode('flagged')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                filterMode === 'flagged'
                  ? 'bg-[#784b00] text-white'
                  : 'bg-[#ffddb8] text-[#784b00] hover:bg-[#ffb95f]'
              }`}
            >
              Marcadas ({attempt.flaggedForReview.length})
            </button>
          </div>
        </div>

        {/* List of Questions with Comments */}
        <div className="flex flex-col gap-6">
          {filteredQuestions.map(({ question, index, studentAnswer, isCorrect, isBlank, isFlagged }) => {
            const isExpanded = expandedExplanations[question.id] ?? true;

            return (
              <div
                key={question.id}
                className={`p-5 rounded-2xl border transition-all ${
                  isCorrect
                    ? 'border-[#85f8c4] bg-[#faf8ff]'
                    : isBlank
                    ? 'border-[#eaedff] bg-white'
                    : 'border-[#ffdad6] bg-[#faf8ff]'
                }`}
              >
                {/* Header of Item */}
                <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#eaedff]">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold text-base text-[#131b2e]">
                      Questão {question.number}
                    </span>
                    <span className="text-xs text-[#737686]">• {question.subject}</span>
                    <span className="px-2 py-0.5 rounded-md bg-[#eaedff] text-xs font-semibold text-[#004ac6]">
                      {question.subtopic}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {isCorrect ? (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#85f8c4] text-[#002114] text-xs font-bold">
                        <CheckCircle className="w-3.5 h-3.5 text-[#006c4a]" />
                        Você Acertou!
                      </span>
                    ) : isBlank ? (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#eaedff] text-[#434655] text-xs font-bold">
                        <HelpCircle className="w-3.5 h-3.5" />
                        Não respondida
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#ffdad6] text-[#ba1a1a] text-xs font-bold">
                        <XCircle className="w-3.5 h-3.5 text-[#ba1a1a]" />
                        Você Errou
                      </span>
                    )}

                    {isFlagged && (
                      <span className="p-1 rounded-full bg-[#ffddb8] text-[#784b00]" title="Marcada para revisão">
                        <Flag className="w-3.5 h-3.5 fill-current" />
                      </span>
                    )}
                  </div>
                </div>

                {/* Question Stem */}
                <p className="font-bold text-xs sm:text-sm text-[#131b2e] my-3 leading-relaxed">
                  {question.prompt}
                </p>

                {/* Alternatives with Highlights */}
                <div className="grid grid-cols-1 gap-2 my-3">
                  {question.alternatives.map((alt) => {
                    const isRightOption = alt.id === question.correctAnswer;
                    const isStudentPick = alt.id === studentAnswer;

                    let rowStyle = 'border-[#eaedff] bg-white text-[#434655]';
                    if (isRightOption) {
                      rowStyle = 'border-[#006c4a] bg-[#85f8c4]/20 text-[#002114] font-semibold';
                    } else if (isStudentPick && !isCorrect) {
                      rowStyle = 'border-[#ba1a1a] bg-[#ffdad6]/40 text-[#93000a] line-through';
                    }

                    return (
                      <div
                        key={alt.id}
                        className={`p-3 rounded-xl border flex items-start gap-3 text-xs leading-relaxed ${rowStyle}`}
                      >
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 font-bold text-xs ${
                            isRightOption
                              ? 'bg-[#006c4a] text-white'
                              : isStudentPick
                              ? 'bg-[#ba1a1a] text-white'
                              : 'bg-[#eaedff] text-[#434655]'
                          }`}
                        >
                          {alt.id}
                        </div>

                        <div className="flex-1 pt-0.5">
                          {alt.text}
                        </div>

                        {isRightOption && (
                          <span className="px-2 py-0.5 rounded bg-[#85f8c4] text-[#002114] text-[10px] font-bold shrink-0">
                            Gabarito Correto
                          </span>
                        )}

                        {isStudentPick && !isCorrect && (
                          <span className="px-2 py-0.5 rounded bg-[#ffdad6] text-[#ba1a1a] text-[10px] font-bold shrink-0">
                            Sua Escolha
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Teacher's Commented Resolution Card */}
                <div className="mt-4 pt-3 border-t border-[#eaedff]">
                  <button
                    onClick={() => toggleExplanation(question.id)}
                    className="flex items-center justify-between w-full text-left font-bold text-xs text-[#004ac6] hover:underline"
                  >
                    <span className="flex items-center gap-1.5">
                      <BookOpen className="w-4 h-4" />
                      Resolução Comentada do Professor
                    </span>
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>

                  {isExpanded && (
                    <div className="mt-2.5 p-4 rounded-xl bg-[#f2f3ff] text-xs text-[#131b2e] leading-relaxed border border-[#eaedff]">
                      <p className="mb-2">{question.explanation}</p>
                      <div className="text-[11px] font-semibold text-[#737686] pt-1 border-t border-[#eaedff]">
                        Referência: {question.competencyOrDescriptor}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Sticky Bottom Actions Bar */}
      <div className="sticky bottom-4 z-20 bg-white/95 backdrop-blur-md p-4 rounded-2xl shadow-lg border border-[#eaedff] flex flex-col sm:flex-row items-center justify-between gap-3 print:hidden">
        <div className="text-xs text-[#737686]">
          Simulado salvo no histórico local deste dispositivo.
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={onRetry}
            className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl border border-[#004ac6] text-[#004ac6] hover:bg-[#eaedff] text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Tentar Novamente</span>
          </button>

          <button
            onClick={onBackToCatalog}
            className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl bg-[#004ac6] hover:bg-[#003ea8] text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition-transform active:scale-95"
          >
            <BookOpen className="w-4 h-4" />
            <span>Voltar ao Catálogo</span>
          </button>
        </div>
      </div>
    </div>
  );
};
