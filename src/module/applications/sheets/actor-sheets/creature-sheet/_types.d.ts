import BaseActorSheet from "../base-actor-sheet/base-actor-sheet.mjs";

declare module "./creature-sheet.mjs" {
  export default interface TeriockBaseCharacterSheet extends BaseActorSheet {
    get actor(): TeriockCreature;
    get document(): TeriockCreature;
  }
}
