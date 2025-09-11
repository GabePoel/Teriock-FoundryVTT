import type TeriockBaseItemData from "../base-item-data/base-item-data.mjs";
import type { TeriockPower } from "../../../documents/_documents.mjs";

declare module "./power-data.mjs" {
  export default interface TeriockPowerData extends TeriockBaseItemData {
    /** Age of adulthood (if species) */
    adult: number;
    /** Flaws */
    flaws: string;
    /** Lifespan (if species) */
    lifespan: number;
    /** Size (if species) */
    size: number;
    /** Power type */
    type: Teriock.Parameters.Power.PowerType;

    /** Parent */
    get parent(): TeriockPower;
  }
}
