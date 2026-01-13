import { TeriockActor, TeriockEffect } from "../_module.mjs";
import { BaseItemSystem } from "../../data/systems/items/_module.mjs";
import { BaseItemSheet } from "../../applications/sheets/item-sheets/_module.mjs";

declare module "./item.mjs" {
  export default interface TeriockItem
    extends Teriock.Documents.Interface<TeriockEffect> {
    parent?: TeriockActor;
    sheet: BaseItemSheet;
    system: BaseItemSystem;

    get actor(): TeriockActor;
    get documentName(): "Item";
    get transferredEffects(): TeriockEffect[];
  }
}
