import test from 'node:test';
import assert from 'node:assert/strict';
import {
  resolveDepartment,
  validatePatientLocation,
  nextAlertStatus,
  DEMO_STAFF,
} from '../src/features/patient-emergency/emergencyAlertModel.ts';
import {
  createPatientEmergencyAlert,
  escalateExpiredAlerts,
  canActOnAlert,
} from '../src/features/patient-emergency/emergencyAlertStore.ts';

test('room mapping assigns different departments to their configured doctors', () => {
  assert.equal(resolveDepartment('3', 305)?.doctorId, 'doctor-maternity');
  assert.equal(resolveDepartment('2', 214)?.doctorId, 'doctor-neurology');
  assert.equal(resolveDepartment('1', 105)?.doctorId, 'doctor-icu');
});

test('patient location validation rejects invalid floor, room and bed values', () => {
  assert.equal(validatePatientLocation({ floor: '9', room: 305, bed: 2 }), 'Select a valid floor.');
  assert.equal(validatePatientLocation({ floor: '3', room: 0, bed: 2 }), 'Enter a valid room number.');
  assert.equal(validatePatientLocation({ floor: '3', room: 305, bed: 51 }), 'Enter a bed number between 1 and 50.');
  assert.equal(validatePatientLocation({ floor: '3', room: 305, bed: 2 }), null);
});

test('alert creation assigns the responsible doctor and starts in SENT', () => {
  const nurse = DEMO_STAFF.find((staff) => staff.id === 'nurse-ananya');
  const alert = createPatientEmergencyAlert({
    location: { floor: '3', room: 305, bed: 2 },
    emergencyType: 'Difficulty Breathing',
    sender: nurse,
    now: new Date('2026-01-01T00:00:00.000Z'),
  });
  assert.equal(alert.assignedDoctorId, 'doctor-maternity');
  assert.equal(alert.status, 'SENT');
  assert.ok(alert.notifiedDoctorIds?.length > 1, 'alert should notify the configured doctor pool');
  assert.equal(alert.senderId, nurse.id);
  assert.ok(alert.id.startsWith('RQ-'));
});

test('unknown room mapping uses the configured emergency doctor fallback', () => {
  const nurse = DEMO_STAFF.find((staff) => staff.id === 'nurse-ananya');
  const alert = createPatientEmergencyAlert({
    location: { floor: '3', room: 399, bed: 1 },
    emergencyType: 'Sudden Collapse',
    sender: nurse,
  });
  assert.equal(alert.assignedDoctorId, 'doctor-emergency');
  assert.equal(alert.usedFallbackRecipient, true);
});

test('status transitions reject invalid or out-of-order actions', () => {
  assert.equal(nextAlertStatus('SENT', 'DELIVER'), 'DELIVERED');
  assert.equal(nextAlertStatus('SENT', 'ACKNOWLEDGE'), 'ACKNOWLEDGED');
  assert.equal(nextAlertStatus('ACKNOWLEDGED', 'RESPOND'), 'RESPONDING');
  assert.equal(nextAlertStatus('RESPONDING', 'RESOLVE'), 'RESOLVED');
  assert.equal(nextAlertStatus('RESOLVED', 'ESCALATE'), null);
  assert.equal(nextAlertStatus('SENT', 'RESPOND'), null);
});

test('only assigned doctor, escalation recipient or admin may act', () => {
  const nurse = DEMO_STAFF.find((staff) => staff.id === 'nurse-ananya');
  const doctor = DEMO_STAFF.find((staff) => staff.id === 'doctor-maternity');
  const admin = DEMO_STAFF.find((staff) => staff.id === 'admin-ops');
  const alert = createPatientEmergencyAlert({ location: { floor: '3', room: 305, bed: 2 }, emergencyType: 'Sudden Collapse', sender: nurse });
  assert.equal(canActOnAlert(alert, nurse), false);
  assert.equal(canActOnAlert(alert, doctor), true);
  assert.equal(canActOnAlert(alert, admin), true);
});

test('unacknowledged alerts escalate, while acknowledged and resolved alerts do not', () => {
  const nurse = DEMO_STAFF.find((staff) => staff.id === 'nurse-ananya');
  const now = new Date('2026-01-01T00:00:00.000Z');
  const base = createPatientEmergencyAlert({ location: { floor: '3', room: 305, bed: 2 }, emergencyType: 'Difficulty Breathing', sender: nurse, now });
  const pending = escalateExpiredAlerts([base], now.getTime() + 61_000)[0];
  assert.equal(pending.status, 'ESCALATED');
  assert.equal(pending.escalatedToId, 'admin-ops');
  const acknowledged = { ...base, status: 'ACKNOWLEDGED' };
  const resolved = { ...base, status: 'RESOLVED' };
  assert.equal(escalateExpiredAlerts([acknowledged, resolved], now.getTime() + 61_000)[0], acknowledged);
  assert.equal(escalateExpiredAlerts([acknowledged, resolved], now.getTime() + 61_000)[1], resolved);
});
