import type {
  DatabaseCreateOperation,
  DatabaseDeleteOperation,
  DatabaseUpdateOperation,
} from "@common/abstract/_types.mjs";

import type queries from "./_module.mjs";

import { TeriockActiveEffect, TeriockActor, TeriockItem, TeriockUser } from "../../documents/_module.mjs";

declare global {
  namespace Teriock.QueryData {
    export type QueryName = keyof typeof queries;

    export type QueryOptions = {
      failMessage?: string;
      failPrefix?: string;
      failReason?: string;
      format?: Record<string, string>;
      localize?: boolean;
      notifyFailure?: boolean;
      timeout: number;
    };

    export type CreateDocuments = {
      data: object;
      documentName: string;
      operation: Partial<Omit<DatabaseCreateOperation, "data">>;
    };

    export type UpdateDocuments = {
      documentName: string;
      operation: Partial<Omit<DatabaseUpdateOperation, "updates">>;
      updates: object[];
    };

    export type DeleteDocuments = {
      documentName: string;
      ids: string[];
      operation: Partial<Omit<DatabaseDeleteOperation, "ids">>;
    };

    export type InCombatExpiration = { uuid: UUID<TeriockConsequence> };

    export type FireTrigger = { options: object, trigger: Teriock.System.Trigger, uuid: UUID<AnyCommonDocument> };

    export type IdentifyItem = { uuid: UUID<TeriockEquipment> };

    export type TurnChange = { actorUuids: UUID<TeriockActor>[] };

    export type CreateHotbarFolder = { id: ID<TeriockUser>, name: string };

    export type Update = {
      data: object;
      operation?: object;
      uuid: UUID<TeriockActiveEffect> | UUID<TeriockActor> | UUID<TeriockItem>;
    };

    export type MassWrite = { operations: object[] };
  }
}
