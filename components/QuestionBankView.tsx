'use client';

import React, { useState, useMemo } from 'react';
import { 
  Search, 
  HelpCircle, 
  CheckCircle, 
  XCircle, 
  BookOpen, 
  Filter, 
  RotateCcw,
  Sparkles,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { Question, SubjectCategory } from '@/lib/types';
import { SIMULADOS_DATA } from '@/lib/examData';

export const QuestionBankView: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [bancaFilter, setBancaFilter] = useState<string>('all');
  const [userPicks, setUserPicks] = useState<Record<string, 'A' | 'B' | 'C' | 'D' | 'E'>>({});
  const [revealedExplanations, setRevealedExplanations] = useState<Record<string, boolean>>({});

  // Collect all questions
  const allQuestions = useMemo(() => {
    const list: Question[] = [];
    SIMULADOS_DATA.forEach(sim => {
      sim.questions.forEach(q => {
        if (!list.some(item => item.id === q.id)) {
          list.push(q);
        }
      });
    });
    return list;
  }, []);

  const filteredQuestions = useMemo(() => {
    return allQuestions.filter(q => {
      if (categoryFilter !== 'all' && q.category !== categoryFilter) return false;
      if (bancaFilter !== 'all' && !q.examOrigin.toLowerCase().includes(bancaFilter.toLowerCase())) return false;
      if (searchQuery.trim()) {
        const text = `${q.prompt} ${q.subject} ${q.subtopic} ${q.examOrigin}`.toLowerCase();
        if (!text.includes(searchQuery.toLowerCase())) return false;
      }
      return true;
    });
  }, [allQuestions, categoryFilter, bancaFilter, searchQuery]);

  const handleSelect = (questionId: string, altId: 'A' | 'B' | 'C' | 'D' | 'E') => {
    setUserPicks(prev => ({
      ...prev,
      [questionId]: altId
    }));
  };

  const handleReveal = (questionId: string) => {
    setRevealedExplanations(prev => ({
      ...prev,
      [questionId]: !prev[questionId]
    }));
  };

  return (
    <div className="w-full flex flex-col gap-6 p-4 lg:p-8 max-w-[1200px] mx-auto">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 lg:p-8 border border-[#eaedff] shadow-xs">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-2xl bg-[#dbe1ff] text-[#004ac6] flex items-center justify-center font-bold">
            <HelpCircle className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-headline-lg text-2xl font-extrabold text-[#131b2e]">
              Banco de Questões Comentadas
            </h1>
            <p className="font-body-sm text-xs sm:text-sm text-[#737686]">
              Treine questão por questão com resolução comentada instantânea dos professores.
            </p>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4 pt-4 border-t border-[#eaedff]">
          <div className="relative">
            <Search className="w-4 h-4 text-[#737686] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por descritor, tema..."
              className="w-full pl-9 pr-4 py-2 bg-[#f2f3ff] rounded-xl text-xs text-[#131b2e] focus:outline-none focus:ring-2 focus:ring-[#004ac6]/30 border border-transparent"
            />
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full px-3 py-2 bg-[#f2f3ff] rounded-xl text-xs text-[#131b2e] focus:outline-none border border-transparent cursor-pointer"
          >
            <option value="all">Todas as Disciplinas</option>
            <option value="matematica">Matemática</option>
            <option value="portugues">Língua Portuguesa</option>
            <option value="natureza">Ciências da Natureza</option>
            <option value="humanas">Ciências Humanas</option>
            <option value="redacao">Redação</option>
            <option value="astronomia">Astronomia (OBA)</option>
          </select>

          <select
            value={bancaFilter}
            onChange={(e) => setBancaFilter(e.target.value)}
            className="w-full px-3 py-2 bg-[#f2f3ff] rounded-xl text-xs text-[#131b2e] focus:outline-none border border-transparent cursor-pointer"
          >
            <option value="all">Todas as Bancas / Origens</option>
            <option value="enem">ENEM</option>
            <option value="fuvest">FUVEST</option>
            <option value="obmep">OBMEP</option>
            <option value="saeb">SAEB / Prova Brasil</option>
            <option value="paulista">Prova Paulista</option>
          </select>
        </div>
      </div>

      {/* Questions List */}
      <div className="flex flex-col gap-5">
        <div className="text-xs text-[#737686] px-1 font-semibold">
          Mostrando {filteredQuestions.length} questões disponíveis no banco
        </div>

        {filteredQuestions.map((q) => {
          const userPick = userPicks[q.id];
          const isRevealed = revealedExplanations[q.id] || false;
          const isCorrect = userPick === q.correctAnswer;

          return (
            <div
              key={q.id}
              className="bg-white rounded-2xl p-6 border border-[#eaedff] shadow-xs flex flex-col gap-4"
            >
              {/* Question Top Tags */}
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#eaedff]">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-[#004ac6]">
                    {q.examOrigin} • Questão {q.number}
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-[#f2f3ff] text-xs font-semibold text-[#434655]">
                    {q.subject}
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-[#eaedff] text-xs font-medium text-[#004ac6]">
                    {q.subtopic}
                  </span>
                </div>

                <span className="px-2.5 py-0.5 rounded-full bg-[#ffddb8] text-[#2a1700] text-xs font-bold">
                  {q.difficultyLabel}
                </span>
              </div>

              {/* Support Text if present */}
              {q.supportText && (
                <div className="p-4 rounded-xl bg-[#f2f3ff] text-xs text-[#434655] italic border-l-2 border-[#004ac6]">
                  {q.supportText}
                </div>
              )}

              {/* Prompt */}
              <p className="font-bold text-sm text-[#131b2e] leading-relaxed">
                {q.prompt}
              </p>

              {/* Alternatives */}
              <div className="flex flex-col gap-2">
                {q.alternatives.map((alt) => {
                  const isSelected = userPick === alt.id;
                  const isRight = alt.id === q.correctAnswer;

                  let style = 'bg-[#f2f3ff] border-[#eaedff] text-[#131b2e] hover:bg-[#eaedff]';
                  if (isSelected && !isRevealed) {
                    style = 'bg-[#eaedff] border-[#004ac6] text-[#004ac6] ring-1 ring-[#004ac6] font-semibold';
                  } else if (isRevealed) {
                    if (isRight) {
                      style = 'bg-[#85f8c4]/30 border-[#006c4a] text-[#002114] font-bold';
                    } else if (isSelected && !isRight) {
                      style = 'bg-[#ffdad6]/40 border-[#ba1a1a] text-[#ba1a1a] line-through';
                    }
                  }

                  return (
                    <button
                      key={alt.id}
                      onClick={() => handleSelect(q.id, alt.id)}
                      className={`p-3 rounded-xl border text-left flex items-start gap-3 text-xs transition-colors ${style}`}
                    >
                      <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
                        {alt.id}
                      </div>
                      <div className="flex-1 pt-0.5">{alt.text}</div>
                    </button>
                  );
                })}
              </div>

              {/* Bottom verify & explanation action */}
              <div className="pt-3 border-t border-[#eaedff] flex items-center justify-between">
                <div>
                  {isRevealed && (
                    <span className={`text-xs font-bold inline-flex items-center gap-1 ${
                      isCorrect ? 'text-[#006c4a]' : 'text-[#ba1a1a]'
                    }`}>
                      {isCorrect ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                      {isCorrect ? 'Você acertou!' : `Incorreto. A resposta certa é (${q.correctAnswer})`}
                    </span>
                  )}
                </div>

                <button
                  onClick={() => handleReveal(q.id)}
                  className="px-4 py-2 bg-[#004ac6] hover:bg-[#003ea8] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>{isRevealed ? 'Ocultar Resolução' : 'Verificar e Ver Resolução'}</span>
                </button>
              </div>

              {/* Expanded Explanation */}
              {isRevealed && (
                <div className="p-4 rounded-xl bg-[#f2f3ff] text-xs text-[#131b2e] border border-[#eaedff] leading-relaxed">
                  <div className="font-bold text-[#004ac6] mb-1">Resolução Comentada:</div>
                  <p className="mb-2">{q.explanation}</p>
                  <div className="text-[11px] text-[#737686] font-semibold pt-1 border-t border-[#eaedff]">
                    {q.competencyOrDescriptor}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
