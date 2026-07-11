import { TeriockFolder } from "../documents/_module.mjs";

declare global {
  namespace Teriock.Hierarchy {
    /** Index representing a subset of document data. */
    export type Index<Doc> = {
      _id: ID<Doc>;
      folder: ID<TeriockFolder>;
      img: string;
      name: string;
      pack: string;
      sort: number;
      system: { _sup?: ID<Doc> };
      type: Teriock.Documents.CommonType;
      uuid: UUID<Doc>;
    };

    /** A safe version of a document that can be called within compendiums. */
    export type SyncDoc<Doc> = Doc | Index<Doc>;
  }
}

export {};
