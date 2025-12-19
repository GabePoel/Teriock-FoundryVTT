import { TeriockEffect } from "../../../documents/_module.mjs";

declare global {
  namespace Teriock.Models {
    export interface TeriockBaseEffectModelInterface
      extends Teriock.Models.ChildTypeModelInterface {
      /** <schema> If this effect should be deleted instead of disabled when it expires */
      deleteOnExpire: boolean;
      /** <schema> Suppression */
      suppression: {
        /** <schema> Statuses that must be active or inactive for this effect to be suppressed */
        statuses: {
          /** <schema> Statuses that suppress this if active */
          active: Set<Teriock.Parameters.Condition.ConditionKey>;
          /** <schema> Statuses that suppress this if inactive */
          inactive: Set<Teriock.Parameters.Condition.ConditionKey>;
        };
      };

      get parent(): TeriockEffect;
    }
  }
}
