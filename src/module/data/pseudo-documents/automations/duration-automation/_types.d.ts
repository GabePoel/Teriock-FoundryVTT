import { EffectDurationUnitModel } from "../../../models/unit-models/_module.mjs";

declare module "./duration-automation.mjs" {
  export default interface DurationAutomation {
    duration: EffectDurationUnitModel;
    substitution: Teriock.System.FormulaString;
  }
}

export {};
