import * as documents from "../documents/_module.mjs";

declare global {
  export type AnyActiveEffect = ActiveEffectTypeMap[keyof ActiveEffectTypeMap];
  export type AnyItem = ItemTypeMap[keyof ItemTypeMap];
  export type AnyActor = ActorTypeMap[keyof ActorTypeMap];
  export type AnyParent = AnyActor | AnyItem;
  export type AnyCommonDocument = AnyActiveEffect | AnyActor | AnyItem;
  export type AnyChildDocument = AnyActiveEffect | AnyItem;
  export type AnyRules = AnyCommonDocument | documents.TeriockJournalEntryPage;
  export type TeriockArmament = TeriockBody | TeriockEquipment;
  export type TeriockLingering = TeriockCondition | TeriockConsequence | TeriockImbuement;

  export type ChildDocumentName = "ActiveEffect" | "Item";
  export type CommonDocumentName = "ActiveEffect" | "Actor" | "Item";
  export type TeriockDocument =
    | documents.TeriockActiveEffect
    | documents.TeriockActor
    | documents.TeriockCard
    | documents.TeriockCards
    | documents.TeriockChatMessage
    | documents.TeriockCombat
    | documents.TeriockCombatant
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
