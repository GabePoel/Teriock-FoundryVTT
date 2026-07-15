import type costConfig from "../../../../../../constants/config/cost-config.mjs";

declare global {
  namespace Teriock.Models {
    export type CostComponentValue = { description: string, type: keyof typeof costConfig.components.types | null };

    export type CostPrimaryValue = {
      description: string;
      formula: Teriock.System.FormulaString;
      type: keyof typeof costConfig.primary.types | null;
    };

    export type AbilityCostsPartData = {
      costs: {
        /** <schema> Component costs */
        components: Record<Teriock.Keys.Component, CostComponentValue>;
        /** <schema> Primary costs */
        primary: Record<Teriock.Keys.Stat, CostPrimaryValue>;
        /** <schema> Cost tweaks */
        tweaks: Record<Teriock.Keys.CostTweak, number>;
      };
    };
  }
}
