import * as documents from "../documents/_module.mjs";

declare global {
  /** Expand `keyof Map` into a string-literal union for IDE hints. */
  type TypeMapKey<Map> = { [K in keyof Map]: K; }[keyof Map];

  export type TeriockDocument =
    | documents.TeriockCards
    | documents.TeriockCombat
    | documents.TeriockCombatant
    | documents.TeriockFolder
    | documents.TeriockJournalEntry
    | documents.TeriockJournalEntryCategory
    | documents.TeriockMacro
    | documents.TeriockRegionDocument
    | documents.TeriockRollTable
    | documents.TeriockScene
    | documents.TeriockTableResult
    | documents.TeriockTokenDocument
    | documents.TeriockUser
    | TeriockActiveEffect
    | TeriockActor
    | TeriockCard
    | TeriockChatMessage
    | TeriockItem
    | TeriockJournalEntryPage;
}

export {};
