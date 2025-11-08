import { TeriockEffect } from "../_module.mjs";
import type TeriockBaseItemSheet from "../../applications/sheets/item-sheets/base-item-sheet/base-item-sheet.mjs";
import type { HierarchyDocumentInterface } from "../mixins/child-document-mixin/parts/_types";

declare module "./item.mjs" {
  export default interface TeriockItem
    extends Teriock.Documents.Interface<TeriockEffect>,
      HierarchyDocumentInterface<TeriockItem> {
    _id: Teriock.ID<TeriockItem>;
    sheet: TeriockBaseItemSheet;
    system: Teriock.Documents.ItemModel;

    get documentName(): "Item";

    get id(): Teriock.ID<TeriockItem>;

    get transferredEffects(): TeriockEffect[];

    get uuid(): Teriock.UUID<TeriockItem>;
  }
}

export {};
