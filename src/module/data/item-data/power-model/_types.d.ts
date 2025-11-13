import TeriockBaseItemModel from "../base-item-model/base-item-model.mjs";
import { TeriockPower } from "../../../documents/_documents.mjs";

declare module "./power-model.mjs" {
  export default interface TeriockPowerModel extends TeriockBaseItemModel {
    /** <schema> Flaws */
    flaws: string;
    /** <schema> Power type */
    type: Teriock.Parameters.Power.PowerType;

    get parent(): TeriockPower;
  }
}
