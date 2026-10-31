# ResQ Twin — Hospital Emergency Digital Twin

A React + TypeScript + Vite hackathon prototype for exploring synthetic hospital emergency operations. The existing home, hospital 3D view, emergency simulation, ambulance network, and navigation are retained.

## Run locally

```bash
npm install
npm run dev
```

## Build and checks

```bash
npm run build
npm run test:simulation
npm run lint
```

The patient-flow model is in `src/utils/patientFlowSimulation.ts`. The new downstream bottleneck, repeated-run, Little's Law, and intervention analysis panels are integrated beneath the existing Emergency Simulation screen in `src/components/SimulationView/PatientFlowInsights.tsx`.

## Model scope and limitations

The simulator creates synthetic patient records and advances a discrete minute-by-minute model. ER beds remain occupied while a patient waits for treatment or a destination transfer; ICU and general-ward patients are only transferred when the matching destination has capacity. Treatment and discharge throughput are rate-limited by configured staffing and processing times. Repeated runs use deterministic, distinct seeds; paired comparisons reuse the same seed sequence. Little's Law is reported as an ER-boundary finite-horizon estimate and includes right-censored time for unfinished ER stays.

The model is educational and intentionally simplified. It is not validated for clinical operations, real patient routing, staffing, or treatment decisions. The local case interpreter is a keyword-based estimate only; no AI service is connected.

## Patient Emergency Alert System

The global red **EMERGENCY — ALERT DOCTOR** control opens a short patient-only alert form (floor, room, bed, emergency type). A configurable room-to-department mapping assigns a synthetic responsible doctor; unmapped rooms use the configured emergency doctor fallback. Alert lifecycle events and actor timestamps are recorded in an audit trail. Doctors can acknowledge, mark themselves responding, and resolve alerts. Unacknowledged alerts escalate to the demo operations administrator after 60 seconds.

**Important deployment limitation:** this repository has no authentication provider or shared backend. The staff/doctor selector is a local demonstration identity switcher, not authentication or an authorization boundary. Alert records are stored in this browser's local storage and synchronized between tabs in the same browser only. The intended recipient's app view marks an alert delivered when that local session receives and renders it; saving the record alone leaves it in `SENT`. Real cross-device delivery, secure role enforcement, durable audit storage, and server-side escalation require a shared authenticated backend and server-side scheduler. No SMS, phone, or external push message is sent. Do not use this prototype for real patient care.

The local demonstration uses synthetic room mappings in `src/features/patient-emergency/emergencyAlertModel.ts`. Update these mappings and staff IDs when integrating a real hospital directory.

## Doctor emergency response dashboard (demo)

Signing in with the **Doctor** role opens a dedicated emergency-response dashboard. It reads the existing patient-emergency alert records and adds acknowledgement, unable-to-attend with a reason and backup request, explicit backup acceptance/decline, en-route/arrival timestamps, task start/completion notes, elapsed timers, and audit timeline entries. The nurse can close an alert after task completion from the existing emergency inbox.

**Prototype limitations:** alert data currently uses browser `localStorage` and synchronizes only tabs in the same browser profile. It does not provide authenticated cross-device notifications or server-side escalation. The login is demo-only and the doctor identity selector is a demonstration control. Do not use this prototype for real patient care. A shared backend (for example, Supabase Auth, Postgres with RLS, and Realtime) is required for multi-device operation.

To run locally after dependencies install successfully:

```bash
npm install
npm run dev
```

To check the production build:

```bash
npm run build
```
