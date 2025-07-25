import TeriockBaseActorData from "../base-actor-data/base-actor-data.mjs";
import { TeriockCharacter } from "../../../documents/_documents.mjs";

interface TeriockCharacterSchema extends TeriockBaseActorData {
  /** Metadata */
  readonly metadata: { type: "Character" };
  /** Parent */
  parent: TeriockCharacter;
}

declare module "./character-data.mjs" {
  export default interface TeriockCharacterData
    extends TeriockCharacterSchema {}
}
