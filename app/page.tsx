'use client';

import React, { useState, useEffect } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { CatalogView } from '@/components/CatalogView';
import { ExamPlayer } from '@/components/ExamPlayer';
import { ResultsView } from '@/components/ResultsView';
import { QuestionBankView } from '@/components/QuestionBankView';
import { ReportsView } from '@/components/ReportsView';
import { StudyPlanView } from '@/components/StudyPlanView';
import { SupportView } from '@/components/SupportView';
import { 
  Simulado, 
  ExamAttempt 
} from '@/lib/types';
import { SIMULADOS_DATA } from '@/lib/examData';
import { 
  getStudentProfile, 
  saveStudentProfile, 
  saveExamAttempt, 
  getActiveExamState,
  StudentProfile,
  DEFAULT_STUDENT
} from '@/lib/storage';

export default function HomePage() {
  const [activeView, setActiveView] = useState<string>('catalogo');
  const [activeSimulado, setActiveSimulado] = useState<Simulado | null>(null);
  const [activeAttempt, setActiveAttempt] = useState<ExamAttempt | null>(null);
  const [student, setStudent] = useState<StudentProfile>(() => {
    return getStudentProfile();
  });
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [globalSearchQuery, setGlobalSearchQuery] = useState('');
  const [hasActiveExamSaved, setHasActiveExamSaved] = useState<boolean>(() => {
    return getActiveExamState() !== null;
  });

  const handleUpdateStudent = (updates: Partial<StudentProfile>) => {
    const updated = saveStudentProfile(updates);
    setStudent(updated);
  };

  const handleStartSimulado = (simulado: Simulado) => {
    setActiveSimulado(simulado);
    setActiveAttempt(null);
    setActiveView('simulado');
    setHasActiveExamSaved(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFinishExam = (results: {
    answers: Record<number, 'A' | 'B' | 'C' | 'D' | 'E' | undefined>;
    flagged: number[];
    struck: Record<number, ('A' | 'B' | 'C' | 'D' | 'E')[]>;
    timeSpentSeconds: number;
  }) => {
    if (!activeSimulado) return;

    // Calculate score & estimated TRI
    let correct = 0;
    activeSimulado.questions.forEach((q, idx) => {
      if (results.answers[idx] === q.correctAnswer) {
        correct++;
      }
    });

    const total = activeSimulado.questions.length;
    const scorePct = Math.round((correct / total) * 100);
    // TRI estimation formula based on score and question base
    const baseTri = activeSimulado.banca === 'enem' ? 450 : 500;
    const calculatedTri = Math.round(baseTri + (scorePct * 4.8) + (correct > total * 0.7 ? 40 : 0));

    const newAttempt: ExamAttempt = {
      id: `att-${Date.now()}`,
      simuladoId: activeSimulado.id,
      simuladoTitle: activeSimulado.title,
      date: new Date().toISOString(),
      completedAt: new Date().toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      answers: results.answers,
      flaggedForReview: results.flagged,
      struckAlternatives: results.struck,
      timeSpentSeconds: results.timeSpentSeconds,
      totalQuestions: total,
      correctCount: correct,
      scorePercentage: scorePct,
      triScore: calculatedTri,
    };

    saveExamAttempt(newAttempt);
    setActiveAttempt(newAttempt);
    setActiveView('resultados');
    setHasActiveExamSaved(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenPastAttempt = (simulado: Simulado, attempt: ExamAttempt) => {
    setActiveSimulado(simulado);
    setActiveAttempt(attempt);
    setActiveView('resultados');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStartExamById = (id: string) => {
    const matched = SIMULADOS_DATA.find(s => s.id === id);
    if (matched) {
      handleStartSimulado(matched);
    } else {
      setActiveView('catalogo');
    }
  };

  const handleRetryExam = () => {
    if (activeSimulado) {
      handleStartSimulado(activeSimulado);
    }
  };

  // If in 'simulado' view and activeSimulado exists, render the dedicated player
  const isPlayingExam = activeView === 'simulado' && activeSimulado !== null;

  return (
    <div className="min-h-screen bg-[#faf8ff] text-[#131b2e] flex flex-col font-sans">
      {/* If playing an exam, render player with its dedicated HUD and collapsible side map */}
      {isPlayingExam ? (
        <ExamPlayer
          simulado={activeSimulado}
          onFinishExam={handleFinishExam}
          onBackToCatalog={() => setActiveView('catalogo')}
        />
      ) : (
        <>
          {/* Main Layout: Fixed Sidebar + Header + Content Area */}
          <Sidebar
            activeView={activeView === 'dashboard' ? 'catalogo' : activeView}
            onNavigate={(view) => {
              if (view === 'simulado') {
                if (activeSimulado) {
                  setActiveView('simulado');
                } else {
                  // If none active, start first default
                  handleStartSimulado(SIMULADOS_DATA[0]);
                }
              } else {
                setActiveView(view);
              }
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            hasActiveExam={hasActiveExamSaved}
            student={student}
            mobileOpen={mobileSidebarOpen}
            onCloseMobile={() => setMobileSidebarOpen(false)}
          />

          <div className="lg:pl-72 flex flex-col min-h-screen">
            <Header
              student={student}
              onUpdateStudent={handleUpdateStudent}
              onOpenMobileSidebar={() => setMobileSidebarOpen(true)}
              searchQuery={globalSearchQuery}
              onSearchChange={setGlobalSearchQuery}
            />

            {/* Main scrollable body */}
            <main className="w-full pt-16 flex-1 flex flex-col">
              {(activeView === 'catalogo' || activeView === 'dashboard') && (
                <CatalogView
                  onStartSimulado={handleStartSimulado}
                  externalSearchQuery={globalSearchQuery}
                />
              )}

              {activeView === 'resultados' && activeSimulado && activeAttempt && (
                <ResultsView
                  simulado={activeSimulado}
                  attempt={activeAttempt}
                  onRetry={handleRetryExam}
                  onBackToCatalog={() => setActiveView('catalogo')}
                />
              )}

              {activeView === 'banco' && <QuestionBankView />}

              {activeView === 'relatorios' && (
                <ReportsView
                  onOpenAttempt={handleOpenPastAttempt}
                  onGoToCatalog={() => setActiveView('catalogo')}
                />
              )}

              {activeView === 'plano' && (
                <StudyPlanView onStartExamById={handleStartExamById} />
              )}

              {activeView === 'suporte' && <SupportView />}
            </main>
          </div>
        </>
      )}
    </div>
  );
}
