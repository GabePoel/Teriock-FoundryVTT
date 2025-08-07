import type { TeriockCharacter } from "../../../../documents/_module.mjs";
import TeriockBaseActorSheet from "../base-actor-sheet/base-actor-sheet.mjs";

declare module "./base-character-sheet.mjs" {
  export default interface TeriockBaseCharacterSheet
    extends TeriockBaseActorSheet {
    get actor(): TeriockCharacter;

    get document(): TeriockCharacter;
  }
}
