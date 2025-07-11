import type TeriockBaseActorSheet from "../base-actor-sheet/base-actor-sheet.mjs";
import { TeriockCharacter } from "../../../types/documents";
import TeriockActor from "../../../documents/actor.mjs";

declare module "./character-sheet.mjs" {
  export default interface TeriockCharacterSheet extends TeriockBaseActorSheet {
    actor: TeriockCharacter & TeriockActor;
    document: TeriockCharacter & TeriockActor;
  }
}
