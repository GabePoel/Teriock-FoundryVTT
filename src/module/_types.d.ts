import { TeriockActor } from "./documents/_module.mjs";
import type { AbilityRollConfig } from "./data/effect-data/ability-data/types/roll-config";

declare global {
  // Definition for writing macros.
  let actor: TeriockActor;
  let scope: AbilityRollConfig & { args: any[] };
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
