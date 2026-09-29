import * as documents from "../documents/_module.mjs";

declare global {
  /** Expand `keyof Map` into a string-literal union for IDE hints. */
  type TypeMapKey<Map> = { [K in keyof Map]: K; }[keyof Map];

  export type TeriockDocument =
    | documents.TeriockActiveEffect
    | documents.TeriockActor
    | documents.TeriockAmbientLightDocument
    | documents.TeriockCard
    | documents.TeriockCards
    | documents.TeriockChatMessage
    | documents.TeriockCombat
    | documents.TeriockCombatant
    | documents.TeriockCombatantGroup
    | documents.TeriockFolder
    | documents.TeriockItem
    | documents.TeriockJournalEntry
    | documents.TeriockJournalEntryCategory
    | documents.TeriockJournalEntryPage
    | documents.TeriockMacro
    | documents.TeriockRegionDocument
    | documents.TeriockRollTable
    | documents.TeriockScene
    | documents.TeriockTableResult
    | documents.TeriockTokenDocument
    | documents.TeriockUser;
}

export {};
