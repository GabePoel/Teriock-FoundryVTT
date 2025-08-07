import type { TeriockActor } from "../../../../documents/_module.mjs";
import { SheetMixin } from "../../mixins/_module.mjs";
import "./types/settings";

type SheetMixinType = typeof SheetMixin;

declare module "./base-actor-sheet.mjs" {
  export default interface TeriockBaseActorSheet extends SheetMixinType {
    get actor(): TeriockActor;

    get document(): TeriockActor;
  }
}
