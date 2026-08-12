import { TeriockAmbientLight } from "../../canvas/placeables/_module.mjs";

declare module "./ambient-light-document.mjs" {
  export default interface TeriockAmbientLightDocument {
    _id: Readonly<ID<TeriockAmbientLightDocument>>;

    get documentName(): "AmbientLight";
    get id(): ID<TeriockAmbientLightDocument>;
    get object(): TeriockAmbientLight;
    get uuid(): UUID<TeriockAmbientLightDocument>;
  }
}

export {};
