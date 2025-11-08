import { TeriockTokenDocument } from "../_module.mjs";

declare module "./scene.mjs" {
  export default interface TeriockScene
    extends Teriock.Documents.Interface<TeriockTokenDocument> {
    _id: Teriock.ID<TeriockScene>;

    get documentName(): "Scene";

    get id(): Teriock.ID<TeriockScene>;

    get uuid(): Teriock.UUID<TeriockScene>;
  }
}

export {};
