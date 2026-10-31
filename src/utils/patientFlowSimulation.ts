import type { EmergencyScenario } from '../types';

export interface FlowConfig {
  durationMinutes: number;
  patientsArrived: number;
  erBeds: number;
  erOccupied: number;
  icuBeds: number;
  icuOccupied: number;
  wardBeds: number;
  wardOccupied: number;
  doctors: number;
  nurses: number;
  treatmentCapacityPerHour: number;
  dischargeCapacityPerHour: number;
  treatmentMinutes: number;
  dischargeMinutes: number;
  icuPercent: number;
  wardPercent: number;
  dischargePercent: number;
  waitThresholdMinutes: number;
}

export interface FlowPatient {
  id: string;
  arrivalMinute: number;
  category: string;
  severity: 1 | 2 | 3;
  treatmentMinutes: number;
  destination: 'icu' | 'ward' | 'discharge';
  status: 'waiting-er' | 'treatment' | 'waiting-icu' | 'waiting-ward' | 'icu' | 'ward' | 'discharge-queue' | 'discharged';
  statusSince: number;
  erEnteredAt: number | null;
  erExitedAt: number | null;
  treatmentStartedAt: number | null;
  completedAt: number | null;
}

export interface FlowResult {
  seed: number;
  durationMinutes: number;
  patientsArrived: number;
  patientsTreated: number;
  patientsDischarged: number;
  transferredIcu: number;
  transferredWard: number;
  waitingTreatment: number;
  waitingIcu: number;
  waitingWard: number;
  blockedInEr: number;
  patientsStillWaiting: number;
  averageWaitingMinutes: number;
  averageSystemMinutes: number;
  averageTransferWaitMinutes: number;
  maxErQueue: number;
  erUtilization: number;
  icuUtilization: number;
  wardUtilization: number;
  treatmentUtilization: number;
  dischargeUtilization: number;
  overThreshold: number;
  averageErOccupancy: number;
  arrivalRatePerHour: number;
  averageErTimeHours: number;
  littleLawPredictedOccupancy: number;
  littleLawDifference: number;
  littleLawRelativeDifference: number | null;
  unstable: boolean;
  primaryBottleneck: string;
  evidence: string[];
  recommendation: string;
  patients: FlowPatient[];
  stageCounts: { incoming: number; er: number; treatment: number; icuQueue: number; wardQueue: number; icu: number; ward: number; discharge: number; completed: number };
}

export interface RunStats {
  mean: number; min: number; max: number; standardDeviation: number; median: number;
  confidenceInterval95: [number, number] | null;
}
export type FlowMetric = 'patientsArrived' | 'patientsTreated' | 'patientsDischarged' | 'waitingTreatment' | 'waitingIcu' | 'waitingWard' | 'blockedInEr' | 'averageWaitingMinutes' | 'averageSystemMinutes' | 'maxErQueue' | 'icuUtilization' | 'wardUtilization' | 'erUtilization' | 'overThreshold';

export const DEFAULT_FLOW_CONFIG: FlowConfig = {
  durationMinutes: 480, patientsArrived: 28, erBeds: 30, erOccupied: 0, icuBeds: 30, icuOccupied: 0, wardBeds: 90, wardOccupied: 0, doctors: 12, nurses: 18,
  treatmentCapacityPerHour: 12, dischargeCapacityPerHour: 8, treatmentMinutes: 35,
  dischargeMinutes: 20, icuPercent: 20, wardPercent: 45, dischargePercent: 35, waitThresholdMinutes: 60,
};

const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, Number.isFinite(n) ? n : min));
function rng(seed: number) {
  let state = seed >>> 0;
  return () => { state = (state * 1664525 + 1013904223) >>> 0; return state / 4294967296; };
}
function gaussian(random: () => number) {
  const u = Math.max(random(), 1e-9); const v = Math.max(random(), 1e-9);
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}
function percentile(values: number[], p: number) {
  const sorted = [...values].sort((a, b) => a - b);
  if (!sorted.length) return 0;
  const index = (sorted.length - 1) * p; const low = Math.floor(index); const high = Math.ceil(index);
  return sorted[low] + (sorted[high] - sorted[low]) * (index - low);
}

