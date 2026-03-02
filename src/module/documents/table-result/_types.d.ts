import { TeriockRollTable, TeriockTableResult } from "../_module.mjs";

declare global {
  namespace Teriock.Documents {
    export interface TableResultInterface {
      _id: ID<TeriockTableResult>;
      parent: TeriockRollTable;

      get documentName(): "TableResult";

      get id(): ID<TeriockTableResult>;

      get uuid(): UUID<TeriockTableResult>;
    }
  }
}

export {};
