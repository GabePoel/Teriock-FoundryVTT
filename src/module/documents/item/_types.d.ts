import { EmbeddedCollection } from "@common/abstract/_module.mjs";

import { TeriockActiveEffect as ActiveEffectClass, TeriockItem as ItemClass } from "../_module.mjs";
import { BaseItemSystem } from "../../data/systems/items/_module.mjs";

declare module "./item.mjs" {
  export default interface TeriockItem {
    _id: Readonly<ID<TeriockItem>>;
    effects: EmbeddedCollection<TeriockActiveEffect>;
    system: BaseItemSystem;
    type: ItemType;

    readonly parent: TeriockActor | null;
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
