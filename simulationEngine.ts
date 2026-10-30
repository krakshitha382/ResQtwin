import { EmergencyScenario } from '../types';

export interface InterventionOptions {
  extraStaff: boolean;
  surgeIcuBeds: boolean;
  divertNonCritical: boolean;
}

export interface SimulationResult {
  patientsArrived: number;
  avgWaitMinutes: number;
  criticalBottlenecks: number;
  erBedsOccupied: number;
  erBedsTotal: number;
  icuBedsOccupied: number;
  icuBedsTotal: number;
  otRoomsOccupied: number;
  otRoomsTotal: number;
  staffOnDuty: number;
  staffTotal: number;
  bloodUnits: number;
  bloodTotal: number;
  statusBadge: string;
  bottlenecksList: string[];
}

export function runSimulationCalculation(
  scenario: EmergencyScenario,
  interventions: InterventionOptions
): SimulationResult {
  let patients = scenario.patientsArrived;
  let waitMinutes = scenario.avgWaitMinutes;
  let bottlenecks = scenario.criticalBottlenecks;

  let erBedsOcc = scenario.resources.erBeds.current;
  const erBedsTot = scenario.resources.erBeds.total;

  let icuBedsOcc = scenario.resources.icuBeds.current;
  let icuBedsTot = scenario.resources.icuBeds.total;

  let otRoomsOcc = scenario.resources.otRooms.current;
  const otRoomsTot = scenario.resources.otRooms.total;

  let staffDuty = scenario.resources.staff.current;
  let staffTot = scenario.resources.staff.total;

  let blood = scenario.resources.bloodUnits.current;
  const bloodTot = scenario.resources.bloodUnits.total;

  const bottlenecksList: string[] = [];

  // Apply interventions
  if (interventions.extraStaff) {
    staffDuty = Math.min(staffTot + 15, staffDuty + 15);
    staffTot += 15;
    waitMinutes = Math.max(12, Math.round(waitMinutes * 0.7));
  }

  if (interventions.surgeIcuBeds) {
    icuBedsTot += 8;
    bottlenecks = Math.max(0, bottlenecks - 1);
  }

  if (interventions.divertNonCritical) {
    patients = Math.round(patients * 0.72);
    erBedsOcc = Math.max(8, Math.round(erBedsOcc * 0.75));
    waitMinutes = Math.max(10, Math.round(waitMinutes * 0.65));
    bottlenecks = Math.max(0, bottlenecks - 1);
  }

  // Assess bottlenecks
  if (erBedsOcc / erBedsTot >= 0.85) {
    bottlenecksList.push('Emergency Bay triage saturation (>85% capacity)');
  }
  if (icuBedsOcc / icuBedsTot >= 0.85) {
    bottlenecksList.push('ICU ventilator and telemetry shortage');
  }
  if (otRoomsOcc / otRoomsTot >= 0.8) {
    bottlenecksList.push('Operating theatre queue delay for non-scheduled trauma');
  }
  if (blood / bloodTot < 0.45) {
    bottlenecksList.push('O-negative blood bank critical reserve threshold');
  }

  let statusBadge = scenario.highLoadMessage;
  if (interventions.extraStaff && interventions.surgeIcuBeds) {
    statusBadge = 'Stabilized | Surge Protocol Active';
  } else if (interventions.divertNonCritical) {
    statusBadge = 'Controlled Load | Triage Diversion Active';
  }

  return {
    patientsArrived: patients,
    avgWaitMinutes: waitMinutes,
    criticalBottlenecks: Math.max(bottlenecksList.length, bottlenecks),
    erBedsOccupied: erBedsOcc,
    erBedsTotal: erBedsTot,
    icuBedsOccupied: icuBedsOcc,
    icuBedsTotal: icuBedsTot,
    otRoomsOccupied: otRoomsOcc,
    otRoomsTotal: otRoomsTot,
    staffOnDuty: staffDuty,
    staffTotal: staffTot,
    bloodUnits: blood,
    bloodTotal: bloodTot,
    statusBadge,
    bottlenecksList,
  };
}

