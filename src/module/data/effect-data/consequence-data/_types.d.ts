import type TeriockBaseEffectData from "../base-effect-data/base-effect-data.mjs";
import type { TeriockConsequence } from "../../../documents/_documents.mjs";
import type {
  CombatExpirationMethod, CombatExpirationSourceType, CombatExpirationTiming,
} from "../shared/shared-fields";
import type { TeriockActor, TeriockEffect } from "../../../documents/_module.mjs";
import type { HierarchyDataMixinInterface } from "../../mixins/hierarchy-data-mixin/_types";

declare module "./consequence-data.mjs" {
  export default interface TeriockConsequenceData extends TeriockBaseEffectData, HierarchyDataMixinInterface {
    conditionExpiration: boolean;
    dawnExpiration: boolean;
    expirations: {
      conditions: {
        present: Set<Teriock.Parameters.Condition.ConditionKey>;
        absent: Set<Teriock.Parameters.Condition.ConditionKey>;
      };
      /** Expirations based on combat timing. */
      combat: {
        who: {
          type: CombatExpirationSourceType;
          source: Teriock.UUID<TeriockActor>;
        };
        what: CombatExpirationMethod;
        when: CombatExpirationTiming;
      };
      movement: boolean;
      dawn: boolean;
      sustained: boolean;
      /** Description of the circumstances under which this effect expires. */
      description: string;
    };
    movementExpiration: boolean;
    source: Teriock.UUID<TeriockEffect>;
    sourceDescription: string;
    sustainedExpiration: boolean;

    get parent(): TeriockConsequence;
  }
}
