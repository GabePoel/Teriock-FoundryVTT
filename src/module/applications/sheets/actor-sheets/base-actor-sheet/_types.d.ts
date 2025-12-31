import { TeriockActor } from "../../../../documents/_module.mjs";
import "./types/settings";

declare module "./base-actor-sheet.mjs" {
  export default interface TeriockBaseActorSheet {
    _activeTab: string;

    get actor(): TeriockActor;
    get document(): TeriockActor;
  }
}
