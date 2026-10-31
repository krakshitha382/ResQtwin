export type PageId =
  | 'home'
  | 'hospital'
  | 'simulation'
  | 'network'
  | 'scenario-comparison';

export interface FloorData {
  id: string;
  name: string;
  departments: string[];
  totalBeds: number;
  occupiedBeds: number;
}

export interface DepartmentData {
  id: string;
  floorId: string;
  name: string;
  shortName: string;
  tagColor: 'pink' | 'cyan' | 'amber' | 'red';
  position3D: [number, number, number];
  bedsOccupied: number;
  totalBeds: number;
  staffCount: number;
  totalStaff: number;
  status: 'Available' | 'High Load' | 'Critical' | 'Full';
  facilities: string[];
  description: string;
}

export interface EmergencyScenario {
  id: string;
  title: string;
  icon: string;
  severity: 'moderate' | 'high' | 'critical';
  patientsArrived: number;
  avgWaitMinutes: number;
  criticalBottlenecks: number;
  highLoadMessage: string;
  dominoEffect: {
    id: string;
    label: string;
    status: 'normal' | 'warning' | 'critical';
    cause: string;
  }[];
  resources: {
    erBeds: { current: number; total: number; status: 'normal' | 'warning' | 'critical' };
    icuBeds: { current: number; total: number; status: 'normal' | 'warning' | 'critical' };
    otRooms: { current: number; total: number; status: 'normal' | 'warning' | 'critical' };
    staff: { current: number; total: number; status: 'normal' | 'warning' | 'critical' };
    bloodUnits: { current: number; total: number; status: 'normal' | 'warning' | 'critical' };
  };
}

export interface HospitalCandidate {
  id: string;
  name: string;
  etaMinutes: number;
  distanceKm: number;
  status: 'Available' | 'Not Available' | 'Limited';
  reasons: string[];
  icuBedsAvailable: number;
  otAvailable: boolean;
  traumaTeamReady: boolean;
  ctAvailable: boolean;
  bloodBankReady: boolean;
  position3D: [number, number, number];
  color: string;
}

export interface SimulationIntervention {
  id: string;
  name: string;
  description: string;
  staffBoost: number;
  icuBoost: number;
  applied: boolean;
}

