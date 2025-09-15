import type { TeriockActor } from "../../../../documents/_module.mjs";
import { CommonSheetMixin } from "../../mixins/_module.mjs";
import "./types/settings";

type SheetMixinType = typeof CommonSheetMixin;

declare module "./base-actor-sheet.mjs" {
  export default interface TeriockBaseActorSheet extends SheetMixinType {
    get actor(): TeriockActor;

    get document(): TeriockActor;
  }
}
