# ResQ Twin — Role workflows and Patient Emergency Alerts

## Receptionist: Patient In / Patient Out
- Register patient name, age, mobile, reported symptoms, emergency type, priority and department.
- The receptionist does not enter doctor or nurse names. The app assigns the first on-duty doctor and nurse for that department, then falls back to on-duty staff if needed. If no staff are on duty, the record explicitly shows that an administrator must review the assignment.
- Search patient records, view arrival time and status, and record Patient Out / checkout.
- The receptionist does not manage the staff roster.

## Doctor
- Patient list is filtered to records assigned to the signed-in doctor name.
- Use the Patient Emergency Alerts panel to receive and manage alerts assigned to the doctor's account.

## Nurse
- Patient list is filtered to records assigned to the signed-in nurse name.
- Use the red Emergency — Alert Doctor button to raise a patient medical emergency.

## Administrator
- Manages doctor/nurse department and shift assignments, on-duty status, department snapshot and patient records.
- Configured staff assignments are used by patient registration and emergency routing.

## Patient emergency alert scope
Only patient medical emergencies inside the hospital are part of this feature. The alert lifecycle is SENT, DELIVERED, ACKNOWLEDGED, RESPONDING, RESOLVED and ESCALATED. The doctor must explicitly acknowledge; opening an alert does not acknowledge it.

## Prototype limits — read before demonstration
This project currently uses browser localStorage as demo persistence. It can sync browser tabs on the same origin, but does not provide secure multi-device delivery. Timeout escalation runs only while the relevant app is open. There is no real SMS, phone, or push notification provider integrated. Login is a frontend demo and is not production authentication. Use synthetic data only; do not use this prototype for real patient care.

## Run
1. Extract the ZIP and open the project folder in VS Code.
2. Run `npm install`.
3. Run `npm run dev` and open the local URL shown in the terminal.
4. For a production-like multi-device demonstration, add a shared backend with authenticated users, database-backed assignments and alerts, real-time delivery, and server-side escalation.
