import type { EmergencyScenario, HospitalCandidate } from '../types';

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

// New comparison simulator types

export interface CrisisInterventions {
  additionalIcuBeds: number;
  additionalDoctors: number;
  additionalNurses: number;
  surgeBeds: number;
  ambulancesDiverted: number;
}

export interface ResourceSnapshot {
  erBeds: { occupied: number; total: number };
  icuBeds: { occupied: number; total: number };
  surgeBeds: { occupied: number; total: number };
  otRooms: { occupied: number; total: number };
  doctors: { available: number; total: number };
  nurses: { available: number; total: number };
  bloodUnits: { available: number; total: number };
}

export interface CrisisSimulationResult {
  scenarioId: string;
  patientsArrived: number;
  patientsServed: number;
  patientsWaiting: number;
  avgWaitMinutes: number;
  icuUtilization: number;
  erUtilization: number;
  otUtilization: number;
  doctorAvailability: number;
  nurseAvailability: number;
  bloodAvailability: number;
  bottlenecks: string[];
  status: 'Stable' | 'High Load' | 'Critical';
  resources: ResourceSnapshot;
  assumptions: string[];
}

export interface CrisisComparison {
  baseline: CrisisSimulationResult;
  improved: CrisisSimulationResult;
  divertedPatients: number;
  divertedHospitalNames: string[];
}

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

function makeResourceSnapshot(
  scenario: EmergencyScenario,
  interventions: CrisisInterventions
): ResourceSnapshot {
  const staff = scenario.resources.staff;

  // Existing total staff is not split by profession in the source data.
  // The initial doctor/nurse split is therefore an explicit prototype assumption.
  const initialDoctors = Math.floor(staff.current * 0.4);
  const initialNurses = staff.current - initialDoctors;

  const erTotal = scenario.resources.erBeds.total;
  const erOccupied = scenario.resources.erBeds.current;

  const icuTotal =
    scenario.resources.icuBeds.total +
    interventions.additionalIcuBeds;

  const surgeTotal = interventions.surgeBeds;

  const surgeOccupied = 0;

  return {
    erBeds: {
      occupied: erOccupied,
      total: erTotal,
    },
    icuBeds: {
      occupied: scenario.resources.icuBeds.current,
      total: icuTotal,
    },
    surgeBeds: {
      occupied: surgeOccupied,
      total: surgeTotal,
    },
    otRooms: {
      occupied: scenario.resources.otRooms.current,
      total: scenario.resources.otRooms.total,
    },
    doctors: {
      available: initialDoctors + interventions.additionalDoctors,
      total: initialDoctors + interventions.additionalDoctors,
    },
    nurses: {
      available: initialNurses + interventions.additionalNurses,
      total: initialNurses + interventions.additionalNurses,
    },
    bloodUnits: {
      available: scenario.resources.bloodUnits.current,
      total: scenario.resources.bloodUnits.total,
    },
  };
}

export function runCrisisSimulation(
  scenario: EmergencyScenario,
  interventions: CrisisInterventions
): CrisisSimulationResult {
  const safeInterventions: CrisisInterventions = {
    additionalIcuBeds: clamp(interventions.additionalIcuBeds, 0, 50),
    additionalDoctors: clamp(interventions.additionalDoctors, 0, 50),
    additionalNurses: clamp(interventions.additionalNurses, 0, 80),
    surgeBeds: clamp(interventions.surgeBeds, 0, 50),
    ambulancesDiverted: clamp(interventions.ambulancesDiverted, 0, scenario.patientsArrived),
  };

  const resources = makeResourceSnapshot(scenario, safeInterventions);

  const patientsArrived = Math.max(
    0,
    scenario.patientsArrived - safeInterventions.ambulancesDiverted
  );

  // These are transparent prototype assumptions, not clinical predictions.
  const assumptions = [
    'Doctor and nurse baseline split is estimated as 40% doctors and 60% nurses because the source data provides combined staff only.',
    'One staffed bed is assumed to accommodate one patient during this simulation window.',
    'Each doctor is assumed to support four patients during the simulation window.',
    'Each nurse is assumed to support two patients during the simulation window.',
    'Surge beds are assumed to be available but unoccupied until demand is assigned.',
    'Waiting time is a capacity-based estimate, not a measured clinical waiting time.',
  ];

  const totalBeds =
    resources.erBeds.total +
    resources.icuBeds.total +
    resources.surgeBeds.total;

  const occupiedBeds =
    resources.erBeds.occupied +
    resources.icuBeds.occupied +
    resources.surgeBeds.occupied;

  const freeBeds = Math.max(0, totalBeds - occupiedBeds);

  const doctorCapacity = resources.doctors.available * 4;
  const nurseCapacity = resources.nurses.available * 2;

  const staffCapacity = Math.min(doctorCapacity, nurseCapacity);

  const otCapacity = Math.max(
    0,
    resources.otRooms.total - resources.otRooms.occupied
  );

  const estimatedDemand = patientsArrived;

  const estimatedCapacity = Math.min(
    freeBeds + otCapacity,
    staffCapacity
  );

  const patientsServed = clamp(
    Math.min(estimatedDemand, estimatedCapacity),
    0,
    estimatedDemand
  );

  const patientsWaiting = Math.max(
    0,
    estimatedDemand - patientsServed
  );

  const resourcePressure = estimatedDemand /
    Math.max(estimatedCapacity, 1);

  const avgWaitMinutes = Math.round(
    scenario.avgWaitMinutes *
    Math.max(0.25, resourcePressure)
  );

  const erUtilization = Math.round(
    resources.erBeds.occupied /
    Math.max(resources.erBeds.total, 1) * 100
  );

  const icuUtilization = Math.round(
    resources.icuBeds.occupied /
    Math.max(resources.icuBeds.total, 1) * 100
  );

  const otUtilization = Math.round(
    resources.otRooms.occupied /
    Math.max(resources.otRooms.total, 1) * 100
  );

  const doctorAvailability = Math.round(
    resources.doctors.available /
    Math.max(resources.doctors.total, 1) * 100
  );

  const nurseAvailability = Math.round(
    resources.nurses.available /
    Math.max(resources.nurses.total, 1) * 100
  );

  const bloodAvailability = Math.round(
    resources.bloodUnits.available /
    Math.max(resources.bloodUnits.total, 1) * 100
  );

  const bottlenecks: string[] = [];

  if (erUtilization >= 85) {
    bottlenecks.push('Emergency department bed capacity is under pressure.');
  }

  if (icuUtilization >= 85) {
    bottlenecks.push('ICU bed capacity is under pressure.');
  }

  if (otUtilization >= 85) {
    bottlenecks.push('Operating theatre availability is limited.');
  }

  if (doctorAvailability < 50) {
    bottlenecks.push('Doctor staffing availability is limited.');
  }

  if (nurseAvailability < 50) {
    bottlenecks.push('Nurse staffing availability is limited.');
  }

  if (bloodAvailability < 45) {
    bottlenecks.push('Blood inventory is below the prototype reserve threshold.');
  }

  if (patientsWaiting > 0) {
    bottlenecks.push(`${patientsWaiting} simulated patients remain waiting.`);
  }

  const status: CrisisSimulationResult['status'] =
    bottlenecks.length >= 3
      ? 'Critical'
      : bottlenecks.length >= 1
      ? 'High Load'
      : 'Stable';

  return {
    scenarioId: scenario.id,
    patientsArrived,
    patientsServed,
    patientsWaiting,
    avgWaitMinutes,
    icuUtilization,
    erUtilization,
    otUtilization,
    doctorAvailability,
    nurseAvailability,
    bloodAvailability,
    bottlenecks,
    status,
    resources,
    assumptions,
  };
}

