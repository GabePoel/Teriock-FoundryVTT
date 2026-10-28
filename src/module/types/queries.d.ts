import type {
  DatabaseCreateOperation,
  DatabaseDeleteOperation,
  DatabaseUpdateOperation,
  DatabaseWriteOperation,
} from "@common/abstract/_types.mjs";

import type queries from "../helpers/queries/_module.mjs";

import { TeriockScene, TeriockUser } from "../documents/_module.mjs";

declare global {
  namespace Teriock.Queries {
    export type QueryName = keyof typeof queries;

    export type QueryOptions = { timeout: number };

    export type QueryGMOptions = QueryOptions & {
      failMessage?: string;
      failPrefix?: string;
      failReason?: string;
      fallback?: Teriock.System.Serializable;
      format?: Record<string, string>;
      localize?: boolean;
      notifyFailure?: boolean;
    };

    export type CreateDocumentsData = {
      data: object;
      documentName: string;
      operation: Partial<Omit<DatabaseCreateOperation, "data">>;
    };

    export type UpdateDocumentsData = {
      documentName: string;
      operation: Partial<Omit<DatabaseUpdateOperation, "updates">>;
      updates: object[];
    };

    export type DeleteDocumentsData = {
      documentName: string;
      ids: string[];
      operation: Partial<Omit<DatabaseDeleteOperation, "ids">>;
    };

    export type FireTriggerData = {
      scope?: Partial<Teriock.System.TriggerScope>;
      trigger: Teriock.System.Trigger;
      uuid: UUID<TeriockActiveEffect | TeriockActor | TeriockItem>;
    };

    export type ModifyBatchData = { operations: DatabaseWriteOperation[] };

    export type IdentifyItemData = { itemUuid: UUID<TeriockItem<"equipment">>, userUuid: UUID<TeriockUser> };

    export type TurnChangeData = {
      actionUuids: UUID<TeriockCombatant>[];
      attackPenaltyUuids: UUID<TeriockCombatant>[];
      reactionUuids: UUID<TeriockCombatant>[];
      sceneUuid: UUID<TeriockScene> | null;
    };

    export type CreateHotbarFolderData = { id: ID<TeriockUser>, name: string };

    export type UseData = { uuid: UUID };
  }
}
