import TeriockBaseActorData from "../base-data/base-data.mjs";
import { TeriockCharacter } from "../../../types/documents";

declare module "./character-data.mjs" {
  export default interface TeriockCharacterData extends TeriockBaseActorData {
    parent: TeriockCharacter;
  }
}