export function normalizeFlowConfig(config: FlowConfig): FlowConfig {
  const icu = clamp(config.icuPercent, 0, 100); const ward = clamp(config.wardPercent, 0, 100 - icu);
  return {
    durationMinutes: clamp(Math.round(config.durationMinutes), 60, 1440), patientsArrived: clamp(Math.round(config.patientsArrived), 0, 1000),
    erBeds: clamp(Math.round(config.erBeds), 0, 500), erOccupied: clamp(Math.round(config.erOccupied), 0, clamp(Math.round(config.erBeds), 0, 500)),
    icuBeds: clamp(Math.round(config.icuBeds), 0, 500), icuOccupied: clamp(Math.round(config.icuOccupied), 0, clamp(Math.round(config.icuBeds), 0, 500)),
    wardBeds: clamp(Math.round(config.wardBeds), 0, 2000), wardOccupied: clamp(Math.round(config.wardOccupied), 0, clamp(Math.round(config.wardBeds), 0, 2000)), doctors: clamp(Math.round(config.doctors), 0, 500),
    nurses: clamp(Math.round(config.nurses), 0, 1000), treatmentCapacityPerHour: clamp(config.treatmentCapacityPerHour, 0, 300),
    dischargeCapacityPerHour: clamp(config.dischargeCapacityPerHour, 0, 300), treatmentMinutes: clamp(config.treatmentMinutes, 5, 240),
    dischargeMinutes: clamp(config.dischargeMinutes, 1, 180), icuPercent: icu, wardPercent: ward,
    dischargePercent: Math.max(0, 100 - icu - ward), waitThresholdMinutes: clamp(config.waitThresholdMinutes, 1, 1440),
  };
}

export function configFromScenario(scenario: EmergencyScenario): FlowConfig {
  const staff = scenario.resources.staff.current;
  // The existing mock floor data defines the general ward as 68 occupied of 90 beds.
  return normalizeFlowConfig({ ...DEFAULT_FLOW_CONFIG, patientsArrived: scenario.patientsArrived, erBeds: scenario.resources.erBeds.total, erOccupied: scenario.resources.erBeds.current,
    icuBeds: scenario.resources.icuBeds.total, icuOccupied: scenario.resources.icuBeds.current, wardBeds: 90, wardOccupied: 68, doctors: Math.max(1, Math.round(staff * 0.4)),
    nurses: Math.max(1, Math.round(staff * 0.6)), treatmentCapacityPerHour: Math.max(1, Math.round(staff / 3)),
    icuPercent: scenario.id === 'cardiac-emergency' ? 35 : scenario.id === 'stroke-emergency' ? 30 : 20,
    wardPercent: 45, dischargePercent: 0 });
}

