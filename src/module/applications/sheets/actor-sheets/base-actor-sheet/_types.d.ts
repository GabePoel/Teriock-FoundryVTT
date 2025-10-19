import type { TeriockActor } from "../../../../documents/_module.mjs";
import { CommonSheetMixin } from "../../mixins/_module.mjs";
import "./types/settings";

type SheetMixinType = typeof CommonSheetMixin;

export type ActorTab =
  | "tradecrafts"
  | "abilities"
  | "inventory"
  | "classes"
  | "powers"
  | "resources"
  | "conditions"
  | "protections"
  | "notes";

declare module "./base-actor-sheet.mjs" {
  export default interface TeriockBaseActorSheet extends SheetMixinType {
    _activeTab: ActorTab;

    get actor(): TeriockActor;

    get document(): TeriockActor;
  }
}
