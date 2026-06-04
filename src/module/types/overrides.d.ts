import { Game } from "@client/_module.mjs";
import { Canvas } from "@client/canvas/_module.mjs";
import { TokenLayer } from "@client/canvas/layers/_module.mjs";
import { CompendiumCollection } from "@client/documents/collections/_module.mjs";
import { Collection } from "@common/utils/_module.mjs";

import { TeriockDocumentSheet } from "../applications/sheets/utility-sheets/_module.mjs";
import {
  TeriockActorDirectory,
  TeriockChatLog,
  TeriockCombatTracker,
  TeriockCompendiumDirectory,
  TeriockItemDirectory, TeriockRollTableDirectory,
} from "../applications/sidebar/tabs/_module.mjs";
import { TeriockHotbar, TeriockNotifications } from "../applications/ui/_module.mjs";
import { TeriockActor, TeriockUser } from "../documents/_module.mjs";
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

declare global {
  // Definition for writing macros.
  let actor: TeriockActor;
  let scope: Teriock.System.TriggerScope;

  const game: Game & {
    actors: TeriockActors;
    canvas: Canvas & { tokens: TokenLayer };
    folders: TeriockFolders;
    items: TeriockItems;
    journal: TeriockJournal;
    macros: TeriockMacros;
    messages: TeriockChatMessages;
    // @ts-expect-error Document extension
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