export function runPatientFlowSimulation(scenario: EmergencyScenario, rawConfig: FlowConfig, seed = 1): FlowResult {
  const config = normalizeFlowConfig(rawConfig); const random = rng(seed);
  const totalArrivals = config.patientsArrived;
  const patients: FlowPatient[] = [];
  const arrivalsByMinute = new Map<number, FlowPatient[]>();
  const categories = ['trauma', 'medical', 'urgent'];
  for (let i = 0; i < totalArrivals; i++) {
    const arrivalMinute = Math.min(config.durationMinutes - 1, Math.floor(random() * config.durationMinutes));
    const destinationRoll = random() * 100;
    const destination = destinationRoll < config.icuPercent ? 'icu' : destinationRoll < config.icuPercent + config.wardPercent ? 'ward' : 'discharge';
    const severity = (random() < 0.18 ? 3 : random() < 0.55 ? 2 : 1) as 1 | 2 | 3;
    const treatmentMinutes = clamp(Math.round(config.treatmentMinutes * (1 + gaussian(random) * 0.22) * (severity === 3 ? 1.35 : severity === 1 ? 0.8 : 1)), 5, 240);
    const patient: FlowPatient = { id: `P-${seed}-${i + 1}`, arrivalMinute, category: categories[Math.floor(random() * categories.length)], severity, treatmentMinutes, destination,
      status: 'waiting-er', statusSince: arrivalMinute, erEnteredAt: null, erExitedAt: null, treatmentStartedAt: null, completedAt: null };
    patients.push(patient); const list = arrivalsByMinute.get(arrivalMinute) ?? []; list.push(patient); arrivalsByMinute.set(arrivalMinute, list);
  }

  const er: FlowPatient[] = []; const treatment: FlowPatient[] = []; const icuQueue: FlowPatient[] = []; const wardQueue: FlowPatient[] = [];
  const icu: { patient: FlowPatient; releaseAt: number }[] = []; const ward: { patient: FlowPatient; releaseAt: number }[] = [];
  const dischargeQueue: FlowPatient[] = []; const outsideQueue: FlowPatient[] = [];
  const treatmentCompletion = new Map<string, number>();
  const activeTreatment: FlowPatient[] = [];
  let icuOccupancyArea = 0; let wardOccupancyArea = 0;
  let treated = 0; let discharged = 0; let transferredIcu = 0; let transferredWard = 0;
  let maxErQueue = 0; let erOccupancyArea = 0; let erOccupiedMinutes = 0; let treatmentBusyMinutes = 0; let dischargeBusyMinutes = 0;
  const completedWaits: number[] = []; const completedSystem: number[] = []; const transferWaits: number[] = [];
  const treatmentSlots = Math.floor(config.treatmentCapacityPerHour / 60 * 60); // capacity is patients/hour; admission below uses fractional accumulator
  let treatmentCredit = 0; let dischargeCredit = 0;
  const treatmentCapacity = Math.min(config.treatmentCapacityPerHour, config.doctors * 2, config.nurses * 1.5, (60 * Math.min(config.doctors, config.nurses)) / config.treatmentMinutes);
  const dischargeCapacity = Math.min(config.dischargeCapacityPerHour, (60 * config.nurses) / config.dischargeMinutes);

  for (let minute = 0; minute < config.durationMinutes; minute++) {
    // Release destination beds and process destination discharge.
    for (let i = icu.length - 1; i >= 0; i--) if (icu[i].releaseAt <= minute) { const [item] = icu.splice(i, 1); item.patient.status = 'discharge-queue'; item.patient.statusSince = minute; dischargeQueue.push(item.patient); }
    for (let i = ward.length - 1; i >= 0; i--) if (ward[i].releaseAt <= minute) { const [item] = ward.splice(i, 1); item.patient.status = 'discharge-queue'; item.patient.statusSince = minute; dischargeQueue.push(item.patient); }

    // Destination transfers are only permitted when the matching bed exists.
    while (icuQueue.length && icu.length + config.icuOccupied < config.icuBeds) { const p = icuQueue.shift()!; er.splice(er.indexOf(p), 1); p.erExitedAt = minute; transferWaits.push(minute - p.statusSince); p.status = 'icu'; p.statusSince = minute; transferredIcu++; icu.push({ patient: p, releaseAt: minute + 240 + Math.round(random() * 180) }); }
    while (wardQueue.length && ward.length + config.wardOccupied < config.wardBeds) { const p = wardQueue.shift()!; er.splice(er.indexOf(p), 1); p.erExitedAt = minute; transferWaits.push(minute - p.statusSince); p.status = 'ward'; p.statusSince = minute; transferredWard++; ward.push({ patient: p, releaseAt: minute + 300 + Math.round(random() * 240) }); }

    // Arrivals enter ER only if a physical ER bed is free.
    for (const p of arrivalsByMinute.get(minute) ?? []) {
      if (er.length + config.erOccupied < config.erBeds) { p.status = 'waiting-er'; p.erEnteredAt = minute; er.push(p); treatment.push(p); }
      else outsideQueue.push(p);
    }
    // Move waiting outside patients into ER as capacity opens.
    while (outsideQueue.length && er.length + config.erOccupied < config.erBeds) { const p = outsideQueue.shift()!; p.status = 'waiting-er'; p.statusSince = minute; p.erEnteredAt = minute; er.push(p); treatment.push(p); }

    // Treatment service capacity is rate-limited and each patient consumes staff/time.
    treatmentCredit += treatmentCapacity / 60;
    let starts = Math.floor(treatmentCredit); treatmentCredit -= starts;
    while (starts > 0 && treatment.length) {
      const p = treatment.shift()!; p.status = 'treatment'; p.statusSince = minute; p.treatmentStartedAt = minute;
      const finish = minute + p.treatmentMinutes;
      // Schedule completion by storing a non-enumerable local completion map.
      treatmentCompletion.set(p.id, finish); activeTreatment.push(p); starts--;
    }
    for (let i = activeTreatment.length - 1; i >= 0; i--) {
      const p = activeTreatment[i]; if ((treatmentCompletion.get(p.id) ?? Infinity) <= minute) {
        activeTreatment.splice(i, 1); treatmentCompletion.delete(p.id); treated++;
        if (p.destination === 'icu') { p.status = 'waiting-icu'; p.statusSince = minute; icuQueue.push(p); }
        else if (p.destination === 'ward') { p.status = 'waiting-ward'; p.statusSince = minute; wardQueue.push(p); }
        else { p.status = 'discharge-queue'; p.statusSince = minute; dischargeQueue.push(p); }
      }
    }

    dischargeCredit += dischargeCapacity / 60;
    let discharges = Math.floor(dischargeCredit); dischargeCredit -= discharges;
    while (discharges > 0 && dischargeQueue.length) {
      const p = dischargeQueue.shift()!; const fromEr = er.indexOf(p);
      if (fromEr >= 0) { er.splice(fromEr, 1); p.erExitedAt = minute; }
      p.status = 'discharged'; p.completedAt = minute; discharged++;
      const start = p.arrivalMinute; completedSystem.push(minute - start); completedWaits.push(Math.max(0, (p.erEnteredAt ?? minute) - start));
      discharges--;
    }

    // ER patients blocked on transfer continue occupying ER beds; record queues and occupancy.
    const occupied = er.length; erOccupancyArea += occupied + config.erOccupied; if (occupied > 0) erOccupiedMinutes++;
    icuOccupancyArea += icu.length + config.icuOccupied; wardOccupancyArea += ward.length + config.wardOccupied;
    maxErQueue = Math.max(maxErQueue, treatment.length + icuQueue.length + wardQueue.length + outsideQueue.length);
    treatmentBusyMinutes += activeTreatment.length; dischargeBusyMinutes += dischargeQueue.length;
  }

  // Keep unfinished patients visible and include censored time through the simulation horizon.
  const remaining = patients.filter(p => p.status !== 'discharged');
  const waitingTreatment = treatment.length + outsideQueue.length;
  const blockedInEr = icuQueue.length + wardQueue.length;
  const avgSystem = patients.length ? patients.reduce((sum,p)=>sum + (p.completedAt ?? config.durationMinutes) - p.arrivalMinute,0) / patients.length : 0;
  const admitted = patients.filter(p => p.erEnteredAt !== null).length;
  const averageErTime = patients.filter(p => p.erEnteredAt !== null).reduce((sum,p)=>sum + (p.erExitedAt ?? config.durationMinutes) - (p.erEnteredAt ?? config.durationMinutes),0) / Math.max(1, admitted);
  const arrivalRate = admitted / (config.durationMinutes / 60);
  const predicted = arrivalRate * (averageErTime / 60);
  const observed = Math.max(0, erOccupancyArea / config.durationMinutes - config.erOccupied);
  const diff = observed - predicted;
  const erUtil = config.erBeds ? Math.round((erOccupancyArea / config.durationMinutes) / config.erBeds * 100) : (observed > 0 ? 100 : 0);
  const icuUtil = config.icuBeds ? Math.round((icuOccupancyArea / config.durationMinutes) / config.icuBeds * 100) : (transferredIcu ? 100 : 0);
  const wardUtil = config.wardBeds ? Math.round((wardOccupancyArea / config.durationMinutes) / config.wardBeds * 100) : (transferredWard ? 100 : 0);
  const waitValues = patients.map(p => p.treatmentStartedAt === null ? config.durationMinutes - p.arrivalMinute : p.treatmentStartedAt - p.arrivalMinute);
  const averageWaiting = waitValues.length ? waitValues.reduce((a,b)=>a+b,0)/waitValues.length : 0;
  const overThreshold = waitValues.filter(v => v > config.waitThresholdMinutes).length;
  const transferWait = transferWaits.length ? transferWaits.reduce((a,b)=>a+b,0)/transferWaits.length : 0;
  const evidence: string[] = []; let primary = 'No significant bottleneck detected'; let recommendation = 'Continue monitoring patient flow and resource utilization.';
  if (icuQueue.length > 0 && (config.icuBeds === 0 || icu.length >= config.icuBeds)) { primary = 'ICU capacity'; evidence.push(`${icuQueue.length} patients are waiting for ICU transfer.`); evidence.push(`${icu.length} of ${config.icuBeds} ICU beds are occupied.`); recommendation = 'Review ICU discharge throughput and consider safely staffed surge ICU capacity.'; }
  else if (wardQueue.length > 0 && (config.wardBeds === 0 || ward.length >= config.wardBeds)) { primary = 'General ward capacity'; evidence.push(`${wardQueue.length} patients are waiting for general ward transfer.`); evidence.push(`${ward.length} of ${config.wardBeds} ward beds are occupied.`); recommendation = 'Review ward discharge flow and staffed ward capacity.'; }
  else if (treatment.length > 0 && treatmentCapacity <= 0) { primary = 'Treatment staffing / capacity'; evidence.push(`${treatment.length} patients are waiting for treatment while treatment capacity is zero.`); recommendation = 'Increase staffed treatment capacity and review clinician availability.'; }
  else if (dischargeQueue.length > 0 && dischargeCapacity <= 0) { primary = 'Discharge processing'; evidence.push(`${dischargeQueue.length} patients are waiting for discharge processing.`); recommendation = 'Increase discharge coordination capacity and reduce avoidable discharge delays.'; }
  else if (outsideQueue.length > 0 || erUtil >= 95) { primary = 'Emergency department bed capacity'; evidence.push(`${outsideQueue.length} patients are waiting for an ER bed.`); evidence.push(`Average ER bed utilization is ${erUtil}%.`); recommendation = 'Review ER bed turnover and downstream transfer delays.'; }
  else if (treatment.length > 0) { primary = 'Treatment processing'; evidence.push(`${treatment.length} patients are waiting for treatment.`); evidence.push(`Treatment service capacity is ${treatmentCapacity.toFixed(1)} patients/hour.`); recommendation = 'Review treatment staffing and treatment throughput.'; }
  else if (dischargeQueue.length > 0) { primary = 'Discharge processing'; evidence.push(`${dischargeQueue.length} patients are waiting for discharge processing.`); recommendation = 'Increase discharge processing capacity.'; }
  if (!evidence.length) evidence.push('No sustained queue or full-capacity constraint was observed in this run.');
  return { seed, durationMinutes: config.durationMinutes, patientsArrived: patients.length, patientsTreated: treated + activeTreatment.length,
    patientsDischarged: discharged, transferredIcu, transferredWard, waitingTreatment, waitingIcu: icuQueue.length, waitingWard: wardQueue.length,
    blockedInEr, patientsStillWaiting: remaining.length, averageWaitingMinutes: averageWaiting, averageSystemMinutes: avgSystem,
    averageTransferWaitMinutes: transferWait, maxErQueue, erUtilization: clamp(erUtil,0,100), icuUtilization: clamp(icuUtil,0,100), wardUtilization: clamp(wardUtil,0,100),
    treatmentUtilization: clamp(Math.round(treatmentBusyMinutes / (config.durationMinutes * Math.max(1,treatmentCapacity)) * 60),0,100),
    dischargeUtilization: clamp(Math.round(dischargeBusyMinutes / (config.durationMinutes * Math.max(1,dischargeCapacity)) * 60),0,100),
    overThreshold, averageErOccupancy: observed, arrivalRatePerHour: arrivalRate, averageErTimeHours: averageErTime/60,
    littleLawPredictedOccupancy: predicted, littleLawDifference: diff, littleLawRelativeDifference: Math.abs(predicted) > 1e-9 ? Math.abs(diff)/predicted*100 : 0,
    unstable: remaining.length > Math.max(2, patients.length*0.1), primaryBottleneck: primary, evidence, recommendation,
    patients, stageCounts: { incoming: outsideQueue.length, er: er.length, treatment: treatment.length + activeTreatment.length, icuQueue: icuQueue.length, wardQueue: wardQueue.length, icu: icu.length, ward: ward.length, discharge: dischargeQueue.length, completed: discharged } };
}

