import { TeriockActor } from "../../../../documents/_module.mjs";
import "./types/settings";

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
  export default interface TeriockBaseActorSheet {
    _activeTab: ActorTab;

    get actor(): TeriockActor;
    get document(): TeriockActor;
  }
}
