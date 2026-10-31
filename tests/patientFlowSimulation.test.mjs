import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DEFAULT_FLOW_CONFIG, runPatientFlowSimulation, runRepeatedSimulations,
  summarizeMetric, compareInterventionRuns, normalizeFlowConfig,
} from '../src/utils/patientFlowSimulation.ts';

const scenario = {
  id: 'test-trauma', title: 'Test trauma', patientsArrived: 36, avgWaitMinutes: 30,
  resources: {
    erBeds: { current: 0, total: 12 }, icuBeds: { current: 0, total: 4 },
    staff: { current: 18, total: 20 },
  },
};
const base = { ...DEFAULT_FLOW_CONFIG, durationMinutes: 360, erBeds: 12, erOccupied: 0,
  icuBeds: 4, icuOccupied: 0, wardBeds: 12, wardOccupied: 0, doctors: 8, nurses: 12,
  treatmentCapacityPerHour: 12, dischargeCapacityPerHour: 12, treatmentMinutes: 20,
  dischargeMinutes: 10, icuPercent: 40, wardPercent: 40, dischargePercent: 20 };

test('ICU capacity zero blocks ICU transfers and keeps patients in ER', () => {
  const result = runPatientFlowSimulation(scenario, { ...base, icuBeds: 0 }, 11);
  assert.ok(result.waitingIcu > 0);
  assert.ok(result.blockedInEr > 0);
  assert.match(result.primaryBottleneck, /ICU/i);
});

test('general ward bottleneck is diagnosed when ICU has capacity', () => {
  const result = runPatientFlowSimulation(scenario, { ...base, icuPercent: 0, wardPercent: 100, wardBeds: 0 }, 12);
  assert.ok(result.waitingWard > 0);
  assert.match(result.primaryBottleneck, /ward/i);
});

test('zero treatment capacity produces a treatment queue', () => {
  const result = runPatientFlowSimulation(scenario, { ...base, treatmentCapacityPerHour: 0 }, 13);
  assert.ok(result.waitingTreatment > 0);
  assert.match(result.primaryBottleneck, /treatment/i);
});

test('zero discharge capacity produces a discharge bottleneck', () => {
  const result = runPatientFlowSimulation(scenario, { ...base, icuPercent: 0, wardPercent: 0, dischargePercent: 100, dischargeCapacityPerHour: 0 }, 14);
  assert.ok(result.stageCounts.discharge > 0);
  assert.match(result.primaryBottleneck, /discharge/i);
});

test('bed occupancy never exceeds configured capacities', () => {
  const result = runPatientFlowSimulation(scenario, { ...base, erBeds: 5, icuBeds: 2, wardBeds: 3 }, 15);
  assert.ok(result.patients.every(p => ['waiting-er','treatment','waiting-icu','waiting-ward','icu','ward','discharge-queue','discharged'].includes(p.status)));
  assert.ok(result.erUtilization <= 100 && result.icuUtilization <= 100 && result.wardUtilization <= 100);
});

test('same seed reproduces identical result', () => {
  assert.deepEqual(runPatientFlowSimulation(scenario, base, 99), runPatientFlowSimulation(scenario, base, 99));
});

test('different seeds change stochastic patient flow', () => {
  const a = runPatientFlowSimulation(scenario, base, 100);
  const b = runPatientFlowSimulation(scenario, base, 101);
  assert.notDeepEqual(a.patients.map(p => [p.arrivalMinute,p.treatmentMinutes,p.destination]), b.patients.map(p => [p.arrivalMinute,p.treatmentMinutes,p.destination]));
});

test('repeated runs and summary statistics are calculated from run results', () => {
  const runs = runRepeatedSimulations(scenario, base, 30, 2026);
  assert.equal(runs.length, 30);
  const stats = summarizeMetric(runs.map(r => r.averageWaitingMinutes));
  assert.ok(stats.min <= stats.mean && stats.mean <= stats.max);
  assert.ok(stats.confidenceInterval95);
});

test('Little Law validation returns finite, consistently bounded values', () => {
  const result = runPatientFlowSimulation(scenario, base, 202);
  assert.ok(Number.isFinite(result.averageErOccupancy));
  assert.ok(Number.isFinite(result.arrivalRatePerHour));
  assert.ok(Number.isFinite(result.littleLawPredictedOccupancy));
});

test('paired intervention comparison applies modified ICU capacity', () => {
  const comparison = compareInterventionRuns(scenario, { ...base, icuBeds: 0 }, { ...base, icuBeds: 8 }, 8, 303);
  assert.equal(comparison.baselineRuns.length, comparison.interventionRuns.length);
  assert.ok(comparison.interventionRuns.every(r => r.seed >= 303));
  const blocked = comparison.comparison.find(row => row.metric === 'blockedInEr');
  assert.ok(blocked.intervention.mean < blocked.baseline.mean, 'extra ICU capacity should reduce ER transfer blocking in this ICU-constrained test');
});

test('invalid percentages and values are normalized safely', () => {
  const normalized = normalizeFlowConfig({ ...base, icuPercent: 150, wardPercent: 150, erBeds: -5, durationMinutes: 0 });
  assert.equal(normalized.icuPercent, 100);
  assert.equal(normalized.wardPercent, 0);
  assert.equal(normalized.erBeds, 0);
  assert.equal(normalized.durationMinutes, 60);
});
