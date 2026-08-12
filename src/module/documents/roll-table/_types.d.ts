import { EmbeddedCollection } from "@common/abstract/_module.mjs";

import { TeriockTableResult } from "../_module.mjs";

declare module "./roll-table.mjs" {
  export default interface TeriockRollTable {
    _id: ID<TeriockRollTable>;
    // @ts-expect-error Bad extension
    results: EmbeddedCollection<TeriockTableResult>;

    get documentName(): "RollTable";
    get id(): ID<TeriockRollTable>;
    get uuid(): UUID<TeriockRollTable>;
  }
}

export {};
