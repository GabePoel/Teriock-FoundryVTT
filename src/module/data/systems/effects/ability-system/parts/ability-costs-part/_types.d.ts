import type { costOptions } from "../../../../../../constants/options/cost-options.mjs";

declare global {
  namespace Teriock.Models {
    export type AbilityCostsPartInterface = {
      costs: {
        /** <schema> Component costs */
        components: Record<CostComponentKey, CostComponentValue>;
        /** <schema> Primary costs */
        primary: Record<CostPrimaryKey, CostPrimaryValue>;
        /** <schema> Cost tweaks */
        tweaks: Record<CostTweakKey, number>;
      };
    };
  }
}

export type CostComponentKey = keyof typeof costOptions.components.keys;

export type CostComponentValue = {
  type: keyof typeof costOptions.components.types | null;
  description: string;
};

export type CostPrimaryKey = keyof typeof costOptions.primary.keys;

export type CostPrimaryValue = {
  type: keyof typeof costOptions.primary.types | null;
  formula: Teriock.System.FormulaString;
  description: string;
};

export type CostTweakKey = keyof typeof costOptions.tweaks;
