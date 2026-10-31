import React, { useState } from 'react';
import { EMERGENCY_SCENARIOS, HOSPITALS_DATA } from '../../data/mockData';
import {
  runCrisisComparison,
  type CrisisInterventions,
  type CrisisComparison,
} from '../../utils/simulationEngine';

const emptyInterventions: CrisisInterventions = {
  additionalIcuBeds: 0,
  additionalDoctors: 0,
  additionalNurses: 0,
  surgeBeds: 0,
  ambulancesDiverted: 0,
};

function MetricCard({
  label,
  before,
  after,
  suffix = '',
}: {
  label: string;
  before: number;
  after: number;
  suffix?: string;
}) {
  const improved = after < before;

  return (
    <div className="rounded-xl border border-slate-700 bg-slate-900/70 p-4">
      <p className="text-xs uppercase tracking-wider text-slate-400">
        {label}
      </p>
      <div className="mt-3 grid grid-cols-2 gap-3">
        <div>
          <p className="text-xs text-slate-500">Before</p>
          <p className="text-2xl font-bold text-slate-200">
            {before}{suffix}
          </p>
        </div>
        <div>
          <p className="text-xs text-slate-500">After</p>
          <p className={`text-2xl font-bold ${improved ? 'text-emerald-400' : 'text-cyan-300'}`}>
            {after}{suffix}
          </p>
        </div>
      </div>
    </div>
  );
}

