import type TeriockBaseEffectData from "../base-effect-data/base-effect-data.mjs";
import type { TeriockConsequence } from "../../../documents/_documents.mjs";
import type {
  CombatExpirationMethod,
  CombatExpirationSourceType,
  CombatExpirationTiming,
  HierarchyField,
} from "../shared/shared-fields";
import type {
  TeriockActor,
  TeriockEffect,
} from "../../../documents/_module.mjs";

declare module "./consequence-data.mjs" {
  export default interface TeriockConsequenceData
    extends TeriockBaseEffectData {
    source: Teriock.UUID<TeriockEffect>;
    expirations: {
      conditions: {
        present: Set<Teriock.Parameters.Condition.Key>;
        absent: Set<Teriock.Parameters.Condition.Key>;
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
    conditionExpiration: boolean;
    movementExpiration: boolean;
    dawnExpiration: boolean;
    sustainedExpiration: boolean;
    sourceDescription: string;
    hierarchy: HierarchyField;

    get parent(): TeriockConsequence;
  }
}
