export type EmergencyType =
  | 'Suspected Heart Attack'
  | 'Difficulty Breathing'
  | 'Sudden Collapse'
  | 'Unusual Behaviour'
  | 'Sudden Deterioration'
  | 'Other Patient Emergency';

export type EmergencyAlertStatus =
  | 'SENT'
  | 'DELIVERED'
  | 'ACKNOWLEDGED'
  | 'RESPONDING'
  | 'RESOLVED'
  | 'ESCALATED'
  | 'UNABLE_TO_ATTEND'
  | 'BACKUP_REQUESTED'
  | 'BACKUP_ACCEPTED'
  | 'EN_ROUTE'
  | 'ARRIVED'
  | 'ASSESSMENT_IN_PROGRESS'
  | 'TASK_IN_PROGRESS'
  | 'TASK_COMPLETED'
  | 'CLOSED';

export type StaffRole = 'NURSE' | 'DOCTOR' | 'ADMIN';

export interface DemoStaffIdentity {
  id: string;
  name: string;
  role: StaffRole;
  department?: string;
}

export interface PatientLocation {
  floor: string;
  room: number;
  bed: number;
}

export interface DepartmentDoctorAssignment {
  departmentId: string;
  departmentName: string;
  floor: string;
  roomStart: number;
  roomEnd: number;
  doctorId: string;
}

export interface AlertAuditEntry {
  at: string;
  actorId: string;
  actorName: string;
  action: string;
  note?: string;
}

export interface EmergencyTask {
  id: string;
  description: string;
  assignedDoctorId: string;
  assignedDoctorName: string;
  startedAt?: string;
  completedAt?: string;
  completionNote?: string;
}

export interface PatientEmergencyAlert {
  id: string;
  location: PatientLocation;
  emergencyType: EmergencyType;
  departmentId: string | null;
  departmentName: string;
  senderId: string;
  senderName: string;
  assignedDoctorId: string;
  assignedDoctorName: string;
  /** All on-duty demo doctors notified so any available doctor can claim the alert. */
  notifiedDoctorIds?: string[];
  acceptedByDoctorId?: string;
  patientDoneAt?: string;
  patientDoneById?: string;
  usedFallbackRecipient: boolean;
  status: EmergencyAlertStatus;
  createdAt: string;
  deliveredAt?: string;
  acknowledgedAt?: string;
  acknowledgedById?: string;
  respondingAt?: string;
  resolvedAt?: string;
  resolvedById?: string;
  escalatedAt?: string;
  escalatedToId?: string;
  escalatedToName?: string;
  escalationDeliveredAt?: string;
  unableToAttendReason?: string;
  unableToAttendAt?: string;
  backupDoctorId?: string;
  backupDoctorName?: string;
  backupRequestedAt?: string;
  backupAcceptedAt?: string;
  enRouteAt?: string;
  arrivedAt?: string;
  assessmentStartedAt?: string;
  tasks?: EmergencyTask[];
  closedAt?: string;
  closedByName?: string;
  audit: AlertAuditEntry[];
}

export const ALERT_STORAGE_KEY = 'resqtwin.patient-emergency-alerts.v1';
export const DEMO_SESSION_STORAGE_KEY = 'resqtwin.patient-emergency-demo-session.v1';
export const ACKNOWLEDGEMENT_TIMEOUT_MS = 60_000;

export const DEMO_STAFF: DemoStaffIdentity[] = [
  { id: 'nurse-ananya', name: 'Ananya Rao', role: 'NURSE', department: 'Emergency & Trauma' },
  { id: 'admin-ops', name: 'Hospital Operations Admin', role: 'ADMIN' },
  { id: 'doctor-cardiology', name: 'Dr. Asha Menon', role: 'DOCTOR', department: 'Cardiology' },
  { id: 'doctor-neurology', name: 'Dr. Rohan Iyer', role: 'DOCTOR', department: 'Neurology' },
  { id: 'doctor-orthopedics', name: 'Dr. Meera Nair', role: 'DOCTOR', department: 'Orthopedics' },
  { id: 'doctor-maternity', name: 'Dr. Kavya Rao', role: 'DOCTOR', department: 'Maternity' },
  { id: 'doctor-nicu', name: 'Dr. Arjun Das', role: 'DOCTOR', department: 'NICU' },
  { id: 'doctor-paediatrics', name: 'Dr. Nisha Patel', role: 'DOCTOR', department: 'Paediatrics' },
  { id: 'doctor-icu', name: 'Dr. Vikram Shah', role: 'DOCTOR', department: 'ICU' },
  { id: 'doctor-surgery', name: 'Dr. Sameer Kulkarni', role: 'DOCTOR', department: 'Surgery' },
  { id: 'doctor-emergency', name: 'Dr. Priya Menon', role: 'DOCTOR', department: 'Emergency Coordination' },
];

