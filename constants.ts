
import { Service, Professional, Appointment, TimeSlot, EstablishmentConfig } from './types';

export const DEFAULT_CONFIG: EstablishmentConfig = {
  name: 'BarberFlow Headquartes',
  phone: '5511999999999',
  address: 'Av. Paulista, 1000 - SP',
  coverImage: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?q=80&w=2074&auto=format&fit=crop' // Interior Barbearia Dark/Premium
};

export const MOCK_SERVICES: Service[] = [
  {
    id: '1',
    name: 'Corte Premium',
    description: 'Corte de cabelo completo com lavagem, massagem capilar e finalização com pomada.',
    price: 50,
    durationMin: 45,
    image: 'https://images.unsplash.com/photo-1622286342621-4bd786c2447c?q=80&w=800&auto=format&fit=crop' // Foco no corte/tesoura
  },
  {
    id: '2',
    name: 'Barba Terapia',
    description: 'Ritual de barba com toalha quente (hot towel), esfoliação facial e óleo hidratante.',
    price: 35,
    durationMin: 30,
    image: 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?q=80&w=800&auto=format&fit=crop' // Barba com espuma e toalha
  },
  {
    id: '3',
    name: 'Combo Rei',
    description: 'A experiência completa. Corte e barba alinhados, com bebida de cortesia e massagem.',
    price: 80,
    durationMin: 75,
    image: 'https://images.unsplash.com/photo-1503951914875-452162b7f30a?q=80&w=800&auto=format&fit=crop' // Cliente na cadeira relaxando
  },
  {
    id: '4',
    name: 'Acabamento / Pezinho',
    description: 'Manutenção apenas dos contornos (pezinho) e nuca. Ideal para manter o corte em dia.',
    price: 20,
    durationMin: 15,
    image: 'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?q=80&w=800&auto=format&fit=crop' // Foco em detalhe/nuca
  },
  {
    id: '5',
    name: 'Camuflagem de Brancos',
    description: 'Pintura sutil para escurecer fios brancos da barba ou cabelo, com aspecto natural.',
    price: 45,
    durationMin: 40,
    image: 'https://images.unsplash.com/photo-1552058544-f2b08422138a?q=80&w=800&auto=format&fit=crop' // Barba escura e densa
  },
  {
    id: '6',
    name: 'Sobrancelha Navalhada',
    description: 'Design de sobrancelha com navalha para um olhar mais marcante e limpo.',
    price: 15,
    durationMin: 15,
    image: 'https://images.unsplash.com/photo-1595152772835-219638e31f3d?q=80&w=800&auto=format&fit=crop' // Rosto masculino foco olho
  },
  {
    id: '7',
    name: 'Platinado Global',
    description: 'Descoloração total dos fios com matização para o tom branco/cinza perfeito.',
    price: 120,
    durationMin: 120,
    image: 'https://images.unsplash.com/photo-1617140621348-c033e4c62b7e?q=80&w=800&auto=format&fit=crop' // Cabelo platinado/loiro
  },
  {
    id: '8',
    name: 'Limpeza de Pele',
    description: 'Remoção profunda de cravos e impurezas do rosto com vapor de ozônio.',
    price: 60,
    durationMin: 45,
    image: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?q=80&w=800&auto=format&fit=crop' // Skincare masculino
  }
];

export const MOCK_PROFESSIONALS: Professional[] = [
  {
    id: 'p1',
    name: 'Carlos "Boss" Silva',
    role: 'Master Barber (Dono)',
    avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=200&auto=format&fit=crop', // Homem de terno/profissional
    rating: 5.0,
    isAvailable: true,
    permissions: ['all'], 
    pin: '1234',
    commissionRate: 100 
  },
  {
    id: 'p2',
    name: 'Ana Souza',
    role: 'Visagista & Stylist',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=200&auto=format&fit=crop', // Mulher profissional
    rating: 4.9,
    isAvailable: true,
    permissions: ['agenda'], 
    pin: '0000',
    commissionRate: 50 
  },
  {
    id: 'p3',
    name: 'Roberto "Navalha"',
    role: 'Barbeiro Clássico',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=200&auto=format&fit=crop', // Homem estilo lenhador
    rating: 4.8,
    isAvailable: false,
    permissions: ['agenda'], 
    pin: '1111',
    commissionRate: 40 
  }
];

export const MOCK_TIME_SLOTS: TimeSlot[] = [
  { time: '09:00', available: true },
  { time: '10:00', available: false },
  { time: '11:00', available: true },
  { time: '13:00', available: true },
  { time: '14:00', available: true },
  { time: '15:00', available: false },
  { time: '16:00', available: true },
  { time: '17:00', available: true },
  { time: '18:00', available: true },
  { time: '19:00', available: true },
];

export const MOCK_APPOINTMENTS: Appointment[] = [
  {
    id: 'a1',
    serviceId: '1',
    professionalId: 'p1',
    date: new Date().toISOString(),
    time: '10:00',
    customerName: 'João Paulo',
    customerPhone: '11999999999',
    status: 'confirmed',
    price: 50,
    paymentMethod: 'pix'
  },
  {
    id: 'a2',
    serviceId: '2',
    professionalId: 'p2',
    date: new Date().toISOString(),
    time: '15:00',
    customerName: 'Pedro Henrique',
    customerPhone: '11888888888',
    status: 'completed',
    price: 35,
    paymentMethod: 'cash'
  },
  {
    id: 'a3',
    serviceId: '3',
    professionalId: 'p1',
    date: new Date().toISOString(),
    time: '11:00',
    customerName: 'Lucas Lima',
    customerPhone: '11777777777',
    status: 'confirmed',
    price: 80,
    paymentMethod: 'card'
  },
  {
      id: 'a4',
      serviceId: '1',
      professionalId: 'p1',
      date: new Date().toISOString(),
      time: '14:00',
      customerName: 'Gabriel Medina',
      customerPhone: '11777777777',
      status: 'confirmed',
      price: 50,
      paymentMethod: 'pix'
  }
];