function ResourceBar({
  label,
  occupied,
  total,
}: {
  label: string;
  occupied: number;
  total: number;
}) {
  const percentage = Math.min(
    100,
    Math.round((occupied / Math.max(total, 1)) * 100)
  );

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="text-slate-300">{label}</span>
        <span className="text-slate-400">{occupied} / {total}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-slate-700">
        <div
          className={`h-full rounded-full ${
            percentage >= 85 ? 'bg-red-400' :
            percentage >= 65 ? 'bg-amber-400' : 'bg-cyan-400'
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <p className="text-right text-xs text-slate-500">{percentage}% occupied</p>
    </div>
  );
}

export function ScenarioComparison() {
  const [selectedId, setSelectedId] = useState(EMERGENCY_SCENARIOS[0].id);
  const [interventions, setInterventions] =
    useState<CrisisInterventions>(emptyInterventions);
  const [comparison, setComparison] = useState<CrisisComparison | null>(null);

  const scenario = EMERGENCY_SCENARIOS.find(
    (item) => item.id === selectedId
  ) ?? EMERGENCY_SCENARIOS[0];

  const updateIntervention = (
    key: keyof CrisisInterventions,
    value: number
  ) => {
    setInterventions((current) => ({
      ...current,
      [key]: Math.max(0, value),
    }));
    setComparison(null);
  };

  const runComparison = () => {
    const result = runCrisisComparison(
      scenario,
      interventions,
      HOSPITALS_DATA
    );
    setComparison(result);
  };

  const resetAll = () => {
    setInterventions(emptyInterventions);
    setComparison(null);
  };

  const numberControl = (
    label: string,
    key: keyof CrisisInterventions,
    max: number,
    description: string
  ) => (
    <div className="rounded-xl border border-slate-700 bg-slate-900/70 p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="font-medium text-slate-200">{label}</p>
          <p className="mt-1 text-xs text-slate-500">{description}</p>
        </div>
        <input
          type="number"
          min="0"
          max={max}
          value={interventions[key]}
          onChange={(event) =>
            updateIntervention(key, Math.min(max, Number(event.target.value) || 0))
          }
          className="w-20 rounded-lg border border-slate-600 bg-slate-800 p-2 text-center text-white"
        />
      </div>
      <input
        type="range"
        min="0"
        max={max}
        value={interventions[key]}
        onChange={(event) =>
          updateIntervention(key, Number(event.target.value))
        }
        className="mt-4 w-full accent-cyan-400"
      />
      <div className="flex justify-between text-xs text-slate-500">
        <span>0</span>
        <span>{max}</span>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#070d18] px-4 py-8 text-slate-100 md:px-8">
      <div className="mx-auto max-w-7xl space-y-8">

        <header>
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-cyan-400">
            ResQ Twin / Decision Support
          </p>
          <h1 className="mt-3 text-3xl font-bold md:text-4xl">
            Before vs After Crisis Simulator
          </h1>
          <p className="mt-3 max-w-3xl text-slate-400">
            Simulate an emergency, apply resource interventions, and compare
            the projected hospital response.
          </p>
        </header>

        <section className="rounded-2xl border border-slate-700 bg-slate-900/60 p-5">
          <label className="mb-3 block text-sm font-semibold text-slate-300">
            Select emergency scenario
          </label>
          <select
            value={selectedId}
            onChange={(event) => {
              setSelectedId(event.target.value);
              setInterventions(emptyInterventions);
              setComparison(null);
            }}
            className="w-full rounded-xl border border-slate-600 bg-slate-800 p-3 text-white md:max-w-xl"
          >
            {EMERGENCY_SCENARIOS.map((item) => (
              <option key={item.id} value={item.id}>
                {item.title}
              </option>
            ))}
          </select>

          <div className="mt-5 grid gap-4 sm:grid-cols-3">
            <div>
              <p className="text-xs text-slate-500">Incoming patients</p>
              <p className="mt-1 text-2xl font-bold text-cyan-300">
                {scenario.patientsArrived}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Current average wait</p>
              <p className="mt-1 text-2xl font-bold text-amber-300">
                {scenario.avgWaitMinutes} min
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Scenario severity</p>
              <p className="mt-1 text-2xl font-bold capitalize text-red-300">
                {scenario.severity}
              </p>
            </div>
          </div>
        </section>

        <section>
          <div className="mb-4">
            <h2 className="text-xl font-bold">Resource interventions</h2>
            <p className="mt-1 text-sm text-slate-400">
              Adjust the resources available in the improved scenario.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {numberControl('Additional ICU beds', 'additionalIcuBeds', 30, 'Increase ICU capacity')}
            {numberControl('Additional doctors', 'additionalDoctors', 30, 'Add medical staff')}
            {numberControl('Additional nurses', 'additionalNurses', 40, 'Add nursing staff')}
            {numberControl('Surge beds', 'surgeBeds', 30, 'Open temporary beds')}
            {numberControl('Ambulances diverted', 'ambulancesDiverted', scenario.patientsArrived, 'Route patients away from this hospital')}
          </div>

          <div className="mb-4 rounded-xl border border-cyan-500/30 bg-cyan-500/10 p-4">
  <p className="font-semibold text-cyan-300">
    Current intervention settings
  </p>
  <p className="mt-2 text-sm text-slate-300">
    ICU beds: {interventions.additionalIcuBeds} | 
    Doctors: {interventions.additionalDoctors} | 
    Nurses: {interventions.additionalNurses}
  </p>
  <p className="mt-1 text-sm text-slate-300">
    Surge beds: {interventions.surgeBeds} | 
    Ambulances diverted: {interventions.ambulancesDiverted}
  </p>
</div>
          <div className="mt-5 flex flex-wrap gap-3">
            <button
              onClick={runComparison}
              className="rounded-xl bg-cyan-500 px-6 py-3 font-semibold text-slate-950 transition hover:bg-cyan-400"
            >
              Run Before vs After Comparison
            </button>
            <button
              onClick={resetAll}
              className="rounded-xl border border-slate-600 px-6 py-3 font-semibold text-slate-300 transition hover:bg-slate-800"
            >
              Reset interventions
            </button>
          </div>
        </section>

        {comparison && (
          <>
            <section>
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-bold">Simulation results</h2>
                  <p className="mt-1 text-sm text-slate-400">
                    Same selected emergency, with and without interventions.
                  </p>
                </div>
                <span className="rounded-full border border-amber-500/40 bg-amber-500/10 px-3 py-1 text-xs text-amber-300">
                  Prototype estimates
                </span>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <MetricCard
                  label="Patients waiting"
                  before={comparison.baseline.patientsWaiting}
                  after={comparison.improved.patientsWaiting}
                />
                <MetricCard
                  label="Average wait"
                  before={comparison.baseline.avgWaitMinutes}
                  after={comparison.improved.avgWaitMinutes}
                  suffix=" min"
                />
                <MetricCard
                  label="ICU utilization"
                  before={comparison.baseline.icuUtilization}
                  after={comparison.improved.icuUtilization}
                  suffix="%"
                />
                <MetricCard
                  label="ER utilization"
                  before={comparison.baseline.erUtilization}
                  after={comparison.improved.erUtilization}
                  suffix="%"
                />
              </div>
            </section>

            <section className="grid gap-5 lg:grid-cols-2">
              {[
                { title: 'Before interventions', result: comparison.baseline },
                { title: 'After interventions', result: comparison.improved },
              ].map(({ title, result }) => (
                <div key={title} className="rounded-2xl border border-slate-700 bg-slate-900/60 p-5">
                  <h3 className="text-lg font-bold">{title}</h3>
                  <p className={`mt-2 inline-block rounded-full px-3 py-1 text-xs font-semibold ${
                    result.status === 'Critical'
                      ? 'bg-red-500/15 text-red-300'
                      : result.status === 'High Load'
                      ? 'bg-amber-500/15 text-amber-300'
                      : 'bg-emerald-500/15 text-emerald-300'
                  }`}>
                    {result.status}
                  </p>

                  <div className="mt-5 space-y-5">
                    <ResourceBar
                      label="ER beds"
                      occupied={result.resources.erBeds.occupied}
                      total={result.resources.erBeds.total}
                    />
                    <ResourceBar
                      label="ICU beds"
                      occupied={result.resources.icuBeds.occupied}
                      total={result.resources.icuBeds.total}
                    />
                    <ResourceBar
                      label="Operating theatres"
                      occupied={result.resources.otRooms.occupied}
                      total={result.resources.otRooms.total}
                    />
                    <ResourceBar
                      label="Blood units"
                      occupied={result.resources.bloodUnits.total - result.resources.bloodUnits.available}
                      total={result.resources.bloodUnits.total}
                    />
                  </div>

                  <div className="mt-5 border-t border-slate-700 pt-4">
                    <p className="font-semibold text-slate-300">Bottlenecks</p>
                    {result.bottlenecks.length > 0 ? (
                      <ul className="mt-2 list-disc space-y-2 pl-5 text-sm text-slate-400">
                        {result.bottlenecks.map((item, index) => (
                          <li key={index}>{item}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="mt-2 text-sm text-emerald-400">
                        No bottlenecks detected by this prototype.
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </section>

            <section className="rounded-2xl border border-cyan-500/30 bg-cyan-500/5 p-5">
              <h2 className="text-xl font-bold text-cyan-300">
                Diversion and recommendations
              </h2>
              <p className="mt-3 text-sm text-slate-300">
                {comparison.divertedPatients} patients were allocated for
                diversion in this prototype.
              </p>
              {comparison.divertedHospitalNames.length > 0 && (
                <p className="mt-2 text-sm text-slate-400">
                  Eligible hospitals: {comparison.divertedHospitalNames.join(', ')}
                </p>
              )}
              <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-slate-300">
                {comparison.improved.patientsWaiting > 0 && (
                  <li>Review staffing and available bed capacity to reduce the remaining simulated queue.</li>
                )}
                {comparison.improved.icuUtilization >= 85 && (
                  <li>Consider additional ICU capacity or coordinated transfers.</li>
                )}
                {comparison.improved.erUtilization >= 85 && (
                  <li>Consider opening surge capacity and reviewing emergency triage flow.</li>
                )}
                {comparison.improved.bottlenecks.length === 0 && (
                  <li>Continue monitoring resources; no threshold bottlenecks were detected.</li>
                )}
                <li>Confirm all proposed changes with hospital operations staff before real-world use.</li>
              </ul>
            </section>

            <section className="rounded-xl border border-slate-700 bg-slate-900/50 p-4">
              <h3 className="font-semibold text-slate-300">Model assumptions</h3>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-xs text-slate-500">
                {comparison.improved.assumptions.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
              <p className="mt-3 text-xs text-amber-400">
                This is a synthetic hackathon prototype, not a clinical decision
                system. Results are estimates based on simplified assumptions
                and must not be used for actual patient routing or treatment.
              </p>
            </section>
          </>
        )}
      </div>
    </div>
  );
}

export default ScenarioComparison;