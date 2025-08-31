import type { abilityOptions } from "../../../../../constants/ability-options.mjs";

export type NormalDurationUnit = keyof typeof abilityOptions.duration.unit;

export type Duration = {
  unit: NormalDurationUnit;
  quantity: number;
  description: string;
  conditions: {
    absent: Set<Teriock.Parameters.Condition.Key>;
    present: Set<Teriock.Parameters.Condition.Key>;
  };
  stationary: boolean;
};
