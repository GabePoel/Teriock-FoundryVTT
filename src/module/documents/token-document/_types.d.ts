import { TeriockCombat, TeriockScene } from "../_module.mjs";

declare module "./token-document.mjs" {
  export default interface TeriockTokenDocument {
    _id: Readonly<ID<TeriockTokenDocument>>;

    readonly parent: TeriockScene;
    get actor(): TeriockActor | null;
    get combat(): TeriockCombat | null;
    get documentName(): "TokenDocument";
    get id(): ID<TeriockTokenDocument>;
    get uuid(): UUID<TeriockTokenDocument>;
  }
}

export {};
