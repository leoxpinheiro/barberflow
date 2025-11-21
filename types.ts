
export interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  durationMin: number;
  image: string;
}

export interface Professional {
  id: string;
  name: string;
  role: string;
  avatar: string;
  rating: number;
  isAvailable: boolean;
  permissions: string[]; // 'all', 'agenda', 'financial', 'settings', etc.
  pin: string; // Senha individual de 4 digitos
  commissionRate: number; // Porcentagem (0-100)
}

export interface TimeSlot {
  time: string;
  available: boolean;
}

export interface EstablishmentConfig {
  name: string;
  phone: string;
  coverImage: string;
  address: string;
}

export interface Appointment {
  id: string;
  serviceId: string;
  professionalId: string;
  date: string; // ISO string
  time: string;
  customerName: string;
  customerPhone: string;
  status: 'confirmed' | 'pending' | 'completed' | 'cancelled' | 'blocked';
  // Novos campos financeiros
  paymentMethod?: 'pix' | 'cash' | 'card';
  price?: number; // Salvar o preço na hora do agendamento (snapshot)
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'ai';
  content: string;
  timestamp: Date;
}

export interface DashboardStats {
  revenue: number;
  appointments: number;
  customers: number;
  growth: number;
}
