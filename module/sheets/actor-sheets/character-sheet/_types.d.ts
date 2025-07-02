import type TeriockBaseActorSheet from "../base-sheet/base-sheet.mjs";
import { TeriockCharacter } from "../../../types/documents";

declare module "./character-sheet.mjs" {
  export default interface TeriockCharacterSheet extends TeriockBaseActorSheet {
    actor: TeriockCharacter;
    document: TeriockCharacter;
  }
}
