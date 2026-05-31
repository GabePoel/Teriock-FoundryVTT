import type {
  DatabaseCreateOperation,
  DatabaseDeleteOperation,
  DatabaseUpdateOperation,
} from "@common/abstract/_types.mjs";

import type queries from "./_module.mjs";

import { ApplicableEffectSystem } from "../../data/systems/effects/_module.mjs";
import { TeriockActiveEffect, TeriockActor, TeriockUser } from "../../documents/_module.mjs";

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

    export type InCombatExpirationData = { uuid: UUID<TeriockActiveEffect & { system: ApplicableEffectSystem }> };

    export type FireTriggerData = { options: object, trigger: Teriock.System.Trigger, uuid: UUID<AnyCommonDocument> };

    export type IdentifyItemData = { uuid: UUID<TeriockEquipment> };

    export type TurnChangeData = { actorUuids: UUID<TeriockActor>[] };

    export type CreateHotbarFolderData = { id: ID<TeriockUser>, name: string };

    export type MassWriteData = { operations: object[] };
  }
}
