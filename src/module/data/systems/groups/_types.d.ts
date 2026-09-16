import { TeriockCombatant } from "../../../documents/_module.mjs";

declare module "./commanded-system.mjs" {
  export default interface CommandedSystem {
    commander: TeriockCombatant | null;
  }
}
