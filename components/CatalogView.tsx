'use client';

import React, { useState, useMemo } from 'react';
import { 
  CheckCircle2, 
  Bookmark, 
  BookmarkCheck, 
  SlidersHorizontal, 
  Clock, 
  HelpCircle, 
  TrendingUp, 
  Sparkles, 
  Play, 
  RotateCcw,
  BookOpen,
  Filter,
  Check,
  Zap,
  Target,
  School,
  BrainCircuit,
  Award
} from 'lucide-react';
import { Simulado, ExamSegment, ExamBanca, DifficultyLevel } from '@/lib/types';
import { SIMULADOS_DATA, generateCustomSimulado } from '@/lib/examData';
import { getBookmarks, toggleBookmarkStorage, getExamAttempts } from '@/lib/storage';

interface CatalogViewProps {
  onStartSimulado: (simulado: Simulado) => void;
  externalSearchQuery: string;
}

export const CatalogView: React.FC<CatalogViewProps> = ({
  onStartSimulado,
  externalSearchQuery,
}) => {
  // State
  const [selectedSegment, setSelectedSegment] = useState<ExamSegment>('medio');
  const [searchQuery, setSearchQuery] = useState('');
  const [bancaFilter, setBancaFilter] = useState<string>('all');
  const [difficultyFilter, setDifficultyFilter] = useState<string>('all');
  const [yearFilter, setYearFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'todos' | 'nao-realizados' | 'concluidos'>('todos');
  const [subjectFilter, setSubjectFilter] = useState<string | null>(null);
  
  // Custom builder widget state
  const [customDisciplines, setCustomDisciplines] = useState<string[]>([
    'Matemática',
    'Linguagens',
  ]);
  const [customQuestionCount, setCustomQuestionCount] = useState<number>(30);
  const [customFocus, setCustomFocus] = useState<string>('Apenas Questões Inéditas para mim');
  const [showAdvancedModal, setShowAdvancedModal] = useState(false);
  const [advancedMode, setAdvancedMode] = useState<'real' | 'estudo'>('real');

  // Bookmarks & Attempts
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>(() => getBookmarks());
  const completedAttempts = useMemo(() => getExamAttempts(), []);

  const handleToggleBookmark = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    toggleBookmarkStorage(id);
    setBookmarkedIds(getBookmarks());
  };

  // Combine local search and header search
  const effectiveSearch = (externalSearchQuery || searchQuery).toLowerCase().trim();

  // Filtered simulados
  const filteredSimulados = useMemo(() => {
    return SIMULADOS_DATA.filter((sim) => {
      // Segment filter
      if (sim.segment !== selectedSegment) return false;

      // Text query
      if (effectiveSearch) {
        const textToMatch = `${sim.title} ${sim.description} ${sim.badge} ${sim.banca} ${sim.curator.name}`.toLowerCase();
        if (!textToMatch.includes(effectiveSearch)) return false;
      }

      // Banca
      if (bancaFilter !== 'all' && sim.banca !== bancaFilter) return false;

      // Difficulty
      if (difficultyFilter !== 'all' && sim.difficulty !== difficultyFilter) return false;

      // Year
      if (yearFilter !== 'all' && String(sim.year) !== yearFilter) return false;

      // Status
      const isCompleted = completedAttempts.some((a) => a.simuladoId === sim.id);
      if (statusFilter === 'nao-realizados' && isCompleted) return false;
      if (statusFilter === 'concluidos' && !isCompleted) return false;

      // Subject tag
      if (subjectFilter) {
        const text = `${sim.title} ${sim.description}`.toLowerCase();
        if (subjectFilter === 'mat' && !text.includes('matemática') && !text.includes('saeb') && !text.includes('obmep')) {
          return false;
        }
        if (subjectFilter === 'port' && !text.includes('portuguesa') && !text.includes('linguagens') && !text.includes('redação')) {
          return false;
        }
        if (subjectFilter === 'nat' && !text.includes('biologia') && !text.includes('química') && !text.includes('física') && !text.includes('natureza')) {
          return false;
        }
        if (subjectFilter === 'hum' && !text.includes('humanas') && !text.includes('história') && !text.includes('geografia') && !text.includes('filosofia')) {
          return false;
        }
      }

      return true;
    });
  }, [
    selectedSegment,
    effectiveSearch,
    bancaFilter,
    difficultyFilter,
    yearFilter,
    statusFilter,
    subjectFilter,
    completedAttempts,
  ]);

  const resetAllFilters = () => {
    setSearchQuery('');
    setBancaFilter('all');
    setDifficultyFilter('all');
    setYearFilter('all');
    setStatusFilter('todos');
    setSubjectFilter(null);
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customDisciplines.length === 0) {
      alert('Selecione pelo menos uma disciplina para o simulado personalizado.');
      return;
    }
    const customExam = generateCustomSimulado(customDisciplines, customQuestionCount, selectedSegment);
    onStartSimulado(customExam);
  };

  const toggleDiscipline = (name: string) => {
    if (customDisciplines.includes(name)) {
      if (customDisciplines.length > 1) {
        setCustomDisciplines(customDisciplines.filter(d => d !== name));
      }
    } else {
      setCustomDisciplines([...customDisciplines, name]);
    }
  };

  const segmentCounts = useMemo(() => {
    const medioCount = SIMULADOS_DATA.filter(s => s.segment === 'medio').length;
    const fundCount = SIMULADOS_DATA.filter(s => s.segment === 'fundamental').length;
    return { medio: medioCount, fundamental: fundCount };
  }, []);

  return (
    <div className="w-full flex flex-col gap-6 p-4 lg:p-8 max-w-[1440px] mx-auto">
      {/* Editorial Header & Metric Pillows (Exact Stitch Banner) */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#e2e7ff] via-[#eaedff] to-[#ffffff] p-6 lg:p-8 shadow-xs border border-[#eaedff]">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex flex-col gap-2 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-[#dbe1ff] text-[#00174b] font-label-sm text-xs uppercase tracking-wider font-bold">
                Acervo Oficial 2025
              </span>
              <span className="flex items-center gap-1.5 text-[#434655] font-label-sm text-xs font-semibold">
                <CheckCircle2 className="w-4 h-4 text-[#006c4a]" />
                Curadoria Pedagógica TRI
              </span>
            </div>

            <h1 className="font-headline-lg text-2xl lg:text-3xl text-[#131b2e] font-extrabold tracking-tight">
              Catálogo de Simulados &amp; Banco de Questões
            </h1>

            <p className="font-body-md text-sm sm:text-base text-[#434655] leading-relaxed">
              Acesse mais de <span className="font-bold text-[#004ac6]">45.000 questões comentadas</span> item a item por mestres, simulados cronometrados em padrão Inep, FUVEST e olimpíadas escolares com cálculo estatístico de proficiência instantâneo.
            </p>
          </div>

          {/* Metric Floating Chips */}
          <div className="grid grid-cols-3 gap-3 shrink-0">
            <div className="bg-[#ffffff]/90 backdrop-blur-xs p-4 rounded-xl shadow-xs border border-[#eaedff] flex flex-col justify-between">
              <div className="flex items-center gap-1.5 text-[#004ac6]">
                <Target className="w-4 h-4" />
                <span className="font-label-sm text-[10px] uppercase font-bold">Ativas</span>
              </div>
              <div className="font-headline-md text-xl font-extrabold text-[#131b2e] mt-1">45.820</div>
              <span className="font-label-md text-xs text-[#434655]">Questões</span>
            </div>

            <div className="bg-[#ffffff]/90 backdrop-blur-xs p-4 rounded-xl shadow-xs border border-[#eaedff] flex flex-col justify-between">
              <div className="flex items-center gap-1.5 text-[#006c4a]">
                <BookOpen className="w-4 h-4" />
                <span className="font-label-sm text-[10px] uppercase font-bold">Provas</span>
              </div>
              <div className="font-headline-md text-xl font-extrabold text-[#131b2e] mt-1">318</div>
              <span className="font-label-md text-xs text-[#434655]">Simulados</span>
            </div>

            <div className="bg-[#ffffff]/90 backdrop-blur-xs p-4 rounded-xl shadow-xs border border-[#eaedff] flex flex-col justify-between">
              <div className="flex items-center gap-1.5 text-[#784b00]">
                <Award className="w-4 h-4" />
                <span className="font-label-sm text-[10px] uppercase font-bold">Frequência</span>
              </div>
              <div className="font-headline-md text-xl font-extrabold text-[#131b2e] mt-1">112k</div>
              <span className="font-label-md text-xs text-[#434655]">Execuções</span>
            </div>
          </div>
        </div>

        {/* Ambient background curve */}
        <div className="absolute -right-16 -bottom-16 w-80 h-80 rounded-full bg-[#004ac6]/5 blur-2xl pointer-events-none" />
      </div>

      {/* Segment Switcher & Fast Builder Button */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="inline-flex p-1 bg-[#e2e7ff] rounded-2xl self-start border border-[#dae2fd]">
          <button
            onClick={() => setSelectedSegment('medio')}
            className={`px-4 py-2.5 rounded-xl font-label-lg text-xs sm:text-sm transition-all flex items-center gap-2 ${
              selectedSegment === 'medio'
                ? 'bg-[#ffffff] text-[#004ac6] font-bold shadow-xs'
                : 'text-[#434655] hover:text-[#131b2e]'
            }`}
          >
            <School className="w-4 h-4" />
            <span>Ensino Médio • ENEM &amp; Vestibulares</span>
            <span className="ml-1 px-2 py-0.5 rounded-full bg-[#dbe1ff] text-[#00174b] font-label-sm text-[11px] font-bold">
              {segmentCounts.medio}
            </span>
          </button>

          <button
            onClick={() => setSelectedSegment('fundamental')}
            className={`px-4 py-2.5 rounded-xl font-label-lg text-xs sm:text-sm transition-all flex items-center gap-2 ${
              selectedSegment === 'fundamental'
                ? 'bg-[#ffffff] text-[#004ac6] font-bold shadow-xs'
                : 'text-[#434655] hover:text-[#131b2e]'
            }`}
          >
            <BrainCircuit className="w-4 h-4" />
            <span>Fundamental II • SAEB, OBMEP &amp; Militares</span>
            <span className="ml-1 px-2 py-0.5 rounded-full bg-[#dae2fd] text-[#434655] font-label-sm text-[11px] font-bold">
              {segmentCounts.fundamental}
            </span>
          </button>
        </div>

        {/* Quick Action: Montar Simulado Customizado Modal Trigger */}
        <button
          onClick={() => setShowAdvancedModal(true)}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#004ac6] hover:bg-[#003ea8] text-white font-label-lg text-xs sm:text-sm font-bold shadow-xs hover:shadow-sm active:scale-98 transition-all"
        >
          <SlidersHorizontal className="w-4 h-4" />
          <span>Montar Simulado Customizado</span>
        </button>
      </div>

      {/* Complex Filter Hub */}
      <div className="bg-[#ffffff] p-4 sm:p-5 rounded-2xl shadow-xs border border-[#eaedff] flex flex-col gap-4">
        {/* Row 1: Search and Dropdowns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Live search */}
          <div className="lg:col-span-2 relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-[#737686] w-4 h-4" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filtrar por título, banca, temática ou competência..."
              className="w-full pl-9 pr-4 py-2.5 bg-[#f2f3ff] focus:bg-white rounded-xl text-xs sm:text-sm text-[#131b2e] placeholder:text-[#737686] focus:outline-none focus:ring-2 focus:ring-[#004ac6]/30 border border-transparent focus:border-[#004ac6]/30 transition-all"
            />
          </div>

          {/* Banca selector */}
          <select
            value={bancaFilter}
            onChange={(e) => setBancaFilter(e.target.value)}
            className="w-full px-3 py-2.5 bg-[#f2f3ff] rounded-xl font-label-md text-xs sm:text-sm text-[#131b2e] focus:outline-none border border-transparent focus:border-[#004ac6]/30 cursor-pointer"
          >
            <option value="all">Todas as Bancas / Exames</option>
            <option value="enem">ENEM (Exame Nacional)</option>
            <option value="fuvest">FUVEST (USP)</option>
            <option value="unicamp">UNICAMP (Comvest)</option>
            <option value="saeb">SAEB / Prova Brasil</option>
            <option value="prova_paulista">Prova Paulista (SEDUC-SP)</option>
            <option value="obmep">OBMEP (Olimpíada)</option>
            <option value="oba">OBA (Astronomia)</option>
          </select>

          {/* Difficulty selector */}
          <select
            value={difficultyFilter}
            onChange={(e) => setDifficultyFilter(e.target.value)}
            className="w-full px-3 py-2.5 bg-[#f2f3ff] rounded-xl font-label-md text-xs sm:text-sm text-[#131b2e] focus:outline-none border border-transparent focus:border-[#004ac6]/30 cursor-pointer"
          >
            <option value="all">Todas as Dificuldades</option>
            <option value="facil">Fácil</option>
            <option value="medio">Médio</option>
            <option value="dificil">Difícil</option>
            <option value="desafio">Desafio Ninja</option>
          </select>

          {/* Year selector */}
          <select
            value={yearFilter}
            onChange={(e) => setYearFilter(e.target.value)}
            className="w-full px-3 py-2.5 bg-[#f2f3ff] rounded-xl font-label-md text-xs sm:text-sm text-[#131b2e] focus:outline-none border border-transparent focus:border-[#004ac6]/30 cursor-pointer"
          >
            <option value="all">Todos os Anos</option>
            <option value="2024">Edição 2024</option>
            <option value="2023">Edição 2023</option>
            <option value="2022">Edição 2022</option>
            <option value="2021">Edição 2021</option>
          </select>
        </div>

        {/* Row 2: Status Pills & Subject Filter */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pt-2 border-t border-[#eaedff]">
          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0 no-scrollbar">
            <span className="font-label-sm text-xs text-[#737686] uppercase mr-1">Status:</span>
            <button
              onClick={() => setStatusFilter('todos')}
              className={`px-3 py-1 rounded-full font-label-sm text-xs font-semibold transition-all ${
                statusFilter === 'todos'
                  ? 'bg-[#004ac6] text-white font-bold'
                  : 'bg-[#eaedff] text-[#434655] hover:text-[#131b2e]'
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setStatusFilter('nao-realizados')}
              className={`px-3 py-1 rounded-full font-label-sm text-xs font-semibold transition-all ${
                statusFilter === 'nao-realizados'
                  ? 'bg-[#004ac6] text-white font-bold'
                  : 'bg-[#eaedff] text-[#434655] hover:text-[#131b2e]'
              }`}
            >
              Não Realizados
            </button>
            <button
              onClick={() => setStatusFilter('concluidos')}
              className={`px-3 py-1 rounded-full font-label-sm text-xs font-semibold transition-all ${
                statusFilter === 'concluidos'
                  ? 'bg-[#004ac6] text-white font-bold'
                  : 'bg-[#eaedff] text-[#434655] hover:text-[#131b2e]'
              }`}
            >
              Concluídos ({completedAttempts.length})
            </button>
          </div>

          {/* Quick Subject Badges */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0 no-scrollbar">
            <span className="font-label-sm text-xs text-[#737686] uppercase mr-1">Foco:</span>
            <button
              onClick={() => setSubjectFilter(subjectFilter === 'mat' ? null : 'mat')}
              className={`px-2.5 py-1 rounded-lg font-label-sm text-xs font-bold transition-all ${
                subjectFilter === 'mat'
                  ? 'bg-[#004ac6] text-white ring-2 ring-[#004ac6]'
                  : 'bg-[#e2e7ff] text-[#004ac6] hover:bg-[#dbe1ff]'
              }`}
            >
              Matemática
            </button>
            <button
              onClick={() => setSubjectFilter(subjectFilter === 'port' ? null : 'port')}
              className={`px-2.5 py-1 rounded-lg font-label-sm text-xs font-bold transition-all ${
                subjectFilter === 'port'
                  ? 'bg-[#006c4a] text-white ring-2 ring-[#006c4a]'
                  : 'bg-[#85f8c4]/40 text-[#006c4a] hover:bg-[#85f8c4]'
              }`}
            >
              L. Portuguesa
            </button>
            <button
              onClick={() => setSubjectFilter(subjectFilter === 'nat' ? null : 'nat')}
              className={`px-2.5 py-1 rounded-lg font-label-sm text-xs font-bold transition-all ${
                subjectFilter === 'nat'
                  ? 'bg-[#784b00] text-white ring-2 ring-[#784b00]'
                  : 'bg-[#ffddb8] text-[#784b00] hover:bg-[#ffb95f]'
              }`}
            >
              Ciências da Natureza
            </button>
            <button
              onClick={() => setSubjectFilter(subjectFilter === 'hum' ? null : 'hum')}
              className={`px-2.5 py-1 rounded-lg font-label-sm text-xs font-bold transition-all ${
                subjectFilter === 'hum'
                  ? 'bg-[#434655] text-white ring-2 ring-[#434655]'
                  : 'bg-[#eaedff] text-[#434655] hover:bg-[#dae2fd]'
              }`}
            >
              Humanas &amp; Redação
            </button>
          </div>
        </div>
      </div>

      {/* Active Filters Summary Line */}
      <div className="flex flex-wrap items-center justify-between text-[#434655] font-label-md text-xs px-1 gap-2">
        <div className="flex items-center gap-2">
          <span>
            Mostrando <strong className="text-[#131b2e]">{filteredSimulados.length} simulados</strong> recomendados para o seu perfil
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-[#c3c6d7]" />
          <span className="text-[#006c4a] font-semibold">Atualizado com as bancas oficiais Inep &amp; SEDUC-SP</span>
        </div>

        <button
          onClick={resetAllFilters}
          className="text-[#004ac6] hover:underline flex items-center gap-1 font-label-sm text-xs font-bold"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Redefinir filtros
        </button>
      </div>

      {/* Main Content Grid: 8 Cols Cards + 4 Cols Interactive Builder (XL) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* Simulados Cards Grid (8 cols on XL) */}
        <div className="xl:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredSimulados.length === 0 ? (
            <div className="col-span-2 bg-white rounded-2xl p-12 text-center border border-[#eaedff]">
              <HelpCircle className="w-12 h-12 text-[#737686] mx-auto mb-3" />
              <h3 className="text-base font-bold text-[#131b2e]">Nenhum simulado encontrado</h3>
              <p className="text-xs text-[#737686] max-w-sm mx-auto mt-1 mb-4">
                Tente ajustar os filtros de banca, dificuldade ou termo de busca.
              </p>
              <button
                onClick={resetAllFilters}
                className="px-4 py-2 bg-[#004ac6] text-white rounded-xl text-xs font-bold"
              >
                Limpar Todos os Filtros
              </button>
            </div>
          ) : (
            filteredSimulados.map((sim) => {
              const isBookmarked = bookmarkedIds.includes(sim.id);
              const attempt = completedAttempts.find((a) => a.simuladoId === sim.id);

              return (
                <div
                  key={sim.id}
                  className="bg-[#ffffff] rounded-2xl p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between border border-[#eaedff] group relative"
                >
                  <div className="flex flex-col gap-3">
                    {/* Badge & Bookmark button */}
                    <div className="flex items-center justify-between">
                      <span className={`px-2.5 py-0.5 rounded-full font-label-sm text-[11px] uppercase tracking-wider font-bold ${
                        sim.badgeType === 'enem' 
                          ? 'bg-[#004ac6] text-white' 
                          : sim.badgeType === 'vestibular'
                          ? 'bg-slate-900 text-white'
                          : sim.badgeType === 'obmep'
                          ? 'bg-[#ffddb8] text-[#2a1700]'
                          : sim.badgeType === 'fundamental'
                          ? 'bg-[#85f8c4] text-[#002114]'
                          : 'bg-[#eaedff] text-[#004ac6]'
                      }`}>
                        {sim.badge}
                      </span>

                      <button
                        onClick={(e) => handleToggleBookmark(sim.id, e)}
                        className={`p-1.5 rounded-full transition-colors ${
                          isBookmarked 
                            ? 'text-[#784b00] bg-[#ffddb8]' 
                            : 'text-[#c3c6d7] hover:text-[#784b00] hover:bg-[#f2f3ff]'
                        }`}
                        title={isBookmarked ? 'Salvo nos favoritos' : 'Favoritar simulado'}
                      >
                        {isBookmarked ? (
                          <BookmarkCheck className="w-5 h-5 fill-current" />
                        ) : (
                          <Bookmark className="w-5 h-5" />
                        )}
                      </button>
                    </div>

                    {/* Title & Description */}
                    <div>
                      <h3 className="font-headline-sm text-base font-bold text-[#131b2e] group-hover:text-[#004ac6] transition-colors leading-snug">
                        {sim.title}
                      </h3>
                      <p className="font-body-sm text-xs text-[#434655] line-clamp-2 mt-1 leading-relaxed">
                        {sim.description}
                      </p>
                    </div>

                    {/* Meta Badges Pill Row */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-1 text-xs text-[#434655]">
                      <div className="flex items-center gap-1 bg-[#f2f3ff] px-2 py-1 rounded-lg">
                        <HelpCircle className="w-3.5 h-3.5 text-[#004ac6]" />
                        <span className="font-medium">{sim.questionCount} Questões</span>
                      </div>
                      <div className="flex items-center gap-1 bg-[#f2f3ff] px-2 py-1 rounded-lg">
                        <Clock className="w-3.5 h-3.5 text-[#006c4a]" />
                        <span className="font-medium">{sim.durationFormatted}</span>
                      </div>
                      <div className="flex items-center gap-1 bg-[#f2f3ff] px-2 py-1 rounded-lg">
                        <TrendingUp className="w-3.5 h-3.5 text-[#784b00]" />
                        <span className="font-medium">{sim.difficultyLabel}</span>
                      </div>
                    </div>

                    {/* Visual Progress & Benchmark Bar */}
                    <div className="bg-[#f2f3ff] p-3 rounded-xl flex flex-col gap-1 mt-1 border border-[#eaedff]">
                      <div className="flex items-center justify-between font-label-sm text-xs">
                        <span className="text-[#434655] flex items-center gap-1 font-semibold">
                          <TrendingUp className="w-3.5 h-3.5 text-[#006c4a]" />
                          Taxa Média de Acertos
                        </span>
                        <span className="font-bold text-[#131b2e]">{sim.averageScorePercent}%</span>
                      </div>

                      <div className="w-full h-1.5 rounded-full bg-[#dae2fd] overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-[#004ac6] to-[#006c4a] rounded-full"
                          style={{ width: `${sim.averageScorePercent}%` }}
                        />
                      </div>

                      <div className="flex items-center justify-between font-label-sm text-[11px] text-[#737686] pt-0.5">
                        <span>{sim.studentsCountFormatted}</span>
                        <span className="text-[#006c4a] font-semibold">{sim.benchmarkBadge}</span>
                      </div>
                    </div>

                    {attempt && (
                      <div className="bg-[#85f8c4]/30 text-[#005137] px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center justify-between">
                        <span>Você concluiu com {attempt.scorePercentage}%</span>
                        <span>TRI {attempt.triScore}</span>
                      </div>
                    )}
                  </div>

                  {/* Card Bottom Footer: Curator + Iniciar Simulado CTA */}
                  <div className="pt-4 mt-4 border-t border-[#eaedff] flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <img
                        src={sim.curator.avatar}
                        alt={sim.curator.name}
                        className="w-8 h-8 rounded-full object-cover shadow-xs ring-1 ring-[#eaedff]"
                      />
                      <div className="flex flex-col">
                        <span className="font-label-sm text-xs text-[#131b2e] font-semibold leading-tight">
                          {sim.curator.name}
                        </span>
                        <span className="font-label-sm text-[10px] text-[#737686] leading-tight">
                          {sim.curator.role}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => onStartSimulado(sim)}
                      className="px-4 py-2 bg-[#004ac6] hover:bg-[#003ea8] text-white rounded-xl font-label-lg text-xs sm:text-sm font-bold shadow-xs hover:shadow-md active:scale-98 transition-all text-center flex items-center gap-1.5"
                    >
                      <span>Iniciar Simulado</span>
                      <Play className="w-3.5 h-3.5 fill-current" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Quick Interactive Sidebar: "Simulado Sob Medida" & "Seu Desempenho Médio" (4 cols on XL) */}
        <div className="xl:col-span-4 flex flex-col gap-4">
          <div className="bg-[#ffffff] rounded-2xl p-5 shadow-xs border border-[#eaedff] flex flex-col gap-4 sticky top-20">
            <div className="flex items-center justify-between pb-2 border-b border-[#eaedff]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#dbe1ff] flex items-center justify-center text-[#004ac6]">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="font-headline-sm text-sm sm:text-base font-bold text-[#131b2e]">
                    Simulado Sob Medida
                  </h2>
                  <p className="font-label-sm text-[11px] text-[#737686]">Monte seu caderno exclusivo</p>
                </div>
              </div>

              <span className="px-2 py-0.5 rounded-full bg-[#85f8c4] text-[#002114] font-label-sm text-[11px] font-bold">
                Instantâneo
              </span>
            </div>

            {/* Quick Generator Form */}
            <form onSubmit={handleCustomSubmit} className="flex flex-col gap-4">
              {/* Disciplines Checkboxes */}
              <div className="flex flex-col gap-1.5">
                <label className="font-label-md text-xs text-[#131b2e] font-bold">
                  Selecione as Disciplinas:
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  {['Matemática', 'Linguagens', 'Física', 'Química', 'Biologia', 'História/Geo'].map(
                    (item) => {
                      const isChecked = customDisciplines.includes(item);
                      return (
                        <label
                          key={item}
                          onClick={() => toggleDiscipline(item)}
                          className={`flex items-center gap-2 p-2 rounded-xl text-xs font-semibold cursor-pointer transition-colors border ${
                            isChecked
                              ? 'bg-[#eaedff] text-[#004ac6] border-[#004ac6]/30'
                              : 'bg-[#f2f3ff] text-[#434655] border-transparent hover:bg-[#eaedff]'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {}}
                            className="rounded text-[#004ac6] focus:ring-0"
                          />
                          <span>{item}</span>
                        </label>
                      );
                    }
                  )}
                </div>
              </div>

              {/* Number of Questions Slider */}
              <div className="flex flex-col gap-1 pt-1">
                <div className="flex items-center justify-between">
                  <label className="font-label-md text-xs text-[#131b2e] font-bold">
                    Quantidade de Questões:
                  </label>
                  <span className="font-headline-sm text-sm font-extrabold text-[#004ac6]">
                    {customQuestionCount}
                  </span>
                </div>

                <input
                  type="range"
                  min="10"
                  max="90"
                  step="5"
                  value={customQuestionCount}
                  onChange={(e) => setCustomQuestionCount(Number(e.target.value))}
                  className="w-full accent-[#004ac6] cursor-pointer"
                />

                <div className="flex items-center justify-between font-label-sm text-[10px] text-[#737686]">
                  <span>10 q (Treino Rápido)</span>
                  <span>Tempo est.: <strong className="text-[#131b2e]">{customQuestionCount * 3} min</strong></span>
                  <span>90 q (Oficial)</span>
                </div>
              </div>

              {/* Focus of Bank */}
              <div className="flex flex-col gap-1">
                <label className="font-label-md text-xs text-[#131b2e] font-bold">
                  Foco do Banco:
                </label>
                <select
                  value={customFocus}
                  onChange={(e) => setCustomFocus(e.target.value)}
                  className="w-full px-3 py-2 bg-[#f2f3ff] rounded-xl font-label-sm text-xs text-[#131b2e] focus:outline-none border border-transparent focus:border-[#004ac6]/30"
                >
                  <option>Apenas Questões Inéditas para mim</option>
                  <option>Apenas Questões que já Errei (Treino de Erros)</option>
                  <option>Mix Balanceado com Peso TRI</option>
                </select>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-[#004ac6] to-[#2563eb] hover:from-[#003ea8] hover:to-[#004ac6] text-white rounded-xl font-label-lg text-xs sm:text-sm font-bold shadow-xs hover:shadow-md active:scale-98 transition-all flex items-center justify-center gap-2"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Gerar Caderno &amp; Iniciar</span>
              </button>
            </form>

            {/* Performance Snapshot Pill */}
            <div className="bg-[#f2f3ff] p-4 rounded-xl flex flex-col gap-1.5 border border-[#eaedff]">
              <div className="flex items-center justify-between">
                <span className="font-label-sm text-[11px] text-[#434655] uppercase tracking-wider font-bold">
                  Seu Desempenho Médio
                </span>
                <span className="font-label-sm text-[11px] text-[#006c4a] font-bold">
                  +5.4% este mês
                </span>
              </div>

              <div className="flex items-baseline gap-2">
                <span className="font-display-lg text-2xl font-extrabold text-[#004ac6]">718.5</span>
                <span className="font-label-md text-xs text-[#434655]">TRI Média Estimada</span>
              </div>

              <p className="font-body-sm text-xs text-[#434655] leading-relaxed">
                Você já realizou {completedAttempts.length} simulados nesta sessão. Próxima meta recomendada: FUVEST 1ª Fase Geral.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Advanced Custom Simulado Modal */}
      {showAdvancedModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white max-w-xl w-full rounded-2xl p-6 sm:p-8 shadow-2xl border border-[#eaedff] flex flex-col gap-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-[#eaedff] pb-3">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-5 h-5 text-[#004ac6]" />
                <h2 className="font-headline-md text-base sm:text-lg text-[#131b2e] font-bold">
                  Configuração Avançada de Simulado
                </h2>
              </div>
              <button
                onClick={() => setShowAdvancedModal(false)}
                className="p-1 rounded-lg text-[#737686] hover:bg-[#eaedff]"
              >
                ✕
              </button>
            </div>

            <p className="font-body-md text-xs sm:text-sm text-[#434655]">
              Defina parâmetros específicos como pesos de competências da BNCC, temporizador com contagem regressiva rigorosa e feedback imediato de gabarito comentado.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label
                onClick={() => setAdvancedMode('real')}
                className={`p-3 rounded-xl border flex items-start gap-2 cursor-pointer transition-colors ${
                  advancedMode === 'real'
                    ? 'border-[#004ac6] bg-[#eaedff]/40'
                    : 'border-[#eaedff] bg-[#f2f3ff]'
                }`}
              >
                <input
                  type="radio"
                  name="advancedMode"
                  checked={advancedMode === 'real'}
                  onChange={() => setAdvancedMode('real')}
                  className="accent-[#004ac6] mt-0.5"
                />
                <div className="text-xs">
                  <strong className="block text-[#131b2e]">Modo Exame Real</strong>
                  <span className="text-[#434655]">
                    Cronômetro com tempo oficial e gabarito apenas após finalizar.
                  </span>
                </div>
              </label>

              <label
                onClick={() => setAdvancedMode('estudo')}
                className={`p-3 rounded-xl border flex items-start gap-2 cursor-pointer transition-colors ${
                  advancedMode === 'estudo'
                    ? 'border-[#004ac6] bg-[#eaedff]/40'
                    : 'border-[#eaedff] bg-[#f2f3ff]'
                }`}
              >
                <input
                  type="radio"
                  name="advancedMode"
                  checked={advancedMode === 'estudo'}
                  onChange={() => setAdvancedMode('estudo')}
                  className="accent-[#004ac6] mt-0.5"
                />
                <div className="text-xs">
                  <strong className="block text-[#131b2e]">Modo Estudo</strong>
                  <span className="text-[#434655]">
                    Sem pressão de tempo e com dicas pedagógicas imediatas.
                  </span>
                </div>
              </label>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#eaedff]">
              <button
                type="button"
                onClick={() => setShowAdvancedModal(false)}
                className="px-4 py-2 text-xs font-semibold text-[#737686] hover:bg-[#eaedff] rounded-xl"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowAdvancedModal(false);
                  const custom = generateCustomSimulado(
                    ['Matemática', 'Linguagens', 'Ciências da Natureza'],
                    30,
                    selectedSegment
                  );
                  onStartSimulado(custom);
                }}
                className="px-5 py-2.5 bg-[#004ac6] hover:bg-[#003ea8] text-white rounded-xl text-xs sm:text-sm font-bold shadow-xs hover:shadow-md"
              >
                Criar e Abrir Caderno
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
