import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AlertOctagon, Bell, Check, Clock3, Radio, ShieldAlert, Siren, X } from 'lucide-react';
import {
  ACKNOWLEDGEMENT_TIMEOUT_MS,
  DEMO_SESSION_STORAGE_KEY,
  DEMO_STAFF,
  type DemoStaffIdentity,
  type EmergencyAlertStatus,
  type EmergencyType,
  type PatientEmergencyAlert,
  type PatientLocation,
} from '../features/patient-emergency/emergencyAlertModel';
import {
  canActOnAlert,
  createPatientEmergencyAlert,
  escalateExpiredAlerts,
  getSessionById,
  readAlerts,
  writeAlerts,
} from '../features/patient-emergency/emergencyAlertStore';

const EMERGENCY_TYPES: EmergencyType[] = [
  'Suspected Heart Attack',
  'Difficulty Breathing',
  'Sudden Collapse',
  'Unusual Behaviour',
  'Sudden Deterioration',
  'Other Patient Emergency',
];

const initialLocation: PatientLocation = { floor: '', room: 0, bed: 0 };

const statusStyles: Partial<Record<EmergencyAlertStatus, string>> = {
  SENT: 'border-amber-500/40 bg-amber-500/10 text-amber-300',
  DELIVERED: 'border-cyan-500/40 bg-cyan-500/10 text-cyan-300',
  ACKNOWLEDGED: 'border-blue-500/40 bg-blue-500/10 text-blue-300',
  RESPONDING: 'border-violet-500/40 bg-violet-500/10 text-violet-300',
  RESOLVED: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300',
  ESCALATED: 'border-red-500/50 bg-red-500/15 text-red-300',
};

function formatTime(value?: string): string {
  if (!value) return '—';
  return new Date(value).toLocaleString();
}

function updateAlert(
  alert: PatientEmergencyAlert,
  user: DemoStaffIdentity,
  action: 'ACKNOWLEDGE' | 'RESPOND' | 'RESOLVE',
): PatientEmergencyAlert {
  const at = new Date().toISOString();
  const status: EmergencyAlertStatus = action === 'ACKNOWLEDGE'
    ? 'ACKNOWLEDGED'
    : action === 'RESPOND'
      ? 'RESPONDING'
      : 'RESOLVED';
  const auditAction = action === 'ACKNOWLEDGE'
    ? 'ALERT_ACKNOWLEDGED'
    : action === 'RESPOND'
      ? 'DOCTOR_RESPONDING'
      : 'ALERT_RESOLVED';
  return {
    ...alert,
    status,
    ...(action === 'ACKNOWLEDGE' ? { acknowledgedAt: at, acknowledgedById: user.id } : {}),
    ...(action === 'RESPOND' ? { respondingAt: at } : {}),
    ...(action === 'RESOLVE' ? { resolvedAt: at, resolvedById: user.id } : {}),
    audit: [...alert.audit, { at, actorId: user.id, actorName: user.name, action: auditAction }],
  };
}

