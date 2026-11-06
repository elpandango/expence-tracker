export type SavedPlanEntry = {
  id: number;
  name: string;
  amountCents: number;
  startMonth: string | null;
  endMonth: string | null;
  accountId?: string | null;
};

export type SavingsPlanAccount = {id: string; name: string; currency: string};

export type SavingsPlanPayload = {
  defaultAccountId?: string | null;
  startMonth: string;
  endMonth: string;
  incomes: SavedPlanEntry[];
  expenses: SavedPlanEntry[];
};

export type SavingsPlanResponse = {
  plan: (SavingsPlanPayload & {updatedAt: string}) | null;
  accounts?: SavingsPlanAccount[];
};
