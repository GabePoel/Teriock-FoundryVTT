import TeriockTableResult from "../table-result/table-result.mjs";

declare module "./roll-table.mjs" {
  export default interface TeriockRollTable
    extends Teriock.Documents.Interface<TeriockTableResult> {
    _id: ID<TeriockRollTable>;

    get documentName(): "RollTable";
    get id(): ID<TeriockRollTable>;
    get uuid(): UUID<TeriockRollTable>;
  }
}

export {};
