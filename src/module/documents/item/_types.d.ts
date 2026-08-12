import { Item } from "@client/documents/_module.mjs";
import { DocumentCollection } from "@client/documents/abstract/_module.mjs";

import { TeriockItem as ItemClass } from "../_module.mjs";
import { BaseItemSystem } from "../../data/systems/items/_module.mjs";

type ItemDocument = Omit<Teriock.Documents.DocumentBase<ItemClass, Item>, "documentName"> & {
  // @ts-expect-error Not a document
  effects: DocumentCollection<TeriockActiveEffect>;

  get documentName(): "Item";
  get transferredEffects(): TeriockActiveEffect[];
};

interface ItemSubtype<T extends ItemType>
  extends Teriock.Documents.Subtype<ItemDocument, T, ItemSheetMap[T], ItemSystemMap[T]>
{}

declare module "./item.mjs" {
  export default interface TeriockItem {
    _id: Readonly<ID<TeriockItem>>;
    // @ts-expect-error Not a document
    effects: DocumentCollection<TeriockActiveEffect>;
    system: BaseItemSystem;
    type: ItemType;

    get actor(): TeriockActor | null;
    get documentName(): "Item";
    get id(): ID<TeriockItem>;
    get transferredEffects(): TeriockActiveEffect[];
    get uuid(): UUID<TeriockItem>;
  }
}

declare global {
  export type TeriockItem<T extends ItemType = ItemType> = T extends unknown ? ItemSubtype<T> : never;
}

export {};
