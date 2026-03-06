import { PiercingModel } from "../../../models/_module.mjs";

declare global {
  namespace Teriock.Models {
    export type AttackSystemInterface = {
      /** <schema> Piercing */
      piercing: PiercingModel;
      /** <base> Warded */
      warded: boolean;
    };
  }
}
