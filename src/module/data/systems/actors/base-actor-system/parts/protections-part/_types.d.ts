import type { protectionOptions } from "../../../../../../constants/options/protection-options.mjs";

declare global {
  namespace Teriock.Parameters.Actor {
    export type ProtectionTypeKey = keyof typeof protectionOptions.types;

    export type ProtectionCategoryKey =
      keyof typeof protectionOptions.categories;
  }

  namespace Teriock.Models {
    export type ActorProtectionsPartInterface = {
      /** <base> Protections */
      protections: Record<
        Teriock.Parameters.Actor.ProtectionTypeKey,
        Record<Teriock.Parameters.Actor.ProtectionCategoryKey, Set<string>>
      >;
    };
  }
}

export {};
