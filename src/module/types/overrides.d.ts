import { TeriockActor } from "../documents/_module.mjs";

declare global {
  // Definition for writing macros.
  let actor: TeriockActor;
  let scope: Teriock.RollOptions.MacroScope;
  // Global overrides that improve Teriock typing.
  namespace globalThis {
    function fromUuidSync<T>(uuid: Teriock.UUID<T>): T | undefined;

    function fromUuid<T>(uuid: Teriock.UUID<T>): T | undefined;

    namespace foundry {
      namespace utils {
        function fromUuidSync<T>(uuid: Teriock.UUID<T>): T | undefined;

        function fromUuid<T>(uuid: Teriock.UUID<T>): Promise<T> | undefined;
      }
    }
  }
}

export {};
