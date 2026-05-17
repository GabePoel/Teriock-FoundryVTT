import { EmbeddedCollection } from "@common/abstract/_module.mjs";

import { TeriockRollTable, TeriockTableResult } from "../_module.mjs";

declare global {
  namespace Teriock.Documents {
    export interface RollTableInterface {
      _id: ID<TeriockRollTable>;
      // @ts-expect-error Bad extension
      results: EmbeddedCollection<TeriockTableResult>;

      get documentName(): "RollTable";
      get id(): ID<TeriockRollTable>;
      get uuid(): UUID<TeriockRollTable>;
    }
  }
}

export {};
