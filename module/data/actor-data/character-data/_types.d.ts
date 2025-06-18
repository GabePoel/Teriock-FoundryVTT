import type TeriockBaseActorData from "../base-data/base-data.mjs";

declare module "./character-data.mjs" {
  export default interface TeriockCharacterData extends TeriockBaseActorData {}
}
