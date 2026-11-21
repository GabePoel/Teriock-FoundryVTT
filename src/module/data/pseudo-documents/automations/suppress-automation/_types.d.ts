import { SuppressionModel } from "../../../models/_module.mjs";

declare module "./suppress-automation.mjs" {
  export default interface SuppressAutomation {
    /** <schema> Children this suppresses */
    suppression: SuppressionModel;
  }
}

export {};
