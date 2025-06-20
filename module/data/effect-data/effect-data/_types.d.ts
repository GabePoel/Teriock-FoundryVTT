import type TeriockBaseEffectData from "../base-data/base-data.mjs";

declare module "./effect-data.mjs" {
  export default interface TeriockEffectData extends TeriockBaseEffectData {
    source: string;
    expirations: {
      condition: {
        value: string | null;
        present: boolean;
      };
      movement: boolean;
      dawn: boolean;
      sustained: boolean;
    };
    conditionExpiration: boolean;
    movementExpiration: boolean;
    dawnExpiration: boolean;
    sustainedExpiration: boolean;
  }
}
