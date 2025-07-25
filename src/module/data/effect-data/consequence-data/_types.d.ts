import TeriockActor from "../../../documents/actor.mjs";
import TeriockBaseEffectData from "../base-effect-data/base-effect-data.mjs";
import { TeriockConsequence } from "../../../documents/_documents.mjs";
import {
  CombatExpirationMethod,
  CombatExpirationSourceType,
  CombatExpirationTiming,
  HierarchyField,
} from "../shared/shared-fields";

export interface TeriockConsequenceSchema extends TeriockBaseEffectData {
  parent: TeriockConsequence;
  source: string;
  expirations: {
    condition: {
      value: string | null;
      present: boolean;
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
}

declare module "./consequence-data.mjs" {
  export default interface TeriockConsequenceData
    extends TeriockConsequenceSchema {}
}
