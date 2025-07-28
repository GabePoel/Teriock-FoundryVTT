import { TeriockActor } from "../../../documents/_module.mjs";
import { TeriockBaseActorDefault } from "./types/default";
import { TeriockBaseActorDerived } from "./types/derived";
import { EquipmentChanges } from "./types/changes";

declare module "./base-actor-data.mjs" {
  export default interface TeriockBaseActorData
    extends TeriockBaseActorDefault,
      TeriockBaseActorDerived,
      EquipmentChanges {
    /** Parent Actor */
    parent: TeriockActor;
  }
}
