import { ChildSheet } from "../utility-sheets/_module.mjs";
import { ArmamentSheet, EquipmentSheet, MountSheet, PowerSheet, RankSheet, SpeciesSheet } from "./_module.mjs";

declare global {
  export interface ItemSheetMap {
    archetype: ChildSheet;
    body: ArmamentSheet;
    equipment: EquipmentSheet;
    mount: MountSheet;
    power: PowerSheet;
    rank: RankSheet;
    species: SpeciesSheet;
  }
}
