// base-data.d.ts
import { TeriockBaseActorDefault } from "./types/default";
import { TeriockBaseActorDerived } from "./types/derived";

declare module "./base-data.mjs" {
  interface TeriockBaseActorData extends TeriockBaseActorDefault, TeriockBaseActorDerived {}

  const TeriockBaseActorData: {
    prototype: TeriockBaseActorData;
  };

  export default TeriockBaseActorData;
}
