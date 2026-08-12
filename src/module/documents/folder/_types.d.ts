declare module "./folder.mjs" {
  export default interface TeriockFolder {
    _id: Readonly<ID<TeriockFolder>>;

    get documentName(): "Folder";
    get id(): ID<TeriockFolder>;
    get uuid(): UUID<TeriockFolder>;
  }
}

export {};
