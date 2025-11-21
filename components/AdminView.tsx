
import React, { useState, useEffect, useRef } from 'react';
import { 
    Users, DollarSign, Calendar as CalendarIcon, Settings, 
    Plus, Trash2, X, Check, Menu, Pencil, Lock, 
    ChevronLeft, ChevronRight, Megaphone, Sparkles, Upload, Eye, EyeOff, Shield,
    TrendingUp, ArrowUpRight, ArrowDownRight, GripVertical, Sun, Moon, Coffee,
    QrCode, CreditCard, Banknote, Scissors, Percent, Wallet
} from 'lucide-react';
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
    AreaChart, Area, PieChart, Pie, Cell 
} from 'recharts';
import { EstablishmentConfig, Service, Professional, Appointment } from '../types';
import { generateMarketingCopy } from '../services/geminiService';
import { format, addDays, isSameDay, subDays, parseISO, startOfMonth, endOfMonth, eachMonthOfInterval, isWithinInterval } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface AdminViewProps {
    currentUser: Professional | null;
    config: EstablishmentConfig;
    setConfig: (c: EstablishmentConfig) => void;
    services: Service[];
    setServices: React.Dispatch<React.SetStateAction<Service[]>>;
    professionals: Professional[];
    setProfessionals: React.Dispatch<React.SetStateAction<Professional[]>>;
    appointments: Appointment[];
    setAppointments: React.Dispatch<React.SetStateAction<Appointment[]>>;
}

type Tab = 'dashboard' | 'agenda' | 'services' | 'team' | 'marketing' | 'financial' | 'settings';

const SERVICE_DISTRIBUTION = [
    { name: 'Cabelo', value: 45, color: '#10b981' }, // Emerald 500
    { name: 'Barba', value: 30, color: '#3b82f6' },  // Blue 500
    { name: 'Combos', value: 15, color: '#8b5cf6' }, // Violet 500
    { name: 'Outros', value: 10, color: '#f59e0b' }, // Amber 500
];

