import type TeriockBaseItemData from "../base-data/base-data.mjs";

declare module "./power-data.mjs" {
  export default interface TeriockPowerData extends TeriockBaseItemData {
    type: string;
    flaws: string;
    size: number;
    lifespan: number;
    adult: number;
  }
}
