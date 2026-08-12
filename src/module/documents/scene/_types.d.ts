import { DocumentCollection } from "@client/documents/abstract/_module.mjs";

import { TeriockTokenDocument } from "../_module.mjs";

declare module "./scene.mjs" {
  export default interface TeriockScene {
    _id: Readonly<ID<TeriockScene>>;
    // @ts-expect-error DocumentConstructionContext
    tokens: DocumentCollection<ID<TeriockTokenDocument>, TeriockTokenDocument>;

    get documentName(): "Scene";
    get id(): ID<TeriockScene>;
    get uuid(): UUID<TeriockScene>;
  }
}

export {};
