import TeriockBaseActorSheet from "../base-actor-sheet/base-actor-sheet.mjs";

declare module "./creature-sheet.mjs" {
  export default interface TeriockBaseCharacterSheet
    extends TeriockBaseActorSheet {
    get actor(): TeriockCreature;

    get document(): TeriockCreature;
  }
}
