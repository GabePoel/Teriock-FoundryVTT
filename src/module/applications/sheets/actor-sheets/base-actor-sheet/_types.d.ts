import { TeriockActor } from "../../../../documents/_module.mjs";
import "./types/settings";

declare module "./base-actor-sheet.mjs" {
  export default interface BaseActorSheet {
    get actor(): TeriockActor;
    get document(): TeriockActor;
  }
}
