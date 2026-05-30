import "./parts/_types";
import { AbilitySettingsModel } from "../../../models/_module.mjs";

declare global {
  namespace Teriock.Models {
    export interface AbilitySystemData extends Teriock.Models.BaseEffectSystemData {
      /** <schema> Per-document behavior and display settings */
      settings: AbilitySettingsModel;

      get parent(): TeriockAbility;
    }
  }
}
