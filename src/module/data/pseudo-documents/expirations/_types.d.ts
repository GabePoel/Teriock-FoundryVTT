import { CombatExpiration, StatusExpiration, TriggerExpiration } from "./_module.mjs";

declare global {
  export interface ExpirationTypeMap {
    combat: CombatExpiration;
    status: StatusExpiration;
    trigger: TriggerExpiration;
  }

  namespace Teriock.Expirations {
    export type TypeMap = ExpirationTypeMap;
    export type Type = TypeMapKey<ExpirationTypeMap>;
    export type Any = AnyExpiration;
  }
}

export {};
