import { TeriockFolder } from "../_module.mjs";

declare global {
  namespace Teriock.Documents {
    export interface FolderInterface {
      _id: ID<TeriockFolder>;

      get documentName(): "Folder";

      get id(): ID<TeriockFolder>;

      get uuid(): UUID<TeriockFolder>;
    }
  }
}

export {};
