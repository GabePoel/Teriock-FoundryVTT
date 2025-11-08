declare module "./folder.mjs" {
  export default interface TeriockFolder
    extends Teriock.Documents.Interface<Teriock.Documents.NullDocument> {
    _id: Teriock.ID<TeriockFolder>;

    get documentName(): "Folder";

    get id(): Teriock.ID<TeriockFolder>;

    get uuid(): Teriock.UUID<TeriockFolder>;
  }
}

export {};
