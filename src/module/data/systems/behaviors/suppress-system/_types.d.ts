import { SuppressionModel } from "../../../models/_module.mjs";

declare module "./suppress-system.mjs" {
  export default interface SuppressSystem {
    /** <schema> Children this suppresses */
    suppression: SuppressionModel;
  }
}

export {};