export const DEPARTMENT_DOCTOR_ASSIGNMENTS: DepartmentDoctorAssignment[] = [
  { departmentId: 'maternity', departmentName: 'Maternity Ward', floor: '3', roomStart: 301, roomEnd: 309, doctorId: 'doctor-maternity' },
  { departmentId: 'nicu', departmentName: 'Neonatal ICU', floor: '3', roomStart: 310, roomEnd: 319, doctorId: 'doctor-nicu' },
  { departmentId: 'paediatrics', departmentName: 'Paediatrics Ward', floor: '3', roomStart: 320, roomEnd: 329, doctorId: 'doctor-paediatrics' },
  { departmentId: 'ward_cardio', departmentName: 'Cardiology Ward', floor: '2', roomStart: 201, roomEnd: 209, doctorId: 'doctor-cardiology' },
  { departmentId: 'ward_neuro', departmentName: 'Neurology Ward', floor: '2', roomStart: 210, roomEnd: 219, doctorId: 'doctor-neurology' },
  { departmentId: 'ward_ortho', departmentName: 'Orthopedics Ward', floor: '2', roomStart: 220, roomEnd: 229, doctorId: 'doctor-orthopedics' },
  { departmentId: 'icu_main', departmentName: 'Main Intensive Care Unit', floor: '1', roomStart: 101, roomEnd: 109, doctorId: 'doctor-icu' },
  { departmentId: 'surgical_ot', departmentName: 'Surgical Unit', floor: '1', roomStart: 110, roomEnd: 119, doctorId: 'doctor-surgery' },
  { departmentId: 'er_trauma', departmentName: 'Emergency & Trauma Bay', floor: 'GF', roomStart: 1, roomEnd: 9, doctorId: 'doctor-emergency' },
];

export const FALLBACK_DOCTOR_ID = 'doctor-emergency';
export const ESCALATION_RECIPIENT_ID = 'admin-ops';

export function resolveDepartment(floor: string, room: number): DepartmentDoctorAssignment | undefined {
  return DEPARTMENT_DOCTOR_ASSIGNMENTS.find(
    (item) => item.floor === floor && room >= item.roomStart && room <= item.roomEnd,
  );
}

export function validatePatientLocation(location: PatientLocation): string | null {
  if (!['GF', '1', '2', '3'].includes(location.floor)) return 'Select a valid floor.';
  if (!Number.isInteger(location.room) || location.room < 1 || location.room > 999) return 'Enter a valid room number.';
  if (!Number.isInteger(location.bed) || location.bed < 1 || location.bed > 50) return 'Enter a bed number between 1 and 50.';
  return null;
}

export function nextAlertStatus(
  current: EmergencyAlertStatus,
  action: 'DELIVER' | 'ACKNOWLEDGE' | 'RESPOND' | 'RESOLVE' | 'ESCALATE',
): EmergencyAlertStatus | null {
  if (action === 'DELIVER') return current === 'SENT' ? 'DELIVERED' : null;
  if (action === 'ACKNOWLEDGE') return current === 'SENT' || current === 'DELIVERED' || current === 'ESCALATED' ? 'ACKNOWLEDGED' : null;
  if (action === 'RESPOND') return current === 'ACKNOWLEDGED' ? 'RESPONDING' : null;
  if (action === 'RESOLVE') return current === 'ACKNOWLEDGED' || current === 'RESPONDING' ? 'RESOLVED' : null;
  if (action === 'ESCALATE') return current === 'SENT' || current === 'DELIVERED' ? 'ESCALATED' : null;
  return null;
}
