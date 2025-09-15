import type TeriockBaseItemModel from "../base-item-data/base-item-data.mjs";
import type { TeriockPower } from "../../../documents/_documents.mjs";

declare module "./power-data.mjs" {
  export default interface TeriockPowerModel extends TeriockBaseItemModel {
    /** <schema> Flaws */
    flaws: string;
    /** <schema> Power type */
    type: Teriock.Parameters.Power.PowerType;

    get parent(): TeriockPower;
  }
}
