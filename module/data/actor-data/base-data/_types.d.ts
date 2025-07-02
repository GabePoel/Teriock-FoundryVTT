import { TeriockBaseActorDerived } from "./types/derived";
import { TeriockBaseActorDefault } from "./types/default";

declare module "./base-data.mjs" {
  export default interface TeriockBaseActorData extends TeriockBaseActorDefault, TeriockBaseActorDerived {}
}