export function runCrisisComparison(
  scenario: EmergencyScenario,
  interventions: CrisisInterventions,
  hospitals: HospitalCandidate[] = []
): CrisisComparison {
  const baselineInterventions: CrisisInterventions = {
    additionalIcuBeds: 0,
    additionalDoctors: 0,
    additionalNurses: 0,
    surgeBeds: 0,
    ambulancesDiverted: 0,
  };

  const baseline = runCrisisSimulation(
    scenario,
    baselineInterventions
  );

  const diversion = clamp(
    interventions.ambulancesDiverted,
    0,
    scenario.patientsArrived
  );

  // Only hospitals meeting basic availability checks are considered.
  // This prototype does not yet model specialty-specific bed counts.
  const eligibleHospitals = hospitals.filter((hospital) =>
    hospital.status === 'Available' &&
    hospital.icuBedsAvailable > 0
  );

  const eligibleCapacity = eligibleHospitals.reduce(
    (sum, hospital) => sum + hospital.icuBedsAvailable,
    0
  );

  const actualDiversion = Math.min(diversion, eligibleCapacity);

  const improved = runCrisisSimulation(scenario, {
    ...interventions,
    ambulancesDiverted: actualDiversion,
  });

  return {
    baseline,
    improved,
    divertedPatients: actualDiversion,
    divertedHospitalNames: eligibleHospitals.map((hospital) => hospital.name),
  };
}

// Original simulator retained for the existing Simulation page.

export function runSimulationCalculation(
  scenario: EmergencyScenario,
  interventions: InterventionOptions
): SimulationResult {
  let patients = scenario.patientsArrived;
  let waitMinutes = scenario.avgWaitMinutes;

  const erBedsOcc = scenario.resources.erBeds.current;
  const erBedsTot = scenario.resources.erBeds.total;

  const icuBedsOcc = scenario.resources.icuBeds.current;
  let icuBedsTot = scenario.resources.icuBeds.total;

  const otRoomsOcc = scenario.resources.otRooms.current;
  const otRoomsTot = scenario.resources.otRooms.total;

  let staffDuty = scenario.resources.staff.current;
  let staffTot = scenario.resources.staff.total;

  const blood = scenario.resources.bloodUnits.current;
  const bloodTot = scenario.resources.bloodUnits.total;

  if (interventions.extraStaff) {
    staffDuty += 15;
    staffTot += 15;
    waitMinutes = Math.max(12, Math.round(waitMinutes * 0.7));
  }

  if (interventions.surgeIcuBeds) {
    icuBedsTot += 8;
  }

  if (interventions.divertNonCritical) {
    patients = Math.round(patients * 0.72);
    waitMinutes = Math.max(10, Math.round(waitMinutes * 0.65));
  }

  const bottlenecksList: string[] = [];

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

  const statusBadge =
    bottlenecksList.length >= 3
      ? 'Critical | Multiple Resource Bottlenecks'
      : bottlenecksList.length >= 1
      ? 'High Load | Resource Pressure'
      : 'Stable | Resources Within Threshold';

  return {
    patientsArrived: patients,
    avgWaitMinutes: waitMinutes,
    criticalBottlenecks: bottlenecksList.length,
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