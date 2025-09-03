import type { abilityOptions } from "../../../../../constants/options/ability-options.mjs";

export type NormalDurationUnit = keyof typeof abilityOptions.duration.unit;

export type Duration = {
  unit: NormalDurationUnit;
  quantity: number;
  description: string;
  conditions: {
    absent: Set<Teriock.Parameters.Condition.ConditionKey>;
    present: Set<Teriock.Parameters.Condition.ConditionKey>;
  };
  stationary: boolean;
};
