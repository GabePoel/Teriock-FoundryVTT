import { BasePageSheet, ClassSheet } from "./_module.mjs";

declare global {
  export interface JournalEntryPageSheetMap {
    class: ClassSheet;
    damage: BasePageSheet;
    drain: BasePageSheet;
    rule: BasePageSheet;
    tradecraft: BasePageSheet;
  }
}
