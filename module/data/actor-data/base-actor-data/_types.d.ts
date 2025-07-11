import TeriockActor from "../../../documents/actor.mjs";
import { TeriockBaseActorDefault } from "./types/default";
import { TeriockBaseActorDerived } from "./types/derived";

declare module "./base-actor-data.mjs" {
  export default interface TeriockBaseActorData extends TeriockBaseActorDefault, TeriockBaseActorDerived {
    /** Parent Actor */
    parent: TeriockActor;
  }
}
