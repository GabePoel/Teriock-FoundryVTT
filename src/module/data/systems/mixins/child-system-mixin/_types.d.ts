declare global {
  namespace Teriock.Models {
    export type ChildSystemData = {
      /** <schema> Description */
      description: string;
      /** <derived> Whether this is forcibly suppressed by something else */
      forceSuppressed: boolean;
      /** <schema> Setup and usage instructions */
      instructions: string;
      /** <schema> Per-document behavior and display settings */
      settings: Teriock.Models.CommonSettingsModel;

      get parent(): AnyChildDocument;
    };
  }
}

export {};
