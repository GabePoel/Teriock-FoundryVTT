declare global {
  namespace Teriock.Models {
    export type ActorProtectionsPartData = {
      /** <base> Protections */
      protections: Record<Teriock.Keys.ProtectionType, Record<Teriock.Keys.ProtectionCategory, Set<string>>>;
    };
  }
}

export {};
