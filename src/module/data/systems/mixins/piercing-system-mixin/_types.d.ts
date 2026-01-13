import { PiercingModel } from "../../../models/_module.mjs";

declare global {
  namespace Teriock.Models {
    export interface PiercingSystemInterface {
      /** <schema> Piercing */
      piercing: PiercingModel;
    }
  }
}
