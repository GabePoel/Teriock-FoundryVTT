// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import { TeriockActor, TeriockUser } from "../documents/_module.mjs";
import { TeriockManager } from "../helpers/_module.mjs";
import { CompendiumCollection } from "@client/documents/collections/_module.mjs";
import { Game } from "@client/_module.mjs";
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
import { Canvas } from "@client/canvas/_module.mjs";
import { TokenLayer } from "@client/canvas/layers/_module.mjs";
import { TeriockTooltipManager } from "../helpers/interaction/_module.mjs";

declare global {
  // Definition for writing macros.
  let actor: TeriockActor;
  let scope: Teriock.System.TriggerScope;

  const game: Game & {
    actors: TeriockActors;
    canvas: Canvas & {
      tokens: TokenLayer;
    };
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
  const ui: ui & {
    activeWindow: TeriockDocumentSheet;
    actors: TeriockActorDirectory;
    hotbar: TeriockHotbar;
    items: TeriockItemDirectory;
    notifications: TeriockNotifications;
  };

  function fromUuidSync<T>(uuid: UUID<T>): T | undefined;
  function fromUuid<T>(uuid: UUID<T>): Promise<T> | undefined;
}

export {};
