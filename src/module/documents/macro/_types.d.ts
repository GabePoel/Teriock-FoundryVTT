declare module "./macro.mjs" {
  export default interface TeriockMacro
    extends Teriock.Documents.Interface<Teriock.Documents.NullDocument> {
    _id: Teriock.ID<TeriockMacro>;

    get documentName(): "Macro";

    get id(): Teriock.ID<TeriockMacro>;

    get uuid(): Teriock.UUID<TeriockMacro>;
  }
}

export {};
