import { CombatExpiration, StatusExpiration, TriggerExpiration } from "./_module.mjs";

declare global {
  namespace Teriock.Expirations {
    export interface TypeMap {
      combat: CombatExpiration;
      status: StatusExpiration;
      trigger: TriggerExpiration;
    }

    export type Type = keyof TypeMap;
    export type Any = TypeMap[Type];
  }
}
