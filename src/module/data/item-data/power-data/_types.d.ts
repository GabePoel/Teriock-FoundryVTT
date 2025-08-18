import TeriockBaseItemData from "../base-item-data/base-item-data.mjs";
import type { TeriockPower } from "../../../documents/_documents.mjs";

declare module "./power-data.mjs" {
  export default interface TeriockPowerData extends TeriockBaseItemData {
    /** Power type */
    type: Teriock.Parameters.Power.PowerType;
    /** Flaws */
    flaws: string;
    /** Size (if species) */
    size: number;
    /** Lifespan (if species) */
    lifespan: number;
    /** Age of adulthood (if species) */
    adult: number;

    /** Parent */
    get parent(): typeof TeriockPower;
  }
}
