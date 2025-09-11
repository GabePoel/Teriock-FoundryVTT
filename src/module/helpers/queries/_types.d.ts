import type { TeriockAbility, TeriockConsequence } from "../../documents/_documents.mjs";
import type { TeriockActor, TeriockEffect, TeriockItem } from "../../documents/_module.mjs";

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

    export type UpdateEmbeddedDocuments = {
      uuid: Teriock.UUID<TeriockActor> | Teriock.UUID<TeriockItem>;
      embeddedName: "Item" | "ActiveEffect";
      updates: Object[];
      operation?: Object;
    };

    export type Update = {
      uuid: | Teriock.UUID<TeriockActor> | Teriock.UUID<TeriockItem> | Teriock.UUID<TeriockEffect>;
      data: Object;
      operation?: Object;
    };
  }
}
