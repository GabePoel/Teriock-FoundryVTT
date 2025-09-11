import type { TeriockActor } from "../../../documents/_module.mjs";
import type { TeriockBaseActorDefault } from "./types/default";
import type { TeriockBaseActorDerived } from "./types/derived";
import type { EquipmentChanges } from "./types/changes";

declare module "./base-actor-data.mjs" {
  export default // @ts-ignore
  interface TeriockBaseActorData extends TeriockBaseActorDefault, TeriockBaseActorDerived, EquipmentChanges {
    /** Parent Actor */
    get parent(): TeriockActor;
  }
}
