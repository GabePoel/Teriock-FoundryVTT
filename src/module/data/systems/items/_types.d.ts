import {
  ArchetypeSystem,
  BodySystem,
  EquipmentSystem,
  MountSystem,
  PowerSystem,
  RankSystem,
  SpeciesSystem,
} from "./_module.mjs";

declare global {
  export interface ItemSystemMap {
    archetype: ArchetypeSystem;
    body: BodySystem;
    equipment: EquipmentSystem;
    mount: MountSystem;
    power: PowerSystem;
    rank: RankSystem;
    species: SpeciesSystem;
  }

  export type ItemType = TypeMapKey<ItemSystemMap>;
}
