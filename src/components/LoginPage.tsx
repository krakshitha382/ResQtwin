import React, { useState } from 'react';
import { Eye, EyeOff, LockKeyhole, UserRound } from 'lucide-react';
import './LoginPage.css';

export type StaffRole = 'Doctor' | 'Nurse' | 'Security' | 'Receptionist' | 'Administrator';
export interface StaffUser { name: string; role: StaffRole; staffId: string; signedInAt: string; }
interface LoginPageProps { onLogin: (user: StaffUser, remember: boolean) => void; }
const roles: StaffRole[] = ['Doctor', 'Nurse', 'Security', 'Receptionist', 'Administrator'];

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [staffId, setStaffId] = useState('');
  const [role, setRole] = useState<StaffRole>('Doctor');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    const identity = staffId.trim();
    if (!identity) { setError('Enter your full name or staff ID.'); return; }
    if (identity.length < 2) { setError('Enter at least 2 characters.'); return; }
    if (!password.trim()) { setError('Enter your password.'); return; }
    setBusy(true);
    window.setTimeout(() => {
      onLogin({ name: identity.replace(/\s+/g, ' '), role, staffId: identity, signedInAt: new Date().toISOString() }, remember);
      setBusy(false);
    }, 150);
  };

  return (
    <div className="rq-login-shell">
      <main className="rq-login-card" aria-labelledby="rq-login-title">
        <div className="rq-login-brand">
          <div className="rq-brand-mark" aria-hidden="true">RQ</div>
          <div className="rq-brand-name">ResQ <span>Twin</span></div>
        </div>
        <div className="rq-login-eyebrow"><span className="rq-live-dot" /> SECURE STAFF ACCESS</div>
        <h1 id="rq-login-title">Welcome back</h1>
        <p className="rq-panel-description">Sign in to open your ResQ Twin workspace.</p>
        <form onSubmit={submit} noValidate>
          <label className="rq-field-label" htmlFor="rq-staff">Full name or Staff ID</label>
          <div className="rq-input-wrap">
            <UserRound size={18} aria-hidden="true" />
            <input id="rq-staff" autoComplete="username" value={staffId} onChange={e => setStaffId(e.target.value)} placeholder="Enter your name or staff ID" />
          </div>
          <label className="rq-field-label" htmlFor="rq-role">Role</label>
          <div className="rq-select-wrap">
            <select id="rq-role" value={role} onChange={e => setRole(e.target.value as StaffRole)}>
              {roles.map(item => <option key={item} value={item}>{item}</option>)}
            </select>
            <span aria-hidden="true">⌄</span>
          </div>
          <label className="rq-field-label" htmlFor="rq-password">Password</label>
          <div className="rq-input-wrap">
            <LockKeyhole size={18} aria-hidden="true" />
            <input id="rq-password" type={showPassword ? 'text' : 'password'} autoComplete="current-password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter your password" />
            <button className="rq-show-password" type="button" onClick={() => setShowPassword(v => !v)} aria-label={showPassword ? 'Hide password' : 'Show password'}>{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button>
          </div>
          <div className="rq-form-options">
            <label className="rq-remember"><input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)} /><span>Remember me</span></label>
          </div>
          {error && <div className="rq-form-error" role="alert">{error}</div>}
          <button className="rq-signin-button" type="submit" disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</button>
        </form>
        <p className="rq-login-footer"><LockKeyhole size={12} aria-hidden="true" /> Secure access for authorised hospital staff</p>
      </main>
    </div>
  );
};
