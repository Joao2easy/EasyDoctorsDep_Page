import { create } from "zustand";
import { NormalizedPlan, WizardState } from "@/types/plan";

interface AppState {
  plans: NormalizedPlan[];
  wizardState: WizardState;
  selectedPlan: NormalizedPlan | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setPlans: (plans: NormalizedPlan[]) => void;
  setWizardState: (state: WizardState) => void;
  setSelectedPlan: (plan: NormalizedPlan | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useAppStore = create<AppState>((set) => ({
  plans: [],
  wizardState: {
    people: 1,
    duration: 1,
    level: "Premium",
    isAvulso: false, // Adicionar flag
  },
  selectedPlan: null,
  isLoading: false,
  error: null,

  setPlans: (plans) => set({ plans }),
  setWizardState: (wizardState) => set({ wizardState }),
  setSelectedPlan: (selectedPlan) => set({ selectedPlan }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
}));