export const AdminView: React.FC<AdminViewProps> = ({ 
    currentUser,
    config, 
    setConfig,
    services, 
    setServices,
    professionals, 
    setProfessionals,
    appointments,
    setAppointments
}) => {
    // Determine default tab based on permissions
    const initialTab = currentUser?.permissions.includes('all') ? 'dashboard' : 'agenda';
    const [activeTab, setActiveTab] = useState<Tab>(initialTab);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    
    // -- STATES FOR FORMS --
    const [isAddingService, setIsAddingService] = useState(false);
    const [editingService, setEditingService] = useState<Service | null>(null);
    const [newService, setNewService] = useState<Partial<Service>>({
        name: '', price: 0, durationMin: 30, description: '', image: ''
    });

    const [isAddingPro, setIsAddingPro] = useState(false);
    const [editingPro, setEditingPro] = useState<Professional | null>(null);
    const [newPro, setNewPro] = useState<Partial<Professional>>({
        name: '', role: 'Barbeiro', avatar: '', isAvailable: true, permissions: ['agenda'], pin: '', commissionRate: 50
    });

    // -- AGENDA STATES --
    const [selectedDate, setSelectedDate] = useState(new Date());
    const dateStripRef = useRef<HTMLDivElement>(null);
    const [draggedAppointmentId, setDraggedAppointmentId] = useState<string | null>(null);

    // -- MARKETING STATES --
    const [marketingIdea, setMarketingIdea] = useState('');
    const [generatedCopy, setGeneratedCopy] = useState('');
    const [isGeneratingCopy, setIsGeneratingCopy] = useState(false);

    // -- FINANCIAL STATES --
    const [financialPeriod, setFinancialPeriod] = useState<'day' | 'month'>('month');


    // -- GREETING LOGIC --
    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour >= 5 && hour < 12) return { text: 'Bom dia', icon: <Sun className="text-yellow-500" /> };
        if (hour >= 12 && hour < 18) return { text: 'Boa tarde', icon: <Coffee className="text-orange-500" /> };
        return { text: 'Boa noite', icon: <Moon className="text-indigo-500" /> };
    };
    const greeting = getGreeting();

    // -- PERMISSION CHECKER --
    const hasPermission = (perm: string) => {
        if (!currentUser) return false;
        if (currentUser.permissions.includes('all')) return true;
        return currentUser.permissions.includes(perm);
    };

    // -- REAL TIME DASHBOARD CALCULATIONS --
    // Calculate today's stats based on appointments
    const today = new Date();
    const todaysAppointments = appointments.filter(a => 
        isSameDay(parseISO(a.date), today) && 
        a.status !== 'cancelled' && 
        a.status !== 'blocked'
    );

    const totalRevenueToday = todaysAppointments.reduce((acc, curr) => acc + (curr.price || 0), 0);
    const pixRevenue = todaysAppointments.filter(a => a.paymentMethod === 'pix').reduce((acc, curr) => acc + (curr.price || 0), 0);
    const cashRevenue = todaysAppointments.filter(a => a.paymentMethod === 'cash').reduce((acc, curr) => acc + (curr.price || 0), 0);
    const cardRevenue = todaysAppointments.filter(a => a.paymentMethod === 'card').reduce((acc, curr) => acc + (curr.price || 0), 0);

    // Mock monthly data but injected with real today's value if month matches
    const revenueData = [
        { name: 'Jun', value: 4500 },
        { name: 'Jul', value: 5200 },
        { name: 'Ago', value: 4800 },
        { name: 'Set', value: 6100 },
        { name: 'Out', value: 5900 },
        { name: 'Nov', value: 7500 + totalRevenueToday }, // Adding today for simple visualization
    ];

    // -- MENU ITEMS --
    const menuItems = [
        { id: 'dashboard', label: 'Dashboard', icon: <DollarSign size={20} />, show: hasPermission('all') },
        { id: 'agenda', label: 'Agenda', icon: <CalendarIcon size={20} />, show: true }, // Everyone sees agenda
        { id: 'financial', label: 'Comissões', icon: <Wallet size={20} />, show: true }, // Everyone sees their own
        { id: 'services', label: 'Serviços', icon: <Check size={20} />, show: hasPermission('all') },
        { id: 'team', label: 'Equipe', icon: <Users size={20} />, show: hasPermission('all') },
        { id: 'marketing', label: 'Marketing', icon: <Megaphone size={20} />, show: hasPermission('all') },
        { id: 'settings', label: 'Configurações', icon: <Settings size={20} />, show: hasPermission('all') },
    ];

    // -- HANDLERS --

    // Services
    const handleSaveService = () => {
        if (!newService.name || !newService.price) return;
        
        if (editingService) {
            setServices(prev => prev.map(s => s.id === editingService.id ? { ...s, ...newService } as Service : s));
        } else {
            const service: Service = {
                id: Date.now().toString(),
                name: newService.name,
                description: newService.description || '',
                price: Number(newService.price),
                durationMin: Number(newService.durationMin),
                image: newService.image || 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?q=80&w=800&auto=format&fit=crop'
            };
            setServices([...services, service]);
        }
        setIsAddingService(false);
        setEditingService(null);
        setNewService({ name: '', price: 0, durationMin: 30, description: '', image: '' });
    };

    const handleEditService = (service: Service) => {
        setEditingService(service);
        setNewService(service);
        setIsAddingService(true);
    };

    const handleDeleteService = (id: string) => {
        if (window.confirm('Tem certeza que deseja excluir este serviço?')) {
            setServices(services.filter(s => s.id !== id));
        }
    };

    // Professionals
    const handleSavePro = () => {
        if (!newPro.name || !newPro.pin) {
            alert("Nome e PIN são obrigatórios");
            return;
        }

        if (editingPro) {
            setProfessionals(prev => prev.map(p => p.id === editingPro.id ? { ...p, ...newPro } as Professional : p));
        } else {
            const pro: Professional = {
                id: Date.now().toString(),
                name: newPro.name,
                role: newPro.role || 'Barbeiro',
                avatar: newPro.avatar || 'https://via.placeholder.com/150',
                rating: 5.0,
                isAvailable: true,
                permissions: newPro.permissions || ['agenda'],
                pin: newPro.pin || '0000',
                commissionRate: Number(newPro.commissionRate) || 50
            };
            setProfessionals([...professionals, pro]);
        }
        setIsAddingPro(false);
        setEditingPro(null);
        setNewPro({ name: '', role: 'Barbeiro', avatar: '', isAvailable: true, permissions: ['agenda'], pin: '', commissionRate: 50 });
    };

    const handleEditPro = (pro: Professional) => {
        setEditingPro(pro);
        setNewPro(pro);
        setIsAddingPro(true);
    };

    const toggleProAvailability = (id: string) => {
        setProfessionals(professionals.map(p => p.id === id ? { ...p, isAvailable: !p.isAvailable } : p));
    };

    // Marketing
    const handleGenerateCopy = async () => {
        if (!marketingIdea) return;
        setIsGeneratingCopy(true);
        const text = await generateMarketingCopy(marketingIdea, config.name);
        setGeneratedCopy(text);
        setIsGeneratingCopy(false);
    };

    // Agenda Blocking & Drag n Drop
    const toggleBlockTime = (time: string, proId: string) => {
        const dateStr = selectedDate.toISOString();
        
        const existing = appointments.find(a => 
            a.time === time && 
            a.professionalId === proId && 
            isSameDay(parseISO(a.date), selectedDate)
        );

        if (existing) {
            if (existing.status === 'blocked') {
                setAppointments(prev => prev.filter(a => a.id !== existing.id));
            } else {
                if(window.confirm('Cancelar este agendamento?')) {
                    setAppointments(prev => prev.filter(a => a.id !== existing.id));
                }
            }
        } else {
            const block: Appointment = {
                id: `block_${Date.now()}`,
                serviceId: 'block',
                professionalId: proId,
                date: dateStr,
                time: time,
                customerName: 'Bloqueado',
                customerPhone: '',
                status: 'blocked'
            };
            setAppointments(prev => [...prev, block]);
        }
    };

    const onDragStart = (e: React.DragEvent, apptId: string) => {
        setDraggedAppointmentId(apptId);
        e.dataTransfer.effectAllowed = "move";
        e.dataTransfer.setData("text/plain", apptId);
    };

    const onDragOver = (e: React.DragEvent) => {
        e.preventDefault();
    };

    const onDrop = (e: React.DragEvent, targetTime: string, targetProId: string) => {
        e.preventDefault();
        if (!draggedAppointmentId) return;

        const dateStr = selectedDate.toISOString();

        const isOccupied = appointments.some(a => 
            a.time === targetTime && 
            a.professionalId === targetProId && 
            isSameDay(parseISO(a.date), selectedDate) && 
            a.id !== draggedAppointmentId
        );

        if (isOccupied) {
            alert("Horário já ocupado!");
            return;
        }

        setAppointments(prev => prev.map(appt => {
            if (appt.id === draggedAppointmentId) {
                return {
                    ...appt,
                    time: targetTime,
                    professionalId: targetProId,
                    date: dateStr 
                };
            }
            return appt;
        }));

        setDraggedAppointmentId(null);
    };

    // Config Image Upload
    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setConfig({ ...config, coverImage: reader.result as string });
            };
            reader.readAsDataURL(file);
        }
    };

    // SORT PROFESSIONALS
    const sortedProfessionals = [...professionals].sort((a, b) => {
        if (a.id === currentUser?.id) return -1;
        if (b.id === currentUser?.id) return 1;
        return 0;
    });

    const myAppointmentsCount = appointments.filter(a => 
        a.professionalId === currentUser?.id && 
        isSameDay(parseISO(a.date), new Date()) &&
        a.status !== 'cancelled' && a.status !== 'blocked'
    ).length;


    // -- FINANCIAL LOGIC --
    const getFinancialStats = () => {
        const startDate = financialPeriod === 'day' ? new Date() : startOfMonth(new Date());
        const endDate = financialPeriod === 'day' ? new Date() : endOfMonth(new Date());

        const relevantAppointments = appointments.filter(a => {
            const apptDate = parseISO(a.date);
            const isDateMatch = financialPeriod === 'day' 
                ? isSameDay(apptDate, startDate)
                : isWithinInterval(apptDate, { start: startDate, end: endDate });
            return isDateMatch && a.status !== 'cancelled' && a.status !== 'blocked';
        });

        return professionals.map(pro => {
            const proAppts = relevantAppointments.filter(a => a.professionalId === pro.id);
            const totalProduction = proAppts.reduce((acc, curr) => acc + (curr.price || 0), 0);
            const commission = (totalProduction * pro.commissionRate) / 100;
            const houseShare = totalProduction - commission;

            return {
                pro,
                servicesCount: proAppts.length,
                totalProduction,
                commission,
                houseShare
            };
        });
    };

    const financialStats = getFinancialStats();

    return (
        <div className="min-h-screen flex bg-slate-50">
            {/* Sidebar (Desktop) */}
            <aside className="hidden lg:flex w-64 bg-white border-r border-slate-200 flex-col fixed h-full z-10">
                <div className="p-6 border-b border-slate-100">
                    <div className="flex items-center gap-2 mb-1">
                        <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center text-white shadow-md">
                            <Scissors size={16} className="transform -rotate-45"/>
                        </div>
                        <div>
                            <h2 className="font-bold text-slate-800">BarberFlow</h2>
                            <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider">Premium</p>
                        </div>
                    </div>
                </div>
                
                <div className="p-4">
                    <div className="bg-slate-50 p-3 rounded-xl mb-6 flex items-center gap-3 border border-slate-100">
                        <img src={currentUser?.avatar} alt="User" className="w-10 h-10 rounded-full object-cover" />
                        <div className="overflow-hidden">
                            <p className="text-xs text-slate-500">Logado como</p>
                            <p className="font-bold text-sm text-slate-800 truncate">{currentUser?.name}</p>
                        </div>
                    </div>

                    <nav className="space-y-1">
                        {menuItems.filter(i => i.show).map(item => (
                            <button
                                key={item.id}
                                onClick={() => setActiveTab(item.id as Tab)}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition text-sm font-medium ${
                                    activeTab === item.id 
                                    ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/20' 
                                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                                }`}
                            >
                                {item.icon}
                                {item.label}
                            </button>
                        ))}
                    </nav>
                </div>
            </aside>

            {/* Mobile Header & Menu */}
            <div className="lg:hidden fixed top-0 left-0 w-full bg-white border-b border-slate-200 z-40 p-4 flex justify-between items-center">
                <div className="font-bold text-slate-800 flex items-center gap-2">
                   <Scissors size={18} className="text-emerald-600" /> BarberFlow
                </div>
                <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 bg-slate-100 rounded-lg">
                    {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
                </button>
            </div>

            {/* Mobile Drawer */}
            {isMobileMenuOpen && (
                <div className="fixed inset-0 bg-slate-900/50 z-30 lg:hidden" onClick={() => setIsMobileMenuOpen(false)}>
                    <div className="absolute right-0 top-0 h-full w-64 bg-white p-4 shadow-2xl" onClick={e => e.stopPropagation()}>
                        <div className="mt-16 space-y-2">
                            {menuItems.filter(i => i.show).map(item => (
                                <button
                                    key={item.id}
                                    onClick={() => {
                                        setActiveTab(item.id as Tab);
                                        setIsMobileMenuOpen(false);
                                    }}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition text-sm font-medium ${
                                        activeTab === item.id 
                                        ? 'bg-slate-900 text-white' 
                                        : 'text-slate-500 hover:bg-slate-50'
                                    }`}
                                >
                                    {item.icon}
                                    {item.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Main Content */}
            <main className="flex-1 lg:ml-64 p-4 lg:p-8 mt-16 lg:mt-0 overflow-x-hidden max-w-full">
                
                {/* WELCOME / RECEPTION HEADER */}
                <header className="mb-8">
                     <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="relative">
                                <img src={currentUser?.avatar} alt="Profile" className="w-16 h-16 rounded-2xl object-cover shadow-md" />
                                <div className="absolute -bottom-1 -right-1 bg-emerald-500 w-4 h-4 rounded-full border-2 border-white"></div>
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                                    {greeting.text}, {currentUser?.name.split(' ')[0]}! {greeting.icon}
                                </h1>
                                <p className="text-slate-500 text-sm mt-1">
                                    Vamos fazer um excelente trabalho hoje.
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <div className="px-4 py-2 bg-emerald-50 rounded-xl border border-emerald-100">
                                <p className="text-xs text-emerald-600 font-bold uppercase">Hoje</p>
                                <p className="text-lg font-bold text-emerald-700">{myAppointmentsCount} Clientes</p>
                            </div>
                            {currentUser?.permissions.includes('all') && (
                                <div className="px-4 py-2 bg-blue-50 rounded-xl border border-blue-100 hidden sm:block">
                                    <p className="text-xs text-blue-600 font-bold uppercase">Equipe</p>
                                    <p className="text-lg font-bold text-blue-700">{professionals.filter(p=>p.isAvailable).length} Online</p>
                                </div>
                            )}
                        </div>
                     </div>
                </header>

                {/* DASHBOARD TAB */}
                {activeTab === 'dashboard' && (
                    <div className="space-y-8 animate-fade-in">
                        {/* Stats Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition relative overflow-hidden">
                                <div className="flex justify-between items-start mb-4 relative z-10">
                                    <div className="p-2 bg-emerald-100 rounded-lg text-emerald-600"><DollarSign size={20} /></div>
                                    <span className="flex items-center text-emerald-600 text-xs font-bold bg-emerald-50 px-2 py-1 rounded-full gap-1">
                                        Hoje
                                    </span>
                                </div>
                                <div className="text-slate-500 text-xs font-bold uppercase tracking-wider relative z-10">Faturamento Total</div>
                                <div className="text-3xl font-bold text-slate-800 mt-1 relative z-10">R$ {totalRevenueToday.toFixed(2)}</div>
                                
                                {/* Background Decoration */}
                                <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-emerald-50 rounded-full z-0"></div>
                            </div>

                            {/* PAYMENT BREAKDOWN CARDS (COMPACT) */}
                            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-center gap-3">
                                <div className="flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-2 text-slate-600">
                                        <QrCode size={16} className="text-emerald-500" /> Pix
                                    </div>
                                    <span className="font-bold text-slate-800">R$ {pixRevenue}</span>
                                </div>
                                <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-emerald-500" style={{ width: `${totalRevenueToday ? (pixRevenue/totalRevenueToday)*100 : 0}%`}}></div>
                                </div>
                                
                                <div className="flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-2 text-slate-600">
                                        <Banknote size={16} className="text-amber-500" /> Dinheiro
                                    </div>
                                    <span className="font-bold text-slate-800">R$ {cashRevenue}</span>
                                </div>
                                <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-amber-500" style={{ width: `${totalRevenueToday ? (cashRevenue/totalRevenueToday)*100 : 0}%`}}></div>
                                </div>

                                <div className="flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-2 text-slate-600">
                                        <CreditCard size={16} className="text-blue-500" /> Cartão
                                    </div>
                                    <span className="font-bold text-slate-800">R$ {cardRevenue}</span>
                                </div>
                                <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-blue-500" style={{ width: `${totalRevenueToday ? (cardRevenue/totalRevenueToday)*100 : 0}%`}}></div>
                                </div>
                            </div>

                            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-2 bg-violet-100 rounded-lg text-violet-600"><CalendarIcon size={20} /></div>
                                </div>
                                <div className="text-slate-500 text-xs font-bold uppercase tracking-wider">Agendamentos Hoje</div>
                                <div className="text-3xl font-bold text-slate-800 mt-1">{todaysAppointments.length}</div>
                            </div>

                            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-2 bg-amber-100 rounded-lg text-amber-600"><TrendingUp size={20} /></div>
                                </div>
                                <div className="text-slate-500 text-xs font-bold uppercase tracking-wider">Ticket Médio</div>
                                <div className="text-3xl font-bold text-slate-800 mt-1">
                                    R$ {todaysAppointments.length ? (totalRevenueToday / todaysAppointments.length).toFixed(2) : '0.00'}
                                </div>
                            </div>
                        </div>

                        {/* Charts Section */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Revenue Chart */}
                            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm lg:col-span-2">
                                <h3 className="font-bold text-slate-800 mb-6">Faturamento Semestral</h3>
                                <div className="h-64 w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={revenueData}>
                                            <defs>
                                                <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8'}} />
                                            <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8'}} />
                                            <Tooltip 
                                                contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} 
                                            />
                                            <Area type="monotone" dataKey="value" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* Services Pie Chart */}
                            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                                <h3 className="font-bold text-slate-800 mb-6">Mix de Serviços</h3>
                                <div className="h-64 w-full relative">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={SERVICE_DISTRIBUTION}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={60}
                                                outerRadius={80}
                                                paddingAngle={5}
                                                dataKey="value"
                                            >
                                                {SERVICE_DISTRIBUTION.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                                ))}
                                            </Pie>
                                            <Tooltip />
                                        </PieChart>
                                    </ResponsiveContainer>
                                    {/* Center Text */}
                                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                        <div className="text-center">
                                            <span className="text-xs text-slate-400 block">Total</span>
                                            <span className="font-bold text-xl text-slate-800">1.4k</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex justify-center gap-4 mt-2">
                                    {SERVICE_DISTRIBUTION.map(item => (
                                        <div key={item.name} className="flex items-center gap-1">
                                            <div className="w-2 h-2 rounded-full" style={{backgroundColor: item.color}}></div>
                                            <span className="text-xs text-slate-500">{item.name}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* AGENDA TAB */}
                {activeTab === 'agenda' && (
                    <div className="space-y-6">
                        {/* Date Strip */}
                        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                            <div className="flex items-center justify-between mb-4">
                                <button onClick={() => setSelectedDate(subDays(selectedDate, 1))} className="p-2 hover:bg-slate-100 rounded-full">
                                    <ChevronLeft size={20} />
                                </button>
                                <span className="font-bold text-lg capitalize">{format(selectedDate, "MMMM yyyy", { locale: ptBR })}</span>
                                <button onClick={() => setSelectedDate(addDays(selectedDate, 1))} className="p-2 hover:bg-slate-100 rounded-full">
                                    <ChevronRight size={20} />
                                </button>
                            </div>
                            <div className="flex justify-between gap-2 overflow-x-auto pb-2 scrollbar-hide snap-x" ref={dateStripRef}>
                                {Array.from({ length: 7 }).map((_, i) => {
                                    const d = addDays(selectedDate, i - 3); // Center current date
                                    const isSelected = isSameDay(d, selectedDate);
                                    return (
                                        <button
                                            key={i}
                                            onClick={() => setSelectedDate(d)}
                                            className={`flex flex-col items-center min-w-[4rem] p-3 rounded-2xl transition snap-center ${
                                                isSelected 
                                                ? 'bg-slate-900 text-white transform scale-110 shadow-lg' 
                                                : 'bg-slate-50 text-slate-400 scale-95'
                                            }`}
                                        >
                                            <span className="text-[10px] font-bold uppercase tracking-wider">{format(d, 'EEE', { locale: ptBR })}</span>
                                            <span className="text-xl font-bold">{d.getDate()}</span>
                                        </button>
                                    )
                                })}
                            </div>
                        </div>

                        {/* Daily Schedule */}
                        <div className="space-y-8">
                            <p className="text-xs text-slate-400 flex items-center gap-1">
                                <Sparkles size={12} /> Dica: Arraste os agendamentos para mudar o horário ou profissional.
                            </p>
                            {/* SORTED PROFESSIONALS: Logged user comes first */}
                            {sortedProfessionals.filter(p => p.isAvailable).map(pro => (
                                <div key={pro.id} className={`bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm ${pro.id === currentUser?.id ? 'ring-2 ring-emerald-500 ring-offset-2' : ''}`}>
                                    <div className={`p-4 border-b border-slate-100 flex items-center gap-3 ${pro.id === currentUser?.id ? 'bg-emerald-50' : 'bg-slate-50'}`}>
                                        <img src={pro.avatar} className="w-10 h-10 rounded-full object-cover" alt={pro.name} />
                                        <div>
                                            <h3 className="font-bold text-slate-800">{pro.name} {pro.id === currentUser?.id && '(Você)'}</h3>
                                            {pro.id === currentUser?.id && <p className="text-[10px] text-emerald-600 font-bold uppercase">Sua Agenda</p>}
                                        </div>
                                    </div>
                                    <div className="divide-y divide-slate-50">
                                        {['09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'].map(time => {
                                            const appt = appointments.find(a => 
                                                a.time === time && 
                                                a.professionalId === pro.id && 
                                                isSameDay(parseISO(a.date), selectedDate)
                                            );
                                            
                                            const isBlocked = appt?.status === 'blocked';

                                            return (
                                                <div key={time} className="flex group">
                                                    <div className="w-20 p-4 text-sm font-medium text-slate-400 border-r border-slate-50 bg-slate-50/50 flex items-center justify-center">
                                                        {time}
                                                    </div>
                                                    <div 
                                                        className="flex-1 p-2 transition-colors hover:bg-slate-50"
                                                        onDragOver={onDragOver}
                                                        onDrop={(e) => onDrop(e, time, pro.id)}
                                                    >
                                                        {appt ? (
                                                            <div 
                                                                draggable={!isBlocked}
                                                                onDragStart={(e) => onDragStart(e, appt.id)}
                                                                className={`w-full h-full rounded-xl p-3 flex justify-between items-center shadow-sm cursor-move relative ${
                                                                    isBlocked 
                                                                    ? 'bg-red-50 text-red-600 border border-red-100 cursor-not-allowed' 
                                                                    : 'bg-emerald-50 text-emerald-700 border border-emerald-100 hover:shadow-md transition-all active:scale-95'
                                                                }`}
                                                            >
                                                                <div className="flex items-center gap-2">
                                                                    {!isBlocked && <GripVertical size={14} className="opacity-50" />}
                                                                    <div>
                                                                        <p className="font-bold text-sm">{appt.customerName}</p>
                                                                        {!isBlocked && <p className="text-xs opacity-80">{services.find(s => s.id === appt.serviceId)?.name}</p>}
                                                                        {/* Payment Icon Badge */}
                                                                        {appt.paymentMethod && (
                                                                            <div className="absolute top-2 right-8">
                                                                                {appt.paymentMethod === 'pix' && <QrCode size={12} className="text-emerald-600" />}
                                                                                {appt.paymentMethod === 'cash' && <Banknote size={12} className="text-amber-600" />}
                                                                                {appt.paymentMethod === 'card' && <CreditCard size={12} className="text-blue-600" />}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                                <button 
                                                                    onClick={() => toggleBlockTime(time, pro.id)}
                                                                    className="p-1 hover:bg-black/5 rounded"
                                                                >
                                                                    {isBlocked ? <X size={16} /> : <Settings size={16} />}
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            <button 
                                                                onClick={() => toggleBlockTime(time, pro.id)}
                                                                className="w-full h-full rounded-xl border-2 border-dashed border-slate-100 text-slate-300 hover:border-slate-300 hover:text-slate-400 flex items-center justify-center gap-2 text-sm font-medium transition opacity-0 group-hover:opacity-100"
                                                            >
                                                                <Lock size={14} /> Bloquear / Agendar
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* FINANCIAL / COMMISSIONS TAB (NEW) */}
                {activeTab === 'financial' && (
                    <div className="space-y-8 animate-fade-in">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <div>
                                <h2 className="text-2xl font-bold text-slate-800">Relatório Financeiro</h2>
                                <p className="text-slate-500 text-sm">Comissões e Fechamento de Caixa</p>
                            </div>
                            <div className="flex bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
                                <button 
                                    onClick={() => setFinancialPeriod('day')}
                                    className={`px-4 py-2 rounded-lg text-sm font-bold transition ${financialPeriod === 'day' ? 'bg-slate-900 text-white' : 'text-slate-500 hover:text-slate-900'}`}
                                >
                                    Hoje
                                </button>
                                <button 
                                    onClick={() => setFinancialPeriod('month')}
                                    className={`px-4 py-2 rounded-lg text-sm font-bold transition ${financialPeriod === 'month' ? 'bg-slate-900 text-white' : 'text-slate-500 hover:text-slate-900'}`}
                                >
                                    Este Mês
                                </button>
                            </div>
                        </div>

                        <div className="grid gap-6">
                             {financialStats.map((stat) => {
                                 // Permission Logic: Admins see all, Barbers see only themselves
                                 if (!hasPermission('all') && stat.pro.id !== currentUser?.id) return null;

                                 return (
                                    <div key={stat.pro.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                                        <div className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-50">
                                            <div className="flex items-center gap-4">
                                                <img src={stat.pro.avatar} alt={stat.pro.name} className="w-12 h-12 rounded-full object-cover" />
                                                <div>
                                                    <h3 className="font-bold text-slate-800 text-lg">{stat.pro.name}</h3>
                                                    <div className="flex items-center gap-2 text-sm">
                                                        <span className="text-emerald-600 font-bold">{stat.pro.commissionRate}% Comissão</span>
                                                        <span className="text-slate-300">•</span>
                                                        <span className="text-slate-500">{stat.servicesCount} serviços realizados</span>
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            <div className="flex gap-4">
                                                <div className="text-right">
                                                    <p className="text-xs text-slate-400 font-bold uppercase">A Receber</p>
                                                    <p className="text-2xl font-bold text-emerald-600">R$ {stat.commission.toFixed(2)}</p>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        {/* Admin Only View: House Share */}
                                        {hasPermission('all') && (
                                            <div className="bg-slate-50 p-4 flex justify-between items-center text-sm">
                                                <div className="flex gap-6">
                                                     <div>
                                                        <span className="text-slate-500 block text-xs uppercase font-bold">Produção Total</span>
                                                        <span className="font-bold text-slate-700">R$ {stat.totalProduction.toFixed(2)}</span>
                                                     </div>
                                                     <div>
                                                        <span className="text-slate-500 block text-xs uppercase font-bold">Lucro Casa</span>
                                                        <span className="font-bold text-slate-700">R$ {stat.houseShare.toFixed(2)}</span>
                                                     </div>
                                                </div>
                                                <button className="text-emerald-600 font-bold text-xs hover:underline">Ver Detalhes</button>
                                            </div>
                                        )}
                                    </div>
                                 );
                             })}
                        </div>
                    </div>
                )}

                {/* SERVICES TAB */}
                {activeTab === 'services' && (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <h3 className="font-bold text-lg">Catálogo</h3>
                            <button 
                                onClick={() => { 
                                    setEditingService(null); 
                                    setNewService({ name: '', price: 0, durationMin: 30, description: '', image: '' }); 
                                    setIsAddingService(!isAddingService) 
                                }}
                                className="bg-slate-900 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-bold hover:bg-slate-800 transition"
                            >
                                {isAddingService ? <X size={16} /> : <Plus size={16} />}
                                {isAddingService ? 'Cancelar' : 'Novo Serviço'}
                            </button>
                        </div>

                        {isAddingService && (
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 animate-fade-in">
                                <h4 className="font-bold mb-4 text-slate-800">{editingService ? 'Editar Serviço' : 'Criar Serviço'}</h4>
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-500">Nome do Serviço</label>
                                        <input 
                                            type="text" 
                                            value={newService.name}
                                            onChange={e => setNewService({...newService, name: e.target.value})}
                                            className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 focus:border-slate-900 outline-none"
                                            placeholder="Ex: Corte Degrade"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-500">Preço (R$)</label>
                                        <input 
                                            type="number" 
                                            value={newService.price}
                                            onChange={e => setNewService({...newService, price: Number(e.target.value)})}
                                            className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 focus:border-slate-900 outline-none"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-500">Duração (min)</label>
                                        <select 
                                            value={newService.durationMin}
                                            onChange={e => setNewService({...newService, durationMin: Number(e.target.value)})}
                                            className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 focus:border-slate-900 outline-none"
                                        >
                                            <option value={15}>15 min</option>
                                            <option value={30}>30 min</option>
                                            <option value={45}>45 min</option>
                                            <option value={60}>60 min</option>
                                            <option value={90}>1h 30min</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-500">URL da Imagem</label>
                                        <input 
                                            type="text" 
                                            value={newService.image}
                                            onChange={e => setNewService({...newService, image: e.target.value})}
                                            className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 focus:border-slate-900 outline-none"
                                            placeholder="https://..."
                                        />
                                    </div>
                                    <div className="col-span-2 space-y-2">
                                        <label className="text-sm font-medium text-slate-500">Descrição</label>
                                        <textarea 
                                            value={newService.description}
                                            onChange={e => setNewService({...newService, description: e.target.value})}
                                            className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 focus:border-slate-900 outline-none h-24 resize-none"
                                        />
                                    </div>
                                </div>
                                <div className="mt-6 flex justify-end">
                                    <button 
                                        onClick={handleSaveService}
                                        className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-emerald-500/20 transition"
                                    >
                                        {editingService ? 'Atualizar Serviço' : 'Salvar Serviço'}
                                    </button>
                                </div>
                            </div>
                        )}

                        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                            {services.map(service => (
                                <div key={service.id} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex gap-4 group">
                                    <img src={service.image} className="w-20 h-20 rounded-xl object-cover" alt={service.name} />
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start">
                                            <h4 className="font-bold text-slate-800">{service.name}</h4>
                                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition">
                                                <button onClick={() => handleEditService(service)} className="p-1.5 bg-slate-100 text-slate-600 rounded-lg hover:bg-blue-50 hover:text-blue-600"><Pencil size={14} /></button>
                                                <button onClick={() => handleDeleteService(service.id)} className="p-1.5 bg-slate-100 text-slate-600 rounded-lg hover:bg-red-50 hover:text-red-600"><Trash2 size={14} /></button>
                                            </div>
                                        </div>
                                        <p className="text-xs text-slate-500 line-clamp-2 mb-2">{service.description}</p>
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-emerald-600 text-sm">R$ {service.price}</span>
                                            <span className="text-xs bg-slate-100 px-2 py-0.5 rounded text-slate-500">{service.durationMin} min</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* TEAM TAB */}
                {activeTab === 'team' && (
                    <div className="space-y-6">
                         <div className="flex justify-between items-center">
                            <h3 className="font-bold text-lg">Profissionais</h3>
                            <button 
                                onClick={() => { 
                                    setEditingPro(null); 
                                    setNewPro({ name: '', role: 'Barbeiro', avatar: '', isAvailable: true, permissions: ['agenda'], pin: '', commissionRate: 50 }); 
                                    setIsAddingPro(!isAddingPro) 
                                }}
                                className="bg-slate-900 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-bold hover:bg-slate-800 transition"
                            >
                                {isAddingPro ? <X size={16} /> : <Plus size={16} />}
                                {isAddingPro ? 'Cancelar' : 'Adicionar Membro'}
                            </button>
                        </div>

                         {isAddingPro && (
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 animate-fade-in">
                                <h4 className="font-bold mb-4 text-slate-800">{editingPro ? 'Editar Membro' : 'Novo Membro'}</h4>
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-500">Nome Completo</label>
                                        <input 
                                            type="text" 
                                            value={newPro.name}
                                            onChange={e => setNewPro({...newPro, name: e.target.value})}
                                            className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 focus:border-slate-900 outline-none"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-500">Cargo</label>
                                        <input 
                                            type="text" 
                                            value={newPro.role}
                                            onChange={e => setNewPro({...newPro, role: e.target.value})}
                                            className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 focus:border-slate-900 outline-none"
                                        />
                                    </div>
                                    
                                    {/* PIN CONFIGURATION */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-500 flex items-center gap-1"><Lock size={14}/> PIN de Acesso (4 dígitos)</label>
                                        <input 
                                            type="text" 
                                            maxLength={4}
                                            value={newPro.pin}
                                            onChange={e => setNewPro({...newPro, pin: e.target.value.replace(/\D/g, '')})}
                                            className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 focus:border-slate-900 outline-none tracking-widest font-mono"
                                            placeholder="0000"
                                        />
                                    </div>

                                     {/* COMMISSION RATE */}
                                     <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-500 flex items-center gap-1"><Percent size={14}/> Taxa de Comissão (%)</label>
                                        <div className="flex items-center gap-2">
                                            <input 
                                                type="number" 
                                                min={0}
                                                max={100}
                                                value={newPro.commissionRate}
                                                onChange={e => setNewPro({...newPro, commissionRate: Number(e.target.value)})}
                                                className="w-24 p-3 bg-slate-50 rounded-xl border border-slate-200 focus:border-slate-900 outline-none"
                                            />
                                            <span className="text-sm text-slate-500">do valor de cada serviço</span>
                                        </div>
                                    </div>

                                    {/* PERMISSIONS */}
                                    <div className="space-y-2 col-span-2">
                                        <label className="text-sm font-medium text-slate-500 flex items-center gap-1"><Shield size={14}/> Níveis de Acesso</label>
                                        <div className="flex gap-4 mt-2">
                                            <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
                                                <input 
                                                    type="checkbox" 
                                                    checked={newPro.permissions?.includes('all')}
                                                    onChange={(e) => {
                                                        if (e.target.checked) setNewPro({...newPro, permissions: ['all']});
                                                        else setNewPro({...newPro, permissions: ['agenda']});
                                                    }}
                                                    className="rounded text-slate-900 focus:ring-0"
                                                />
                                                Administrador (Vê Financeiro Completo e Todos)
                                            </label>
                                            <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
                                                <input 
                                                    type="checkbox" 
                                                    checked={!newPro.permissions?.includes('all')}
                                                    disabled={true}
                                                    className="rounded text-slate-900 focus:ring-0"
                                                />
                                                Básico (Apenas Sua Agenda e Suas Comissões)
                                            </label>
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-6 flex justify-end">
                                    <button 
                                        onClick={handleSavePro}
                                        className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-emerald-500/20 transition"
                                    >
                                        {editingPro ? 'Salvar Alterações' : 'Adicionar Membro'}
                                    </button>
                                </div>
                            </div>
                        )}

                        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                            {professionals.map(pro => (
                                <div key={pro.id} className={`bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col gap-4 transition ${!pro.isAvailable && 'opacity-60 grayscale'}`}>
                                    <div className="flex items-start justify-between">
                                        <div className="flex gap-4">
                                            <img src={pro.avatar} className="w-14 h-14 rounded-full object-cover" alt={pro.name} />
                                            <div>
                                                <h4 className="font-bold text-slate-800">{pro.name}</h4>
                                                <p className="text-xs text-emerald-600 font-bold uppercase">{pro.role}</p>
                                                <div className="flex gap-1 mt-1">
                                                    {pro.permissions.includes('all') && <span className="text-[10px] bg-black text-white px-1.5 rounded">ADMIN</span>}
                                                    <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 rounded">{pro.commissionRate}% Com.</span>
                                                </div>
                                            </div>
                                        </div>
                                        <button onClick={() => handleEditPro(pro)} className="text-slate-400 hover:text-blue-500">
                                            <Pencil size={16} />
                                        </button>
                                    </div>
                                    <div className="pt-4 border-t border-slate-50 flex justify-between items-center">
                                        <span className={`text-xs font-bold px-2 py-1 rounded-full ${pro.isAvailable ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                                            {pro.isAvailable ? 'Disponível' : 'Ausente'}
                                        </span>
                                        <button 
                                            onClick={() => toggleProAvailability(pro.id)}
                                            className="text-xs text-slate-500 underline hover:text-slate-800"
                                        >
                                            {pro.isAvailable ? 'Marcar Ausente' : 'Marcar Disponível'}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* MARKETING TAB */}
                {activeTab === 'marketing' && (
                    <div className="max-w-3xl">
                        <div className="bg-gradient-to-r from-violet-600 to-purple-600 rounded-3xl p-8 text-white shadow-2xl shadow-purple-500/20 mb-8 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl"></div>
                            <div className="relative z-10">
                                <h3 className="text-2xl font-bold mb-2 flex items-center gap-2">
                                    <Sparkles className="text-yellow-300" /> Criador de Campanhas IA
                                </h3>
                                <p className="text-purple-100 mb-6 max-w-lg">Não sabe o que escrever? Diga o tema da promoção e nossa IA cria um texto persuasivo para seu WhatsApp.</p>
                                
                                <div className="flex gap-2 bg-white/10 p-1 rounded-xl backdrop-blur-md border border-white/20">
                                    <input 
                                        type="text" 
                                        value={marketingIdea}
                                        onChange={e => setMarketingIdea(e.target.value)}
                                        onKeyDown={e => e.key === 'Enter' && handleGenerateCopy()}
                                        placeholder="Ex: Promoção de dia dos pais, ganhe uma cerveja..."
                                        className="flex-1 bg-transparent border-none outline-none text-white placeholder-purple-200 px-4"
                                    />
                                    <button 
                                        onClick={handleGenerateCopy}
                                        disabled={isGeneratingCopy}
                                        className="bg-white text-purple-700 px-6 py-2 rounded-lg font-bold hover:bg-purple-50 transition disabled:opacity-70 flex items-center gap-2"
                                    >
                                        {isGeneratingCopy ? 'Criando...' : 'Gerar'} 
                                        {!isGeneratingCopy && <Sparkles size={16} />}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {generatedCopy && (
                            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm animate-fade-in">
                                <h4 className="font-bold text-slate-800 mb-4">Texto Gerado:</h4>
                                <textarea 
                                    className="w-full h-40 p-4 bg-slate-50 rounded-xl border-none outline-none text-slate-700 resize-none mb-4"
                                    value={generatedCopy}
                                    onChange={e => setGeneratedCopy(e.target.value)}
                                />
                                <div className="flex gap-4">
                                    <button 
                                        onClick={() => navigator.clipboard.writeText(generatedCopy)}
                                        className="flex-1 py-3 border border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-50 transition"
                                    >
                                        Copiar Texto
                                    </button>
                                    <a 
                                        href="https://wa.me/"
                                        target="_blank"
                                        rel="noreferrer"
                                        className="flex-1 py-3 bg-[#25D366] text-white rounded-xl font-bold hover:opacity-90 transition flex justify-center items-center gap-2"
                                    >
                                        Abrir WhatsApp
                                    </a>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* SETTINGS TAB */}
                {activeTab === 'settings' && (
                    <div className="max-w-2xl space-y-8">
                        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                            <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
                                <Settings size={20} className="text-slate-400" /> Dados do Estabelecimento
                            </h3>
                            
                            <div className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium text-slate-500 mb-1 block">Foto de Capa</label>
                                    <div className="flex items-center gap-4">
                                        <img src={config.coverImage} className="w-24 h-16 object-cover rounded-lg border border-slate-200" alt="Cover" />
                                        <label className="cursor-pointer bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-lg font-medium text-sm transition flex items-center gap-2">
                                            <Upload size={16} /> Alterar Imagem
                                            <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload}/>
                                        </label>
                                    </div>
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-slate-500 mb-1 block">Nome da Barbearia</label>
                                    <input 
                                        type="text" 
                                        value={config.name}
                                        onChange={e => setConfig({...config, name: e.target.value})}
                                        className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 focus:border-slate-900 outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-slate-500 mb-1 block">WhatsApp (com DDD)</label>
                                    <input 
                                        type="text" 
                                        value={config.phone}
                                        onChange={e => setConfig({...config, phone: e.target.value})}
                                        className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 focus:border-slate-900 outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-slate-500 mb-1 block">Endereço</label>
                                    <input 
                                        type="text" 
                                        value={config.address}
                                        onChange={e => setConfig({...config, address: e.target.value})}
                                        className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 focus:border-slate-900 outline-none"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="bg-red-50 p-6 rounded-2xl border border-red-100">
                            <h3 className="font-bold text-red-900 mb-2 flex items-center gap-2">
                                <Lock size={18} /> Zona de Perigo
                            </h3>
                            <p className="text-sm text-red-700 mb-4">Alterações aqui podem afetar o acesso de todos os usuários.</p>
                            <button 
                                onClick={() => setActiveTab('team')}
                                className="text-sm font-bold text-red-600 hover:underline"
                            >
                                Gerenciar Senhas da Equipe &rarr;
                            </button>
                        </div>
                    </div>
                )}

            </main>
        </div>
    );
};
