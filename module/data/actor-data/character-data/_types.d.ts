import type TeriockCharacterSheet from "../../../sheets/actor-sheets/character-sheet/character-sheet.mjs";
import TeriockBaseActorData from "../base-data/base-data.mjs";

declare module "./character-data.mjs" {
  export default interface TeriockCharacterData extends TeriockBaseActorData {
    parent: TeriockBaseActorData.parent & { sheet: TeriockCharacterSheet };
  }
}
