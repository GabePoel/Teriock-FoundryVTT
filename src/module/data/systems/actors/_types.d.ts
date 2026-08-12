import { CharacterSystem, CreatureSystem, InventorySystem } from "./_module.mjs";

declare global {
  export interface ActorSystemMap {
    character: CharacterSystem;
    creature: CreatureSystem;
    inventory: InventorySystem;
  }

  export type ActorType = TypeMapKey<ActorSystemMap>;
}
