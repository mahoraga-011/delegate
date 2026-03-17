"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2 } from "lucide-react";
import type { Policy, PolicyRule } from "@/lib/delegate";

const FIELDS: { value: PolicyRule["field"]; label: string; numeric: boolean }[] = [
  { value: "actionType", label: "Action Type", numeric: false },
  { value: "tool", label: "Tool", numeric: false },
  { value: "risk", label: "Risk", numeric: true },
  { value: "target", label: "Target", numeric: false },
  { value: "amount", label: "Amount", numeric: true },
  { value: "recipient", label: "Recipient", numeric: false },
  { value: "currency", label: "Currency", numeric: false },
];

const STRING_OPERATORS: { value: PolicyRule["operator"]; label: string }[] = [
  { value: "equals", label: "equals" },
  { value: "notEquals", label: "not equals" },
  { value: "includes", label: "includes" },
  { value: "notIncludes", label: "not includes" },
];

const NUMERIC_OPERATORS: { value: PolicyRule["operator"]; label: string }[] = [
  { value: "lte", label: "<= (at most)" },
  { value: "gte", label: ">= (at least)" },
  { value: "equals", label: "equals" },
  { value: "notEquals", label: "not equals" },
];

function emptyRule(): PolicyRule {
  return {
    id: `rule-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    label: "",
    field: "actionType",
    operator: "equals",
    value: "",
    rationale: "",
  };
}

export function PolicyBuilderDialog({
  open,
  onOpenChange,
  onSave,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (policy: Policy) => void;
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [rules, setRules] = useState<PolicyRule[]>([emptyRule()]);

  const addRule = () => setRules((r) => [...r, emptyRule()]);

  const removeRule = (index: number) => {
    setRules((r) => r.filter((_, i) => i !== index));
  };

  const updateRule = (index: number, updates: Partial<PolicyRule>) => {
    setRules((r) => r.map((rule, i) => (i === index ? { ...rule, ...updates } : rule)));
  };

  const isNumericField = (field: string) => {
    return FIELDS.find((f) => f.value === field)?.numeric ?? false;
  };

  const getOperators = (field: string) => {
    return isNumericField(field) ? NUMERIC_OPERATORS : STRING_OPERATORS;
  };

  const canSave = name.trim() && rules.length > 0 && rules.every((r) => r.label && r.value !== "");

  const handleSave = () => {
    const policy: Policy = {
      id: `custom-${Date.now()}`,
      name: name.trim(),
      description: description.trim(),
      defaultEffect: "deny",
      rules: rules.map((r) => ({
        ...r,
        value: isNumericField(r.field) ? Number(r.value) : String(r.value),
      })),
    };
    onSave(policy);
    // Reset form
    setName("");
    setDescription("");
    setRules([emptyRule()]);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create policy</DialogTitle>
          <DialogDescription>
            Define rules that will be evaluated against agent action requests.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 pt-2">
          {/* Name + description */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="policyName">Name</Label>
              <Input
                id="policyName"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="My spending policy"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="policyDesc">Description</Label>
              <Input
                id="policyDesc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What this policy enforces"
              />
            </div>
          </div>

          {/* Rules */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Rules</Label>
              <Button variant="outline" size="sm" onClick={addRule}>
                <Plus className="mr-1 h-3 w-3" />
                Add rule
              </Button>
            </div>

            {rules.map((rule, index) => {
              const operators = getOperators(rule.field);

              return (
                <div key={rule.id} className="rounded-lg border p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary" className="font-mono text-[10px]">
                      Rule {index + 1}
                    </Badge>
                    {rules.length > 1 && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-destructive"
                        onClick={() => removeRule(index)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <Label>Label</Label>
                    <Input
                      value={rule.label}
                      onChange={(e) => updateRule(index, { label: e.target.value })}
                      placeholder="Risk must be at or below 5"
                    />
                  </div>

                  <div className="grid gap-3 sm:grid-cols-3">
                    <div className="space-y-1.5">
                      <Label>Field</Label>
                      <Select
                        value={rule.field}
                        onValueChange={(v) => {
                          if (!v) return;
                          const updates: Partial<PolicyRule> = {
                            field: v as PolicyRule["field"],
                            value: "",
                          };
                          const newOps = isNumericField(v) ? NUMERIC_OPERATORS : STRING_OPERATORS;
                          if (!newOps.find((o) => o.value === rule.operator)) {
                            updates.operator = newOps[0].value;
                          }
                          updateRule(index, updates);
                        }}
                      >
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {FIELDS.map((f) => (
                            <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1.5">
                      <Label>Operator</Label>
                      <Select
                        value={rule.operator}
                        onValueChange={(v) => {
                          if (v) updateRule(index, { operator: v as PolicyRule["operator"] });
                        }}
                      >
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {operators.map((op) => (
                            <SelectItem key={op.value} value={op.value}>{op.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1.5">
                      <Label>Value</Label>
                      <Input
                        type={isNumericField(rule.field) ? "number" : "text"}
                        value={rule.value}
                        onChange={(e) => updateRule(index, { value: e.target.value })}
                        placeholder={isNumericField(rule.field) ? "5" : "read|write"}
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label>
                      Rationale <span className="font-normal text-muted-foreground">(optional)</span>
                    </Label>
                    <Input
                      value={rule.rationale}
                      onChange={(e) => updateRule(index, { rationale: e.target.value })}
                      placeholder="Why this rule exists"
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={!canSave}>
              Save policy
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
