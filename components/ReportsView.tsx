'use client';

import React, { useMemo } from 'react';
import { 
  Trophy, 
  TrendingUp, 
  Clock, 
  Award, 
  CheckCircle, 
  XCircle, 
  Calendar, 
  Eye, 
  HelpCircle,
  Flame,
  ArrowRight
} from 'lucide-react';
import { getExamAttempts, getStudentProfile } from '@/lib/storage';
import { SIMULADOS_DATA } from '@/lib/examData';
import { Simulado, ExamAttempt } from '@/lib/types';

interface ReportsViewProps {
  onOpenAttempt: (simulado: Simulado, attempt: ExamAttempt) => void;
  onGoToCatalog: () => void;
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  onOpenAttempt,
  onGoToCatalog,
}) => {
  const student = useMemo(() => getStudentProfile(), []);
  const attempts = useMemo(() => getExamAttempts(), []);

  // Compute aggregated stats
  const totalCompleted = attempts.length;
  const averagePercentage = totalCompleted > 0
    ? Math.round(attempts.reduce((acc, a) => acc + a.scorePercentage, 0) / totalCompleted)
    : 0;

  const totalQuestionsSolved = attempts.reduce((acc, a) => acc + a.totalQuestions, 0);

  return (
    <div className="w-full flex flex-col gap-6 p-4 lg:p-8 max-w-[1200px] mx-auto">
      {/* Title */}
      <div className="bg-white rounded-3xl p-6 lg:p-8 border border-[#eaedff] shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#dbe1ff] text-[#004ac6] flex items-center justify-center font-bold">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <h1 className="font-headline-lg text-2xl font-extrabold text-[#131b2e]">
                Relatórios de Desempenho &amp; TRI
              </h1>
              <p className="font-body-sm text-xs sm:text-sm text-[#737686]">
                Estatísticas pedagógicas acumuladas, proficiência estimada e histórico de simulados.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-[#ffddb8] px-3.5 py-1.5 rounded-full text-xs font-bold text-[#2a1700]">
            <Flame className="w-4 h-4 text-[#784b00]" />
            <span>{student.focusDays} Dias de Sequência de Estudos</span>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-[#eaedff] shadow-xs flex flex-col justify-between">
          <span className="text-xs font-bold uppercase text-[#737686]">TRI Média Estimada</span>
          <div className="text-3xl font-extrabold text-[#004ac6] my-2">
            {student.triAverage}
          </div>
          <span className="text-xs text-[#006c4a] font-semibold">+18.5 pts este mês</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#eaedff] shadow-xs flex flex-col justify-between">
          <span className="text-xs font-bold uppercase text-[#737686]">Taxa de Acertos Média</span>
          <div className="text-3xl font-extrabold text-[#131b2e] my-2">
            {averagePercentage > 0 ? `${averagePercentage}%` : '—'}
          </div>
          <span className="text-xs text-[#737686] font-semibold">
            {totalCompleted} simulado(s) realizado(s)
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#eaedff] shadow-xs flex flex-col justify-between">
          <span className="text-xs font-bold uppercase text-[#737686]">Questões Feitas</span>
          <div className="text-3xl font-extrabold text-[#131b2e] my-2">
            {totalQuestionsSolved}
          </div>
          <span className="text-xs text-[#006c4a] font-semibold">
            Meta semanal: {student.weeklySolved}/{student.weeklyTarget}
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#eaedff] shadow-xs flex flex-col justify-between">
          <span className="text-xs font-bold uppercase text-[#737686]">Coerência Pedagógica</span>
          <div className="text-3xl font-extrabold text-[#006c4a] my-2">
            Alta
          </div>
          <span className="text-xs text-[#737686] font-semibold">
            Padrão TRI consistente
          </span>
        </div>
      </div>

      {/* Attempts History */}
      <div className="bg-white rounded-3xl p-6 lg:p-8 border border-[#eaedff] shadow-xs flex flex-col gap-4">
        <div className="flex items-center justify-between border-b border-[#eaedff] pb-4">
          <h2 className="font-headline-md text-base sm:text-lg font-bold text-[#131b2e]">
            Histórico de Simulados Realizados
          </h2>
          <span className="text-xs text-[#737686] font-semibold">
            {attempts.length} registro(s)
          </span>
        </div>

        {attempts.length === 0 ? (
          <div className="text-center py-10 flex flex-col items-center">
            <HelpCircle className="w-12 h-12 text-[#737686] mb-2" />
            <p className="text-sm font-bold text-[#131b2e]">Nenhum simulado finalizado ainda</p>
            <p className="text-xs text-[#737686] max-w-sm mt-1 mb-4">
              Acesse o catálogo e inicie qualquer teste aberto para registrar seu desempenho.
            </p>
            <button
              onClick={onGoToCatalog}
              className="px-5 py-2.5 bg-[#004ac6] text-white rounded-xl text-xs font-bold shadow-xs hover:bg-[#003ea8]"
            >
              Ir para o Catálogo
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {attempts.map((att) => {
              const matchedSim = SIMULADOS_DATA.find(s => s.id === att.simuladoId);

              return (
                <div
                  key={att.id}
                  className="p-4 rounded-2xl bg-[#faf8ff] border border-[#eaedff] hover:border-[#004ac6]/40 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex flex-col gap-1">
                    <span className="text-[11px] text-[#737686] font-semibold">
                      {att.completedAt}
                    </span>
                    <h3 className="font-bold text-sm text-[#131b2e]">
                      {att.simuladoTitle}
                    </h3>
                    <div className="flex items-center gap-3 text-xs text-[#434655] mt-1">
                      <span className="text-[#006c4a] font-bold">
                        {att.correctCount} acertos ({att.scorePercentage}%)
                      </span>
                      <span>•</span>
                      <span className="text-[#004ac6] font-semibold">
                        TRI {att.triScore}
                      </span>
                      <span>•</span>
                      <span>Tempo: {Math.round(att.timeSpentSeconds / 60)} min</span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      if (matchedSim) {
                        onOpenAttempt(matchedSim, att);
                      }
                    }}
                    className="self-start sm:self-center px-4 py-2 rounded-xl bg-white border border-[#004ac6] text-[#004ac6] hover:bg-[#eaedff] text-xs font-bold flex items-center gap-1.5 shadow-2xs"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Ver Gabarito Comentado</span>
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
