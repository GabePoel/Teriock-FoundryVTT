import { TeriockScene, TeriockTokenDocument } from "../_module.mjs";
import { DocumentCollection } from "../../../../foundry/client/documents/abstract/_module.mjs";

declare global {
  namespace Teriock.Documents {
    export interface SceneInterface {
      _id: ID<TeriockScene>;
      tokens: DocumentCollection<TeriockTokenDocument>;

      get documentName(): "Scene";

      get id(): ID<TeriockScene>;

      get uuid(): UUID<TeriockScene>;
    }
  }
}

export {};
