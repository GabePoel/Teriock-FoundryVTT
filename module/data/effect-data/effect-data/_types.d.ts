import { TeriockBaseEffectData } from "../base-effect-data/base-effect-data.mjs";

export interface TeriockEffectSchema extends TeriockBaseEffectSchema {
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

declare module "./effect-data.mjs" {
  export default interface TeriockEffectData extends TeriockEffectSchema, TeriockBaseEffectData {}
}
