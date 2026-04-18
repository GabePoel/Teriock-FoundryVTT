import type { costConfig } from "../../../../../../constants/config/cost-config.mjs";

declare global {
  namespace Teriock.Models {
    export type AbilityCostsPartData = {
      costs: {
        /** <schema> Component costs */
        components: Record<Teriock.Keys.Component, CostComponentValue>;
        /** <schema> Primary costs */
        primary: Record<Teriock.Keys.PrimaryCost, CostPrimaryValue>;
        /** <schema> Cost tweaks */
        tweaks: Record<Teriock.Keys.CostTweak, number>;
      };
    };
  }
}

export type CostComponentValue = {
  type: keyof typeof costConfig.components.types | null;
  description: string;
};

export type CostPrimaryValue = {
  type: keyof typeof costConfig.primary.types | null;
  formula: Teriock.System.FormulaString;
  description: string;
};
