declare module "./macro.mjs" {
  export default interface TeriockMacro
    extends Teriock.Documents.Interface<Teriock.Documents.NullDocument> {
    _id: ID<TeriockMacro>;

    get documentName(): "Macro";

    get id(): ID<TeriockMacro>;

    get uuid(): UUID<TeriockMacro>;
  }
}

export {};
