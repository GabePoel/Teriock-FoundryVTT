import { Collection } from "@common/utils/_module.mjs";

import { TeriockTokenDocument } from "../_module.mjs";

declare module "./scene.mjs" {
  export default interface TeriockScene {
    _id: ID<TeriockScene>;
    tokens: Collection<ID<TeriockTokenDocument>, TeriockTokenDocument>;

    get documentName(): "Scene";
    get id(): ID<TeriockScene>;
    get uuid(): UUID<TeriockScene>;
  }
}

export {};
