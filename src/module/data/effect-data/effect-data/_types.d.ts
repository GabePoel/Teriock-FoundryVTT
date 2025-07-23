import TeriockBaseEffectData from "../base-effect-data/base-effect-data.mjs";
import type {
  CombatExpirationMethod,
  CombatExpirationSourceType,
  CombatExpirationTiming,
  HierarchyField,
} from "../shared/shared-fields";
import type TeriockActor from "../../../documents/actor.mjs";

export interface TeriockEffectSchema extends TeriockBaseEffectData {
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
  hierarchy: HierarchyField;
}

declare module "./effect-data.mjs" {
  export default interface TeriockEffectData extends TeriockEffectSchema {}
}
