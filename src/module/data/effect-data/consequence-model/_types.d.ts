import {
  CombatExpirationMethod,
  CombatExpirationSourceType,
  CombatExpirationTiming,
} from "../../fields/helpers/_types";
import { TeriockActor, TeriockEffect } from "../../../documents/_module.mjs";

declare module "./consequence-model.mjs" {
  export default interface TeriockConsequenceModel {
    /** <schema> Associations */
    associations: Teriock.MessageData.MessageAssociation[];
    /** <schema> Blocks representing the source */
    blocks: Teriock.MessageData.MessageBlock[];
    /** <schema> If this was the result of an effect that went critical */
    critical: boolean;
    /** <schema> Circumstances in which this effect is active or expires */
    expirations: {
      /** <schema> Conditions that affect if this effect is active or expired */
      conditions: {
        /** <schema> Conditions that must be present in order for this effect to be active */
        present: Set<Teriock.Parameters.Condition.ConditionKey>;
        /** <schema> Conditions that must be absent in order for this effect to be active */
        absent: Set<Teriock.Parameters.Condition.ConditionKey>;
      };
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
      /** <schema> If this effect expires when the {@link TeriockToken} representing its {@link TeriockActor} moves */
      movement: boolean;
      /** <schema> If this effect expires at dawn */
      dawn: boolean;
      /** <schema> If this effect expires when its source is inactive */
      sustained: boolean;
      /** <schema> Description of the circumstances under which this effect expires */
      description: string;
    };
    /** <schema> How much the source was heightened */
    heightened: number;
    movementExpiration: boolean;
    /** <schema> {@link TeriockEffect} that's the source of this consequence */
    source: UUID<TeriockEffect>;
    /** <schema> Source description */
    sourceDescription: string;
    /** <schema> If this expires when its source is inactive */
    sustainedExpiration: boolean;

    get parent(): TeriockConsequence;
  }
}
