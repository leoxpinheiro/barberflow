
import React, { useState } from 'react';
import { ClientView } from './components/ClientView';
import { AdminView } from './components/AdminView';
import { SalesLanding } from './components/SalesLanding'; // Import the landing page
import { AIChatAssistant } from './components/AIChatAssistant';
import { LayoutDashboard, User, Lock, ChevronRight, X, Sparkles } from 'lucide-react';
import { MOCK_SERVICES, MOCK_PROFESSIONALS, DEFAULT_CONFIG, MOCK_APPOINTMENTS } from './constants';
import { EstablishmentConfig, Service, Professional, Appointment } from './types';

type ViewMode = 'client' | 'admin' | 'sales'; // Added 'sales' mode

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewMode>('sales'); // Default to sales for demo? Or client. Let's stick to client but add button
  const [preSelectedService, setPreSelectedService] = useState<string | undefined>(undefined);

  // Auth State
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState(false);
  
  // Current Logged In User
  const [currentUser, setCurrentUser] = useState<Professional | null>(null);

  // GLOBAL STATE
  const [config, setConfig] = useState<EstablishmentConfig>(DEFAULT_CONFIG);
  const [services, setServices] = useState<Service[]>(MOCK_SERVICES);
  const [professionals, setProfessionals] = useState<Professional[]>(MOCK_PROFESSIONALS);
  const [appointments, setAppointments] = useState<Appointment[]>(MOCK_APPOINTMENTS);

  const handleAIIntent = (serviceId: string) => {
    setPreSelectedService(serviceId);
    if (currentView !== 'client') {
      setCurrentView('client');
    }
  };

  // IMPORTANT: This function allows the ClientView to "save" data to the "Database" (state)
  // so the AdminView can calculate real revenue.
  const handleNewAppointment = (newAppt: Omit<Appointment, 'id' | 'status'>) => {
    const appointment: Appointment = {
      id: Date.now().toString(),
      status: 'confirmed', // Assuming instant confirmation for this MVP
      ...newAppt
    };
    setAppointments(prev => [...prev, appointment]);
  };

  const handleAdminClick = () => {
    if (currentView === 'admin') return;
    setIsAdminLoginOpen(true);
    setLoginError(false);
    setPasswordInput('');
  };

  const handleLoginSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    
    // Find professional with matching PIN
    const user = professionals.find(p => p.pin === passwordInput);

    if (user) {
      setCurrentUser(user);
      setCurrentView('admin');
      setIsAdminLoginOpen(false);
      setPasswordInput('');
    } else {
      setLoginError(true);
      setTimeout(() => setLoginError(false), 500);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentView('client');
  };

  // Render content based on view
  const renderContent = () => {
    switch (currentView) {
      case 'sales':
        return <SalesLanding onDemoClick={() => setCurrentView('client')} />;
      case 'client':
        return (
          <>
             <ClientView 
              preSelectedServiceId={preSelectedService}
              config={config}
              services={services}
              professionals={professionals}
              appointments={appointments}
              onBookingComplete={handleNewAppointment}
            />
            <AIChatAssistant onBookingIntent={handleAIIntent} />
          </>
        );
      case 'admin':
        return (
           <AdminView 
              currentUser={currentUser}
              config={config} 
              setConfig={setConfig}
              services={services}
              setServices={setServices}
              professionals={professionals}
              setProfessionals={setProfessionals}
              appointments={appointments}
              setAppointments={setAppointments}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-primary-200 selection:text-primary-900">
      
      {/* Toggle Button / Navigation Controls */}
      <div className="fixed top-4 right-4 z-[100] bg-white/90 backdrop-blur border border-slate-200 p-1 rounded-lg shadow-lg flex gap-1">
        <button 
          onClick={() => setCurrentView('sales')}
          className={`p-2 rounded-md transition flex items-center gap-2 text-xs font-bold ${currentView === 'sales' ? 'bg-emerald-600 text-white' : 'text-slate-500 hover:bg-slate-100'}`}
        >
          <Sparkles size={14} />
          VENDER
        </button>
        <div className="w-[1px] bg-slate-200 mx-1"></div>
        <button 
          onClick={() => setCurrentView('client')}
          className={`p-2 rounded-md transition flex items-center gap-2 text-xs font-bold ${currentView === 'client' ? 'bg-slate-900 text-white' : 'text-slate-500 hover:bg-slate-100'}`}
        >
          <User size={14} />
          CLIENTE
        </button>
        <button 
          onClick={handleAdminClick}
          className={`p-2 rounded-md transition flex items-center gap-2 text-xs font-bold ${currentView === 'admin' ? 'bg-slate-900 text-white' : 'text-slate-500 hover:bg-slate-100'}`}
        >
          {currentView === 'admin' ? <LayoutDashboard size={14} /> : <Lock size={14} />}
          ADMIN
        </button>
      </div>

      {/* Admin Login Modal */}
      {isAdminLoginOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white w-full max-w-xs p-8 rounded-3xl shadow-2xl relative overflow-hidden">
             <button 
                onClick={() => setIsAdminLoginOpen(false)}
                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition"
             >
               <X size={20} />
             </button>

             <div className="flex flex-col items-center mb-6">
               <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4 text-slate-700">
                 <Lock size={32} />
               </div>
               <h3 className="text-xl font-bold text-slate-800">Quem está aí?</h3>
               <p className="text-sm text-slate-500">Digite seu PIN pessoal</p>
             </div>

             <form onSubmit={handleLoginSubmit} className="space-y-4">
               <input 
                  type="password" 
                  maxLength={4}
                  placeholder="••••"
                  autoFocus
                  className={`w-full text-center text-3xl tracking-[1em] font-bold py-4 border-b-2 bg-transparent outline-none transition placeholder:tracking-widest ${loginError ? 'border-red-500 text-red-500 animate-[pulse_0.5s_ease-in-out]' : 'border-slate-200 focus:border-slate-900 text-slate-800'}`}
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
               />
               
               <button 
                  type="submit"
                  className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold hover:bg-slate-800 transition flex items-center justify-center gap-2 mt-4"
               >
                 Entrar <ChevronRight size={18} />
               </button>
               
               <div className="text-center mt-4">
                    <p className="text-xs text-slate-400">Dono: 1234 | Barbeiro: 0000</p>
               </div>
             </form>
          </div>
        </div>
      )}

      {renderContent()}

    </div>
  );
};

export default App;
