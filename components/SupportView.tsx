'use client';

import React, { useState } from 'react';
import { 
  HelpCircle, 
  MessageSquare, 
  ChevronDown, 
  ChevronUp, 
  Send, 
  CheckCircle2,
  ShieldCheck,
  BookOpen,
  Mail
} from 'lucide-react';

export const SupportView: React.FC = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [sentSuccess, setSentSuccess] = useState(false);

  const faqs = [
    {
      q: 'Preciso criar conta, fazer login ou fornecer senha para usar?',
      a: 'Não! O ESCSimulados tem acesso 100% livre e direto. Qualquer estudante pode entrar na plataforma e iniciar simulados instantaneamente. Suas respostas, anotações de rascunho e histórico de notas são salvos localmente na memória do seu navegador (LocalStorage).'
    },
    {
      q: 'Como funciona o cálculo estatístico da nota TRI?',
      a: 'A Teoria de Resposta ao Item (TRI) do Inep calcula a proficiência avaliando a coerência pedagógica do estudante: acertar questões difíceis errando as fáceis reduz a pontuação devido à probabilidade de chute (parâmetro c). Acertar consistentemente questões fáceis e médias garante pontuação sólida e alta.'
    },
    {
      q: 'Os simulados da Prova Paulista e do SARESP seguem o padrão da SEDUC-SP?',
      a: 'Sim. Os cadernos trazem habilidades e descritores idênticos aos aplicados pela Secretaria da Educação do Estado de São Paulo, permitindo que alunos da rede pública treinem para as avaliações bimestrais e diagnósticas.'
    },
    {
      q: 'Como funciona o Treino para Olimpíadas (OBMEP e OBA)?',
      a: 'Os simulados da OBMEP priorizam raciocínio lógico dedutivo sem necessidade de fórmulas decorebas, enquanto a OBA foca em astronomia básica, estações do ano, exploração espacial e gravitação.'
    },
    {
      q: 'Posso usar o ESCSimulados no celular?',
      a: 'Sim! Toda a interface foi adaptada para smartphones, tablets e computadores de laboratórios escolares, garantindo toque ágil e botões com dimensões ergonômicas para responder sem cansaço visual.'
    }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      setSentSuccess(true);
      setMessage('');
      setTimeout(() => setSentSuccess(false), 4000);
    }
  };

  return (
    <div className="w-full flex flex-col gap-6 p-4 lg:p-8 max-w-[1000px] mx-auto">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 lg:p-8 border border-[#eaedff] shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#dbe1ff] text-[#004ac6] flex items-center justify-center font-bold">
            <HelpCircle className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-headline-lg text-2xl font-extrabold text-[#131b2e]">
              Central de Ajuda &amp; Suporte Pedagógico
            </h1>
            <p className="font-body-sm text-xs sm:text-sm text-[#737686]">
              Tire dúvidas sobre os exames oficiais, cálculo TRI e funcionamento da plataforma.
            </p>
          </div>
        </div>
      </div>

      {/* FAQ Accordion */}
      <div className="bg-white rounded-3xl p-6 lg:p-8 border border-[#eaedff] shadow-xs flex flex-col gap-3">
        <h2 className="font-headline-md text-lg font-bold text-[#131b2e] mb-2">
          Perguntas Frequentes dos Estudantes
        </h2>

        {faqs.map((faq, idx) => {
          const isOpen = openFaq === idx;
          return (
            <div
              key={idx}
              className="border border-[#eaedff] rounded-2xl overflow-hidden transition-colors"
            >
              <button
                onClick={() => setOpenFaq(isOpen ? null : idx)}
                className="w-full p-4 text-left flex items-center justify-between gap-3 bg-[#faf8ff] hover:bg-[#eaedff] transition-colors"
              >
                <span className="font-bold text-xs sm:text-sm text-[#131b2e]">
                  {faq.q}
                </span>
                {isOpen ? (
                  <ChevronUp className="w-4 h-4 text-[#004ac6] shrink-0" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-[#737686] shrink-0" />
                )}
              </button>

              {isOpen && (
                <div className="p-4 bg-white text-xs sm:text-sm text-[#434655] leading-relaxed border-t border-[#eaedff]">
                  {faq.a}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Quick Contact Form */}
      <div className="bg-white rounded-3xl p-6 lg:p-8 border border-[#eaedff] shadow-xs flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-[#004ac6]" />
          <h2 className="font-headline-md text-base sm:text-lg font-bold text-[#131b2e]">
            Fale com a Equipe Pedagógica
          </h2>
        </div>
        <p className="text-xs text-[#737686]">
          Encontrou alguma divergência em questão de simulado ou gostaria de sugerir uma nova prova? Envie sua mensagem!
        </p>

        {sentSuccess && (
          <div className="p-3 rounded-xl bg-[#85f8c4] text-[#002114] text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#006c4a]" />
            <span>Mensagem enviada com sucesso! Agradecemos sua contribuição pedagógica.</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#131b2e] mb-1">Seu Nome:</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Lucas"
                className="w-full px-3 py-2 bg-[#f2f3ff] rounded-xl text-xs text-[#131b2e] border border-transparent focus:border-[#004ac6] focus:bg-white focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#131b2e] mb-1">E-mail para resposta (opcional):</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="estudante@exemplo.com"
                className="w-full px-3 py-2 bg-[#f2f3ff] rounded-xl text-xs text-[#131b2e] border border-transparent focus:border-[#004ac6] focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#131b2e] mb-1">Mensagem ou Dúvida:</label>
            <textarea
              required
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Descreva sua dúvida, sugestão de questão ou comentário..."
              className="w-full p-3 bg-[#f2f3ff] rounded-xl text-xs text-[#131b2e] border border-transparent focus:border-[#004ac6] focus:bg-white focus:outline-none"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="px-6 py-2.5 bg-[#004ac6] hover:bg-[#003ea8] text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-2 transition-transform active:scale-95"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Enviar Mensagem</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
