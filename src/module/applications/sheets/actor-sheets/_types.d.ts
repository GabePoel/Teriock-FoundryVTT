import { InventorySheet, PlayableActorSheet } from "./_module.mjs";

declare global {
  export interface ActorSheetMap {
    character: PlayableActorSheet;
    creature: PlayableActorSheet;
    inventory: InventorySheet;
  }
}
