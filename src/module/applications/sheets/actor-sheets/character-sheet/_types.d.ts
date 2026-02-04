import BaseActorSheet from "../base-actor-sheet/base-actor-sheet.mjs";

declare module "./character-sheet.mjs" {
  export default interface BaseCharacterSheet extends BaseActorSheet {
    get actor(): TeriockCharacter;
    get document(): TeriockCharacter;
  }
}
