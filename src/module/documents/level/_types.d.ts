import { TeriockScene } from "../_module.mjs";

declare module "./level.mjs" {
  export default interface TeriockLevel {
    _id: Readonly<ID<TeriockLevel>>;

    readonly parent: TeriockScene;
    get documentName(): "Level";
    get id(): ID<TeriockLevel>;
    get uuid(): UUID<TeriockLevel>;
  }
}

export {};
