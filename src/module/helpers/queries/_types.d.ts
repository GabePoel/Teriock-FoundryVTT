import {
  type TeriockAbility,
  type TeriockConsequence,
} from "../../documents/_documents.mjs";
import type TeriockActor from "../../documents/actor.mjs";

declare global {
  namespace Teriock.QueryData {
    export type InCombatExpiration = {
      effectUuid: Teriock.UUID<TeriockConsequence>;
    };

    export type AddToSustaining = {
      sustainingUuid: Teriock.UUID<TeriockAbility>;
      sustainedUuids: Teriock.UUID<TeriockConsequence>[];
    };

    export type SustainedExpiration = {
      sustainedUuid: Teriock.UUID<TeriockConsequence>;
    };

    export type TimeAdvance = {
      delta: number;
    };

    export type ResetAttackPenalties = {
      actorUuids: Teriock.UUID<TeriockActor>[];
    };

    export type CreateHotbarFolder = {
      name: string;
    };
  }
}
