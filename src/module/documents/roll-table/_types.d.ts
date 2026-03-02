import { TeriockRollTable, TeriockTableResult } from "../_module.mjs";
import { DocumentCollection } from "../../../../foundry/client/documents/abstract/_module.mjs";

declare global {
  namespace Teriock.Documents {
    export interface RollTableInterface {
      _id: ID<TeriockRollTable>;
      results: DocumentCollection<TeriockTableResult>;

      get documentName(): "RollTable";

      get id(): ID<TeriockRollTable>;

      get uuid(): UUID<TeriockRollTable>;
    }
  }
}

export {};
