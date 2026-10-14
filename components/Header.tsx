'use client';

import React, { useState } from 'react';
import { 
  Search, 
  GraduationCap, 
  ChevronDown, 
  Bell, 
  Menu,
  Check,
  Sparkles,
  Flame,
  User
} from 'lucide-react';
import { StudentProfile } from '@/lib/storage';

interface HeaderProps {
  student: StudentProfile;
  onUpdateStudent: (updates: Partial<StudentProfile>) => void;
  onOpenMobileSidebar: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  student,
  onUpdateStudent,
  onOpenMobileSidebar,
  searchQuery,
  onSearchChange,
}) => {
  const [showGradeMenu, setShowGradeMenu] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [tempName, setTempName] = useState(student.name);

  const gradeOptions = [
    '3º Ano - Médio / ENEM',
    '2º Ano - Médio',
    '1º Ano - Médio',
    '9º Ano - Fundamental II',
    '8º Ano - Fundamental II',
    '7º Ano - Fundamental II',
    '6º Ano - Fundamental II',
  ];

  const notifications = [
    {
      id: 1,
      title: 'Novo Simulado: ENEM 2024 Calibrado',
      desc: 'Adicionamos novas questões de Linguagens com nota TRI 2024.',
      time: 'Há 2 horas',
    },
    {
      id: 2,
      title: 'Inscrições OBMEP 2025',
      desc: 'Treinos para Nível 1, 2 e 3 liberados no catálogo.',
      time: 'Ontem',
    },
  ];

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (tempName.trim()) {
      onUpdateStudent({ name: tempName.trim() });
    }
    setShowProfileModal(false);
  };

  return (
    <>
      <header className="fixed top-0 left-0 lg:left-72 right-0 h-16 bg-[#ffffff]/90 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)] z-40 flex items-center justify-between px-4 lg:px-6 border-b border-[#eaedff]">
        {/* Left Side: Mobile Menu Button + Search & Grade */}
        <div className="flex items-center gap-3 flex-1 max-w-2xl">
          {/* Mobile hamburger */}
          <button
            onClick={onOpenMobileSidebar}
            className="lg:hidden p-2 rounded-xl text-[#434655] hover:bg-[#eaedff] transition-colors"
            aria-label="Abrir menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Search bar */}
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#737686] w-4 h-4" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Buscar simulado, exame ENEM, FUVEST ou tópico..."
              className="w-full pl-9 pr-4 py-2 bg-[#f2f3ff] hover:bg-[#eaedff] focus:bg-[#ffffff] rounded-xl font-body-sm text-xs sm:text-sm text-[#131b2e] placeholder:text-[#737686] focus:outline-none focus:ring-2 focus:ring-[#004ac6]/30 transition-all border border-transparent focus:border-[#004ac6]/40"
            />
          </div>

          {/* Grade Selector Dropdown */}
          <div className="relative hidden md:block shrink-0">
            <button
              onClick={() => setShowGradeMenu(!showGradeMenu)}
              className="flex items-center gap-1.5 px-3 py-2 bg-[#eaedff] hover:bg-[#dae2fd] rounded-xl text-xs font-semibold text-[#131b2e] transition-colors"
            >
              <GraduationCap className="text-[#004ac6] w-4 h-4" />
              <span className="whitespace-nowrap">{student.grade}</span>
              <ChevronDown className="text-[#737686] w-3.5 h-3.5" />
            </button>

            {showGradeMenu && (
              <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-lg border border-[#eaedff] py-1 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-3 py-1.5 text-[11px] font-bold text-[#737686] uppercase tracking-wider">
                  Etapa de Ensino
                </div>
                {gradeOptions.map((grade) => (
                  <button
                    key={grade}
                    onClick={() => {
                      onUpdateStudent({ grade });
                      setShowGradeMenu(false);
                    }}
                    className={`w-full px-3 py-2 text-left text-xs flex items-center justify-between hover:bg-[#f2f3ff] transition-colors ${
                      student.grade === grade ? 'text-[#004ac6] font-bold bg-[#eaedff]/40' : 'text-[#434655]'
                    }`}
                  >
                    <span>{grade}</span>
                    {student.grade === grade && <Check className="w-3.5 h-3.5 text-[#004ac6]" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Streak, Notifications & Student Info */}
        <div className="flex items-center gap-2 sm:gap-4 ml-2">
          {/* Focus Streak Badge */}
          <div className="flex items-center gap-1 px-3 py-1.5 bg-[#ffddb8] rounded-full text-xs font-bold text-[#2a1700] shadow-xs">
            <span className="text-sm">🔥</span>
            <span className="hidden sm:inline font-label-sm">{student.focusDays} dias de foco</span>
            <span className="sm:hidden font-label-sm">{student.focusDays}d</span>
          </div>

          {/* Notifications Bell */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              aria-label="Notificações"
              className="relative p-2 rounded-xl text-[#434655] hover:bg-[#eaedff] transition-colors"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#ba1a1a]" />
            </button>

            {showNotifications && (
              <div className="absolute right-0 top-full mt-2 w-72 sm:w-80 bg-white rounded-2xl shadow-xl border border-[#eaedff] p-3 z-50">
                <div className="flex items-center justify-between pb-2 border-b border-[#eaedff] mb-2">
                  <span className="font-bold text-xs text-[#131b2e]">Avisos & Atualizações</span>
                  <span className="text-[10px] text-[#004ac6] font-semibold">2 novos</span>
                </div>
                <div className="flex flex-col gap-2">
                  {notifications.map((n) => (
                    <div key={n.id} className="p-2 rounded-xl bg-[#f2f3ff] hover:bg-[#eaedff] transition-colors">
                      <div className="font-semibold text-xs text-[#131b2e]">{n.title}</div>
                      <p className="text-[11px] text-[#434655] mt-0.5">{n.desc}</p>
                      <span className="text-[9px] text-[#737686] mt-1 block">{n.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Student Profile Pill */}
          <button
            onClick={() => {
              setTempName(student.name);
              setShowProfileModal(true);
            }}
            className="flex items-center gap-2.5 pl-1.5 pr-2 py-1 rounded-full hover:bg-[#eaedff] transition-colors text-left group"
          >
            <div className="text-right hidden xl:block">
              <div className="font-label-lg text-xs font-bold text-[#131b2e] leading-tight group-hover:text-[#004ac6] transition-colors">
                {student.name}
              </div>
              <div className="font-label-sm text-[11px] text-[#006c4a] font-semibold">
                Acesso Aberto • Pro
              </div>
            </div>

            <div className="w-8 h-8 rounded-full bg-[#004ac6] text-white flex items-center justify-center font-bold text-xs shadow-sm ring-2 ring-[#dbe1ff]">
              {student.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
            </div>
          </button>
        </div>
      </header>

      {/* Student Profile Edit Modal (NO LOGIN - Just student convenience) */}
      {showProfileModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-[#eaedff] animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-[#dbe1ff] text-[#004ac6] flex items-center justify-center font-bold">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-headline-sm text-sm text-[#131b2e] font-bold">
                  Perfil do Estudante
                </h3>
                <p className="text-xs text-[#737686]">
                  Acesso livre • Salvo no seu navegador
                </p>
              </div>
            </div>

            <form onSubmit={handleSaveProfile} className="flex flex-col gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#131b2e] mb-1">
                  Seu Nome ou Apelido:
                </label>
                <input
                  type="text"
                  value={tempName}
                  onChange={(e) => setTempName(e.target.value)}
                  placeholder="Ex: Lucas Albuquerque"
                  className="w-full px-3 py-2 bg-[#f2f3ff] rounded-xl text-xs text-[#131b2e] border border-transparent focus:border-[#004ac6] focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#131b2e] mb-1">
                  Meta Semanal de Questões:
                </label>
                <input
                  type="number"
                  min="20"
                  max="500"
                  value={student.weeklyTarget}
                  onChange={(e) => onUpdateStudent({ weeklyTarget: Number(e.target.value) || 100 })}
                  className="w-full px-3 py-2 bg-[#f2f3ff] rounded-xl text-xs text-[#131b2e] border border-transparent focus:border-[#004ac6] focus:bg-white focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 mt-2 pt-2 border-t border-[#eaedff]">
                <button
                  type="button"
                  onClick={() => setShowProfileModal(false)}
                  className="px-3 py-1.5 rounded-lg text-xs text-[#737686] hover:bg-[#eaedff]"
                >
                  Fechar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg text-xs font-bold bg-[#004ac6] text-white hover:opacity-90 shadow-xs"
                >
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
