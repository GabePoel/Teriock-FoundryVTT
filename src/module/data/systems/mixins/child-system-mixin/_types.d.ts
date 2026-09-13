import { CommonDocumentSettingsModel } from "../../../models/settings-models/_module.mjs";

declare global {
  namespace Teriock.Models {
    export interface ChildSystemData {
      /** <derived> Whether this is forcibly suppressed by something else */
      forceSuppressed: boolean;
      /** <schema> Categorical kind for this document */
      kind: string;
      /** <schema> Per-document behavior and display settings */
      settings: CommonDocumentSettingsModel;
    }
  }
}

export {};
