import type { IdentityTwin, BreachRecord, ExposureDataPoint, RecoveryStep } from '../types';

import { identityTwin as twinData } from '../mock-data/identity-twin';
import { identityBreaches as breachData } from '../mock-data/identity-breaches';

export async function getIdentityTwin(): Promise<IdentityTwin> {
  await new Promise(resolve => setTimeout(resolve, 400));
  return twinData as unknown as IdentityTwin;
}

export async function getBreaches(): Promise<BreachRecord[]> {
  await new Promise(resolve => setTimeout(resolve, 300));
  return breachData as unknown as BreachRecord[];
}

export async function getExposureHistory(): Promise<ExposureDataPoint[]> {
  await new Promise(resolve => setTimeout(resolve, 300));
  return [
    { month: 'Oct 2025', breaches: 0, dataPoints: 2 },
    { month: 'Nov 2025', breaches: 1, dataPoints: 5 },
    { month: 'Dec 2025', breaches: 0, dataPoints: 5 },
    { month: 'Jan 2026', breaches: 1, dataPoints: 9 },
    { month: 'Feb 2026', breaches: 1, dataPoints: 14 },
    { month: 'Mar 2026', breaches: 0, dataPoints: 14 },
  ];
}

export async function getRecoverySteps(): Promise<RecoveryStep[]> {
  await new Promise(resolve => setTimeout(resolve, 300));
  const steps: RecoveryStep[] = [];
  (breachData as unknown as BreachRecord[]).forEach(breach => {
    breach.recoverySteps.forEach((step, idx) => {
      steps.push({
        id: `${breach.id}_step_${idx}`,
        title: step,
        description: `Recovery action for the ${breach.serviceName} breach`,
        priority: idx === 0 ? 'immediate' : idx === 1 ? 'high' : 'medium',
        completed: breach.isResolved,
        relatedBreach: breach.serviceName,
      });
    });
  });
  return steps;
}

export async function markBreachResolved(breachId: string): Promise<BreachRecord> {
  await new Promise(resolve => setTimeout(resolve, 200));
  const breach = (breachData as unknown as BreachRecord[]).find(b => b.id === breachId);
  if (!breach) throw new Error('Breach not found');
  return { ...breach, isResolved: true };
}
