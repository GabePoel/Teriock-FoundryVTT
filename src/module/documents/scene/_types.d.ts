import { TeriockTokenDocument } from "../_module.mjs";

declare module "./scene.mjs" {
  export default interface TeriockScene
    extends Teriock.Documents.Interface<TeriockTokenDocument> {
    _id: ID<TeriockScene>;

    get documentName(): "Scene";

    get id(): ID<TeriockScene>;

    get uuid(): UUID<TeriockScene>;
  }
}

export {};
