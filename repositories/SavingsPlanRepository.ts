import type {SavingsPlanPayload, SavingsPlanResponse} from '~/types/savingsPlan';

export default {
  getPlan: () => $fetch<SavingsPlanResponse>('/api/savings-plan'),
  savePlan: (payload: SavingsPlanPayload) => $fetch<SavingsPlanResponse>('/api/savings-plan', {
    method: 'PUT', body: payload,
  }),
};
