# ResQ Twin — Doctor broadcast and patient completion timer

## Changes in this update

- A nurse emergency is routed using the existing floor/room department mapping, and the alert is also broadcast to the configured demo doctor pool.
- Every configured demo doctor can see an unclaimed alert in the Doctor workspace. The first doctor to acknowledge claims the alert; subsequent doctors cannot claim it after the status changes.
- The existing acknowledgement timeout escalates unacknowledged alerts to the demo operations administrator. The alert remains visible to the doctor pool so another available doctor can acknowledge it.
- After a response task is marked complete, the doctor can select **PATIENT CHECK-UP DONE · STOP TIMER**. This records `patientDoneAt`, marks the alert `RESOLVED`, freezes elapsed time at that exact timestamp, and removes response actions.
- The nurse can then separately select **CLOSE EMERGENCY**. This preserves the distinction between patient check-up completion and nurse closure.
- Completed history displays the frozen elapsed duration.

## Run

```bash
npm install
npm run dev
```

## Prototype limitations

This implementation uses browser localStorage and browser-tab events. It is a same-browser demonstration, not cross-device delivery. For separate computers, configure a shared backend (for example Supabase Auth, database tables, RLS and Realtime). The doctor selector is a demo identity selector, not secure authentication. Escalation is evaluated while a nurse or doctor workspace is open. This is a synthetic-data hackathon prototype, not a clinically validated or real patient-care system.
