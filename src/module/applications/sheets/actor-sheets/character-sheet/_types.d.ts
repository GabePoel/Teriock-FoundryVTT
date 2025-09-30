import TeriockBaseActorSheet from "../base-actor-sheet/base-actor-sheet.mjs";
import type { TeriockCharacter } from "../../../../documents/_documents.mjs";

declare module "./character-sheet.mjs" {
  export default interface TeriockBaseCharacterSheet
    extends TeriockBaseActorSheet {
    get actor(): TeriockCharacter;

    get document(): TeriockCharacter;
  }
}
