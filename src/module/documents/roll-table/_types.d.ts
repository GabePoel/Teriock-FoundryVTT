import { EmbeddedCollection } from "@common/abstract/_module.mjs";

import { TeriockTableResult } from "../_module.mjs";

declare module "./roll-table.mjs" {
  export default interface TeriockRollTable {
    _id: Readonly<ID<TeriockRollTable>>;
    results: EmbeddedCollection<TeriockTableResult>;

    get documentName(): "RollTable";
    get id(): ID<TeriockRollTable>;
    get uuid(): UUID<TeriockRollTable>;
  }
}

export {};
