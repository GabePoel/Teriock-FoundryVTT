declare module "./table-result.mjs" {
  export default interface TeriockTableResult
    extends Teriock.Documents.Interface<Teriock.Documents.NullDocument> {
    _id: ID<TeriockTableResult>;

    get documentName(): "TableResult";

    get id(): ID<TeriockTableResult>;

    get uuid(): UUID<TeriockTableResult>;
  }
}

export {};
