import { EmbeddedCollection } from "@common/abstract/_module.mjs";

import { TeriockActiveEffect as ActiveEffectClass, TeriockItem as ItemClass } from "../_module.mjs";
import { BaseItemSystem } from "../../data/systems/items/_module.mjs";

// @ts-expect-error Broken subtype IDK why I hate TypeScript
interface ItemSubtype<T extends ItemType> extends ItemClass {
  sheet: ItemSheetMap[T];
  system: ItemSystemMap[T];
  type: T;
}

declare module "./item.mjs" {
  // @ts-expect-error Recursive
  export default interface TeriockItem {
    _id: Readonly<ID<TeriockItem>>;
    effects: EmbeddedCollection<TeriockActiveEffect>;
    system: BaseItemSystem;
    type: ItemType;

    get documentName(): "Item";
    get id(): ID<TeriockItem>;
    get transferredEffects(): ActiveEffectClass[];
    get uuid(): UUID<TeriockItem>;
  }
}

declare global {
  export type TeriockItem<T extends ItemType = ItemType> = (T extends unknown ? ItemSubtype<T> : never) & ItemClass;
}

export {};
