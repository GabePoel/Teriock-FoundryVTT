import type TeriockBaseActorData from "../base-data/base-data.mjs";

declare module "./character-data.mjs" {
  type TeriockCharacterData = TeriockBaseActorData;
  export default TeriockCharacterData;
}
