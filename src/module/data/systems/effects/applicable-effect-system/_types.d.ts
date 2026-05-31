import { TeriockActor } from "../../../../documents/_module.mjs";
import {
  CombatExpirationMethod,
  CombatExpirationSourceType,
  CombatExpirationTiming,
} from "../../../fields/helpers/_types.js";

declare global {
  namespace Teriock.Models {
    export type ApplicableEffectSystemData = {
      /** <schema> UUID of the document this is sourced from */
      _src: UUID<TeriockAbility> | null;
      /** <schema> Blocks representing the source */
      blocks: Teriock.Panels.PanelBlock[];
      /** <schema> If this was the result of an effect that went critical */
      critical: boolean;
      /** <schema> Circumstances in which this effect is active or expires */
      expirations: {
        /** <schema> Expirations based on combat timing */
        combat: {
          /** <schema> What is the method of this expiration? */
          what: CombatExpirationMethod;
          /** <schema> When in the combat does this effect expire? */
          when: CombatExpirationTiming;
          /** <schema> Who triggers effect expiration? */
          who: {
            /** <schema> What {@link TeriockActor} is the one that triggers expirations? */
            source: UUID<TeriockActor>;
            /** <schema> What is the relationship of the {@link TeriockActor} that triggers expirations? */
            type: CombatExpirationSourceType;
          };
        };
        /** <schema> Conditions that affect if this effect is active or expired */
        conditions: {
          /** <schema> Conditions that must be absent in order for this effect to be active */
          absent: Set<Teriock.Keys.Condition>;
          /** <schema> Conditions that must be present in order for this effect to be active */
          present: Set<Teriock.Keys.Condition>;
        };
        /** <schema> Description of the circumstances under which this effect expires */
        description: string;
        /** <schema> If this effect expires when its source is inactive */
        sustained: boolean;
        /** <schema> Triggers that will make this effect expire */
        triggers: Set<string>;
      };
      /** <schema> How much the source was heightened */
      heightened: number;
    };
  }
}
