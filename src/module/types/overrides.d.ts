import {
  TeriockActor,
  TeriockChatMessage,
  TeriockUser,
} from "../documents/_module.mjs";
import {
  TeriockActors,
  TeriockUsers,
} from "../documents/collections/_module.mjs";
import { TeriockTextEditor } from "../applications/ux/_module.mjs";
import type TeriockGame from "../_game.mjs";

declare global {
  // Definition for writing macros.
  let actor: TeriockActor;
  let scope: Teriock.RollOptions.MacroScope;

  const game: TeriockGame & {
    actors: TeriockActors;
    users: TeriockUsers;
    user: TeriockUser;
  };

  const Actor: typeof TeriockActor & {
    implementation: typeof TeriockActor;
  };

  const ChatMessage: typeof TeriockChatMessage;

  function fromUuidSync<T>(uuid: Teriock.UUID<T>): T | undefined;

  function fromUuid<T>(uuid: Teriock.UUID<T>): Promise<T> | undefined;
}

export {};
