declare module "./table-result.mjs" {
  export default interface TeriockTableResult
    extends Teriock.Documents.Interface<Teriock.Documents.NullDocument> {
    _id: Teriock.ID<TeriockTableResult>;

    get documentName(): "TableResult";

    get id(): Teriock.ID<TeriockTableResult>;

    get uuid(): Teriock.UUID<TeriockTableResult>;
  }
}

export {};
