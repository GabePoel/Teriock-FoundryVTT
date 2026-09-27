import { EmbeddedCollection } from "@common/abstract/_module.mjs";

import { TeriockActiveEffect as ActiveEffectClass, TeriockItem as ItemClass } from "../_module.mjs";
import { TeriockDocumentSheet } from "../../applications/api/_module.mjs";
import { BaseItemSystem } from "../../data/systems/items/_module.mjs";

declare module "./item.mjs" {
  export default interface TeriockItem {
    _id: Readonly<ID<TeriockItem>>;
    effects: EmbeddedCollection<TeriockActiveEffect>;
    sheet: TeriockDocumentSheet;
    system: BaseItemSystem;
    type: ItemType;

    get documentName(): "Item";
    get id(): ID<TeriockItem>;
    get transferredEffects(): ActiveEffectClass[];
    get uuid(): UUID<TeriockItem>;
  }
}

declare global {
  export type TeriockItem<T extends ItemType = ItemType> = ItemClass & Subtype<ItemSystemMap, T>;
}

export {};
