'use client';

import React from 'react';
import { 
  LayoutDashboard, 
  BookOpen, 
  HelpCircle, 
  Timer, 
  Trophy, 
  CalendarDays, 
  HelpCircle as SupportIcon,
  X
} from 'lucide-react';
import { StudentProfile } from '@/lib/storage';

interface SidebarProps {
  activeView: string;
  onNavigate: (view: string) => void;
  hasActiveExam: boolean;
  student: StudentProfile;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeView,
  onNavigate,
  hasActiveExam,
  student,
  mobileOpen,
  onCloseMobile,
}) => {
  const navItems = [
    { id: 'dashboard', label: 'Início / Dashboard', icon: LayoutDashboard },
    { id: 'catalogo', label: 'Catálogo de Simulados', icon: BookOpen },
    { id: 'banco', label: 'Banco de Questões', icon: HelpCircle },
    { 
      id: 'simulado', 
      label: 'Modo Simulado', 
      icon: Timer, 
      badge: hasActiveExam ? 'Em Andamento' : undefined 
    },
    { id: 'relatorios', label: 'Relatórios & TRI', icon: Trophy },
    { id: 'plano', label: 'Meu Plano de Estudos', icon: CalendarDays },
  ];

  const handleItemClick = (id: string) => {
    onNavigate(id);
    onCloseMobile();
  };

  const progressPercent = Math.min(
    100,
    Math.round((student.weeklySolved / student.weeklyTarget) * 100)
  );

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-40 lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={`fixed left-0 top-0 h-full w-72 bg-[#ffffff] shadow-[0_1px_8px_rgba(0,0,0,0.04)] z-50 flex flex-col justify-between transition-transform duration-300 ease-in-out border-r border-[#eaedff] ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex flex-col">
          {/* Brand & Mobile Close */}
          <div className="h-16 px-4 flex items-center justify-between border-b border-[#eaedff]/50">
            <button 
              onClick={() => handleItemClick('catalogo')}
              className="flex items-center gap-2 text-left focus:outline-none group"
            >
              {/* Brand Logo Mark */}
              <div className="w-8 h-8 rounded-lg bg-[#004ac6] text-white flex items-center justify-center font-bold text-base shadow-sm group-hover:scale-105 transition-transform">
                GB
              </div>
              <div className="flex flex-col">
                <span className="font-headline-sm text-[#004ac6] font-extrabold tracking-tight">
                  GabaritaBrasil
                </span>
                <span className="text-[10px] font-semibold text-[#006c4a] -mt-1 tracking-wide">
                  ESCSimulados
                </span>
              </div>
            </button>

            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-full bg-[#e2e7ff] text-[#434655] font-label-sm text-[10px] uppercase tracking-wider font-semibold">
                Estudante
              </span>
              <button
                onClick={onCloseMobile}
                className="lg:hidden p-1.5 rounded-lg text-[#737686] hover:bg-[#eaedff]"
                aria-label="Fechar menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-col gap-1 px-3 mt-4">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleItemClick(item.id)}
                  className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl transition-all font-label-lg text-sm text-left ${
                    isActive
                      ? 'bg-[#004ac6] text-white font-bold shadow-sm'
                      : 'text-[#434655] hover:bg-[#eaedff] hover:text-[#131b2e]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-[#737686]'}`} />
                    <span>{item.label}</span>
                  </div>

                  {item.badge && (
                    <span className="px-2 py-0.5 rounded-full bg-[#82f5c1] text-[#00714e] font-label-sm text-[10px] whitespace-nowrap font-bold animate-pulse">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Widgets */}
        <div className="p-3 flex flex-col gap-2">
          {/* Weekly Goal Widget */}
          <div className="bg-[#f2f3ff] p-4 rounded-2xl shadow-[0_1px_8px_rgba(0,0,0,0.02)] border border-[#eaedff]">
            <div className="flex items-center justify-between mb-1">
              <span className="font-label-md text-xs text-[#131b2e] font-bold">Meta Semanal</span>
              <span className="font-label-sm text-xs text-[#004ac6] font-bold">
                {student.weeklySolved}/{student.weeklyTarget}
              </span>
            </div>
            <p className="font-body-sm text-xs text-[#434655] mb-2.5">
              {student.weeklySolved} de {student.weeklyTarget} questões resolvidas
            </p>
            <div className="w-full h-2 rounded-full bg-[#dae2fd] overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#004ac6] to-[#006c4a] rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Support / Help link */}
          <button
            onClick={() => handleItemClick('suporte')}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-left transition-colors font-label-lg text-sm ${
              activeView === 'suporte'
                ? 'bg-[#004ac6] text-white font-bold'
                : 'text-[#434655] hover:bg-[#eaedff] hover:text-[#131b2e]'
            }`}
          >
            <SupportIcon className="w-5 h-5" />
            <span>Suporte / Ajuda</span>
          </button>
        </div>
      </aside>
    </>
  );
};
