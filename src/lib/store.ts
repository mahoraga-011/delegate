"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Policy, AgentActionRequest, AuditEntry } from "delegate-sdk";
import { samplePolicies } from "./delegate";

interface DelegateStore {
  // Policies
  customPolicies: Policy[];
  selectedPolicyId: string;
  addPolicy: (p: Policy) => void;
  removePolicy: (id: string) => void;
  selectPolicy: (id: string) => void;

  // Audit log
  auditLog: AuditEntry[];
  addAuditEntry: (e: AuditEntry) => void;
  clearAuditLog: () => void;

  // Draft request
  draftRequest: AgentActionRequest;
  updateDraftField: <K extends keyof AgentActionRequest>(key: K, value: AgentActionRequest[K]) => void;
  resetDraft: () => void;
}

const emptyRequest: AgentActionRequest = {
  actionType: "",
  tool: "",
  risk: 0,
  target: "",
  justification: "",
};

export const useStore = create<DelegateStore>()(
  persist(
    (set) => ({
      // Policies
      customPolicies: [],
      selectedPolicyId: samplePolicies[0].id,
      addPolicy: (p) =>
        set((s) => ({ customPolicies: [...s.customPolicies, p], selectedPolicyId: p.id })),
      removePolicy: (id) =>
        set((s) => ({
          customPolicies: s.customPolicies.filter((p) => p.id !== id),
          selectedPolicyId: s.selectedPolicyId === id ? samplePolicies[0].id : s.selectedPolicyId,
        })),
      selectPolicy: (id) => set({ selectedPolicyId: id }),

      // Audit log
      auditLog: [],
      addAuditEntry: (e) => set((s) => ({ auditLog: [e, ...s.auditLog] })),
      clearAuditLog: () => set({ auditLog: [] }),

      // Draft request
      draftRequest: emptyRequest,
      updateDraftField: (key, value) =>
        set((s) => ({ draftRequest: { ...s.draftRequest, [key]: value } })),
      resetDraft: () => set({ draftRequest: emptyRequest }),
    }),
    { name: "delegate-store" }
  )
);

/** All policies: presets + custom */
export function useAllPolicies(): Policy[] {
  const custom = useStore((s) => s.customPolicies);
  return [...samplePolicies, ...custom];
}

/** Currently selected policy */
export function useSelectedPolicy(): Policy {
  const selectedId = useStore((s) => s.selectedPolicyId);
  const all = useAllPolicies();
  return all.find((p) => p.id === selectedId) ?? samplePolicies[0];
}
