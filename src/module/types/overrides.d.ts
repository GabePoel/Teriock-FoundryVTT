// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import {
  TeriockActor,
  TeriockChatMessage,
  TeriockUser,
} from "../documents/_module.mjs";
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
import TeriockGame from "../_game.mjs";
import { TeriockTooltipManager } from "../helpers/interaction/_module.mjs";
import TeriockCanvas from "../_canvas.mjs";
import { TeriockNotifications } from "../applications/ui/_module.mjs";
import type { TeriockCompendiumCollection } from "../documents/collections/packs";

declare global {
  // Definition for writing macros.
  let actor: TeriockActor;
  let scope: Teriock.RollOptions.MacroScope;

  const game: TeriockGame & {
    actors: TeriockActors;
    canvas: TeriockCanvas;
    chatMessages: TeriockChatMessages;
    folders: TeriockFolders;
    items: TeriockItems;
    journal: TeriockJournal;
    macros: TeriockMacros;
    packs: Collection<string, TeriockCompendiumCollection<TeriockDocument>>;
    rollTables: TeriockRollTables;
    scenes: TeriockScenes;
    tooltip: TeriockTooltipManager;
    user: TeriockUser;
    users: TeriockUsers;
  };
  const ui: {
    notifications: TeriockNotifications;
  };

  const canvas: TeriockCanvas;

  const ChatMessage: typeof TeriockChatMessage;

  function fromUuidSync<T>(uuid: UUID<T>): T | undefined;

  function fromUuid<T>(uuid: UUID<T>): Promise<T> | undefined;
}

export {};
