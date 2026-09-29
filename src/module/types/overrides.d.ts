import { Game as BaseGame } from "@client/_module.mjs";
import { Canvas } from "@client/canvas/_module.mjs";
import { TokenLayer } from "@client/canvas/layers/_module.mjs";
import { ClientDocumentMixin, WorldCollection } from "@client/documents/abstract/_module.mjs";
import {
  ChatMessages,
  CompendiumCollection,
  Folders,
  Items,
  Journal,
  Macros,
  RollTables,
  Scenes,
} from "@client/documents/collections/_module.mjs";
import { DataField } from "@common/data/fields.mjs";
import { Collection } from "@common/utils/_module.mjs";

import {
  TeriockFolder,
  TeriockJournalEntry,
  TeriockMacro,
  TeriockRollTable,
  TeriockScene,
  TeriockUser,
} from "../documents/_module.mjs";
import { TeriockActors, TeriockUsers } from "../documents/collections/_module.mjs";
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

// Dumb hacky fix for documents not being able to extend data models.
declare module "@common/abstract/document.mjs" {
  export default interface Document {
    _initializationOrder(): Generator<[string, DataField]>;
  }
}

declare global {
  // Definition for writing macros.
  let actor: TeriockActor;
  let scope: Teriock.System.TriggerScope;

  type ClientDocument = InstanceType<ReturnType<typeof ClientDocumentMixin>>;

  // @ts-expect-error Incorrect extensions
  interface Game extends BaseGame {
    actors: TeriockActors;
    canvas: Canvas & { tokens: TokenLayer };
    folders: WorldCollection<TeriockFolder> & Folders;
    items: WorldCollection<TeriockItem> & Items;
    journal: WorldCollection<TeriockJournalEntry> & Journal;
    macros: WorldCollection<TeriockMacro> & Macros;
    messages: WorldCollection<TeriockChatMessage> & ChatMessages;
    packs: Collection<string, CompendiumCollection<TeriockDocument>>;
    scenes: WorldCollection<TeriockScene> & Scenes;
    tables: WorldCollection<TeriockRollTable> & RollTables;
    teriock: TeriockManager;
    tooltip: TeriockTooltipManager;
    user: TeriockUser;
    users: TeriockUsers;
  }

  // @ts-expect-error Redeclare blocked scope
  let game: Game;

  type FromUuidOptions = { invalid: boolean, relative: TeriockDocument };

  function fromUuidSync<T>(uuid: UUID<T>, options?: FromUuidOptions): T | null;
  function fromUuid<T>(uuid: UUID<T>, options?: FromUuidOptions): Promise<T> | null;
}

export {};
