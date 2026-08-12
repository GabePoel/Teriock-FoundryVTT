import { Game } from "@client/_module.mjs";
import { Canvas } from "@client/canvas/_module.mjs";
import { TokenLayer } from "@client/canvas/layers/_module.mjs";
import { ClientDocumentMixin } from "@client/documents/abstract/_module.mjs";
import { CompendiumCollection } from "@client/documents/collections/_module.mjs";
import { Collection } from "@common/utils/_module.mjs";

import { TeriockDocumentSheet } from "../applications/api/_module.mjs";
import {
  TeriockActorDirectory,
  TeriockChatLog,
  TeriockCombatTracker,
  TeriockCompendiumDirectory,
  TeriockItemDirectory,
  TeriockRollTableDirectory,
} from "../applications/sidebar/tabs/_module.mjs";
import { TeriockHotbar, TeriockNotifications } from "../applications/ui/_module.mjs";
import { TeriockUser } from "../documents/_module.mjs";
import {
  TeriockActors,
  TeriockChatMessages,
  TeriockFolders,
  TeriockItems,
  TeriockJournal,
  TeriockMacros,
  TeriockRollTables,
  TeriockScenes,
  TeriockUsers,
} from "../documents/collections/_module.mjs";
import { TeriockManager } from "../helpers/_module.mjs";
import { TeriockTooltipManager } from "../helpers/interaction/_module.mjs";

/** Fix for common document patching */
declare module "@common/documents/_module.mjs" {
  export const ActiveEffect: typeof import("@client/documents/_module.mjs").ActiveEffect;
  export const Actor: typeof import("@client/documents/_module.mjs").Actor;
  export const AmbientLightDocument: typeof import("@client/documents/_module.mjs").AmbientLightDocument;
  export const Card: typeof import("@client/documents/_module.mjs").Card;
  export const Cards: typeof import("@client/documents/_module.mjs").Cards;
  export const ChatMessage: typeof import("@client/documents/_module.mjs").ChatMessage;
  export const Combat: typeof import("@client/documents/_module.mjs").Combat;
  export const Combatant: typeof import("@client/documents/_module.mjs").Combatant;
  export const Folder: typeof import("@client/documents/_module.mjs").Folder;
  export const Item: typeof import("@client/documents/_module.mjs").Item;
  export const JournalEntry: typeof import("@client/documents/_module.mjs").JournalEntry;
  export const JournalEntryCategory: typeof import("@client/documents/_module.mjs").JournalEntryCategory;
  export const JournalEntryPage: typeof import("@client/documents/_module.mjs").JournalEntryPage;
  export const Macro: typeof import("@client/documents/_module.mjs").Macro;
  export const RegionDocument: typeof import("@client/documents/_module.mjs").RegionDocument;
  export const RollTable: typeof import("@client/documents/_module.mjs").RollTable;
  export const Scene: typeof import("@client/documents/_module.mjs").Scene;
  export const TableResult: typeof import("@client/documents/_module.mjs").TableResult;
  export const TokenDocument: typeof import("@client/documents/_module.mjs").TokenDocument;
  export const User: typeof import("@client/documents/_module.mjs").User;
}

declare global {
  // Definition for writing macros.
  let actor: TeriockActor;
  let scope: Teriock.System.TriggerScope;

  type ClientDocument = InstanceType<ReturnType<typeof ClientDocumentMixin>>;

  // @ts-expect-error Can't redeclare block scope
  const game: Game & {
    actors: TeriockActors;
    canvas: Canvas & { tokens: TokenLayer };
    folders: TeriockFolders;
    items: TeriockItems;
    journal: TeriockJournal;
    macros: TeriockMacros;
    messages: TeriockChatMessages;
    packs: Collection<string, CompendiumCollection<TeriockDocument>>;
    scenes: TeriockScenes;
    tables: TeriockRollTables;
    teriock: TeriockManager;
    tooltip: TeriockTooltipManager;
    user: TeriockUser;
    users: TeriockUsers;
  };
  // @ts-expect-error Doesn't know about global `ui`
  const ui: ui & {
    activeWindow: TeriockDocumentSheet;
    actors: TeriockActorDirectory;
    chat: TeriockChatLog;
    combat: TeriockCombatTracker;
    compendium: TeriockCompendiumDirectory;
    hotbar: TeriockHotbar;
    items: TeriockItemDirectory;
    notifications: TeriockNotifications;
    tables: TeriockRollTableDirectory;
  };

  type FromUuidOptions = { invalid: boolean, relative: TeriockDocument };

  function fromUuidSync<T>(uuid: UUID<T>, options?: FromUuidOptions): T | null;
  function fromUuid<T>(uuid: UUID<T>, options?: FromUuidOptions): Promise<T> | null;
}

export {};
