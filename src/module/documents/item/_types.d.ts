import { TeriockActor, TeriockEffect } from "../_module.mjs";
import { TeriockBaseItemModel } from "../../data/item-data/_module.mjs";
import { TeriockBaseItemSheet } from "../../applications/sheets/item-sheets/_module.mjs";

declare module "./item.mjs" {
  export default interface TeriockItem
    extends Teriock.Documents.Interface<TeriockEffect> {
    parent?: TeriockActor;
    sheet: TeriockBaseItemSheet;
    system: TeriockBaseItemModel;

    get actor(): TeriockActor;
    get documentName(): "Item";
    get transferredEffects(): TeriockEffect[];
  }
}

export {};
