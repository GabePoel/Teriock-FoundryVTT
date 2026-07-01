import "./abstract/_types";
import * as expirations from "./_module.mjs";

declare global {
  namespace Teriock.Expirations {
    export interface TypeMap {
      combat: expirations.CombatExpiration;
      status: expirations.StatusExpiration;
      trigger: expirations.TriggerExpiration;
    }

    export type Type = keyof TypeMap;
    export type Any = TypeMap[Type];
  }
}
