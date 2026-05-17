import { Collection } from "@common/utils/_module.mjs";

import { TeriockScene, TeriockTokenDocument } from "../_module.mjs";

declare global {
  namespace Teriock.Documents {
    export interface SceneInterface {
      _id: ID<TeriockScene>;
      tokens: Collection<ID<TeriockTokenDocument>, TeriockTokenDocument>;

      get documentName(): "Scene";
      get id(): ID<TeriockScene>;
      get uuid(): UUID<TeriockScene>;
    }
  }
}

export {};
