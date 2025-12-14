import { TeriockActor } from "../../../documents/_module.mjs";

declare global {
  interface TeriockBaseActorData {
    /** <schema> Parent */
    parent: TeriockActor;
  }
}

declare module "./base-actor-model.mjs" {
  export default interface TeriockBaseActorModel extends TeriockBaseActorData {
    get parent(): TeriockActor;
  }
}
