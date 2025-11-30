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
      effectUuid: UUID<TeriockConsequence>;
    };

    export type AddToSustaining = {
      sustainingUuid: UUID<TeriockAbility>;
      sustainedUuids: UUID<TeriockConsequence>[];
    };

    export type CallPseudoHook = {
      uuid: UUID<TeriockCommon>;
      pseudoHook: Teriock.Parameters.Shared.PseudoHook;
      data: object;
    };

    export type IdentifyItem = {
      uuid: UUID<TeriockEquipment>;
    };

    export type SustainedExpiration = {
      sustainedUuid: UUID<TeriockConsequence>;
    };

    export type TimeAdvance = {
      delta: number;
    };

    export type ResetAttackPenalties = {
      actorUuids: UUID<TeriockActor>[];
    };

    export type CreateHotbarFolder = {
      name: string;
      id: ID<TeriockUser>;
    };

    export type UpdateEmbeddedDocuments = {
      uuid: UUID<TeriockActor> | UUID<TeriockItem>;
      embeddedName: "Item" | "ActiveEffect";
      updates: object[];
      operation?: object;
    };

    export type Update = {
      uuid: UUID<TeriockActor> | UUID<TeriockItem> | UUID<TeriockEffect>;
      data: object;
      operation?: object;
    };
  }
}
