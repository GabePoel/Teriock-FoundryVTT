import { EmbeddedCollection } from "@common/abstract/_module.mjs";

import { TeriockAmbientLightDocument, TeriockRegionDocument, TeriockTokenDocument } from "../_module.mjs";

declare module "./scene.mjs" {
  export default interface TeriockScene {
    _id: Readonly<ID<TeriockScene>>;
    lights: EmbeddedCollection<TeriockAmbientLightDocument>;
    regions: EmbeddedCollection<TeriockRegionDocument>;
    tokens: EmbeddedCollection<TeriockTokenDocument>;

    get documentName(): "Scene";
    get id(): ID<TeriockScene>;
    get uuid(): UUID<TeriockScene>;
  }
}

export {};
