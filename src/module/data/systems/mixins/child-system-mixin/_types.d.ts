import { ChildSettingsModel } from "../../../models/_module.mjs";

declare global {
  namespace Teriock.Models {
    export type ChildSystemData = {
      /** <schema> Description */
      description: string;
      /** <derived> Whether this is forcibly suppressed by something else */
      forceSuppressed: boolean;
      /** <schema> Per-document behavior and display settings */
      settings: ChildSettingsModel;

      get parent(): AnyChildDocument;
    };
  }
}
