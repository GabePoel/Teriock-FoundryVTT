import { PiercingModel } from "../../models/_module.mjs";

declare global {
  namespace Teriock.Models {
    export interface PiercingDataMixinInterface {
      /** <schema> Piercing */
      piercing: PiercingModel;
    }
  }
}
