import {
  CombatExpirationMethod,
  CombatExpirationSourceType,
  CombatExpirationTiming,
} from "../../../fields/helpers/_types";
import {
  TeriockActiveEffect,
  TeriockActor,
} from "../../../../documents/_module.mjs";

declare global {
  namespace Teriock.Models {
    export type ApplicableSystemData = {
      /** <schema> Blocks representing the source */
      blocks: Teriock.Messages.MessageBlock[];
      /** <schema> If this was the result of an effect that went critical */
      critical: boolean;
      /** <schema> Circumstances in which this effect is active or expires */
      expirations: {
        /** <schema> Expirations based on combat timing */
        combat: {
          /** <schema> Who triggers effect expiration? */
          who: {
            /** <schema> What is the relationship of the {@link TeriockActor} that triggers expirations? */
            type: CombatExpirationSourceType;
            /** <schema> What {@link TeriockActor} is the one that triggers expirations? */
            source: UUID<TeriockActor>;
          };
          /** <schema> What is the method of this expiration? */
          what: CombatExpirationMethod;
          /** <schema> When in the combat does this effect expire? */
          when: CombatExpirationTiming;
        };
        /** <schema> Conditions that affect if this effect is active or expired */
        conditions: {
          /** <schema> Conditions that must be present in order for this effect to be active */
          present: Set<Teriock.Keys.Condition>;
          /** <schema> Conditions that must be absent in order for this effect to be active */
          absent: Set<Teriock.Keys.Condition>;
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
      /** <schema> {@link TeriockActiveEffect} that's the source of this effect */
      source: UUID<TeriockActiveEffect>;
      /** <schema> Source description */
      sourceDescription: string;

      get parent(): TeriockImbuement;
    };
  }
}
