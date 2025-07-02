import type TeriockBaseItemData from "../base-data/base-data.mjs";
import { TeriockPower } from "../../../types/documents";

declare module "./power-data.mjs" {
  export default interface TeriockPowerData extends TeriockBaseItemData {
    parent: TeriockPower;
    type: string;
    flaws: string;
    size: number;
    lifespan: number;
    adult: number;
  }
}
