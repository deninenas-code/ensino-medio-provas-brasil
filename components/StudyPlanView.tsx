'use client';

import React, { useState } from 'react';
import { 
  CalendarDays, 
  CheckCircle, 
  Circle, 
  Clock, 
  Target, 
  BookOpen, 
  Sparkles,
  ArrowRight
} from 'lucide-react';

interface StudyPlanViewProps {
  onStartExamById: (id: string) => void;
}

export const StudyPlanView: React.FC<StudyPlanViewProps> = ({ onStartExamById }) => {
  const [completedTasks, setCompletedTasks] = useState<number[]>([1, 3]);

  const toggleTask = (id: number) => {
    setCompletedTasks(prev => 
      prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]
    );
  };

  const scheduleDays = [
    {
      day: 'Segunda-feira',
      focus: 'Linguagens & Redação',
      tasks: [
        { id: 1, text: 'Revisar variação linguística e figuras de sintaxe', simId: 'redacao-linguagens-enem' },
        { id: 2, text: 'Escrever proposta de intervenção nos 5 critérios nota 1000', simId: 'redacao-linguagens-enem' },
      ],
    },
    {
      day: 'Terça-feira',
      focus: 'Matemática e Geometria',
      tasks: [
        { id: 3, text: 'Resolver 10 questões de Teorema de Pitágoras e relações métricas', simId: 'saeb-9ano-mat' },
        { id: 4, text: 'Treino de probabilidade e análise combinatória sem fórmula', simId: 'obmep-treino-especial' },
      ],
    },
    {
      day: 'Quarta-feira',
      focus: 'Ciências da Natureza',
      tasks: [
        { id: 5, text: 'Ecologia: teias tróficas e biomagnificação de metais pesados', simId: 'maratona-bio-quimica' },
        { id: 6, text: 'Química: pilhas galvânicas, potenciais de redução e eletrólise', simId: 'maratona-bio-quimica' },
      ],
    },
    {
      day: 'Quinta-feira',
      focus: 'Ciências Humanas',
      tasks: [
        { id: 7, text: 'História: reforma urbana de Paris (Haussmann) e urbanização', simId: 'enem-2024-dia1' },
        { id: 8, text: 'Filosofia e Ética: imperativo categórico kantiano', simId: 'enem-2024-dia1' },
      ],
    },
    {
      day: 'Sábado / Domingo',
      focus: 'Simulado Geral Cronometrado',
      tasks: [
        { id: 9, text: 'Realizar Simulado Nacional Oficial com tempo cronometrado', simId: 'enem-2024-dia1' },
      ],
    },
  ];

  return (
    <div className="w-full flex flex-col gap-6 p-4 lg:p-8 max-w-[1200px] mx-auto">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 lg:p-8 border border-[#eaedff] shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#dbe1ff] text-[#004ac6] flex items-center justify-center font-bold">
            <CalendarDays className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-headline-lg text-2xl font-extrabold text-[#131b2e]">
              Meu Plano de Estudos Semanal
            </h1>
            <p className="font-body-sm text-xs sm:text-sm text-[#737686]">
              Metodologia de repetição espaçada e treino prático orientado por descritores.
            </p>
          </div>
        </div>
      </div>

      {/* Schedule Days */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {scheduleDays.map((col, idx) => (
          <div
            key={idx}
            className="bg-white rounded-2xl p-5 border border-[#eaedff] shadow-xs flex flex-col gap-3"
          >
            <div className="flex items-center justify-between pb-2 border-b border-[#eaedff]">
              <div>
                <span className="text-xs font-bold text-[#004ac6]">{col.day}</span>
                <h3 className="font-bold text-sm text-[#131b2e]">{col.focus}</h3>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-[#f2f3ff] text-[10px] font-semibold text-[#434655]">
                {col.tasks.length} metas
              </span>
            </div>

            <div className="flex flex-col gap-2">
              {col.tasks.map((task) => {
                const isDone = completedTasks.includes(task.id);
                return (
                  <div
                    key={task.id}
                    className={`p-3 rounded-xl border flex items-start justify-between gap-3 text-xs transition-colors ${
                      isDone ? 'bg-[#85f8c4]/20 border-[#85f8c4]' : 'bg-[#faf8ff] border-[#eaedff]'
                    }`}
                  >
                    <button
                      onClick={() => toggleTask(task.id)}
                      className="flex items-start gap-2.5 text-left flex-1"
                    >
                      {isDone ? (
                        <CheckCircle className="w-4 h-4 text-[#006c4a] shrink-0 mt-0.5" />
                      ) : (
                        <Circle className="w-4 h-4 text-[#737686] shrink-0 mt-0.5" />
                      )}
                      <span className={isDone ? 'line-through text-[#737686]' : 'text-[#131b2e] font-medium'}>
                        {task.text}
                      </span>
                    </button>

                    <button
                      onClick={() => onStartExamById(task.simId)}
                      className="px-2 py-1 rounded-lg bg-[#004ac6] text-white text-[10px] font-bold hover:bg-[#003ea8] shrink-0"
                    >
                      Treinar
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
