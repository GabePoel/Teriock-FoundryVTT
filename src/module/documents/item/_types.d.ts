import { TeriockActor, TeriockEffect } from "../_module.mjs";
import TeriockBaseItemSheet from "../../applications/sheets/item-sheets/base-item-sheet/base-item-sheet.mjs";

declare module "./item.mjs" {
  export default interface TeriockItem
    extends Teriock.Documents.Interface<TeriockEffect> {
    sheet: TeriockBaseItemSheet;

    get actor(): TeriockActor;

    get documentName(): "Item";

    get transferredEffects(): TeriockEffect[];
  }
}

export {};
