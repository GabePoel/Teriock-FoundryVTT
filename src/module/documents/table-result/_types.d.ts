import { TeriockRollTable } from "../_module.mjs";

declare module "./table-result.mjs" {
  export default interface TeriockTableResult {
    _id: Readonly<ID<TeriockTableResult>>;

    readonly parent: TeriockRollTable;
    get documentName(): "TableResult";
    get id(): ID<TeriockTableResult>;
    get uuid(): UUID<TeriockTableResult>;
  }
}

export {};
