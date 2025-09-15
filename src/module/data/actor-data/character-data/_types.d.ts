import TeriockBaseActorModel from "../base-actor-data/base-actor-data.mjs";
import { TeriockCharacter } from "../../../documents/_documents.mjs";

declare module "./character-data.mjs" {
  export default interface TeriockCharacterModel extends TeriockBaseActorModel {
    /** Parent */
    parent: TeriockCharacter;
  }
}
