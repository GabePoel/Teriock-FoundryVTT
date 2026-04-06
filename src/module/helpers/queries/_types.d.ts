import {
  TeriockActiveEffect,
  TeriockActor,
  TeriockItem,
  TeriockUser,
} from "../../documents/_module.mjs";
import type queries from "./_module.mjs";

declare global {
  namespace Teriock.QueryData {
    export type QueryName = keyof typeof queries;

    export type QueryOptions = {
      timeout: number;
      notifyFailure?: boolean;
      failMessage?: string;
      failPrefix?: string;
      failReason?: string;
      localize?: boolean;
      format?: Record<string, string>;
    };

    export type InCombatExpiration = {
      uuid: UUID<TeriockConsequence>;
    };

    export type FireTrigger = {
      uuid: UUID<AnyCommonDocument>;
      trigger: Teriock.System.Trigger;
      options: object;
    };

    export type IdentifyItem = {
      uuid: UUID<TeriockEquipment>;
    };

    export type ResetAttackPenalties = {
      actorUuids: UUID<TeriockActor>[];
    };

    export type CreateHotbarFolder = {
      name: string;
      id: ID<TeriockUser>;
    };

    export type Update = {
      uuid: UUID<TeriockActor> | UUID<TeriockItem> | UUID<TeriockActiveEffect>;
      data: object;
      operation?: object;
    };
  }
}
