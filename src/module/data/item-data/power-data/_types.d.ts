import TeriockBaseItemData from "../base-item-data/base-item-data.mjs";
import { TeriockPower } from "../../../documents/_documents.mjs";

export interface TeriockPowerSchema extends TeriockBaseItemData {
  /** Parent */
  parent: TeriockPower;
  /** Power type */
  type: Teriock.PowerType;
  /** Flaws */
  flaws: string;
  /** Size (if species) */
  size: number;
  /** Lifespan (if species) */
  lifespan: number;
  /** Age of adulthood (if species) */
  adult: number;
}

declare module "./power-data.mjs" {
  export default interface TeriockPowerData extends TeriockPowerSchema {}
}
