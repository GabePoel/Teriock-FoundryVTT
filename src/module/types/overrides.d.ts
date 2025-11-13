import {
  TeriockActor,
  TeriockChatMessage,
  TeriockUser,
} from "../documents/_module.mjs";
import {
  TeriockActors,
  TeriockUsers,
} from "../documents/collections/_module.mjs";
import TeriockGame from "../_game.mjs";
import { TeriockTooltipManager } from "../helpers/interaction/_module.mjs";
import TeriockCanvas from "../_canvas.mjs";

declare global {
  // Definition for writing macros.
  let actor: TeriockActor;
  let scope: Teriock.RollOptions.MacroScope;

  const game: TeriockGame & {
    actors: TeriockActors;
    users: TeriockUsers;
    user: TeriockUser;
    tooltip: TeriockTooltipManager;
  };

  const canvas: TeriockCanvas;

  const ChatMessage: typeof TeriockChatMessage;

  function fromUuidSync<T>(uuid: Teriock.UUID<T>): T | undefined;

  function fromUuid<T>(uuid: Teriock.UUID<T>): Promise<T> | undefined;
}

export {};
