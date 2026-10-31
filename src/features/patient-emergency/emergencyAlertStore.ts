import {
  ALERT_STORAGE_KEY,
  ACKNOWLEDGEMENT_TIMEOUT_MS,
  DEMO_STAFF,
  ESCALATION_RECIPIENT_ID,
  FALLBACK_DOCTOR_ID,
  resolveDepartment,
  validatePatientLocation,
  type DemoStaffIdentity,
  type EmergencyType,
  type PatientEmergencyAlert,
  type PatientLocation,
} from './emergencyAlertModel.ts';

const getStorage = (): Storage | null => {
  try { return typeof window === 'undefined' ? null : window.localStorage; }
  catch { return null; }
};

export function readAlerts(): PatientEmergencyAlert[] {
  const raw = getStorage()?.getItem(ALERT_STORAGE_KEY);
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed as PatientEmergencyAlert[] : [];
  } catch { return []; }
}

export function writeAlerts(alerts: PatientEmergencyAlert[]): void {
  getStorage()?.setItem(ALERT_STORAGE_KEY, JSON.stringify(alerts));
  if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('resqtwin:alerts-updated'));
}

export function makeAlertId(): string {
  const uuid = globalThis.crypto?.randomUUID?.();
  return uuid ? `RQ-${uuid.slice(0, 8).toUpperCase()}` : `RQ-${Date.now().toString(36).toUpperCase()}`;
}

export function createPatientEmergencyAlert(input: {
  location: PatientLocation;
  emergencyType: EmergencyType;
  sender: DemoStaffIdentity;
  now?: Date;
}): PatientEmergencyAlert {
  const validationError = validatePatientLocation(input.location);
  if (validationError) throw new Error(validationError);
  if (!['NURSE', 'DOCTOR', 'ADMIN'].includes(input.sender.role)) throw new Error('This demo session is not authorized to send patient emergency alerts.');

  const department = resolveDepartment(input.location.floor, input.location.room);
  const assignedDoctor = DEMO_STAFF.find((staff) => staff.id === (department?.doctorId ?? FALLBACK_DOCTOR_ID));
  const timestamp = (input.now ?? new Date()).toISOString();
  if (!assignedDoctor) throw new Error('No configured doctor or fallback recipient is available.');

  return {
    id: makeAlertId(),
    location: input.location,
    emergencyType: input.emergencyType,
    departmentId: department?.departmentId ?? null,
    departmentName: department?.departmentName ?? 'Unmapped location — Emergency Coordination fallback',
    senderId: input.sender.id,
    senderName: input.sender.name,
    assignedDoctorId: assignedDoctor.id,
    assignedDoctorName: assignedDoctor.name,
    // Demo broadcast: every configured doctor receives the alert; the first to acknowledge claims it.
    notifiedDoctorIds: DEMO_STAFF.filter((staff) => staff.role === 'DOCTOR').map((staff) => staff.id),
    usedFallbackRecipient: !department,
    status: 'SENT',
    createdAt: timestamp,
    audit: [{ at: timestamp, actorId: input.sender.id, actorName: input.sender.name, action: 'ALERT_BROADCAST_TO_DOCTORS', note: `Department routing: ${assignedDoctor.name}; notified all configured on-duty demo doctors so the first available doctor can acknowledge.` }],
  };
}

export function escalateExpiredAlerts(
  alerts: PatientEmergencyAlert[],
  now = Date.now(),
): PatientEmergencyAlert[] {
  let changed = false;
  const fallback = DEMO_STAFF.find((staff) => staff.id === ESCALATION_RECIPIENT_ID);
  if (!fallback) return alerts;
  const updated = alerts.map((alert) => {
    const age = now - new Date(alert.createdAt).getTime();
    if ((alert.status !== 'SENT' && alert.status !== 'DELIVERED') || age < ACKNOWLEDGEMENT_TIMEOUT_MS) return alert;
    changed = true;
    const at = new Date(now).toISOString();
    return {
      ...alert,
      status: 'ESCALATED' as const,
      escalatedAt: at,
      escalatedToId: fallback.id,
      escalatedToName: fallback.name,
      audit: [...alert.audit, { at, actorId: 'system', actorName: 'ResQ Twin escalation service', action: 'ALERT_ESCALATED', note: `No acknowledgement within ${Math.round(ACKNOWLEDGEMENT_TIMEOUT_MS / 1000)} seconds. Escalated to ${fallback.name}.` }],
    };
  });
  return changed ? updated : alerts;
}

export function canActOnAlert(alert: PatientEmergencyAlert, user: DemoStaffIdentity): boolean {
  return user.role === 'ADMIN' || user.id === alert.assignedDoctorId || user.id === alert.escalatedToId || (alert.notifiedDoctorIds ?? []).includes(user.id);
}

export function getSessionById(id: string): DemoStaffIdentity | undefined {
  return DEMO_STAFF.find((staff) => staff.id === id);
}
