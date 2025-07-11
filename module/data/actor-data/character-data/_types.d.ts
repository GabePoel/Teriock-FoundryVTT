import { TeriockBaseActorData } from "../base-actor-data/base-actor-data.mjs";

interface TeriockCharacterSchema {
  /** Metadata */
  readonly metadata: { type: "Character" };
}

declare module "./character-data.mjs" {
  export default interface TeriockCharacterData extends TeriockBaseActorData, TeriockCharacterSchema {}
}
