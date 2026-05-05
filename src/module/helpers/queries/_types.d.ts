import type {
  DatabaseCreateOperation,
  DatabaseDeleteOperation,
  DatabaseUpdateOperation,
} from "@common/abstract/_types.mjs";
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

    export type CreateDocuments = {
      data: object;
      documentName: string;
      operation: Partial<Omit<DatabaseCreateOperation, "data">>;
    };

    export type UpdateDocuments = {
      updates: object[];
      documentName: string;
      operation: Partial<Omit<DatabaseUpdateOperation, "updates">>;
    };

    export type DeleteDocuments = {
      ids: string[];
      documentName: string;
      operation: Partial<Omit<DatabaseDeleteOperation, "ids">>;
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

    export type TurnChange = {
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

    export type MassWrite = {
      operations: object[];
    };
  }
}
