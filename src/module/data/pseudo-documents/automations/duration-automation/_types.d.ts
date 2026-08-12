import { TimeUnitModel } from "../../../models/unit-models/_module.mjs";

declare module "./duration-automation.mjs" {
  export default interface DurationAutomation {
    duration: TimeUnitModel;
    substitution: Teriock.System.FormulaString;
  }
}

export {};
