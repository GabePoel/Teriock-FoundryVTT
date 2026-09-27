import { Document } from "@common/abstract/_module.mjs";
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

declare global {
  namespace Teriock.Documents {
    /** Annoying hack to fix the default Scene so it satisfies {@link Document}. */
    export type SceneBase =
      & Omit<typeof foundry.documents.Scene, "prototype">
      & MixinBase<Constructor<foundry.documents.Scene & Document>>;
  }
}

export {};
