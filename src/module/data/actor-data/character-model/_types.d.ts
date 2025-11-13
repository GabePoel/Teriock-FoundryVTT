import TeriockBaseActorModel from "../base-actor-model/base-actor-model.mjs";
import { TeriockCharacter } from "../../../documents/_documents.mjs";

declare module "./character-model.mjs" {
  export default interface TeriockCharacterModel extends TeriockBaseActorModel {
    get parent(): TeriockCharacter;
  }
}
