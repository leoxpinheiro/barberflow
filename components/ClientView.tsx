
import React, { useState } from 'react';
import { Calendar, Clock, CheckCircle2, MapPin, User, ChevronRight, Star, MessageCircle, ArrowRight, Lock, CreditCard, Banknote, QrCode, Copy, Check } from 'lucide-react';
import { MOCK_TIME_SLOTS } from '../constants';
import { Service, Professional, EstablishmentConfig, Appointment } from '../types';
import { format, parseISO, isSameDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ClientViewProps {
  preSelectedServiceId?: string;
  config: EstablishmentConfig;
  services: Service[];
  professionals: Professional[];
  appointments: Appointment[];
  onBookingComplete: (appt: Omit<Appointment, 'id' | 'status'>) => void;
}

export const ClientView: React.FC<ClientViewProps> = ({ 
  preSelectedServiceId, 
  config, 
  services, 
  professionals,
  appointments,
  onBookingComplete
}) => {
  const [step, setStep] = useState<number>(1);
  const [selectedService, setSelectedService] = useState<Service | null>(
    preSelectedServiceId ? services.find(s => s.id === preSelectedServiceId) || null : null
  );
  const [selectedPro, setSelectedPro] = useState<Professional | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'pix' | 'cash' | 'card' | null>(null);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  // Auto advance if pre-selected
  React.useEffect(() => {
    if (preSelectedServiceId && selectedService && step === 1) {
      setStep(2);
    }
  }, [preSelectedServiceId, selectedService, step]);

  const handleBooking = () => {
    if (!selectedService || !selectedPro || !selectedTime || !paymentMethod) return;
    
    // 1. Save to System (So Admin sees it in revenue)
    const dateStr = selectedDate.toISOString();
    onBookingComplete({
        serviceId: selectedService.id,
        professionalId: selectedPro.id,
        date: dateStr,
        time: selectedTime,
        customerName: 'Cliente Novo', // In a real app, we'd ask for name
        customerPhone: '11999999999',
        paymentMethod: paymentMethod,
        price: selectedService.price
    });

    // 2. Show Success Screen
    setIsConfirmed(true);
    setStep(5);
  };

  const getWhatsAppMessage = () => {
    if (!selectedService || !selectedPro || !selectedTime) return "";
    
    const dateStr = format(selectedDate, "dd/MM/yyyy", { locale: ptBR });
    
    const paymentLabel = paymentMethod === 'pix' ? 'Pix' : paymentMethod === 'card' ? 'Cartão' : 'Dinheiro';

    return `Olá! 👋 Gostaria de confirmar meu agendamento no *${config.name}*:

✂️ *Serviço:* ${selectedService.name}
💈 *Profissional:* ${selectedPro.name}
📅 *Data:* ${dateStr}
⏰ *Horário:* ${selectedTime}
💰 *Pagamento:* ${paymentLabel} (R$ ${selectedService.price})

Aguardo a confirmação!`;
  };

  const handleCopyText = () => {
      const text = getWhatsAppMessage();
      navigator.clipboard.writeText(text);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
  };

  const getWhatsAppLink = () => {
    const phone = config.phone.replace(/\D/g, ''); 
    const message = getWhatsAppMessage();
    return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
  };

  const renderProgress = () => (
    <div className="flex justify-between mb-8 px-4">
      {[1, 2, 3, 4].map((s) => (
        <div key={s} className="flex flex-col items-center relative z-10">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-500 ${
            step >= s ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/30' : 'bg-slate-200 text-slate-400'
          }`}>
            {step > s ? <CheckCircle2 size={16} /> : s}
          </div>
          <span className="text-xs mt-2 text-slate-500 font-medium">
            {s === 1 ? 'Serviço' : s === 2 ? 'Barbeiro' : s === 3 ? 'Data' : 'Pagto'}
          </span>
        </div>
      ))}
      <div className="absolute top-4 left-0 w-full h-0.5 bg-slate-200 -z-0 px-8">
        <div 
          className="h-full bg-primary-600 transition-all duration-500" 
          style={{ width: `${((step - 1) / 3) * 100}%` }}
        ></div>
      </div>
    </div>
  );

  if (isConfirmed) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center animate-fade-in bg-slate-50">
        <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mb-6 animate-bounce shadow-lg shadow-emerald-500/20">
          <MessageCircle size={48} className="text-emerald-600" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Falta pouco!</h2>
        <p className="text-slate-600 mb-8 max-w-md leading-relaxed">
          Sua pré-reserva está pronta. Para finalizar, envie os detalhes para nosso WhatsApp e aguarde a confirmação do estabelecimento.
        </p>
        
        <div className="bg-white p-6 rounded-2xl shadow-xl border border-slate-100 w-full max-w-sm mb-8 text-left relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500"></div>
            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                <CheckCircle2 size={18} className="text-emerald-500" />
                Resumo do Pedido
            </h3>
            <div className="space-y-3 text-sm">
                <div className="flex justify-between border-b border-slate-50 pb-2">
                    <span className="text-slate-500">Serviço</span>
                    <span className="font-semibold text-slate-800">{selectedService?.name}</span>
                </div>
                <div className="flex justify-between border-b border-slate-50 pb-2">
                    <span className="text-slate-500">Profissional</span>
                    <span className="font-semibold text-slate-800">{selectedPro?.name}</span>
                </div>
                <div className="flex justify-between border-b border-slate-50 pb-2">
                    <span className="text-slate-500">Pagamento</span>
                    <span className="font-semibold text-slate-800 capitalize">
                        {paymentMethod === 'pix' ? 'Pix' : paymentMethod === 'card' ? 'Cartão' : 'Dinheiro'}
                    </span>
                </div>
                <div className="flex justify-between">
                    <span className="text-slate-500">Data e Hora</span>
                    <span className="font-semibold text-slate-800 text-right">
                        {selectedDate && format(selectedDate, "dd 'de' MMMM", { locale: ptBR })}<br/>
                        às {selectedTime}
                    </span>
                </div>
                <div className="flex justify-between pt-2 border-t border-slate-100 mt-2">
                    <span className="font-bold text-slate-800">Total</span>
                    <span className="font-bold text-emerald-600 text-lg">R$ {selectedService?.price}</span>
                </div>
            </div>
        </div>

        <div className="w-full max-w-xs space-y-3">
            <a 
            href={getWhatsAppLink()}
            target="_blank"
            rel="noreferrer"
            className="bg-[#25D366] text-white px-6 py-4 rounded-xl font-bold text-lg hover:bg-[#20bd5a] transition w-full flex items-center justify-center gap-3 shadow-lg shadow-green-500/30 hover:-translate-y-1"
            >
            <MessageCircle size={24} fill="white" />
            Finalizar no WhatsApp
            </a>

            <button 
                onClick={handleCopyText}
                className="w-full bg-white text-slate-600 border border-slate-200 px-6 py-3 rounded-xl font-medium hover:bg-slate-50 transition flex items-center justify-center gap-2"
            >
                {isCopied ? <Check size={18} className="text-emerald-500" /> : <Copy size={18} />}
                {isCopied ? 'Copiado!' : 'Copiar Mensagem'}
            </button>
        </div>

        <button 
          onClick={() => window.location.reload()}
          className="text-slate-400 text-sm font-medium hover:text-slate-600 transition py-4"
        >
          Voltar ao início
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto pb-24">
        {/* Hero Section */}
        <div className="relative h-64 rounded-b-[3rem] overflow-hidden shadow-xl mb-8 mx-[-1rem] sm:mx-0 sm:rounded-[3rem]">
            <img 
                src={config.coverImage} 
                alt="Barbershop" 
                className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex flex-col justify-end p-8">
                <div className="flex items-center gap-2 text-primary-500 mb-1">
                    <Star size={16} fill="currentColor" />
                    <span className="text-sm font-bold uppercase tracking-wider">Premium</span>
                </div>
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">{config.name}</h1>
                <div className="flex items-center text-white/80 text-sm gap-4">
                    <span className="flex items-center gap-1"><MapPin size={14} /> {config.address}</span>
                    <span className="flex items-center gap-1"><Clock size={14} /> Aberto agora</span>
                </div>
            </div>
        </div>

      <div className="relative px-4">
        {renderProgress()}

        {/* STEP 1: SERVICE */}
        {step === 1 && (
          <div className="space-y-6 animate-fade-in">
            <h2 className="text-xl font-bold text-slate-800">Escolha um Serviço</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {services.map((service) => (
                <div
                  key={service.id}
                  onClick={() => {
                    setSelectedService(service);
                    setStep(2);
                  }}
                  className="group bg-white p-4 rounded-2xl shadow-sm border border-slate-100 hover:shadow-lg hover:border-primary-500/30 transition cursor-pointer flex gap-4 items-center"
                >
                  <img src={service.image} alt={service.name} className="w-20 h-20 rounded-xl object-cover group-hover:scale-105 transition duration-500" />
                  <div className="flex-1">
                    <h3 className="font-bold text-slate-800 group-hover:text-primary-600 transition">{service.name}</h3>
                    <p className="text-xs text-slate-500 line-clamp-2 my-1">{service.description}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-sm font-semibold text-primary-600">R$ {service.price}</span>
                      <span className="text-xs bg-slate-100 px-2 py-1 rounded-full text-slate-500">{service.durationMin} min</span>
                    </div>
                  </div>
                  <ChevronRight className="text-slate-300 group-hover:text-primary-500" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STEP 2: PROFESSIONAL */}
        {step === 2 && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-800">Escolha o Profissional</h2>
                <button onClick={() => setStep(1)} className="text-sm text-slate-500 hover:text-primary-600">Voltar</button>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              {professionals.filter(p => p.isAvailable).map((pro) => (
                <div
                  key={pro.id}
                  onClick={() => {
                    setSelectedPro(pro);
                    setStep(3);
                  }}
                  className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md hover:-translate-y-1 transition cursor-pointer text-center"
                >
                  <div className="relative inline-block">
                    <img src={pro.avatar} alt={pro.name} className="w-24 h-24 rounded-full object-cover mx-auto mb-4 border-4 border-slate-50" />
                    <div className="absolute bottom-0 right-0 bg-white px-1.5 py-0.5 rounded-full shadow-sm flex items-center gap-0.5 border border-slate-100">
                        <Star size={10} className="text-yellow-400" fill="currentColor"/>
                        <span className="text-[10px] font-bold">{pro.rating}</span>
                    </div>
                  </div>
                  <h3 className="font-bold text-slate-800">{pro.name}</h3>
                  <p className="text-xs text-primary-600 uppercase font-semibold tracking-wide mb-4">{pro.role}</p>
                  <button className="w-full py-2 bg-slate-50 text-slate-600 text-sm font-medium rounded-xl hover:bg-primary-50 hover:text-primary-700 transition">
                    Selecionar
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STEP 3: DATE & TIME */}
        {step === 3 && (
          <div className="space-y-6 animate-fade-in">
             <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-800">Data e Hora</h2>
                <button onClick={() => setStep(2)} className="text-sm text-slate-500 hover:text-primary-600">Voltar</button>
            </div>
            
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-semibold text-slate-700">Agenda Disponível</h3>
                    <div className="flex gap-2">
                        <button className="p-1 hover:bg-slate-100 rounded"><ChevronRight className="rotate-180" size={18} /></button>
                        <button className="p-1 hover:bg-slate-100 rounded"><ChevronRight size={18} /></button>
                    </div>
                </div>
                <div className="flex justify-between gap-2 overflow-x-auto pb-2 scrollbar-hide">
                    {Array.from({ length: 7 }).map((_, i) => {
                        const d = new Date();
                        d.setDate(d.getDate() + i);
                        const isSelected = d.getDate() === selectedDate.getDate();
                        return (
                            <button
                                key={i}
                                onClick={() => setSelectedDate(d)}
                                className={`flex flex-col items-center min-w-[3.5rem] p-3 rounded-xl transition ${
                                    isSelected 
                                    ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/20' 
                                    : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
                                }`}
                            >
                                <span className="text-xs font-medium uppercase">{format(d, 'EEE', { locale: ptBR })}</span>
                                <span className="text-lg font-bold">{d.getDate()}</span>
                            </button>
                        )
                    })}
                </div>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
              {MOCK_TIME_SLOTS.map((slot) => {
                const isBlockedOrTaken = appointments.some(a => 
                    a.time === slot.time && 
                    a.professionalId === selectedPro?.id && 
                    isSameDay(parseISO(a.date), selectedDate) &&
                    a.status !== 'cancelled'
                );
                const isAvailable = slot.available && !isBlockedOrTaken;

                return (
                    <button
                    key={slot.time}
                    disabled={!isAvailable}
                    onClick={() => setSelectedTime(slot.time)}
                    className={`py-3 rounded-xl text-sm font-medium transition border ${
                        !isAvailable 
                            ? 'bg-slate-100 text-slate-300 border-transparent cursor-not-allowed flex justify-center items-center gap-1' 
                            : selectedTime === slot.time
                                ? 'bg-primary-600 text-white border-primary-600 shadow-lg shadow-primary-500/30'
                                : 'bg-white text-slate-600 border-slate-200 hover:border-primary-500 hover:text-primary-600'
                    }`}
                    >
                    {isBlockedOrTaken && !slot.available ? <Lock size={12} /> : null}
                    {slot.time}
                    </button>
                );
              })}
            </div>
            
            <div className="flex justify-end mt-4">
               <button
                    disabled={!selectedTime}
                    onClick={() => setStep(4)}
                    className="w-full sm:w-auto bg-slate-900 text-white py-3 px-8 rounded-xl font-bold text-lg hover:bg-slate-800 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    Continuar <ArrowRight size={20} />
                </button>
            </div>
          </div>
        )}

        {/* STEP 4: PAYMENT */}
        {step === 4 && (
          <div className="space-y-6 animate-fade-in">
             <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-800">Forma de Pagamento</h2>
                <button onClick={() => setStep(3)} className="text-sm text-slate-500 hover:text-primary-600">Voltar</button>
            </div>

            <div className="space-y-3">
                <p className="text-sm text-slate-500">Como você prefere pagar ao finalizar o serviço?</p>
                
                <button 
                    onClick={() => setPaymentMethod('pix')}
                    className={`w-full p-4 rounded-2xl border flex items-center gap-4 transition hover:shadow-md ${paymentMethod === 'pix' ? 'border-emerald-500 bg-emerald-50 text-emerald-900' : 'border-slate-200 bg-white text-slate-600'}`}
                >
                    <div className={`p-3 rounded-full ${paymentMethod === 'pix' ? 'bg-emerald-200' : 'bg-slate-100'}`}>
                        <QrCode size={24} className={paymentMethod === 'pix' ? 'text-emerald-700' : 'text-slate-400'} />
                    </div>
                    <div className="text-left">
                        <span className="font-bold block">Pix (Instantâneo)</span>
                        <span className="text-xs opacity-80">Pagamento rápido e seguro</span>
                    </div>
                    {paymentMethod === 'pix' && <CheckCircle2 className="ml-auto text-emerald-600" />}
                </button>

                <button 
                    onClick={() => setPaymentMethod('card')}
                    className={`w-full p-4 rounded-2xl border flex items-center gap-4 transition hover:shadow-md ${paymentMethod === 'card' ? 'border-blue-500 bg-blue-50 text-blue-900' : 'border-slate-200 bg-white text-slate-600'}`}
                >
                    <div className={`p-3 rounded-full ${paymentMethod === 'card' ? 'bg-blue-200' : 'bg-slate-100'}`}>
                        <CreditCard size={24} className={paymentMethod === 'card' ? 'text-blue-700' : 'text-slate-400'} />
                    </div>
                    <div className="text-left">
                        <span className="font-bold block">Cartão de Crédito/Débito</span>
                        <span className="text-xs opacity-80">Pague na maquininha</span>
                    </div>
                    {paymentMethod === 'card' && <CheckCircle2 className="ml-auto text-blue-600" />}
                </button>

                <button 
                    onClick={() => setPaymentMethod('cash')}
                    className={`w-full p-4 rounded-2xl border flex items-center gap-4 transition hover:shadow-md ${paymentMethod === 'cash' ? 'border-amber-500 bg-amber-50 text-amber-900' : 'border-slate-200 bg-white text-slate-600'}`}
                >
                    <div className={`p-3 rounded-full ${paymentMethod === 'cash' ? 'bg-amber-200' : 'bg-slate-100'}`}>
                        <Banknote size={24} className={paymentMethod === 'cash' ? 'text-amber-700' : 'text-slate-400'} />
                    </div>
                    <div className="text-left">
                        <span className="font-bold block">Dinheiro</span>
                        <span className="text-xs opacity-80">Pagamento direto no balcão</span>
                    </div>
                    {paymentMethod === 'cash' && <CheckCircle2 className="ml-auto text-amber-600" />}
                </button>
            </div>

            <div className="fixed bottom-0 left-0 w-full p-4 bg-white/80 backdrop-blur-md border-t border-slate-200 z-20">
                <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
                    <div className="hidden sm:block">
                        <p className="text-xs text-slate-500">Total a Pagar</p>
                        <p className="font-bold text-xl text-emerald-600">R$ {selectedService?.price}</p>
                    </div>
                    <button
                        disabled={!paymentMethod}
                        onClick={handleBooking}
                        className="flex-1 sm:flex-none sm:w-64 bg-emerald-600 text-white py-3 rounded-xl font-bold text-lg hover:bg-emerald-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
                    >
                        Finalizar Agendamento
                    </button>
                </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
};
