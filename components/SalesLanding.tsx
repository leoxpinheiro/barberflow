
import React, { useState } from 'react';
import { CheckCircle2, X, ArrowRight, Star, Scissors, Shield, Instagram, Sparkles, MessageCircle, Smartphone, History, Lock, TrendingUp, Users, UserPlus } from 'lucide-react';

interface SalesLandingProps {
  onDemoClick: () => void;
}

export const SalesLanding: React.FC<SalesLandingProps> = ({ onDemoClick }) => {
  // SEU NÚMERO DE VENDEDOR AQUI
  const SELLER_PHONE = "5511999999999"; 
  
  // Estado para controlar qual card está sendo "focado" pelo mouse
  const [hoveredPlan, setHoveredPlan] = useState<'SOLO' | 'PRO' | null>(null);

  const handleBuyClick = (plan: string, price: string) => {
    const message = `Olá! Tenho interesse no sistema BarberFlow. Quero saber mais sobre o *Plano ${plan}* de R$ ${price}.`;
    window.open(`https://wa.me/${SELLER_PHONE}?text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900">
      {/* Navbar */}
      <nav className="flex justify-between items-center p-6 max-w-6xl mx-auto">
        <div className="flex items-center gap-2 font-bold text-2xl text-slate-900">
          <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-emerald-500/30">
            <Scissors size={24} fill="white" className="transform -rotate-45" />
          </div>
          BarberFlow
        </div>
        <button 
          onClick={onDemoClick}
          className="text-sm font-bold text-slate-500 hover:text-emerald-600 transition"
        >
          Acessar Sistema
        </button>
      </nav>

      {/* Hero Section */}
      <header className="max-w-4xl mx-auto text-center pt-16 pb-24 px-6">
        <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 px-4 py-1.5 rounded-full text-sm font-bold mb-6 animate-fade-in border border-emerald-100">
          <Star size={14} fill="currentColor" /> O sistema nº 1 para Barbearias Modernas
        </div>
        <h1 className="text-5xl md:text-7xl font-bold text-slate-900 mb-6 leading-tight tracking-tight">
          Domine sua Barbearia.<br/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500">Controle Total.</span>
        </h1>
        <p className="text-xl text-slate-500 mb-10 max-w-2xl mx-auto leading-relaxed">
          O <strong>BarberFlow</strong> elimina os furos na agenda e coloca dinheiro no seu bolso.
          Agendamento online, lembretes de WhatsApp e financeiro automático.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button 
            onClick={() => handleBuyClick('PRO', '69,90')}
            className="bg-slate-900 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-slate-800 transition shadow-xl shadow-slate-900/20 flex items-center justify-center gap-2 group"
          >
            Quero Profissionalizar <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform"/>
          </button>
          <button 
             onClick={onDemoClick}
             className="bg-white text-slate-700 border border-slate-200 px-8 py-4 rounded-xl font-bold text-lg hover:bg-slate-50 transition flex items-center justify-center gap-2"
          >
            Testar o BarberFlow
          </button>
        </div>
      </header>

      {/* Pricing Section */}
      <section className="bg-slate-50 py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Investimento Inteligente</h2>
            <p className="text-slate-500">Escolha a ferramenta certa para o tamanho do seu negócio.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto items-center">
            
            {/* PLANO SOLO */}
            <div 
                onMouseEnter={() => setHoveredPlan('SOLO')}
                onMouseLeave={() => setHoveredPlan(null)}
                className={`
                    bg-white p-8 rounded-3xl border transition-all duration-300 relative group cursor-default
                    ${hoveredPlan === 'SOLO' 
                        ? 'scale-105 shadow-2xl border-emerald-500 z-10 ring-4 ring-emerald-500/10' 
                        : hoveredPlan === 'PRO' 
                            ? 'scale-95 opacity-70 border-slate-200 grayscale-[0.5]' 
                            : 'scale-100 shadow-sm border-slate-200'
                    }
                `}
            >
              <h3 className="text-xl font-bold text-slate-800 mb-2">BarberFlow Solo</h3>
              <p className="text-slate-500 text-sm mb-6">Abandone o caderno e reduza os furos.</p>
              <div className="flex items-baseline gap-1 mb-8">
                <span className="text-4xl font-bold text-slate-900">R$ 29,90</span>
                <span className="text-slate-400">/mês</span>
              </div>

              <ul className="space-y-4 mb-8">
                <li className="flex items-center gap-3 text-slate-700">
                  <CheckCircle2 size={18} className="text-emerald-500 flex-shrink-0" />
                  Agenda Online 24h (Link na Bio)
                </li>
                <li className="flex items-center gap-3 text-slate-700 font-medium">
                  <MessageCircle size={18} className="text-emerald-500 flex-shrink-0" />
                  Botão de Confirmação WhatsApp
                </li>
                <li className="flex items-center gap-3 text-slate-700">
                  <History size={18} className="text-emerald-500 flex-shrink-0" />
                  Histórico de Cortes por Cliente
                </li>
                 <li className="flex items-center gap-3 text-slate-700">
                  <CheckCircle2 size={18} className="text-emerald-500 flex-shrink-0" />
                  Resumo Financeiro Diário
                </li>
                 <li className="flex items-center gap-3 text-slate-400">
                  <X size={18} />
                  Gestão de Equipe (Comissões)
                </li>
                <li className="flex items-center gap-3 text-slate-400">
                  <X size={18} />
                  IA Criadora de Marketing
                </li>
              </ul>

              <button 
                onClick={() => handleBuyClick('SOLO', '29,90')}
                className={`w-full py-3 border-2 font-bold rounded-xl transition ${
                    hoveredPlan === 'SOLO' 
                    ? 'bg-slate-900 text-white border-slate-900 hover:bg-slate-800' 
                    : 'border-slate-900 text-slate-900 hover:bg-slate-50'
                }`}
              >
                Assinar Plano Solo
              </button>
            </div>

            {/* PLANO PRO */}
            <div 
                onMouseEnter={() => setHoveredPlan('PRO')}
                onMouseLeave={() => setHoveredPlan(null)}
                className={`
                    bg-white p-8 rounded-3xl border-2 relative transition-all duration-300 cursor-default
                    ${hoveredPlan === 'PRO' 
                        ? 'scale-105 shadow-2xl border-emerald-500 z-10 md:-translate-y-6 ring-4 ring-emerald-500/10' 
                        : hoveredPlan === 'SOLO' 
                            ? 'scale-95 opacity-70 border-slate-200 md:translate-y-0 grayscale-[0.5]' 
                            : 'scale-100 shadow-xl border-emerald-500 md:-translate-y-4'
                    }
                `}
            >
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-emerald-500 text-white px-4 py-1 rounded-full text-sm font-bold uppercase tracking-wide shadow-lg shadow-emerald-500/30 whitespace-nowrap">
                Para Quem Quer Crescer
              </div>
              
              <h3 className="text-xl font-bold text-slate-800 mb-2">BarberFlow Pro</h3>
              <p className="text-slate-500 text-sm mb-6">Gestão de equipe, segurança e lucro real.</p>
              <div className="flex items-baseline gap-1 mb-8">
                <span className="text-4xl font-bold text-slate-900">R$ 69,90</span>
                <span className="text-slate-400">/mês</span>
              </div>

              <ul className="space-y-4 mb-8">
                <li className="flex items-center gap-3 text-slate-700 font-medium">
                  <CheckCircle2 size={18} className="text-emerald-500 flex-shrink-0" />
                  <strong>Tudo do Plano Solo</strong>
                </li>
                {/* NOVO ITEM DESTAQUE */}
                <li className="flex items-center gap-3 text-slate-700 font-bold">
                  <UserPlus size={18} className="text-emerald-500 flex-shrink-0" />
                  Cadastre toda sua Equipe (Ilimitado)
                </li>
                <li className="flex items-center gap-3 text-slate-700">
                  <Users size={18} className="text-emerald-500 flex-shrink-0" />
                  Comissões Automáticas (Adeus Planilha)
                </li>
                <li className="flex items-center gap-3 text-slate-700">
                  <Lock size={18} className="text-emerald-500 flex-shrink-0" />
                  Controle de Acesso (Dono x Barbeiro)
                </li>
                <li className="flex items-center gap-3 text-slate-700">
                  <TrendingUp size={18} className="text-emerald-500 flex-shrink-0" />
                  Relatórios de Lucro e Crescimento
                </li>
                <li className="flex items-center gap-3 text-slate-700">
                  <Sparkles size={18} className="text-purple-500 flex-shrink-0" />
                  <span className="flex items-center gap-1">IA de Marketing: Cria textos que vendem</span>
                </li>
              </ul>

              <button 
                onClick={() => handleBuyClick('PRO', '69,90')}
                className="w-full py-3 bg-emerald-500 text-white font-bold rounded-xl hover:bg-emerald-600 transition shadow-lg shadow-emerald-500/30"
              >
                Assinar Plano Pro
              </button>
            </div>

          </div>

          {/* SETUP FEE BANNER */}
          <div className="max-w-4xl mx-auto mt-12 bg-slate-900 rounded-2xl p-6 md:p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl relative overflow-hidden">
            <div className="absolute -right-10 -top-10 w-40 h-40 bg-emerald-500 rounded-full blur-3xl opacity-20"></div>
            
            <div className="relative z-10">
                <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
                    <Shield className="text-emerald-400" /> Consultoria de Implantação VIP
                </h3>
                <p className="text-slate-400 text-sm md:text-base max-w-lg leading-relaxed">
                    Nós configuramos todo o seu cardápio de serviços, cadastramos sua equipe e treinamos a Inteligência Artificial para vender por você. Entregamos o BarberFlow pronto para rodar.
                </p>
            </div>
            <div className="text-center md:text-right flex-shrink-0 relative z-10">
                <p className="text-sm text-slate-400 mb-1">Taxa única de setup</p>
                <p className="text-3xl font-bold text-white">R$ 197,00</p>
                <p className="text-xs text-emerald-400 mt-1 font-medium">Economize 10h de configuração</p>
            </div>
          </div>

        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white py-12 text-center border-t border-slate-100">
        <div className="flex justify-center gap-6 mb-6">
            <a href="#" className="p-3 bg-slate-50 rounded-full text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition">
                <Instagram size={20} />
            </a>
        </div>
        <p className="text-slate-400 text-sm font-medium">© 2024 BarberFlow Systems.</p>
        <p className="text-slate-300 text-xs mt-2">Feito para quem lidera.</p>
      </footer>
    </div>
  );
};
