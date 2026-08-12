import { CombatExpiration, StatusExpiration, TriggerExpiration } from "./_module.mjs";

declare global {
  export interface ExpirationTypeMap {
    combat: CombatExpiration;
    status: StatusExpiration;
    trigger: TriggerExpiration;
  }

  export type ExpirationType = TypeMapKey<ExpirationTypeMap>;
  export type Expiration<T extends ExpirationType = ExpirationType> = ExpirationTypeMap[T];
}

export {};
