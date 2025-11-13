import {
  TeriockAbility,
  TeriockConsequence,
  TeriockEquipment,
} from "../../documents/_documents.mjs";
import {
  TeriockActor,
  TeriockEffect,
  TeriockItem,
  TeriockUser,
} from "../../documents/_module.mjs";
import type queries from "./_module.mjs";

declare global {
  namespace Teriock.QueryData {
    export type QueryName = keyof typeof queries;

    export type QueryOptions = {
      timeout: number;
      notifyFailure: boolean;
      failMessage: string;
      failPrefix: string;
      failReason: string;
    };

    export type InCombatExpiration = {
      effectUuid: Teriock.UUID<TeriockConsequence>;
    };

    export type AddToSustaining = {
      sustainingUuid: Teriock.UUID<TeriockAbility>;
      sustainedUuids: Teriock.UUID<TeriockConsequence>[];
    };

    export type CallPseudoHook = {
      uuid: Teriock.UUID<TeriockCommon>;
      pseudoHook: Teriock.Parameters.Shared.PseudoHook;
      data: object;
    };

    export type IdentifyItem = {
      uuid: Teriock.UUID<TeriockEquipment>;
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
      id: Teriock.ID<TeriockUser>;
    };

    export type UpdateEmbeddedDocuments = {
      uuid: Teriock.UUID<TeriockActor> | Teriock.UUID<TeriockItem>;
      embeddedName: "Item" | "ActiveEffect";
      updates: object[];
      operation?: object;
    };

    export type Update = {
      uuid:
        | Teriock.UUID<TeriockActor>
        | Teriock.UUID<TeriockItem>
        | Teriock.UUID<TeriockEffect>;
      data: object;
      operation?: object;
    };
  }
}
