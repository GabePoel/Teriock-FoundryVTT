import { TeriockScene } from "../_module.mjs";

declare module "./ambient-light-document.mjs" {
  export default interface TeriockAmbientLightDocument {
    _id: Readonly<ID<TeriockAmbientLightDocument>>;

    readonly parent: TeriockScene;
    get documentName(): "AmbientLight";
    get id(): ID<TeriockAmbientLightDocument>;
    get uuid(): UUID<TeriockAmbientLightDocument>;
  }
}

export {};
