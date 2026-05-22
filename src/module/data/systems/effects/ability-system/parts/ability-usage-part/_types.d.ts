import { RangeModel, SlowExecutionTimeModel } from "../../../../../models/unit-models/_module.mjs";

declare global {
  namespace Teriock.Models {
    export type AbilityUsagePartData = {
      /** <schema> This ability's delivery */
      delivery: Teriock.Keys.Delivery;
      /** <schema> This ability's execution time */
      executionTime: { base: Teriock.Keys.ExecutionTime, slow: SlowExecutionTimeModel };
      /** <schema> This ability's expansion */
      expansion: {
        /** <schema> Maximum number of extra executions */
        cap: Teriock.System.FormulaString;
        /** <schema> What attribute is used for feat saves against this ability's expansion */
        featSaveAttribute: Teriock.Keys.Attribute;
        /** <schema> Range of expansion */
        range: RangeModel;
        /** <schema> Type of ability's expansion */
        type: Teriock.Keys.Expansion | null;
      };
      /** <schema> What attribute is used for feat saves against this ability */
      featSaveAttribute: Teriock.Keys.Attribute;
      /** <schema> This ability's interaction */
      interaction: Teriock.Keys.Interaction;
      /** <schema> This ability's maneuver */
      maneuver: Teriock.Keys.Maneuver;
      /** <schema> The maximum range at which this ability can be used */
      range: RangeModel;
      /** <schema> Appropriate targets */
      targets: Set<Teriock.Keys.Target>;
    };
  }
}

export {};
