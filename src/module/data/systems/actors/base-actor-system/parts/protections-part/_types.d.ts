import type { protectionOptions } from "../../../../../../constants/options/protection-options.mjs";

export type ProtectionTypeKey = keyof typeof protectionOptions.types;

export type ProtectionCategoryKey = keyof typeof protectionOptions.categories;

export type ActorProtectionsPartInterface = {
  /** <base> Protections */
  protections: Record<
    ProtectionTypeKey,
    Record<ProtectionCategoryKey, Set<string>>
  >;
};
