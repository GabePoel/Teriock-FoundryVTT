import type { TeriockActor } from "../../../documents/_module.mjs";
import type { TeriockBaseActorDefault } from "./types/default";
import type { TeriockBaseActorDerived } from "./types/derived";
import type { EquipmentChanges } from "./types/changes";
import type { StatDataInterface } from "../../mixins/_types";

declare module "./base-actor-data.mjs" {
  export default interface TeriockBaseActorData
    extends TeriockBaseActorDefault,
      TeriockBaseActorDerived,
      EquipmentChanges,
      StatDataInterface {
    /** Parent Actor */
    parent: TeriockActor;
  }
}
