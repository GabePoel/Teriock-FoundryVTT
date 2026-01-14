declare module "./folder.mjs" {
  export default interface TeriockFolder
    extends Teriock.Documents.Interface<Teriock.Documents.NullDocument> {
    _id: ID<TeriockFolder>;

    get documentName(): "Folder";
    get id(): ID<TeriockFolder>;
    get uuid(): UUID<TeriockFolder>;
  }
}

export {};
