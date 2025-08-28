import type {
  TeriockActor,
  TeriockEffect,
  TeriockItem,
} from "../../../documents/_module.mjs";

export interface TeriockSheetMixin {
  /** Is the menu open? */
  _menuOpen: boolean;
  /** Context Menus */
  _contextMenus: object[];
  /** Is the sheet locked? */
  _locked: boolean;
  /** Is the sheet editable? */
  editable: boolean;
}

declare module "./sheet-mixin.mjs" {
  export default interface SheetMixin {
    document: TeriockActor | TeriockItem | TeriockEffect;
  }
}
