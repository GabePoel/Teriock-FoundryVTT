export interface TeriockSheet {
  /** Is the menu open? */
  _menuOpen: boolean;
  /** Context Menus */
  _contextMenus: object[];
  /** Is the sheet locked? */
  _locked: boolean;
  /** Is the sheet editable? */
  editable: boolean;
}
