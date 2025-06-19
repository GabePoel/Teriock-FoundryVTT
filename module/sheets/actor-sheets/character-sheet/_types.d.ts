import type TeriockBaseActorSheet from "../base-sheet/base-sheet.mjs"
import type TeriockActor from "../../../documents/actor.mjs"
import type TeriockCharacterData from "../../../data/actor-data/character-data/character-data.mjs"

declare module "./character-sheet.mjs" {
  export default interface TeriockCharacterSheet extends TeriockBaseActorSheet {
    actor: TeriockActor & { system: TeriockCharacterData };
    document: TeriockActor & { system: TeriockCharacterData };
  }
}