export function runRepeatedSimulations(scenario: EmergencyScenario, config: FlowConfig, runs = 30, seed = 2026): FlowResult[] {
  const safeRuns = clamp(Math.round(runs), 1, 100); return Array.from({ length: safeRuns }, (_, index) => runPatientFlowSimulation(scenario, config, seed + index * 7919));
}

export function summarizeMetric(values: number[]): RunStats {
  if (!values.length) return { mean:0,min:0,max:0,standardDeviation:0,median:0,confidenceInterval95:null };
  const mean = values.reduce((a,b)=>a+b,0)/values.length; const variance = values.reduce((s,v)=>s+(v-mean)**2,0)/values.length;
  const sd = Math.sqrt(variance); const sorted = [...values].sort((a,b)=>a-b); const median = percentile(sorted,0.5);
  const margin = values.length > 1 ? 1.96 * sd / Math.sqrt(values.length) : 0;
  return { mean, min:sorted[0], max:sorted[sorted.length-1], standardDeviation:sd, median, confidenceInterval95: values.length > 1 ? [mean-margin,mean+margin] : null };
}

export function compareInterventionRuns(scenario: EmergencyScenario, baseline: FlowConfig, intervention: FlowConfig, runs=30, seed=2026) {
  const baselineRuns = runRepeatedSimulations(scenario, baseline, runs, seed);
  const interventionRuns = runRepeatedSimulations(scenario, intervention, runs, seed);
  const metrics: FlowMetric[] = ['waitingTreatment','waitingIcu','waitingWard','blockedInEr','averageWaitingMinutes','icuUtilization','wardUtilization','erUtilization','patientsTreated','overThreshold'];
  return { baselineRuns, interventionRuns, comparison: metrics.map(metric => ({ metric, baseline: summarizeMetric(baselineRuns.map(r=>r[metric])), intervention: summarizeMetric(interventionRuns.map(r=>r[metric])) })) };
}