export const PatientEmergencyAlertSystem: React.FC<{ visible?: boolean }> = ({ visible = true }) => {
  const [alerts, setAlerts] = useState<PatientEmergencyAlert[]>(() => readAlerts());
  const alertsRef = useRef<PatientEmergencyAlert[]>(alerts);
  const submitLock = useRef(false);
  const [session, setSession] = useState<DemoStaffIdentity>(() => {
    const saved = typeof window !== 'undefined' ? window.localStorage.getItem(DEMO_SESSION_STORAGE_KEY) : null;
    return (saved && getSessionById(saved)) || DEMO_STAFF[0];
  });
  const [formOpen, setFormOpen] = useState(false);
  const [inboxOpen, setInboxOpen] = useState(false);
  const [location, setLocation] = useState<PatientLocation>(initialLocation);
  const [emergencyType, setEmergencyType] = useState<EmergencyType>('Difficulty Breathing');
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [confirmation, setConfirmation] = useState<PatientEmergencyAlert | null>(null);

  const commitAlerts = useCallback((transform: (current: PatientEmergencyAlert[]) => PatientEmergencyAlert[]) => {
    const next = transform(alertsRef.current);
    if (next !== alertsRef.current) {
      alertsRef.current = next;
      setAlerts(next);
      writeAlerts(next);
    }
  }, []);

  // Keep this local demonstration synchronized across tabs in the same browser.
  // A shared backend is required for different devices or real staff accounts.
  useEffect(() => {
    const refresh = () => {
      const latest = readAlerts();
      if (JSON.stringify(alertsRef.current) !== JSON.stringify(latest)) {
        alertsRef.current = latest;
        setAlerts(latest);
      }
    };
    const timer = window.setInterval(() => {
      const latest = readAlerts();
      const escalated = escalateExpiredAlerts(latest);
      if (escalated !== latest) writeAlerts(escalated);
      const source = escalated !== latest ? escalated : latest;
      if (JSON.stringify(alertsRef.current) !== JSON.stringify(source)) {
        alertsRef.current = source;
        setAlerts(source);
      }
    }, 1000);
    window.addEventListener('storage', refresh);
    window.addEventListener('resqtwin:alerts-updated', refresh);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener('storage', refresh);
      window.removeEventListener('resqtwin:alerts-updated', refresh);
    };
  }, []);

  // Delivery is recorded only when the intended recipient's app session is active
  // and the notification is rendered in that session.
  useEffect(() => {
    const at = new Date().toISOString();
    let changed = false;
    const next = alerts.map((alert) => {
      if (alert.assignedDoctorId === session.id && alert.status === 'SENT') {
        changed = true;
        return {
          ...alert,
          status: 'DELIVERED' as const,
          deliveredAt: at,
          audit: [...alert.audit, { at, actorId: session.id, actorName: session.name, action: 'ALERT_DELIVERED_TO_DOCTOR_APP' }],
        };
      }
      if (alert.escalatedToId === session.id && alert.status === 'ESCALATED' && !alert.escalationDeliveredAt) {
        changed = true;
        return {
          ...alert,
          escalationDeliveredAt: at,
          audit: [...alert.audit, { at, actorId: session.id, actorName: session.name, action: 'ESCALATION_DELIVERED_TO_ADMIN_APP' }],
        };
      }
      return alert;
    });
    if (changed) commitAlerts(() => next);
  }, [alerts, session, commitAlerts]);

  // Keep a recipient's active alert visible until it is acknowledged/resolved.
  useEffect(() => {
    const hasRecipientAlert = alerts.some((alert) =>
      alert.status !== 'RESOLVED' && alert.status !== 'CLOSED' &&
      (alert.assignedDoctorId === session.id || alert.escalatedToId === session.id),
    );
    if (hasRecipientAlert) setInboxOpen(true);
  }, [alerts, session]);

  const openAlerts = useMemo(() => alerts.filter((alert) => alert.status !== 'RESOLVED' && alert.status !== 'CLOSED'), [alerts]);
  const visibleAlerts = useMemo(() => alerts
    .filter((alert) => session.role === 'ADMIN'
      || alert.assignedDoctorId === session.id
      || alert.escalatedToId === session.id
      || alert.senderId === session.id)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()), [alerts, session]);
  const recipientAlerts = visibleAlerts.filter((alert) => alert.assignedDoctorId === session.id || alert.escalatedToId === session.id);

  const handleSessionChange = (id: string) => {
    const selected = getSessionById(id);
    if (!selected) return;
    setSession(selected);
    window.localStorage.setItem(DEMO_SESSION_STORAGE_KEY, selected.id);
  };

  const sendAlert = (event: React.FormEvent) => {
    event.preventDefault();
    if (submitting || submitLock.current) return;
    submitLock.current = true;
    setFormError('');
    if (!Number.isInteger(location.room) || location.room < 1 || !Number.isInteger(location.bed) || location.bed < 1 || location.bed > 50) {
      setFormError('Enter a valid room and bed number (bed 1–50).');
      return;
    }
    setSubmitting(true);
    try {
      const alert = createPatientEmergencyAlert({ location, emergencyType, sender: session });
      commitAlerts((current) => [alert, ...current]);
      setConfirmation(alert);
      setFormOpen(false);
      setInboxOpen(true);
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Unable to create this alert.');
    } finally {
      submitLock.current = false;
      setSubmitting(false);
    }
  };

  const performAction = (alert: PatientEmergencyAlert, action: 'ACKNOWLEDGE' | 'RESPOND' | 'RESOLVE') => {
    if (!canActOnAlert(alert, session)) return;
    const updated = updateAlert(alert, session, action);
    commitAlerts((current) => current.map((item) => item.id === alert.id ? updated : item));
  };

  return (
    <>
      {visible && (
        <>
      <div className="fixed bottom-5 right-5 z-[90] flex flex-col items-end gap-2">
        <div className="rounded-xl border border-slate-700 bg-[#0b1626]/95 p-2 shadow-2xl backdrop-blur-xl">
          <label className="mb-1 block px-1 text-[10px] uppercase tracking-wider text-slate-500">Local demo session</label>
          <select
            aria-label="Switch local demo staff session"
            value={session.id}
            onChange={(event) => handleSessionChange(event.target.value)}
            className="max-w-[230px] rounded-lg border border-slate-700 bg-slate-900 px-2 py-1.5 text-xs text-slate-200 outline-none focus:border-cyan-400"
          >
            {DEMO_STAFF.map((staff) => <option key={staff.id} value={staff.id}>{staff.name} · {staff.role}</option>)}
          </select>
        </div>
        <button
          onClick={() => { setInboxOpen((value) => !value); setConfirmation(null); }}
          className="relative flex items-center gap-2 rounded-xl border border-slate-600 bg-[#101d30] px-4 py-3 text-sm font-semibold text-white shadow-xl hover:bg-[#172840]"
          aria-label={`Open emergency inbox, ${openAlerts.length} active alerts`}
        >
          <Bell className="h-4 w-4 text-cyan-300" /> Active alerts
          <span className="rounded-full bg-red-600 px-2 py-0.5 text-xs font-bold text-white">{openAlerts.length}</span>
        </button>
        <button
          onClick={() => { setFormOpen(true); setFormError(''); setConfirmation(null); }}
          className="flex items-center gap-3 rounded-2xl border border-red-300/70 bg-gradient-to-r from-red-700 to-rose-600 px-5 py-4 text-sm font-extrabold tracking-wide text-white shadow-[0_0_28px_rgba(220,38,38,0.42)] transition hover:scale-[1.02] hover:from-red-600 hover:to-rose-500 focus:outline-none focus:ring-4 focus:ring-red-400/40"
        >
          <Siren className="h-5 w-5" /> EMERGENCY — ALERT DOCTOR
        </button>
      </div>

      {formOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="patient-emergency-title">
          <form onSubmit={sendAlert} className="w-full max-w-md rounded-2xl border border-red-500/40 bg-[#0b1626] p-5 shadow-[0_0_50px_rgba(220,38,38,0.2)]">
            <div className="mb-5 flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 text-red-300"><AlertOctagon className="h-5 w-5" /><span className="text-xs font-bold uppercase tracking-[0.2em]">Patient emergency</span></div>
                <h2 id="patient-emergency-title" className="mt-2 text-xl font-bold text-white">Alert responsible doctor</h2>
              </div>
              <button type="button" onClick={() => setFormOpen(false)} className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white" aria-label="Close emergency form"><X className="h-5 w-5" /></button>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <label className="text-xs text-slate-300">Floor
                <select value={location.floor} onChange={(event) => setLocation((value) => ({ ...value, floor: event.target.value }))} className="mt-1.5 w-full rounded-lg border border-slate-700 bg-slate-900 p-2.5 text-sm text-white">
                  <option value="" disabled>Select</option><option value="GF">Ground</option><option value="1">1</option><option value="2">2</option><option value="3">3</option>
                </select>
              </label>
              <label className="text-xs text-slate-300">Room number
                <input required type="number" min="1" max="999" value={location.room} onChange={(event) => setLocation((value) => ({ ...value, room: Number(event.target.value) }))} className="mt-1.5 w-full rounded-lg border border-slate-700 bg-slate-900 p-2.5 text-sm text-white" />
              </label>
              <label className="text-xs text-slate-300">Bed number
                <input required type="number" min="1" max="50" value={location.bed} onChange={(event) => setLocation((value) => ({ ...value, bed: Number(event.target.value) }))} className="mt-1.5 w-full rounded-lg border border-slate-700 bg-slate-900 p-2.5 text-sm text-white" />
              </label>
            </div>

            <label className="mt-4 block text-xs text-slate-300">Emergency type
              <select value={emergencyType} onChange={(event) => setEmergencyType(event.target.value as EmergencyType)} className="mt-1.5 w-full rounded-lg border border-slate-700 bg-slate-900 p-3 text-sm text-white">
                {EMERGENCY_TYPES.map((type) => <option key={type} value={type}>{type}</option>)}
              </select>
            </label>
            {formError && <p role="alert" className="mt-3 rounded-lg border border-red-500/30 bg-red-500/10 p-2.5 text-xs text-red-200">{formError}</p>}
            <p className="mt-4 text-[11px] text-slate-500">Sender: {session.name} · {session.role}. The responsible doctor is assigned automatically from the configured room mapping.</p>
            <button disabled={submitting} type="submit" className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-3.5 text-sm font-extrabold text-white shadow-lg hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-60">
              <Siren className="h-4 w-4" /> SEND EMERGENCY ALERT
            </button>
          </form>
        </div>
      )}

      {inboxOpen && (
        <div className="fixed bottom-44 right-5 z-[95] max-h-[65vh] w-[min(440px,calc(100vw-2.5rem))] overflow-y-auto rounded-2xl border border-cyan-500/30 bg-[#091525]/[.98] p-4 shadow-2xl backdrop-blur-xl">
          <div className="mb-3 flex items-center justify-between">
            <div><p className="text-xs font-bold uppercase tracking-wider text-cyan-300">Patient emergency inbox</p><p className="mt-1 text-[11px] text-slate-500">Signed in locally as {session.name}</p></div>
            <button onClick={() => setInboxOpen(false)} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800" aria-label="Close inbox"><X className="h-4 w-4" /></button>
          </div>

          {confirmation && (
            <div className="mb-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm">
              <p className="font-semibold text-emerald-300">Alert recorded · {confirmation.id}</p>
              <p className="mt-1 text-xs text-slate-300">Status: SENT · Assigned to {confirmation.assignedDoctorName}</p>
              {confirmation.usedFallbackRecipient && <p className="mt-1 text-xs text-amber-300">Fallback recipient used because this room has no department mapping.</p>}
              <p className="mt-1 text-[10px] text-slate-500">Local demo record only; delivery is confirmed only when the recipient session receives it.</p>
            </div>
          )}

          {recipientAlerts.length === 0 && !visibleAlerts.length ? (
            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 text-center text-sm text-slate-400">No patient emergency alerts for this demo session.</div>
          ) : visibleAlerts.length === 0 ? null : (
            <div className="space-y-3">
              {visibleAlerts.map((alert) => {
                const canAct = canActOnAlert(alert, session);
                return (
                  <article key={alert.id} className={`rounded-xl border p-3 ${alert.status === 'ESCALATED' ? 'border-red-500/50 bg-red-950/25' : 'border-slate-700 bg-slate-900/70'}`}>
                    <div className="flex items-center justify-between gap-2">
                      <p className="flex items-center gap-1.5 text-xs font-bold text-red-300"><ShieldAlert className="h-4 w-4" /> PATIENT EMERGENCY</p>
                      <span className={`rounded-full border px-2 py-1 text-[9px] font-bold ${statusStyles[alert.status] ?? 'border-slate-500/40 bg-slate-500/10 text-slate-300'}`}>{alert.status}</span>
                    </div>
                    <p className="mt-2 text-sm font-semibold text-white">{alert.emergencyType}</p>
                    <div className="mt-2 grid grid-cols-3 gap-2 text-xs text-slate-300">
                      <span>Floor: <b>{alert.location.floor === 'GF' ? 'Ground' : alert.location.floor}</b></span>
                      <span>Room: <b>{alert.location.room}</b></span>
                      <span>Bed: <b>{alert.location.bed}</b></span>
                    </div>
                    <p className="mt-2 text-[10px] text-slate-500">{alert.id} · {formatTime(alert.createdAt)}</p>
                    <p className="mt-1 text-[10px] text-slate-400">Notified doctors: {(alert.notifiedDoctorIds?.length ?? 1)} · Initial department route: {alert.assignedDoctorName}{alert.usedFallbackRecipient ? ' (fallback)' : ''}</p>
                    {alert.status === 'ESCALATED' && <p className="mt-1 text-xs font-semibold text-red-300">Escalated to {alert.escalatedToName}</p>}
                    {alert.status === 'DELIVERED' && alert.deliveredAt && <p className="mt-1 text-[10px] text-cyan-300">Delivered to doctor app: {formatTime(alert.deliveredAt)}</p>}
                    {alert.acknowledgedAt && <p className="mt-1 text-[10px] text-blue-300">Acknowledged: {formatTime(alert.acknowledgedAt)}</p>}
                    {alert.resolvedAt && <p className="mt-1 text-[10px] text-emerald-300">Resolved: {formatTime(alert.resolvedAt)}</p>}
                    {canAct && alert.status !== 'RESOLVED' && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {(alert.status === 'SENT' || alert.status === 'DELIVERED' || alert.status === 'ESCALATED') && <button onClick={() => performAction(alert, 'ACKNOWLEDGE')} className="rounded-lg bg-blue-600 px-3 py-2 text-[10px] font-bold text-white hover:bg-blue-500"><Check className="mr-1 inline h-3 w-3" /> ACKNOWLEDGE</button>}
                        {alert.status === 'ACKNOWLEDGED' && <button onClick={() => performAction(alert, 'RESPOND')} className="rounded-lg bg-violet-600 px-3 py-2 text-[10px] font-bold text-white hover:bg-violet-500"><Radio className="mr-1 inline h-3 w-3" /> RESPONDING</button>}
                        {(alert.status === 'ACKNOWLEDGED' || alert.status === 'RESPONDING') && <button onClick={() => performAction(alert, 'RESOLVE')} className="rounded-lg bg-emerald-600 px-3 py-2 text-[10px] font-bold text-white hover:bg-emerald-500">MARK RESOLVED</button>}
                      </div>
                    )}
                    {(alert.status === 'TASK_COMPLETED' || alert.status === 'RESOLVED') && alert.senderId === session.id && <button onClick={() => { const at = new Date().toISOString(); const updated = { ...alert, status: 'CLOSED' as const, closedAt: at, closedByName: session.name, audit: [...alert.audit, { at, actorId: session.id, actorName: session.name, action: 'EMERGENCY_CLOSED_BY_NURSE' }] }; commitAlerts(current => current.map(item => item.id === alert.id ? updated : item)); }} className="mt-3 rounded-lg bg-emerald-600 px-3 py-2 text-[10px] font-bold text-white">CLOSE EMERGENCY</button>}
                    {!canAct && alert.status !== 'RESOLVED' && alert.status !== 'CLOSED' && <p className="mt-2 text-[10px] text-slate-500">Waiting for an available doctor to acknowledge the broadcast alert.</p>}
                    {alert.audit.length > 1 && <details className="mt-2"><summary className="flex cursor-pointer items-center gap-1 text-[10px] text-slate-500"><Clock3 className="h-3 w-3" /> Audit history</summary><div className="mt-2 space-y-1">{alert.audit.map((entry, index) => <p key={`${entry.at}-${index}`} className="text-[10px] text-slate-500">{formatTime(entry.at)} · {entry.actorName}: {entry.action}</p>)}</div></details>}
                  </article>
                );
              })}
            </div>
          )}

          <div className="mt-3 rounded-lg border border-amber-500/20 bg-amber-500/5 p-2.5 text-[10px] leading-relaxed text-amber-200/80">
            Local demo only: alerts synchronize between tabs in this browser using local storage. Cross-device delivery, authenticated identity, and secure audit persistence require a shared backend. No SMS or phone notification is sent. Unacknowledged alerts escalate after {Math.round(ACKNOWLEDGEMENT_TIMEOUT_MS / 1000)} seconds to the demo operations administrator.
          </div>
        </div>
      )}
        </>
      )}
    </>
  );
};

export default PatientEmergencyAlertSystem;
